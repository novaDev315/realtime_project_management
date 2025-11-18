import { Response } from 'express'
import ScheduledTask from '../models/ScheduledTask'
import { AuthRequest } from '../middleware/auth'
import { scheduleTask, unscheduleTask, calculateNextRun } from '../services/schedulerService'

// Get all scheduled tasks for a project
export const getScheduledTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params

    const tasks = await ScheduledTask.find({ projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get single scheduled task
export const getScheduledTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await ScheduledTask.findById(id)
      .populate('createdBy', 'name email')

    if (!task) {
      res.status(404).json({ error: 'Scheduled task not found' })
      return
    }

    res.json(task)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create scheduled task
export const createScheduledTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { name, description, schedule, action, enabled, timezone } = req.body
    const userId = req.user!.userId

    // Calculate next run time
    const nextRun = calculateNextRun(schedule, timezone || 'UTC')

    const task = new ScheduledTask({
      projectId,
      name,
      description,
      schedule,
      action,
      enabled: enabled !== undefined ? enabled : true,
      timezone: timezone || 'UTC',
      nextRun,
      createdBy: userId,
    })

    await task.save()

    // Schedule the task if enabled
    if (task.enabled) {
      scheduleTask(task)
    }

    const populatedTask = await ScheduledTask.findById(task._id)
      .populate('createdBy', 'name email')

    res.status(201).json(populatedTask)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Update scheduled task
export const updateScheduledTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, schedule, action, enabled, timezone } = req.body

    const task = await ScheduledTask.findById(id)

    if (!task) {
      res.status(404).json({ error: 'Scheduled task not found' })
      return
    }

    // Unschedule old task
    unscheduleTask(task._id.toString())

    // Update fields
    task.name = name || task.name
    task.description = description !== undefined ? description : task.description
    task.schedule = schedule || task.schedule
    task.action = action || task.action
    task.enabled = enabled !== undefined ? enabled : task.enabled
    task.timezone = timezone || task.timezone

    // Recalculate next run if schedule changed
    if (schedule) {
      task.nextRun = calculateNextRun(task.schedule, task.timezone)
    }

    await task.save()

    // Reschedule if enabled
    if (task.enabled) {
      scheduleTask(task)
    }

    const populatedTask = await ScheduledTask.findById(task._id)
      .populate('createdBy', 'name email')

    res.json(populatedTask)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete scheduled task
export const deleteScheduledTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await ScheduledTask.findById(id)

    if (!task) {
      res.status(404).json({ error: 'Scheduled task not found' })
      return
    }

    // Unschedule before deleting
    unscheduleTask(task._id.toString())

    await task.deleteOne()

    res.json({ message: 'Scheduled task deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Toggle scheduled task enabled/disabled
export const toggleScheduledTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await ScheduledTask.findById(id)

    if (!task) {
      res.status(404).json({ error: 'Scheduled task not found' })
      return
    }

    task.enabled = !task.enabled

    if (task.enabled) {
      task.nextRun = calculateNextRun(task.schedule, task.timezone)
      await task.save()
      scheduleTask(task)
    } else {
      await task.save()
      unscheduleTask(task._id.toString())
    }

    res.json(task)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Run scheduled task immediately
export const runScheduledTaskNow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await ScheduledTask.findById(id)

    if (!task) {
      res.status(404).json({ error: 'Scheduled task not found' })
      return
    }

    // Execute the task action
    const { executeTaskAction } = require('../services/schedulerService')
    await executeTaskAction(task)

    res.json({ message: 'Task executed successfully', lastRun: task.lastRun })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
