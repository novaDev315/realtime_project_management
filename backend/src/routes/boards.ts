import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addColumn,
} from '../controllers/boardController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Board routes
router.get('/:id', getBoardById)
router.put('/:id', updateBoard)
router.delete('/:id', deleteBoard)
router.post('/:id/columns', addColumn)

export default router

// Project-specific board routes
export const projectBoardRoutes = Router()
projectBoardRoutes.use(authenticate)
projectBoardRoutes.get('/:projectId/boards', getBoards)
projectBoardRoutes.post(
  '/:projectId/boards',
  [body('name').trim().notEmpty()],
  createBoard
)
