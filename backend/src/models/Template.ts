import mongoose, { Document, Schema } from 'mongoose'

// Card Template Interface
export interface ICardTemplate {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  labels: string[]
  storyPoints?: number
  checklist?: Array<{
    item: string
    checked: boolean
  }>
  customFields?: Record<string, any>
}

// Sprint Template Interface
export interface ISprintTemplate {
  name: string
  durationDays: number
  goal?: string
  defaultCapacity: number
  cardTemplates: ICardTemplate[]
}

// Project Template Interface
export interface IProjectTemplate extends Document {
  name: string
  description: string
  category: 'agile' | 'kanban' | 'scrum' | 'waterfall' | 'custom'
  icon: string
  isPublic: boolean
  createdBy: mongoose.Types.ObjectId

  // Board configuration
  columns: Array<{
    name: string
    wipLimit?: number
    order: number
  }>

  // Default labels
  labels: Array<{
    name: string
    color: string
  }>

  // Sprint templates
  sprintTemplates: ISprintTemplate[]

  // Card templates
  cardTemplates: ICardTemplate[]

  // Custom fields configuration
  customFields: Array<{
    name: string
    fieldType: string
    required: boolean
    options?: string[]
  }>

  // Automation rules
  automationRules: Array<{
    name: string
    trigger: string
    conditions: Record<string, any>
    actions: Array<{
      type: string
      parameters: Record<string, any>
    }>
  }>

  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const CardTemplateSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  labels: [String],
  storyPoints: Number,
  checklist: [{
    item: String,
    checked: { type: Boolean, default: false }
  }],
  customFields: Schema.Types.Mixed
}, { _id: false })

const SprintTemplateSchema = new Schema({
  name: { type: String, required: true },
  durationDays: { type: Number, default: 14 },
  goal: String,
  defaultCapacity: { type: Number, default: 40 },
  cardTemplates: [CardTemplateSchema]
}, { _id: false })

const ProjectTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['agile', 'kanban', 'scrum', 'waterfall', 'custom'],
    default: 'agile'
  },
  icon: { type: String, default: '📋' },
  isPublic: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  columns: [{
    name: { type: String, required: true },
    wipLimit: Number,
    order: { type: Number, required: true }
  }],

  labels: [{
    name: { type: String, required: true },
    color: { type: String, required: true }
  }],

  sprintTemplates: [SprintTemplateSchema],
  cardTemplates: [CardTemplateSchema],

  customFields: [{
    name: { type: String, required: true },
    fieldType: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [String]
  }],

  automationRules: [{
    name: String,
    trigger: String,
    conditions: Schema.Types.Mixed,
    actions: [{
      type: String,
      parameters: Schema.Types.Mixed
    }]
  }],

  usageCount: { type: Number, default: 0 }
}, {
  timestamps: true
})

// Index for searching templates
ProjectTemplateSchema.index({ name: 'text', description: 'text' })
ProjectTemplateSchema.index({ category: 1, isPublic: 1 })
ProjectTemplateSchema.index({ createdBy: 1 })

export const ProjectTemplate = mongoose.model<IProjectTemplate>('ProjectTemplate', ProjectTemplateSchema)

// Pre-built templates
export const DEFAULT_TEMPLATES = {
  scrum: {
    name: 'Scrum Template',
    description: 'Standard Scrum framework with sprints, backlog grooming, and ceremonies',
    category: 'scrum',
    icon: '🏃',
    columns: [
      { name: 'Backlog', order: 0 },
      { name: 'Sprint Backlog', order: 1 },
      { name: 'In Progress', wipLimit: 5, order: 2 },
      { name: 'Code Review', wipLimit: 3, order: 3 },
      { name: 'Testing', wipLimit: 3, order: 4 },
      { name: 'Done', order: 5 }
    ],
    labels: [
      { name: 'feature', color: '#22c55e' },
      { name: 'bug', color: '#ef4444' },
      { name: 'tech-debt', color: '#f59e0b' },
      { name: 'documentation', color: '#3b82f6' },
      { name: 'blocked', color: '#dc2626' }
    ],
    sprintTemplates: [{
      name: 'Standard Sprint',
      durationDays: 14,
      goal: '',
      defaultCapacity: 40,
      cardTemplates: []
    }],
    cardTemplates: [
      {
        title: 'User Story',
        description: 'As a [user], I want [feature] so that [benefit]',
        priority: 'medium',
        labels: ['feature'],
        checklist: [
          { item: 'Acceptance criteria defined', checked: false },
          { item: 'Design approved', checked: false },
          { item: 'Code complete', checked: false },
          { item: 'Tests written', checked: false },
          { item: 'Code reviewed', checked: false }
        ]
      },
      {
        title: 'Bug Report',
        description: '**Steps to reproduce:**\n1. \n\n**Expected behavior:**\n\n**Actual behavior:**',
        priority: 'high',
        labels: ['bug'],
        checklist: [
          { item: 'Reproduced', checked: false },
          { item: 'Root cause identified', checked: false },
          { item: 'Fix implemented', checked: false },
          { item: 'Tested', checked: false }
        ]
      }
    ]
  },
  kanban: {
    name: 'Kanban Template',
    description: 'Continuous flow with WIP limits and visual management',
    category: 'kanban',
    icon: '📊',
    columns: [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', wipLimit: 3, order: 1 },
      { name: 'Review', wipLimit: 2, order: 2 },
      { name: 'Done', order: 3 }
    ],
    labels: [
      { name: 'urgent', color: '#dc2626' },
      { name: 'normal', color: '#3b82f6' },
      { name: 'low', color: '#6b7280' }
    ],
    sprintTemplates: [],
    cardTemplates: [
      {
        title: 'Task',
        description: '',
        priority: 'medium',
        labels: ['normal']
      }
    ]
  },
  agile: {
    name: 'Agile Template',
    description: 'Flexible agile framework combining best practices',
    category: 'agile',
    icon: '🚀',
    columns: [
      { name: 'Backlog', order: 0 },
      { name: 'Ready', order: 1 },
      { name: 'In Progress', wipLimit: 4, order: 2 },
      { name: 'Testing', wipLimit: 3, order: 3 },
      { name: 'Done', order: 4 }
    ],
    labels: [
      { name: 'feature', color: '#22c55e' },
      { name: 'improvement', color: '#8b5cf6' },
      { name: 'bug', color: '#ef4444' },
      { name: 'research', color: '#06b6d4' }
    ],
    sprintTemplates: [{
      name: 'Iteration',
      durationDays: 7,
      goal: '',
      defaultCapacity: 20,
      cardTemplates: []
    }],
    cardTemplates: []
  }
}
