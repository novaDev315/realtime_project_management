import express from 'express'
import { authenticate } from '../middleware/auth'
import * as aiController from '../controllers/aiController'

const router = express.Router()

// All AI routes require authentication
router.use(authenticate)

// Sprint predictions
router.get('/sprints/:sprintId/predict-completion', aiController.predictSprintCompletion)

// Retrospective insights
router.get('/sprints/:sprintId/retro-insights', aiController.generateRetroInsights)

// Task generation from natural language
router.post('/projects/:projectId/generate-tasks', aiController.generateTasksFromDescription)

// Meeting summarization
router.post('/meetings/summarize', aiController.summarizeMeeting)

// Risk prediction
router.get('/projects/:projectId/predict-risks', aiController.predictRisks)

// Resource optimization
router.post('/projects/:projectId/optimize-resources', aiController.optimizeResourceAllocation)

// AI assistant chat
router.post('/chat', aiController.chatWithAssistant)

export default router
