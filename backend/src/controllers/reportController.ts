import { Request, Response } from 'express'
import { Project } from '../models/Project'
import { Card } from '../models/Card'
import { Sprint } from '../models/Sprint'
import { TimeEntry } from '../models/TimeEntry'

// Generate Sprint Report Data
export const getSprintReport = async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId).populate('boardId')
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' })
    }

    const cards = await Card.find({ sprintId })
      .populate('assignees', 'name email')
      .populate('boardId')

    const timeEntries = await TimeEntry.find({
      cardId: { $in: cards.map(c => c._id) }
    })

    // Get board to find "Done" column
    const board = sprint.boardId as any
    const doneColumn = board?.columns?.find((col: any) =>
      col.name.toLowerCase() === 'done' || col.name.toLowerCase() === 'completed'
    )
    const doneColumnId = doneColumn?._id?.toString()

    // Calculate metrics
    const totalCards = cards.length
    const completedCards = cards.filter(c => c.columnId?.toString() === doneColumnId).length
    const totalPoints = cards.reduce((sum, c) => sum + (c.storyPoints || 0), 0)
    const completedPoints = cards.filter(c => c.columnId?.toString() === doneColumnId)
      .reduce((sum, c) => sum + (c.storyPoints || 0), 0)

    const totalTimeMinutes = timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0)
    const billableMinutes = timeEntries.filter(t => t.billable)
      .reduce((sum, t) => sum + (t.duration || 0), 0)

    // Cards by column (status)
    const cardsByStatus = cards.reduce((acc: any, card) => {
      const column = board?.columns?.find((col: any) => col._id?.toString() === card.columnId?.toString())
      const columnName = column?.name || 'Unknown'
      acc[columnName] = (acc[columnName] || 0) + 1
      return acc
    }, {})

    // Cards by assignee
    const cardsByAssignee = cards.reduce((acc: any, card) => {
      const assignees = card.assignees as any[]
      if (!assignees || assignees.length === 0) {
        if (!acc['Unassigned']) acc['Unassigned'] = { total: 0, completed: 0, points: 0 }
        acc['Unassigned'].total += 1
        acc['Unassigned'].points += card.storyPoints || 0
        if (card.columnId?.toString() === doneColumnId) acc['Unassigned'].completed += 1
      } else {
        assignees.forEach(assignee => {
          const name = assignee.name || 'Unknown'
          if (!acc[name]) acc[name] = { total: 0, completed: 0, points: 0 }
          acc[name].total += 1
          acc[name].points += card.storyPoints || 0
          if (card.columnId?.toString() === doneColumnId) acc[name].completed += 1
        })
      }
      return acc
    }, {})

    // Daily burndown data
    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const pointsPerDay = totalPoints / totalDays

    const burndownData = []
    let remainingPoints = totalPoints

    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const ideal = Math.max(0, totalPoints - (pointsPerDay * i))

      // Count actual completed points up to this date
      const completedByDate = cards
        .filter(c => c.columnId?.toString() === doneColumnId && c.updatedAt && new Date(c.updatedAt) <= date)
        .reduce((sum, c) => sum + (c.storyPoints || 0), 0)

      burndownData.push({
        date: date.toISOString().split('T')[0],
        ideal: Math.round(ideal * 10) / 10,
        actual: totalPoints - completedByDate
      })
    }

    const report = {
      sprint: {
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        capacity: sprint.capacity
      },
      metrics: {
        totalCards,
        completedCards,
        completionRate: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
        totalPoints,
        completedPoints,
        velocity: completedPoints,
        pointsCompletionRate: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
        totalTimeHours: Math.round(totalTimeMinutes / 60 * 10) / 10,
        billableTimeHours: Math.round(billableMinutes / 60 * 10) / 10
      },
      cardsByStatus,
      cardsByAssignee: Object.entries(cardsByAssignee).map(([name, data]: [string, any]) => ({
        name,
        ...data
      })),
      burndownData,
      cards: cards.map(c => {
        const column = board?.columns?.find((col: any) => col._id?.toString() === c.columnId?.toString())
        const assignees = c.assignees as any[]
        return {
          title: c.title,
          status: column?.name || 'Unknown',
          priority: c.priority,
          storyPoints: c.storyPoints,
          assignee: assignees?.length > 0 ? assignees.map(a => a.name).join(', ') : 'Unassigned'
        }
      }),
      generatedAt: new Date().toISOString()
    }

    res.json(report)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Generate Project Report Data
export const getProjectReport = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const { from, to } = req.query

    const project = await Project.findById(projectId)
      .populate('members.userId', 'name email')

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const dateFilter: any = {}
    if (from) dateFilter.$gte = new Date(from as string)
    if (to) dateFilter.$lte = new Date(to as string)

    const sprintQuery: any = { projectId }
    if (from || to) sprintQuery.startDate = dateFilter

    const sprints = await Sprint.find(sprintQuery).sort({ startDate: -1 })

    // Get all boards for this project
    const { Board } = await import('../models/Board')
    const boards = await Board.find({ projectId })
    const boardIds = boards.map(b => b._id)

    // Find "Done" columns across all boards
    const doneColumnIds = boards.flatMap(board =>
      board.columns
        .filter(col => col.name.toLowerCase() === 'done' || col.name.toLowerCase() === 'completed')
        .map(col => col._id.toString())
    )

    // Get cards from all project boards
    const cards = await Card.find({ boardId: { $in: boardIds } })
      .populate('assignees', 'name')
      .populate('boardId')

    const timeEntries = await TimeEntry.find({
      cardId: { $in: cards.map(c => c._id) }
    })

    // Overall metrics
    const totalCards = cards.length
    const completedCards = cards.filter(c =>
      c.columnId && doneColumnIds.includes(c.columnId.toString())
    ).length
    const blockedCards = cards.filter(c => c.blocked).length
    const overdueCards = cards.filter(c => {
      const isDone = c.columnId && doneColumnIds.includes(c.columnId.toString())
      return c.dueDate && new Date(c.dueDate) < new Date() && !isDone
    }).length

    // Sprint velocity history
    const velocityHistory = sprints
      .filter(s => s.status === 'completed')
      .map(s => ({
        sprint: s.name,
        planned: s.capacity || 0,
        completed: s.velocity || 0,
        startDate: s.startDate
      }))

    // Team performance
    const teamPerformance = cards.reduce((acc: any, card) => {
      const assignees = card.assignees as any[]
      const isDone = card.columnId && doneColumnIds.includes(card.columnId.toString())
      const board = card.boardId as any
      const column = board?.columns?.find((col: any) => col._id?.toString() === card.columnId?.toString())
      const isInProgress = column?.name.toLowerCase().includes('progress') || column?.name.toLowerCase().includes('doing')

      if (!assignees || assignees.length === 0) {
        if (!acc['Unassigned']) acc['Unassigned'] = { completed: 0, inProgress: 0, total: 0, points: 0 }
        acc['Unassigned'].total += 1
        acc['Unassigned'].points += card.storyPoints || 0
        if (isDone) acc['Unassigned'].completed += 1
        if (isInProgress) acc['Unassigned'].inProgress += 1
      } else {
        assignees.forEach(assignee => {
          const name = assignee.name || 'Unknown'
          if (!acc[name]) acc[name] = { completed: 0, inProgress: 0, total: 0, points: 0 }
          acc[name].total += 1
          acc[name].points += card.storyPoints || 0
          if (isDone) acc[name].completed += 1
          if (isInProgress) acc[name].inProgress += 1
        })
      }
      return acc
    }, {})

    // Time tracking summary
    const totalMinutes = timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0)
    const billableMinutes = timeEntries.filter(t => t.billable)
      .reduce((sum, t) => sum + (t.duration || 0), 0)

    const report = {
      project: {
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        memberCount: project.members.length
      },
      overview: {
        totalCards,
        completedCards,
        completionRate: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
        blockedCards,
        overdueCards,
        totalSprints: sprints.length,
        activeSprints: sprints.filter(s => s.status === 'active').length,
        totalTimeHours: Math.round(totalMinutes / 60 * 10) / 10,
        billableHours: Math.round(billableMinutes / 60 * 10) / 10
      },
      velocityHistory,
      teamPerformance: Object.entries(teamPerformance).map(([name, data]: [string, any]) => ({
        name,
        ...data
      })),
      cardsByPriority: {
        critical: cards.filter(c => c.priority === 'critical').length,
        high: cards.filter(c => c.priority === 'high').length,
        medium: cards.filter(c => c.priority === 'medium').length,
        low: cards.filter(c => c.priority === 'low').length
      },
      recentActivity: cards
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
        .map(c => {
          const board = c.boardId as any
          const column = board?.columns?.find((col: any) => col._id?.toString() === c.columnId?.toString())
          return {
            title: c.title,
            status: column?.name || 'Unknown',
            updatedAt: c.updatedAt
          }
        }),
      generatedAt: new Date().toISOString()
    }

    res.json(report)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Generate Time Tracking Report
export const getTimeReport = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const { from, to, groupBy = 'user', billableOnly } = req.query

    const query: any = { projectId }

    if (from || to) {
      query.startTime = {}
      if (from) query.startTime.$gte = new Date(from as string)
      if (to) query.startTime.$lte = new Date(to as string)
    }

    if (billableOnly === 'true') {
      query.billable = true
    }

    const entries = await TimeEntry.find(query)
      .populate('userId', 'name email')
      .populate('cardId', 'title')

    // Group entries
    const grouped: any = {}

    for (const entry of entries) {
      let key: string

      if (groupBy === 'user') {
        key = (entry.userId as any)?.name || 'Unknown'
      } else if (groupBy === 'card') {
        key = (entry.cardId as any)?.title || 'No Card'
      } else if (groupBy === 'date') {
        key = entry.startTime.toISOString().split('T')[0]
      } else {
        key = 'all'
      }

      if (!grouped[key]) {
        grouped[key] = {
          totalMinutes: 0,
          billableMinutes: 0,
          entries: []
        }
      }

      grouped[key].totalMinutes += entry.duration || 0
      if (entry.billable) grouped[key].billableMinutes += entry.duration || 0
      grouped[key].entries.push({
        description: entry.description,
        duration: entry.duration,
        billable: entry.billable,
        date: entry.startTime,
        card: (entry.cardId as any)?.title
      })
    }

    // Convert to array and calculate hours
    const report = Object.entries(grouped).map(([key, data]: [string, any]) => ({
      group: key,
      totalHours: Math.round(data.totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(data.billableMinutes / 60 * 10) / 10,
      entryCount: data.entries.length,
      entries: data.entries
    }))

    const totals = {
      totalHours: Math.round(entries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60 * 10) / 10,
      billableHours: Math.round(entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0) / 60 * 10) / 10,
      entryCount: entries.length
    }

    res.json({
      groupBy,
      dateRange: { from, to },
      data: report,
      totals,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Export report as JSON (PDF generation would be done on frontend)
export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params

    let report: any

    if (type === 'sprint') {
      // Reuse sprint report logic
      req.params.sprintId = id
      // For now, return the data; frontend will generate PDF
    } else if (type === 'project') {
      req.params.projectId = id
    }

    res.json({
      message: 'Report data ready for PDF export',
      exportType: type,
      id
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
