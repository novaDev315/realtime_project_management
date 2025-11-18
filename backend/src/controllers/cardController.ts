import { Response } from 'express'
import { Card } from '../models/Card'
import { Board } from '../models/Board'
import { AuthRequest } from '../middleware/auth'

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, columnId } = req.params
    const { title, description, priority, storyPoints, assignees, labels, dueDate } = req.body
    const userId = req.user!.userId

    const board = await Board.findById(boardId)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    const column = board.columns.find((c) => c._id.toString() === columnId)
    if (!column) {
      res.status(404).json({ error: 'Column not found' })
      return
    }

    const card = await Card.create({
      title,
      description,
      boardId,
      columnId,
      priority: priority || 'medium',
      storyPoints,
      assignees: assignees || [],
      labels: labels || [],
      dueDate,
      position: column.cards.length,
      createdBy: userId,
    })

    // Add card to column
    column.cards.push(card._id)
    await board.save()

    const populatedCard = await Card.findById(card._id).populate(
      'assignees createdBy',
      'name email avatar'
    )

    res.status(201).json(populatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body
    const userId = req.user!.userId

    const card = await Card.findById(id)
    if (!card) {
      res.status(404).json({ error: 'Card not found' })
      return
    }

    // Track history
    const changedFields = Object.keys(updateData).filter(
      (key) => updateData[key] !== undefined
    )

    changedFields.forEach((field) => {
      card.history.push({
        userId,
        action: 'update',
        field,
        oldValue: (card as any)[field],
        newValue: updateData[field],
        timestamp: new Date(),
      })
    })

    // Update card
    Object.assign(card, updateData)
    await card.save()

    const populatedCard = await Card.findById(card._id).populate(
      'assignees createdBy',
      'name email avatar'
    )

    res.json(populatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { targetColumnId, position } = req.body
    const userId = req.user!.userId

    const card = await Card.findById(id)
    if (!card) {
      res.status(404).json({ error: 'Card not found' })
      return
    }

    const board = await Board.findById(card.boardId)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    const sourceColumn = board.columns.find((c) => c._id.toString() === card.columnId.toString())
    const targetColumn = board.columns.find((c) => c._id.toString() === targetColumnId)

    if (!sourceColumn || !targetColumn) {
      res.status(404).json({ error: 'Column not found' })
      return
    }

    // Remove from source column
    sourceColumn.cards = sourceColumn.cards.filter((cId) => cId.toString() !== id)

    // Add to target column at position
    targetColumn.cards.splice(position, 0, card._id)

    // Update card
    card.columnId = targetColumnId
    card.position = position
    card.history.push({
      userId,
      action: 'move',
      field: 'columnId',
      oldValue: sourceColumn._id,
      newValue: targetColumnId,
      timestamp: new Date(),
    })

    await Promise.all([card.save(), board.save()])

    const populatedCard = await Card.findById(card._id).populate(
      'assignees createdBy',
      'name email avatar'
    )

    res.json(populatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const card = await Card.findById(id)
    if (!card) {
      res.status(404).json({ error: 'Card not found' })
      return
    }

    // Remove from board
    const board = await Board.findById(card.boardId)
    if (board) {
      const column = board.columns.find((c) => c._id.toString() === card.columnId.toString())
      if (column) {
        column.cards = column.cards.filter((cId) => cId.toString() !== id)
        await board.save()
      }
    }

    await card.deleteOne()
    res.json({ message: 'Card deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { text } = req.body
    const userId = req.user!.userId

    const card = await Card.findById(id)
    if (!card) {
      res.status(404).json({ error: 'Card not found' })
      return
    }

    card.comments.push({
      userId,
      text,
      createdAt: new Date(),
    })

    await card.save()

    const populatedCard = await Card.findById(card._id)
      .populate('assignees createdBy', 'name email avatar')
      .populate('comments.userId', 'name email avatar')

    res.json(populatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
