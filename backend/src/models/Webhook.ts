import mongoose, { Document, Schema } from 'mongoose'

export interface IWebhookLog {
  timestamp: Date
  status: number
  response?: string
  error?: string
  duration: number
}

export interface IWebhook extends Document {
  projectId: mongoose.Types.ObjectId
  name: string
  url: string
  secret?: string
  events: string[]
  enabled: boolean
  headers?: Map<string, string>
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  triggerCount: number
  failureCount: number
  logs: IWebhookLog[]
}

const WebhookLogSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: Number,
  response: String,
  error: String,
  duration: Number,
})

const WebhookSchema = new Schema<IWebhook>({
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
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'URL must be a valid HTTP(S) URL',
    },
  },
  secret: String,
  events: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length > 0
      },
      message: 'At least one event must be selected',
    },
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  headers: {
    type: Map,
    of: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastTriggered: Date,
  triggerCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  logs: {
    type: [WebhookLogSchema],
    default: [],
  },
}, {
  timestamps: true,
})

// Index for efficient querying
WebhookSchema.index({ projectId: 1, enabled: 1 })
WebhookSchema.index({ events: 1 })

// Keep only last 50 logs
WebhookSchema.pre('save', function(next) {
  if (this.logs && this.logs.length > 50) {
    this.logs = this.logs.slice(-50)
  }
  next()
})

export default mongoose.model<IWebhook>('Webhook', WebhookSchema)
