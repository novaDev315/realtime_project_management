import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getAutomationRules,
  getAutomationRuleById,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule,
} from '../controllers/automationController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Automation rule routes
router.get('/:id', getAutomationRuleById)
router.put('/:id', updateAutomationRule)
router.delete('/:id', deleteAutomationRule)
router.post('/:id/toggle', toggleAutomationRule)

export default router

// Project-specific automation routes
export const projectAutomationRoutes = Router()
projectAutomationRoutes.use(authenticate)
projectAutomationRoutes.get('/:projectId/automation-rules', getAutomationRules)
projectAutomationRoutes.post(
  '/:projectId/automation-rules',
  [
    body('name').notEmpty().withMessage('Rule name is required'),
    body('trigger').notEmpty().withMessage('Trigger configuration is required'),
    body('actions').isArray().withMessage('Actions must be an array'),
  ],
  createAutomationRule
)
