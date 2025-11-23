import { Request, Response } from 'express'
import { Card } from '../models/Card'
import mongoose from 'mongoose'

// Bulk update cards
export const bulkUpdateCards = async (req: Request, res: Response) => {
  try {
    const { cardIds, updates } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Updates object is required' })
    }

    // Allowed fields for bulk update
    const allowedFields = ['priority', 'labels', 'assignees', 'sprintId', 'columnId', 'status', 'dueDate', 'storyPoints']
    const filteredUpdates: any = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid update fields provided' })
    }

    // Perform bulk update
    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: filteredUpdates,
        $push: {
          history: {
            userId,
            action: 'bulk_update',
            field: Object.keys(filteredUpdates).join(', '),
            newValue: filteredUpdates,
            timestamp: new Date(),
          },
        },
      }
    )

    res.json({
      message: `Successfully updated ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk move cards to column
export const bulkMoveCards = async (req: Request, res: Response) => {
  try {
    const { cardIds, columnId, boardId } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    if (!columnId) {
      return res.status(400).json({ error: 'Column ID is required' })
    }

    // Get current max position in target column
    const maxPositionCard = await Card.findOne({ columnId })
      .sort({ position: -1 })
      .select('position')

    let position = (maxPositionCard?.position || 0) + 1

    // Update each card with incrementing position
    const updates = cardIds.map((cardId: string, index: number) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(cardId) },
        update: {
          $set: {
            columnId: new mongoose.Types.ObjectId(columnId),
            position: position + index,
          },
          $push: {
            history: {
              userId,
              action: 'bulk_move',
              field: 'columnId',
              newValue: columnId,
              timestamp: new Date(),
            },
          },
        },
      },
    }))

    const result = await Card.bulkWrite(updates)

    res.json({
      message: `Successfully moved ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk assign cards
export const bulkAssignCards = async (req: Request, res: Response) => {
  try {
    const { cardIds, assigneeIds, mode = 'add' } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    if (!assigneeIds || !Array.isArray(assigneeIds)) {
      return res.status(400).json({ error: 'Assignee IDs array is required' })
    }

    let updateOperation: any

    if (mode === 'add') {
      updateOperation = {
        $addToSet: {
          assignees: { $each: assigneeIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        },
      }
    } else if (mode === 'remove') {
      updateOperation = {
        $pull: {
          assignees: { $in: assigneeIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        },
      }
    } else if (mode === 'replace') {
      updateOperation = {
        $set: {
          assignees: assigneeIds.map((id: string) => new mongoose.Types.ObjectId(id)),
        },
      }
    } else {
      return res.status(400).json({ error: 'Invalid mode. Use add, remove, or replace' })
    }

    // Add history
    updateOperation.$push = {
      history: {
        userId,
        action: 'bulk_assign',
        field: 'assignees',
        newValue: { mode, assigneeIds },
        timestamp: new Date(),
      },
    }

    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      updateOperation
    )

    res.json({
      message: `Successfully updated assignees on ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk add labels
export const bulkAddLabels = async (req: Request, res: Response) => {
  try {
    const { cardIds, labels, mode = 'add' } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({ error: 'Labels array is required' })
    }

    let updateOperation: any

    if (mode === 'add') {
      updateOperation = {
        $addToSet: { labels: { $each: labels } },
      }
    } else if (mode === 'remove') {
      updateOperation = {
        $pull: { labels: { $in: labels } },
      }
    } else if (mode === 'replace') {
      updateOperation = {
        $set: { labels },
      }
    } else {
      return res.status(400).json({ error: 'Invalid mode. Use add, remove, or replace' })
    }

    updateOperation.$push = {
      history: {
        userId,
        action: 'bulk_labels',
        field: 'labels',
        newValue: { mode, labels },
        timestamp: new Date(),
      },
    }

    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      updateOperation
    )

    res.json({
      message: `Successfully updated labels on ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk delete cards
export const bulkDeleteCards = async (req: Request, res: Response) => {
  try {
    const { cardIds } = req.body

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    const result = await Card.deleteMany({
      _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    })

    res.json({
      message: `Successfully deleted ${result.deletedCount} cards`,
      deletedCount: result.deletedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk add to sprint
export const bulkAddToSprint = async (req: Request, res: Response) => {
  try {
    const { cardIds, sprintId } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: {
          sprintId: sprintId ? new mongoose.Types.ObjectId(sprintId) : null,
        },
        $push: {
          history: {
            userId,
            action: 'bulk_sprint',
            field: 'sprintId',
            newValue: sprintId,
            timestamp: new Date(),
          },
        },
      }
    )

    res.json({
      message: `Successfully ${sprintId ? 'added' : 'removed'} ${result.modifiedCount} cards ${sprintId ? 'to' : 'from'} sprint`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk set priority
export const bulkSetPriority = async (req: Request, res: Response) => {
  try {
    const { cardIds, priority } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' })
    }

    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: { priority },
        $push: {
          history: {
            userId,
            action: 'bulk_priority',
            field: 'priority',
            newValue: priority,
            timestamp: new Date(),
          },
        },
      }
    )

    res.json({
      message: `Successfully set priority to ${priority} on ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Bulk set due date
export const bulkSetDueDate = async (req: Request, res: Response) => {
  try {
    const { cardIds, dueDate } = req.body
    const userId = req.user._id

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Card IDs array is required' })
    }

    const result = await Card.updateMany(
      { _id: { $in: cardIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: { dueDate: dueDate ? new Date(dueDate) : null },
        $push: {
          history: {
            userId,
            action: 'bulk_due_date',
            field: 'dueDate',
            newValue: dueDate,
            timestamp: new Date(),
          },
        },
      }
    )

    res.json({
      message: `Successfully set due date on ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
