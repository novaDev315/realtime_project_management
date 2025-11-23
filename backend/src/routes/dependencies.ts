import { Router } from 'express'
import { auth } from '../middleware/auth'
import {
  addDependency,
  removeDependency,
  getDependencies,
  getDependencyGraph,
} from '../controllers/dependencyController'

const router = Router()

// All routes require authentication
router.use(auth)

// Card dependency routes
router.post('/card/:cardId', addDependency)
router.delete('/card/:cardId/:dependencyId', removeDependency)
router.get('/card/:cardId', getDependencies)

// Board dependency graph
router.get('/board/:boardId/graph', getDependencyGraph)

export default router
