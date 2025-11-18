import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getCustomFields,
  getCustomFieldById,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields,
  duplicateCustomField,
} from '../controllers/customFieldController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Custom field routes
router.get('/:id', getCustomFieldById)
router.put('/:id', updateCustomField)
router.delete('/:id', deleteCustomField)
router.post('/:id/duplicate', duplicateCustomField)

export default router

// Project-specific custom field routes
export const projectCustomFieldRoutes = Router()
projectCustomFieldRoutes.use(authenticate)
projectCustomFieldRoutes.get('/:projectId/custom-fields', getCustomFields)
projectCustomFieldRoutes.post(
  '/:projectId/custom-fields',
  [
    body('name').notEmpty().withMessage('Field name is required'),
    body('fieldType').isIn(['text', 'number', 'date', 'select', 'multi_select', 'checkbox', 'url', 'email', 'phone', 'file', 'calculated']).withMessage('Invalid field type'),
    body('appliesTo').isArray().withMessage('appliesTo must be an array'),
  ],
  createCustomField
)
projectCustomFieldRoutes.post('/:projectId/custom-fields/reorder', reorderCustomFields)
