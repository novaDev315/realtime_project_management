import mongoose, { Document, Schema } from 'mongoose'

interface IFieldOption {
  label: string
  value: string
  color?: string
}

interface IValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message?: string
}

interface IConditionalLogic {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
  action: 'show' | 'hide' | 'require'
}

export interface ICustomField extends Document {
  projectId: mongoose.Types.ObjectId
  name: string
  description?: string
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url' | 'email' | 'phone' | 'file' | 'calculated'
  options?: IFieldOption[]
  defaultValue?: any
  validation?: IValidationRule[]
  conditionalLogic?: IConditionalLogic[]
  calculation?: string // Formula for calculated fields
  required: boolean
  position: number
  appliesTo: ('card' | 'project' | 'sprint')[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const fieldOptionSchema = new Schema<IFieldOption>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    color: String,
  },
  { _id: false }
)

const validationRuleSchema = new Schema<IValidationRule>(
  {
    type: {
      type: String,
      enum: ['required', 'min', 'max', 'pattern', 'custom'],
      required: true,
    },
    value: Schema.Types.Mixed,
    message: String,
  },
  { _id: false }
)

const conditionalLogicSchema = new Schema<IConditionalLogic>(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'],
      required: true,
    },
    value: Schema.Types.Mixed,
    action: {
      type: String,
      enum: ['show', 'hide', 'require'],
      required: true,
    },
  },
  { _id: false }
)

const customFieldSchema = new Schema<ICustomField>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multi_select', 'checkbox', 'url', 'email', 'phone', 'file', 'calculated'],
      required: true,
    },
    options: [fieldOptionSchema],
    defaultValue: Schema.Types.Mixed,
    validation: [validationRuleSchema],
    conditionalLogic: [conditionalLogicSchema],
    calculation: String,
    required: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 0,
    },
    appliesTo: [{
      type: String,
      enum: ['card', 'project', 'sprint'],
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
customFieldSchema.index({ projectId: 1, position: 1 })
customFieldSchema.index({ appliesTo: 1 })

export const CustomField = mongoose.model<ICustomField>('CustomField', customFieldSchema)
