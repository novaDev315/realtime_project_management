import { Response } from 'express'
import { TimeEntry } from '../models/TimeEntry'
import { AuthRequest } from '../middleware/auth'

export const getTimeEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { startDate, endDate, userId, status } = req.query

    const query: any = { projectId }

    if (userId) query.userId = userId
    if (status) query.status = status
    if (startDate || endDate) {
      query.startTime = {}
      if (startDate) query.startTime.$gte = new Date(startDate as string)
      if (endDate) query.startTime.$lte = new Date(endDate as string)
    }

    const timeEntries = await TimeEntry.find(query)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')
      .sort({ startTime: -1 })

    res.json(timeEntries)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { cardId, description, startTime, endTime, billable, tags } = req.body
    const userId = req.user!.userId

    const timeEntry = await TimeEntry.create({
      userId,
      projectId,
      cardId,
      description,
      startTime: startTime || new Date(),
      endTime,
      billable: billable !== undefined ? billable : true,
      tags: tags || [],
      status: endTime ? 'stopped' : 'running',
    })

    // Calculate duration if endTime provided
    if (endTime) {
      const start = new Date(startTime || Date.now())
      const end = new Date(endTime)
      timeEntry.duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60)
      await timeEntry.save()
    }

    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')

    res.status(201).json(populatedEntry)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const startTimer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { cardId, description } = req.body
    const userId = req.user!.userId

    // Stop any running timers for this user
    await TimeEntry.updateMany(
      { userId, status: 'running' },
      { status: 'stopped', endTime: new Date() }
    )

    const timeEntry = await TimeEntry.create({
      userId,
      projectId,
      cardId,
      description,
      startTime: new Date(),
      status: 'running',
      billable: true,
    })

    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')

    res.status(201).json(populatedEntry)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const stopTimer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const timeEntry = await TimeEntry.findOne({ _id: id, userId })
    if (!timeEntry) {
      res.status(404).json({ error: 'Time entry not found' })
      return
    }

    if (timeEntry.status !== 'running') {
      res.status(400).json({ error: 'Timer is not running' })
      return
    }

    timeEntry.endTime = new Date()
    timeEntry.status = 'stopped'
    timeEntry.duration = Math.round((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / 1000 / 60)
    await timeEntry.save()

    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')

    res.json(populatedEntry)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const timeEntry = await TimeEntry.findOne({ _id: id, userId })
    if (!timeEntry) {
      res.status(404).json({ error: 'Time entry not found' })
      return
    }

    const { description, startTime, endTime, billable, tags } = req.body

    if (description !== undefined) timeEntry.description = description
    if (startTime !== undefined) timeEntry.startTime = new Date(startTime)
    if (endTime !== undefined) timeEntry.endTime = new Date(endTime)
    if (billable !== undefined) timeEntry.billable = billable
    if (tags !== undefined) timeEntry.tags = tags

    // Recalculate duration
    if (timeEntry.endTime) {
      timeEntry.duration = Math.round((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / 1000 / 60)
    }

    await timeEntry.save()

    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')

    res.json(populatedEntry)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const timeEntry = await TimeEntry.findOne({ _id: id, userId })
    if (!timeEntry) {
      res.status(404).json({ error: 'Time entry not found' })
      return
    }

    await timeEntry.deleteOne()
    res.json({ message: 'Time entry deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const approveTimeEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const timeEntry = await TimeEntry.findById(id)
    if (!timeEntry) {
      res.status(404).json({ error: 'Time entry not found' })
      return
    }

    timeEntry.status = 'approved'
    timeEntry.approvedBy = userId as any
    timeEntry.approvedAt = new Date()
    await timeEntry.save()

    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('userId', 'name email avatar')
      .populate('cardId', 'title')
      .populate('approvedBy', 'name email')

    res.json(populatedEntry)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getTimeReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { startDate, endDate, groupBy } = req.query

    const matchStage: any = { projectId }

    if (startDate || endDate) {
      matchStage.startTime = {}
      if (startDate) matchStage.startTime.$gte = new Date(startDate as string)
      if (endDate) matchStage.startTime.$lte = new Date(endDate as string)
    }

    const groupByField = groupBy === 'user' ? '$userId' : groupBy === 'card' ? '$cardId' : '$userId'

    const report = await TimeEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByField,
          totalDuration: { $sum: '$duration' },
          totalBillable: {
            $sum: {
              $cond: ['$billable', '$duration', 0]
            }
          },
          entryCount: { $sum: 1 },
        }
      },
      { $sort: { totalDuration: -1 } }
    ])

    res.json(report)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
