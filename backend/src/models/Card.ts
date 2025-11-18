import mongoose, { Document, Schema } from 'mongoose'

interface IComment {
  userId: mongoose.Types.ObjectId
  text: string
  createdAt: Date
}

interface IAttachment {
  filename: string
  url: string
  size: number
  mimeType: string
  uploadedBy: mongoose.Types.ObjectId
  uploadedAt: Date
}

interface IHistoryEvent {
  userId: mongoose.Types.ObjectId
  action: string
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: Date
}

export interface ICard extends Document {
  title: string
  description: string
  boardId: mongoose.Types.ObjectId
  columnId: mongoose.Types.ObjectId
  assignees: mongoose.Types.ObjectId[]
  labels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  storyPoints?: number
  dueDate?: Date
  attachments: IAttachment[]
  comments: IComment[]
  history: IHistoryEvent[]
  position: number
  sprintId?: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const attachmentSchema = new Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const historyEventSchema = new Schema<IHistoryEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const cardSchema = new Schema<ICard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    labels: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    storyPoints: {
      type: Number,
      min: 0,
    },
    dueDate: Date,
    attachments: [attachmentSchema],
    comments: [commentSchema],
    history: [historyEventSchema],
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
    },
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

// Indexes for faster queries
cardSchema.index({ boardId: 1, columnId: 1 })
cardSchema.index({ sprintId: 1 })
cardSchema.index({ assignees: 1 })

export const Card = mongoose.model<ICard>('Card', cardSchema)
