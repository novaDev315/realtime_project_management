import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  testWebhook,
  getWebhookLogs,
} from '../controllers/webhookController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Webhook routes
router.get('/:id', getWebhookById)
router.put('/:id', updateWebhook)
router.delete('/:id', deleteWebhook)
router.post('/:id/toggle', toggleWebhook)
router.post('/:id/test', testWebhook)
router.get('/:id/logs', getWebhookLogs)

export default router

// Project-specific webhook routes
export const projectWebhookRoutes = Router()
projectWebhookRoutes.use(authenticate)
projectWebhookRoutes.get('/:projectId/webhooks', getWebhooks)
projectWebhookRoutes.post(
  '/:projectId/webhooks',
  [
    body('name').notEmpty().withMessage('Webhook name is required'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('events').isArray({ min: 1 }).withMessage('At least one event must be selected'),
  ],
  createWebhook
)
