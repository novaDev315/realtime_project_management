import { Response } from 'express'
import AutomationRule from '../models/AutomationRule'
import Card from '../models/Card'
import { AuthRequest } from '../middleware/auth'

// Get all automation rules for a project
export const getAutomationRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params

    const rules = await AutomationRule.find({ projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(rules)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get single automation rule
export const getAutomationRuleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const rule = await AutomationRule.findById(id)
      .populate('createdBy', 'name email')

    if (!rule) {
      res.status(404).json({ error: 'Automation rule not found' })
      return
    }

    res.json(rule)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create automation rule
export const createAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { name, description, trigger, actions, enabled } = req.body
    const userId = req.user!.userId

    const rule = new AutomationRule({
      projectId,
      name,
      description,
      trigger,
      actions,
      enabled: enabled !== undefined ? enabled : true,
      createdBy: userId,
    })

    await rule.save()

    const populatedRule = await AutomationRule.findById(rule._id)
      .populate('createdBy', 'name email')

    res.status(201).json(populatedRule)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Update automation rule
export const updateAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, trigger, actions, enabled } = req.body

    const rule = await AutomationRule.findByIdAndUpdate(
      id,
      { name, description, trigger, actions, enabled },
      { new: true }
    ).populate('createdBy', 'name email')

    if (!rule) {
      res.status(404).json({ error: 'Automation rule not found' })
      return
    }

    res.json(rule)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete automation rule
export const deleteAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const rule = await AutomationRule.findByIdAndDelete(id)

    if (!rule) {
      res.status(404).json({ error: 'Automation rule not found' })
      return
    }

    res.json({ message: 'Automation rule deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Toggle automation rule enabled/disabled
export const toggleAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const rule = await AutomationRule.findById(id)

    if (!rule) {
      res.status(404).json({ error: 'Automation rule not found' })
      return
    }

    rule.enabled = !rule.enabled
    await rule.save()

    res.json(rule)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Execute automation rules for an event
export const executeAutomationRules = async (
  projectId: string,
  triggerType: string,
  triggerData: any
): Promise<void> => {
  try {
    // Find all enabled rules for this project and trigger type
    const rules = await AutomationRule.find({
      projectId,
      enabled: true,
      'trigger.type': triggerType,
    })

    for (const rule of rules) {
      // Check if conditions match (if any)
      if (rule.trigger.conditions && rule.trigger.conditions.length > 0) {
        const conditionsMet = rule.trigger.conditions.every((condition) => {
          const fieldValue = triggerData[condition.field]
          switch (condition.operator) {
            case 'equals':
              return fieldValue === condition.value
            case 'not_equals':
              return fieldValue !== condition.value
            case 'contains':
              return String(fieldValue).includes(String(condition.value))
            case 'greater_than':
              return Number(fieldValue) > Number(condition.value)
            case 'less_than':
              return Number(fieldValue) < Number(condition.value)
            default:
              return false
          }
        })

        if (!conditionsMet) continue
      }

      // Execute actions
      for (const action of rule.actions) {
        await executeAction(action, triggerData)
      }

      // Update execution stats
      rule.executionCount += 1
      rule.lastExecuted = new Date()
      await rule.save()
    }
  } catch (error) {
    console.error('Error executing automation rules:', error)
  }
}

// Execute a single action
async function executeAction(action: any, triggerData: any): Promise<void> {
  try {
    const cardId = triggerData.cardId || triggerData._id

    switch (action.type) {
      case 'assign_user':
        if (cardId && action.parameters.userId) {
          await Card.findByIdAndUpdate(cardId, {
            $addToSet: { assignees: action.parameters.userId },
          })
        }
        break

      case 'add_label':
        if (cardId && action.parameters.label) {
          await Card.findByIdAndUpdate(cardId, {
            $addToSet: { labels: action.parameters.label },
          })
        }
        break

      case 'change_priority':
        if (cardId && action.parameters.priority) {
          await Card.findByIdAndUpdate(cardId, {
            priority: action.parameters.priority,
          })
        }
        break

      case 'add_comment':
        if (cardId && action.parameters.text) {
          const card = await Card.findById(cardId)
          if (card) {
            card.comments.push({
              userId: action.parameters.userId || 'system',
              text: action.parameters.text,
              createdAt: new Date(),
            } as any)
            await card.save()
          }
        }
        break

      case 'send_notification':
        // In a real implementation, this would integrate with a notification service
        console.log('Notification:', action.parameters.message)
        break

      case 'move_column':
        if (cardId && action.parameters.columnId) {
          await Card.findByIdAndUpdate(cardId, {
            columnId: action.parameters.columnId,
          })
        }
        break

      default:
        console.log('Unknown action type:', action.type)
    }
  } catch (error) {
    console.error('Error executing action:', error)
  }
}
