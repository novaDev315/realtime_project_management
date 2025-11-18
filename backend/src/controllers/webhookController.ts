import { Response } from 'express'
import axios from 'axios'
import crypto from 'crypto'
import Webhook from '../models/Webhook'
import { AuthRequest } from '../middleware/auth'

// Get all webhooks for a project
export const getWebhooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params

    const webhooks = await Webhook.find({ projectId })
      .select('-logs') // Exclude logs from list view
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(webhooks)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get single webhook with logs
export const getWebhookById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const webhook = await Webhook.findById(id)
      .populate('createdBy', 'name email')

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    res.json(webhook)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create webhook
export const createWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { name, url, secret, events, enabled, headers } = req.body
    const userId = req.user!.userId

    const webhook = new Webhook({
      projectId,
      name,
      url,
      secret,
      events,
      enabled: enabled !== undefined ? enabled : true,
      headers,
      createdBy: userId,
    })

    await webhook.save()

    const populatedWebhook = await Webhook.findById(webhook._id)
      .select('-logs')
      .populate('createdBy', 'name email')

    res.status(201).json(populatedWebhook)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Update webhook
export const updateWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, url, secret, events, enabled, headers } = req.body

    const webhook = await Webhook.findByIdAndUpdate(
      id,
      { name, url, secret, events, enabled, headers },
      { new: true }
    )
      .select('-logs')
      .populate('createdBy', 'name email')

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    res.json(webhook)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete webhook
export const deleteWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const webhook = await Webhook.findByIdAndDelete(id)

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    res.json({ message: 'Webhook deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Toggle webhook enabled/disabled
export const toggleWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const webhook = await Webhook.findById(id)

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    webhook.enabled = !webhook.enabled
    await webhook.save()

    res.json(webhook)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Test webhook
export const testWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const webhook = await Webhook.findById(id)

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Real-Time Project Management Platform',
      },
    }

    const result = await triggerWebhook(webhook, 'webhook.test', testPayload)

    res.json({
      success: result.success,
      status: result.status,
      duration: result.duration,
      response: result.response,
      error: result.error,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Trigger webhooks for an event
export const triggerWebhooks = async (
  projectId: string,
  event: string,
  payload: any
): Promise<void> => {
  try {
    // Find all enabled webhooks that subscribe to this event
    const webhooks = await Webhook.find({
      projectId,
      enabled: true,
      events: event,
    })

    // Trigger all matching webhooks in parallel
    const promises = webhooks.map((webhook) =>
      triggerWebhook(webhook, event, payload)
    )

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}

// Trigger a single webhook
async function triggerWebhook(
  webhook: any,
  event: string,
  payload: any
): Promise<{ success: boolean; status?: number; duration: number; response?: string; error?: string }> {
  const startTime = Date.now()

  try {
    const body = {
      event,
      timestamp: new Date().toISOString(),
      projectId: webhook.projectId,
      data: payload,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'RealTime-PM-Platform/1.0',
    }

    // Add custom headers
    if (webhook.headers) {
      webhook.headers.forEach((value: string, key: string) => {
        headers[key] = value
      })
    }

    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(body))
        .digest('hex')
      headers['X-Webhook-Signature'] = signature
    }

    const response = await axios.post(webhook.url, body, {
      headers,
      timeout: 10000, // 10 second timeout
    })

    const duration = Date.now() - startTime

    // Log successful execution
    webhook.logs.push({
      timestamp: new Date(),
      status: response.status,
      response: response.data ? JSON.stringify(response.data).substring(0, 500) : undefined,
      duration,
    })
    webhook.lastTriggered = new Date()
    webhook.triggerCount += 1

    await webhook.save()

    return {
      success: true,
      status: response.status,
      duration,
      response: response.data,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime

    // Log failed execution
    webhook.logs.push({
      timestamp: new Date(),
      status: error.response?.status || 0,
      error: error.message,
      duration,
    })
    webhook.failureCount += 1

    await webhook.save()

    return {
      success: false,
      status: error.response?.status,
      duration,
      error: error.message,
    }
  }
}

// Get webhook logs
export const getWebhookLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    const webhook = await Webhook.findById(id).select('logs')

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' })
      return
    }

    const logs = webhook.logs.slice(-limit).reverse()

    res.json(logs)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
