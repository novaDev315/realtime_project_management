import mongoose, { Document, Schema } from 'mongoose'

export interface IScheduledTask extends Document {
  projectId: mongoose.Types.ObjectId
  name: string
  description?: string
  schedule: string // Cron expression (e.g., "0 9 * * 1" for every Monday at 9am)
  action: {
    type: 'create_card' | 'send_report' | 'update_sprint' | 'send_notification' | 'run_automation'
    parameters: Record<string, any>
  }
  enabled: boolean
  timezone: string
  lastRun?: Date
  nextRun?: Date
  runCount: number
  failureCount: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ScheduledTaskSchema = new Schema<IScheduledTask>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  schedule: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Basic cron validation (5 or 6 fields)
        const parts = v.trim().split(/\s+/)
        return parts.length >= 5 && parts.length <= 6
      },
      message: 'Invalid cron expression',
    },
  },
  action: {
    type: {
      type: String,
      required: true,
      enum: ['create_card', 'send_report', 'update_sprint', 'send_notification', 'run_automation'],
    },
    parameters: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  lastRun: Date,
  nextRun: Date,
  runCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

// Index for efficient querying
ScheduledTaskSchema.index({ projectId: 1, enabled: 1 })
ScheduledTaskSchema.index({ nextRun: 1, enabled: 1 })

export default mongoose.model<IScheduledTask>('ScheduledTask', ScheduledTaskSchema)
