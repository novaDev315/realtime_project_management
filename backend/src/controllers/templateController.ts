import { Request, Response } from 'express'
import { ProjectTemplate, DEFAULT_TEMPLATES } from '../models/Template'
import { Project } from '../models/Project'
import { Board } from '../models/Board'
import { Card } from '../models/Card'
import { Sprint } from '../models/Sprint'

// Get all templates (public + user's own)
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const templates = await ProjectTemplate.find({
      $or: [
        { isPublic: true },
        { createdBy: userId }
      ]
    }).sort({ usageCount: -1, createdAt: -1 })

    // Add default templates
    const defaultTemplates = Object.entries(DEFAULT_TEMPLATES).map(([key, template]) => ({
      _id: `default_${key}`,
      ...template,
      isDefault: true,
      isPublic: true
    }))

    res.json([...defaultTemplates, ...templates])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get template by ID
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if it's a default template
    if (id.startsWith('default_')) {
      const key = id.replace('default_', '') as keyof typeof DEFAULT_TEMPLATES
      if (DEFAULT_TEMPLATES[key]) {
        return res.json({
          _id: id,
          ...DEFAULT_TEMPLATES[key],
          isDefault: true,
          isPublic: true
        })
      }
    }

    const template = await ProjectTemplate.findById(id)
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    res.json(template)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create custom template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const templateData = req.body

    const template = new ProjectTemplate({
      ...templateData,
      createdBy: userId
    })

    await template.save()
    res.status(201).json(template)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Update template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.userId
    const updates = req.body

    const template = await ProjectTemplate.findOne({
      _id: id,
      createdBy: userId
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found or access denied' })
    }

    Object.assign(template, updates)
    await template.save()

    res.json(template)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.userId

    const template = await ProjectTemplate.findOneAndDelete({
      _id: id,
      createdBy: userId
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found or access denied' })
    }

    res.json({ message: 'Template deleted' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create project from template
export const createProjectFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params
    const userId = (req as any).user.userId
    const { projectName, projectDescription } = req.body

    let templateData: any

    // Check if default template
    if (templateId.startsWith('default_')) {
      const key = templateId.replace('default_', '') as keyof typeof DEFAULT_TEMPLATES
      if (!DEFAULT_TEMPLATES[key]) {
        return res.status(404).json({ error: 'Template not found' })
      }
      templateData = DEFAULT_TEMPLATES[key]
    } else {
      const template = await ProjectTemplate.findById(templateId)
      if (!template) {
        return res.status(404).json({ error: 'Template not found' })
      }
      templateData = template.toObject()

      // Increment usage count
      template.usageCount += 1
      await template.save()
    }

    // Create project
    const project = new Project({
      name: projectName || templateData.name,
      description: projectDescription || templateData.description,
      owner: userId,
      members: [{ userId, role: 'admin' }]
    })
    await project.save()

    // Create board with columns
    const board = new Board({
      projectId: project._id,
      name: 'Main Board',
      columns: templateData.columns.map((col: any) => ({
        name: col.name,
        wipLimit: col.wipLimit,
        order: col.order,
        cards: []
      }))
    })
    await board.save()

    // Create cards from card templates
    if (templateData.cardTemplates && templateData.cardTemplates.length > 0) {
      const backlogColumn = board.columns.find(c =>
        c.name.toLowerCase().includes('backlog') || c.order === 0
      )

      for (const cardTemplate of templateData.cardTemplates) {
        const card = new Card({
          boardId: board._id,
          projectId: project._id,
          columnId: backlogColumn?._id,
          title: cardTemplate.title,
          description: cardTemplate.description,
          priority: cardTemplate.priority,
          labels: cardTemplate.labels || [],
          storyPoints: cardTemplate.storyPoints,
          checklist: cardTemplate.checklist || [],
          createdBy: userId
        })
        await card.save()

        if (backlogColumn) {
          backlogColumn.cards.push(card._id)
        }
      }
      await board.save()
    }

    // Create sprint if sprint templates exist
    if (templateData.sprintTemplates && templateData.sprintTemplates.length > 0) {
      const sprintTemplate = templateData.sprintTemplates[0]
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + sprintTemplate.durationDays)

      const sprint = new Sprint({
        projectId: project._id,
        name: sprintTemplate.name,
        goal: sprintTemplate.goal || '',
        startDate,
        endDate,
        capacity: sprintTemplate.defaultCapacity,
        status: 'planning'
      })
      await sprint.save()
    }

    res.status(201).json({
      project,
      board,
      message: 'Project created from template successfully'
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Save current project as template
export const saveProjectAsTemplate = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const userId = (req as any).user.userId
    const { name, description, isPublic } = req.body

    // Get project data
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Get board data
    const board = await Board.findOne({ projectId })

    // Get cards
    const cards = await Card.find({ projectId }).limit(20)

    // Create template
    const template = new ProjectTemplate({
      name: name || `${project.name} Template`,
      description: description || project.description || '',
      category: 'custom',
      icon: '📁',
      isPublic: isPublic || false,
      createdBy: userId,
      columns: board?.columns.map((col, index) => ({
        name: col.name,
        wipLimit: col.wipLimit,
        order: index
      })) || [],
      labels: [],
      cardTemplates: cards.map(card => ({
        title: card.title,
        description: card.description || '',
        priority: card.priority,
        labels: card.labels || [],
        storyPoints: card.storyPoints,
        checklist: card.checklist || []
      })),
      sprintTemplates: [],
      customFields: [],
      automationRules: []
    })

    await template.save()
    res.status(201).json(template)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
