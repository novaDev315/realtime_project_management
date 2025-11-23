import { Router } from 'express'
import { auth } from '../middleware/auth'
import {
  getSprintReport,
  getProjectReport,
  getTimeReport,
  exportReport,
} from '../controllers/reportController'

const router = Router()

// All routes require authentication
router.use(auth)

// Sprint report
router.get('/sprint/:sprintId', getSprintReport)

// Project report
router.get('/project/:projectId', getProjectReport)

// Time tracking report
router.get('/time/:projectId', getTimeReport)

// Export report (returns data for PDF generation)
router.get('/export/:type/:id', exportReport)

export default router
