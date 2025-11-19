import { Request, Response } from 'express'
import AIService from '../services/aiService'
import { Sprint } from '../models/Sprint'
import { Card } from '../models/Card'
import { Project } from '../models/Project'

const aiService = new AIService({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.OPENAI_MODEL,
})

// Predict sprint completion
export const predictSprintCompletion = async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' })
    }

    // Get historical sprints for the project
    const historicalSprints = await Sprint.find({
      projectId: sprint.projectId,
      status: 'completed',
    })
      .sort({ endDate: -1 })
      .limit(5)
      .lean()

    const prediction = await aiService.predictSprintCompletion(sprint.toObject(), historicalSprints)

    res.json(prediction)
  } catch (error: any) {
    console.error('Predict sprint completion error:', error)
    res.status(500).json({ error: error.message || 'Failed to predict sprint completion' })
  }
}

// Generate retrospective insights
export const generateRetroInsights = async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' })
    }

    // Get all cards from the sprint
    const cards = await Card.find({ sprintId }).lean()

    const insights = await aiService.generateRetroInsights(sprint.toObject(), cards)

    res.json(insights)
  } catch (error: any) {
    console.error('Generate retro insights error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate retrospective insights' })
  }
}

// Generate tasks from natural language description
export const generateTasksFromDescription = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const { description } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    const project = await Project.findById(projectId).lean()
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const result = await aiService.generateTasksFromDescription(description, project)

    res.json(result)
  } catch (error: any) {
    console.error('Generate tasks error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate tasks' })
  }
}

// Summarize meeting transcript
export const summarizeMeeting = async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body

    if (!transcript) {
      return res.status(400).json({ error: 'Meeting transcript is required' })
    }

    const summary = await aiService.summarizeMeeting(transcript)

    res.json(summary)
  } catch (error: any) {
    console.error('Summarize meeting error:', error)
    res.status(500).json({ error: error.message || 'Failed to summarize meeting' })
  }
}

// Predict project risks
export const predictRisks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    const project = await Project.findById(projectId).lean()
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Gather project metrics
    const sprints = await Sprint.find({ projectId }).lean()
    const cards = await Card.find({ projectId }).lean()

    const activeSprints = sprints.filter((s) => s.status === 'active').length
    const overdueTasks = cards.filter(
      (c) => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'done'
    ).length
    const blockedTasks = cards.filter((c) => c.blocked).length

    // Calculate velocity trend
    const recentSprints = sprints
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 3)

    const velocityTrend =
      recentSprints.length > 1
        ? recentSprints[0].velocity > recentSprints[recentSprints.length - 1].velocity
          ? 'increasing'
          : 'decreasing'
        : 'stable'

    const projectData = {
      activeSprints,
      overdueTasks,
      velocityTrend,
      resourceUtilization: 75, // This would come from actual resource data
      blockedTasks,
      recentDelays: overdueTasks,
    }

    const riskPrediction = await aiService.predictRisks(projectData)

    res.json(riskPrediction)
  } catch (error: any) {
    console.error('Predict risks error:', error)
    res.status(500).json({ error: error.message || 'Failed to predict risks' })
  }
}

// Optimize resource allocation
export const optimizeResourceAllocation = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params
    const { resources, tasks } = req.body

    if (!resources || !tasks) {
      return res.status(400).json({ error: 'Resources and tasks are required' })
    }

    const optimization = await aiService.optimizeResourceAllocation(resources, tasks)

    res.json(optimization)
  } catch (error: any) {
    console.error('Optimize resource allocation error:', error)
    res.status(500).json({ error: error.message || 'Failed to optimize resource allocation' })
  }
}

// Chat with AI assistant
export const chatWithAssistant = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // This would be enhanced with conversation history
    const aiService = new AIService({
      apiKey: process.env.OPENAI_API_KEY || '',
    })

    // Simple implementation - can be enhanced
    const response = await (aiService as any).callOpenAI(
      [
        {
          role: 'system',
          content: `You are a helpful project management assistant. Help users with project planning, task management, and team coordination. Context: ${JSON.stringify(context || {})}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      0.7
    )

    res.json({ response })
  } catch (error: any) {
    console.error('Chat with assistant error:', error)
    res.status(500).json({ error: error.message || 'Failed to get AI response' })
  }
}
