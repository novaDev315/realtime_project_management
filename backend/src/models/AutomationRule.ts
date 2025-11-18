import mongoose, { Document, Schema } from 'mongoose'

export interface ITrigger {
  type: 'card_created' | 'card_moved' | 'card_updated' | 'status_changed' | 'assignee_changed' | 'due_date_approaching' | 'sprint_started' | 'sprint_completed'
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }>
}

export interface IAction {
  type: 'assign_user' | 'change_status' | 'add_label' | 'send_notification' | 'move_column' | 'add_comment' | 'change_priority' | 'set_due_date'
  parameters: Record<string, any>
}

export interface IAutomationRule extends Document {
  projectId: mongoose.Types.ObjectId
  name: string
  description?: string
  enabled: boolean
  trigger: ITrigger
  actions: IAction[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  executionCount: number
  lastExecuted?: Date
}

const TriggerSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['card_created', 'card_moved', 'card_updated', 'status_changed', 'assignee_changed', 'due_date_approaching', 'sprint_started', 'sprint_completed'],
  },
  conditions: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'],
    },
    value: Schema.Types.Mixed,
  }],
})

const ActionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['assign_user', 'change_status', 'add_label', 'send_notification', 'move_column', 'add_comment', 'change_priority', 'set_due_date'],
  },
  parameters: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true,
  },
})

const AutomationRuleSchema = new Schema<IAutomationRule>({
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
  enabled: {
    type: Boolean,
    default: true,
  },
  trigger: {
    type: TriggerSchema,
    required: true,
  },
  actions: {
    type: [ActionSchema],
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  executionCount: {
    type: Number,
    default: 0,
  },
  lastExecuted: Date,
}, {
  timestamps: true,
})

// Index for efficient querying
AutomationRuleSchema.index({ projectId: 1, enabled: 1 })
AutomationRuleSchema.index({ 'trigger.type': 1 })

export default mongoose.model<IAutomationRule>('AutomationRule', AutomationRuleSchema)
