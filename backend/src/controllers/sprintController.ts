import { Response } from 'express'
import { Sprint } from '../models/Sprint'
import { Card } from '../models/Card'
import { Project } from '../models/Project'
import { AuthRequest } from '../middleware/auth'

export const getSprints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const userId = req.user!.userId

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      'members.userId': userId,
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const sprints = await Sprint.find({ projectId }).sort({ startDate: -1 })
    res.json(sprints)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getSprintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id).populate({
      path: 'cards',
      populate: {
        path: 'assignees createdBy',
        select: 'name email avatar',
      },
    })

    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { name, goal, startDate, endDate, capacity } = req.body
    const userId = req.user!.userId

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      'members.userId': userId,
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const sprint = await Sprint.create({
      name,
      goal,
      projectId,
      startDate,
      endDate,
      capacity,
      status: 'planning',
      createdBy: userId,
    })

    res.status(201).json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    Object.assign(sprint, updateData)
    await sprint.save()

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    // Remove sprint reference from cards
    await Card.updateMany(
      { sprintId: id },
      { $unset: { sprintId: 1 } }
    )

    await sprint.deleteOne()
    res.json({ message: 'Sprint deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const startSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    if (sprint.status !== 'planning') {
      res.status(400).json({ error: 'Sprint can only be started from planning status' })
      return
    }

    sprint.status = 'active'
    sprint.startDate = new Date()
    await sprint.save()

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const completeSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    if (sprint.status !== 'active') {
      res.status(400).json({ error: 'Only active sprints can be completed' })
      return
    }

    // Calculate velocity (story points completed)
    const completedCards = await Card.find({
      sprintId: id,
      columnId: { $exists: true }, // You might want to check for a 'Done' column specifically
    })

    const velocity = completedCards.reduce((sum, card) => sum + (card.storyPoints || 0), 0)

    sprint.status = 'completed'
    sprint.velocity = velocity
    sprint.completedAt = new Date()
    await sprint.save()

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const addCardToSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, cardId } = req.params

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    const card = await Card.findById(cardId)
    if (!card) {
      res.status(404).json({ error: 'Card not found' })
      return
    }

    if (!sprint.cards.includes(card._id)) {
      sprint.cards.push(card._id)
      card.sprintId = sprint._id
      await Promise.all([sprint.save(), card.save()])
    }

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const removeCardFromSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, cardId } = req.params

    const sprint = await Sprint.findById(id)
    if (!sprint) {
      res.status(404).json({ error: 'Sprint not found' })
      return
    }

    const card = await Card.findById(cardId)
    if (card) {
      card.sprintId = undefined
      await card.save()
    }

    sprint.cards = sprint.cards.filter((cId) => cId.toString() !== cardId)
    await sprint.save()

    res.json(sprint)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
