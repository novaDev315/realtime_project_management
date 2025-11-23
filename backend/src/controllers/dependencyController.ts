import { Request, Response } from 'express'
import { Card } from '../models/Card'
import mongoose from 'mongoose'

// Add a dependency between cards
export const addDependency = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params
    const { targetCardId, type } = req.body
    const userId = req.user._id

    if (!targetCardId || !type) {
      return res.status(400).json({ error: 'Target card ID and dependency type are required' })
    }

    if (!['blocks', 'blocked_by', 'relates_to'].includes(type)) {
      return res.status(400).json({ error: 'Invalid dependency type' })
    }

    // Cannot create dependency to self
    if (cardId === targetCardId) {
      return res.status(400).json({ error: 'Cannot create dependency to self' })
    }

    const card = await Card.findById(cardId)
    const targetCard = await Card.findById(targetCardId)

    if (!card || !targetCard) {
      return res.status(404).json({ error: 'Card not found' })
    }

    // Check if dependency already exists
    const existingDep = card.dependencies?.find(
      d => d.cardId.toString() === targetCardId && d.type === type
    )

    if (existingDep) {
      return res.status(400).json({ error: 'Dependency already exists' })
    }

    // Check for circular dependencies (for blocks/blocked_by)
    if (type === 'blocks' || type === 'blocked_by') {
      const hasCircular = await checkCircularDependency(cardId, targetCardId, type)
      if (hasCircular) {
        return res.status(400).json({ error: 'This would create a circular dependency' })
      }
    }

    // Add the dependency
    if (!card.dependencies) {
      card.dependencies = []
    }

    card.dependencies.push({
      cardId: new mongoose.Types.ObjectId(targetCardId),
      type,
    })

    // Add history event
    card.history.push({
      userId,
      action: 'dependency_added',
      field: 'dependencies',
      newValue: { cardId: targetCardId, type, title: targetCard.title },
      timestamp: new Date(),
    })

    // If this card is now blocked by another, mark it as blocked
    if (type === 'blocked_by') {
      card.blocked = true
    }

    await card.save()

    // Create reciprocal dependency on target card
    const reciprocalType = type === 'blocks' ? 'blocked_by' : type === 'blocked_by' ? 'blocks' : 'relates_to'

    if (!targetCard.dependencies) {
      targetCard.dependencies = []
    }

    // Only add reciprocal if it doesn't exist
    const existingReciprocal = targetCard.dependencies.find(
      d => d.cardId.toString() === cardId && d.type === reciprocalType
    )

    if (!existingReciprocal) {
      targetCard.dependencies.push({
        cardId: new mongoose.Types.ObjectId(cardId),
        type: reciprocalType,
      })

      // If target is now blocked
      if (reciprocalType === 'blocked_by') {
        targetCard.blocked = true
      }

      await targetCard.save()
    }

    // Populate and return the updated card
    const updatedCard = await Card.findById(cardId)
      .populate('dependencies.cardId', 'title status priority')
      .populate('assignees', 'name email avatar')

    res.json(updatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Remove a dependency
export const removeDependency = async (req: Request, res: Response) => {
  try {
    const { cardId, dependencyId } = req.params
    const userId = req.user._id

    const card = await Card.findById(cardId)
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    const dependency = card.dependencies?.find(
      d => d._id?.toString() === dependencyId
    )

    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' })
    }

    const targetCardId = dependency.cardId.toString()
    const type = dependency.type

    // Remove from this card
    card.dependencies = card.dependencies.filter(
      d => d._id?.toString() !== dependencyId
    )

    // Add history event
    card.history.push({
      userId,
      action: 'dependency_removed',
      field: 'dependencies',
      oldValue: { cardId: targetCardId, type },
      timestamp: new Date(),
    })

    // Update blocked status if needed
    if (type === 'blocked_by') {
      const stillBlocked = card.dependencies.some(d => d.type === 'blocked_by')
      card.blocked = stillBlocked
    }

    await card.save()

    // Remove reciprocal dependency from target card
    const reciprocalType = type === 'blocks' ? 'blocked_by' : type === 'blocked_by' ? 'blocks' : 'relates_to'

    await Card.updateOne(
      { _id: targetCardId },
      {
        $pull: {
          dependencies: {
            cardId: new mongoose.Types.ObjectId(cardId),
            type: reciprocalType,
          },
        },
      }
    )

    // Update target's blocked status
    if (reciprocalType === 'blocked_by') {
      const targetCard = await Card.findById(targetCardId)
      if (targetCard) {
        const targetStillBlocked = targetCard.dependencies?.some(d => d.type === 'blocked_by')
        targetCard.blocked = !!targetStillBlocked
        await targetCard.save()
      }
    }

    const updatedCard = await Card.findById(cardId)
      .populate('dependencies.cardId', 'title status priority')
      .populate('assignees', 'name email avatar')

    res.json(updatedCard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get card dependencies
export const getDependencies = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params

    const card = await Card.findById(cardId)
      .populate('dependencies.cardId', 'title status priority columnId')

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    // Group dependencies by type
    const blocking = card.dependencies?.filter(d => d.type === 'blocks') || []
    const blockedBy = card.dependencies?.filter(d => d.type === 'blocked_by') || []
    const relatedTo = card.dependencies?.filter(d => d.type === 'relates_to') || []

    res.json({
      cardId,
      blocking,
      blockedBy,
      relatedTo,
      isBlocked: card.blocked,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get dependency graph for a board (for visualization)
export const getDependencyGraph = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params

    const cards = await Card.find({ boardId })
      .select('title status columnId dependencies blocked')

    // Build graph data for visualization
    const nodes = cards.map(card => ({
      id: card._id.toString(),
      title: card.title,
      status: card.status,
      columnId: card.columnId?.toString(),
      blocked: card.blocked,
    }))

    const edges: Array<{
      source: string
      target: string
      type: string
    }> = []

    cards.forEach(card => {
      if (card.dependencies) {
        card.dependencies.forEach(dep => {
          // Only add 'blocks' edges to avoid duplicates
          if (dep.type === 'blocks') {
            edges.push({
              source: card._id.toString(),
              target: dep.cardId.toString(),
              type: 'blocks',
            })
          } else if (dep.type === 'relates_to') {
            // For relates_to, add if not already present
            const exists = edges.some(
              e =>
                (e.source === card._id.toString() && e.target === dep.cardId.toString()) ||
                (e.source === dep.cardId.toString() && e.target === card._id.toString())
            )
            if (!exists) {
              edges.push({
                source: card._id.toString(),
                target: dep.cardId.toString(),
                type: 'relates_to',
              })
            }
          }
        })
      }
    })

    res.json({ nodes, edges })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Helper function to check for circular dependencies
async function checkCircularDependency(
  sourceId: string,
  targetId: string,
  type: string
): Promise<boolean> {
  const visited = new Set<string>()
  const stack = [targetId]

  while (stack.length > 0) {
    const currentId = stack.pop()!

    if (currentId === sourceId) {
      return true // Found a cycle
    }

    if (visited.has(currentId)) {
      continue
    }

    visited.add(currentId)

    const card = await Card.findById(currentId)
    if (card?.dependencies) {
      for (const dep of card.dependencies) {
        // Follow 'blocks' dependencies to detect cycles
        if (dep.type === 'blocks') {
          stack.push(dep.cardId.toString())
        }
      }
    }
  }

  return false
}
