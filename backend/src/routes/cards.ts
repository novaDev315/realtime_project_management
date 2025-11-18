import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
} from '../controllers/cardController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Card routes
router.put('/:id', updateCard)
router.put('/:id/move', moveCard)
router.delete('/:id', deleteCard)
router.post('/:id/comments', [body('text').trim().notEmpty()], addComment)

export default router

// Board-specific card routes
export const boardCardRoutes = Router()
boardCardRoutes.use(authenticate)
boardCardRoutes.post(
  '/:boardId/columns/:columnId/cards',
  [body('title').trim().notEmpty()],
  createCard
)
