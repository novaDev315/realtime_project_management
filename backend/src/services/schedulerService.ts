import cron from 'node-cron'
import ScheduledTask from '../models/ScheduledTask'
import Card from '../models/Card'
import parser from 'cron-parser'

// Store active cron jobs
const activeTasks = new Map<string, cron.ScheduledTask>()

// Initialize all enabled scheduled tasks on server start
export const initializeScheduler = async (): Promise<void> => {
  try {
    const tasks = await ScheduledTask.find({ enabled: true })

    console.log(`Initializing ${tasks.length} scheduled tasks...`)

    for (const task of tasks) {
      scheduleTask(task)
    }
  } catch (error) {
    console.error('Error initializing scheduler:', error)
  }
}

// Schedule a task
export const scheduleTask = (task: any): void => {
  try {
    const taskId = task._id.toString()

    // Unschedule if already scheduled
    if (activeTasks.has(taskId)) {
      activeTasks.get(taskId)?.stop()
      activeTasks.delete(taskId)
    }

    // Validate cron expression
    if (!cron.validate(task.schedule)) {
      console.error(`Invalid cron expression for task ${taskId}: ${task.schedule}`)
      return
    }

    // Create cron job
    const cronTask = cron.schedule(
      task.schedule,
      async () => {
        console.log(`Executing scheduled task: ${task.name} (${taskId})`)
        await executeTaskAction(task)
      },
      {
        scheduled: true,
        timezone: task.timezone || 'UTC',
      }
    )

    activeTasks.set(taskId, cronTask)
    console.log(`Scheduled task: ${task.name} (${taskId}) with cron: ${task.schedule}`)
  } catch (error) {
    console.error(`Error scheduling task ${task._id}:`, error)
  }
}

// Unschedule a task
export const unscheduleTask = (taskId: string): void => {
  if (activeTasks.has(taskId)) {
    activeTasks.get(taskId)?.stop()
    activeTasks.delete(taskId)
    console.log(`Unscheduled task: ${taskId}`)
  }
}

// Execute task action
export const executeTaskAction = async (task: any): Promise<void> => {
  try {
    const { type, parameters } = task.action

    switch (type) {
      case 'create_card':
        await executeCreateCard(task, parameters)
        break

      case 'send_report':
        await executeSendReport(task, parameters)
        break

      case 'send_notification':
        await executeSendNotification(task, parameters)
        break

      case 'update_sprint':
        await executeUpdateSprint(task, parameters)
        break

      case 'run_automation':
        await executeRunAutomation(task, parameters)
        break

      default:
        console.log(`Unknown task action type: ${type}`)
    }

    // Update last run and run count
    task.lastRun = new Date()
    task.runCount += 1
    task.nextRun = calculateNextRun(task.schedule, task.timezone)
    await task.save()

  } catch (error) {
    console.error(`Error executing task ${task._id}:`, error)
    task.failureCount += 1
    await task.save()
  }
}

// Action implementations
async function executeCreateCard(task: any, parameters: any): Promise<void> {
  if (!parameters.boardId || !parameters.columnId) {
    throw new Error('boardId and columnId are required for create_card action')
  }

  const card = new Card({
    title: parameters.title || 'Scheduled Task',
    description: parameters.description || '',
    boardId: parameters.boardId,
    columnId: parameters.columnId,
    priority: parameters.priority || 'medium',
    labels: parameters.labels || [],
    assignees: parameters.assignees || [],
    position: 0,
  })

  await card.save()
  console.log(`Created card: ${card.title}`)
}

async function executeSendReport(task: any, parameters: any): Promise<void> {
  // In a real implementation, this would generate and email a report
  console.log(`Sending report: ${parameters.reportType} to ${parameters.recipients}`)
  // Could integrate with email service like SendGrid
}

async function executeSendNotification(task: any, parameters: any): Promise<void> {
  // In a real implementation, this would send notifications via WebSocket or email
  console.log(`Sending notification: ${parameters.message}`)
  // Could broadcast via Socket.io or send email
}

async function executeUpdateSprint(task: any, parameters: any): Promise<void> {
  // In a real implementation, this would update sprint status
  console.log(`Updating sprint: ${parameters.sprintId} with status: ${parameters.status}`)
  // Could auto-start or complete sprints
}

async function executeRunAutomation(task: any, parameters: any): Promise<void> {
  // In a real implementation, this would trigger an automation rule
  console.log(`Running automation rule: ${parameters.automationRuleId}`)
  // Could execute automation rules on a schedule
}

// Calculate next run time
export const calculateNextRun = (schedule: string, timezone: string = 'UTC'): Date => {
  try {
    const interval = parser.parseExpression(schedule, {
      currentDate: new Date(),
      tz: timezone,
    })
    return interval.next().toDate()
  } catch (error) {
    console.error('Error calculating next run:', error)
    return new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24 hours from now
  }
}

// Get all active scheduled tasks
export const getActiveTaskCount = (): number => {
  return activeTasks.size
}

// Stop all scheduled tasks (for graceful shutdown)
export const stopAllTasks = (): void => {
  activeTasks.forEach((task, id) => {
    task.stop()
    console.log(`Stopped task: ${id}`)
  })
  activeTasks.clear()
  console.log('All scheduled tasks stopped')
}
