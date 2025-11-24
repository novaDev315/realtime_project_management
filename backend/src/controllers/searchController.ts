import { Request, Response } from 'express'
import { Project } from '../models/Project'
import { Board } from '../models/Board'
import { Card } from '../models/Card'
import { Sprint } from '../models/Sprint'
import mongoose from 'mongoose'

interface SearchResult {
  type: 'project' | 'card' | 'sprint' | 'board'
  id: string
  title: string
  description?: string
  status?: string
  projectId?: string
  projectName?: string
  highlight?: string
  score: number
}

// Global search across all entities
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { q, type, projectId, status, assignee, priority, limit = 50 } = req.query

    if (!q || (q as string).length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' })
    }

    const searchQuery = q as string
    const searchRegex = new RegExp(searchQuery, 'i')
    const results: SearchResult[] = []

    // Get user's accessible projects
    const userProjects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.userId': userId }
      ]
    }).select('_id name')

    const projectIds = userProjects.map(p => p._id)
    const projectMap = new Map(userProjects.map(p => [p._id.toString(), p.name]))

    // Search Projects
    if (!type || type === 'project') {
      const projects = await Project.find({
        _id: { $in: projectIds },
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(10)

      for (const project of projects) {
        results.push({
          type: 'project',
          id: project._id.toString(),
          title: project.name,
          description: project.description,
          score: project.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 10 : 5
        })
      }
    }

    // Search Cards
    if (!type || type === 'card') {
      // Get boards for user's projects
      const boards = await Board.find({ projectId: { $in: projectIds } })
      const boardIds = boards.map(b => b._id)
      const boardToProjectMap = new Map(boards.map(b => [b._id.toString(), b.projectId.toString()]))

      const cardQuery: any = {
        boardId: { $in: boardIds },
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { labels: searchRegex }
        ]
      }

      // Filter by board's projectId if specified
      if (projectId) {
        const projectBoards = boards.filter(b => b.projectId.toString() === projectId)
        cardQuery.boardId = { $in: projectBoards.map(b => b._id) }
      }

      if (assignee) {
        cardQuery.assignees = assignee
      }
      if (priority) {
        cardQuery.priority = priority
      }

      const cards = await Card.find(cardQuery)
        .populate('assignees', 'name')
        .populate('boardId')
        .limit(30)

      for (const card of cards) {
        const cardProjectId = boardToProjectMap.get(card.boardId?.toString() || '')
        const projectName = cardProjectId ? projectMap.get(cardProjectId) : 'Unknown'
        const board = card.boardId as any
        const column = board?.columns?.find((col: any) => col._id?.toString() === card.columnId?.toString())

        results.push({
          type: 'card',
          id: card._id.toString(),
          title: card.title,
          description: card.description?.substring(0, 100),
          status: column?.name || 'Unknown',
          projectId: cardProjectId,
          projectName,
          highlight: getHighlight(card.title + ' ' + (card.description || ''), searchQuery),
          score: card.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 8 : 3
        })
      }
    }

    // Search Sprints
    if (!type || type === 'sprint') {
      const sprintQuery: any = {
        projectId: { $in: projectIds },
        $or: [
          { name: searchRegex },
          { goal: searchRegex }
        ]
      }

      if (projectId) {
        sprintQuery.projectId = projectId
      }

      const sprints = await Sprint.find(sprintQuery).limit(10)

      for (const sprint of sprints) {
        const projectName = projectMap.get(sprint.projectId.toString()) || 'Unknown'
        results.push({
          type: 'sprint',
          id: sprint._id.toString(),
          title: sprint.name,
          description: sprint.goal,
          status: sprint.status,
          projectId: sprint.projectId.toString(),
          projectName,
          score: sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 7 : 4
        })
      }
    }

    // Sort by score (relevance)
    results.sort((a, b) => b.score - a.score)

    // Apply limit
    const limitedResults = results.slice(0, Number(limit))

    // Group by type
    const grouped = {
      projects: limitedResults.filter(r => r.type === 'project'),
      cards: limitedResults.filter(r => r.type === 'card'),
      sprints: limitedResults.filter(r => r.type === 'sprint'),
      total: limitedResults.length
    }

    res.json({
      query: searchQuery,
      results: limitedResults,
      grouped,
      total: results.length
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Quick search (for autocomplete)
export const quickSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { q } = req.query

    if (!q || (q as string).length < 2) {
      return res.json({ results: [] })
    }

    const searchRegex = new RegExp(q as string, 'i')

    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.userId': userId }
      ]
    }).select('_id')

    const projectIds = userProjects.map(p => p._id)

    // Get boards for these projects
    const boards = await Board.find({ projectId: { $in: projectIds } })
    const boardIds = boards.map(b => b._id)

    // Quick search - limited results
    const [cards, projects] = await Promise.all([
      Card.find({
        boardId: { $in: boardIds },
        title: searchRegex
      }).select('title boardId columnId').populate('boardId').limit(5),

      Project.find({
        _id: { $in: projectIds },
        name: searchRegex
      }).select('name').limit(3)
    ])

    const results = [
      ...projects.map(p => ({
        type: 'project' as const,
        id: p._id,
        title: p.name
      })),
      ...cards.map(c => {
        const board = c.boardId as any
        const column = board?.columns?.find((col: any) => col._id?.toString() === c.columnId?.toString())
        return {
          type: 'card' as const,
          id: c._id,
          title: c.title,
          status: column?.name || 'Unknown'
        }
      })
    ]

    res.json({ results })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Search within project
export const searchInProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const { q, type } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Search query required' })
    }

    const searchRegex = new RegExp(q as string, 'i')
    const results: any[] = []

    if (!type || type === 'card') {
      const cards = await Card.find({
        projectId,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { labels: searchRegex }
        ]
      }).populate('assignee', 'name avatar')

      results.push(...cards.map(c => ({ ...c.toObject(), type: 'card' })))
    }

    if (!type || type === 'sprint') {
      const sprints = await Sprint.find({
        projectId,
        $or: [
          { name: searchRegex },
          { goal: searchRegex }
        ]
      })

      results.push(...sprints.map(s => ({ ...s.toObject(), type: 'sprint' })))
    }

    res.json({ results, query: q, total: results.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Advanced search with filters
export const advancedSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const {
      query,
      projects,
      types,
      status,
      priority,
      assignees,
      labels,
      dateFrom,
      dateTo,
      hasComments,
      isBlocked,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body

    // Get accessible projects
    let projectIds: mongoose.Types.ObjectId[]

    if (projects && projects.length > 0) {
      projectIds = projects.map((id: string) => new mongoose.Types.ObjectId(id))
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'members.userId': userId }
        ]
      }).select('_id')
      projectIds = userProjects.map(p => p._id)
    }

    const searchRegex = query ? new RegExp(query, 'i') : null
    const results: any[] = []

    // Get boards for these projects
    const boards = await Board.find({ projectId: { $in: projectIds } })
    const boardIds = boards.map(b => b._id)
    const boardToProjectMap = new Map(boards.map(b => [b._id.toString(), b.projectId]))

    // Build card query
    if (!types || types.includes('card')) {
      const cardQuery: any = { boardId: { $in: boardIds } }

      if (searchRegex) {
        cardQuery.$or = [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }
      // Note: status filter removed as cards use columnId, not status
      if (priority && priority.length > 0) cardQuery.priority = { $in: priority }
      if (assignees && assignees.length > 0) cardQuery.assignees = { $in: assignees }
      if (labels && labels.length > 0) cardQuery.labels = { $in: labels }
      if (dateFrom || dateTo) {
        cardQuery.createdAt = {}
        if (dateFrom) cardQuery.createdAt.$gte = new Date(dateFrom)
        if (dateTo) cardQuery.createdAt.$lte = new Date(dateTo)
      }
      if (hasComments) cardQuery['comments.0'] = { $exists: true }
      if (isBlocked) cardQuery.blocked = true

      const cards = await Card.find(cardQuery)
        .populate('assignees', 'name avatar')
        .populate('boardId')
        .skip((page - 1) * limit)
        .limit(limit)

      results.push(...cards.map(c => {
        const board = c.boardId as any
        const column = board?.columns?.find((col: any) => col._id?.toString() === c.columnId?.toString())
        const cardProjectId = boardToProjectMap.get(c.boardId?.toString() || '')
        return {
          ...c.toObject(),
          type: 'card',
          status: column?.name || 'Unknown',
          projectId: cardProjectId
        }
      }))
    }

    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      results.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 4))
    }

    res.json({
      results,
      total: results.length,
      page,
      limit,
      hasMore: results.length === limit
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Helper function to get highlighted text
function getHighlight(text: string, query: string): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return text.substring(0, 100)

  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + query.length + 30)
  let highlight = text.substring(start, end)

  if (start > 0) highlight = '...' + highlight
  if (end < text.length) highlight = highlight + '...'

  return highlight
}
