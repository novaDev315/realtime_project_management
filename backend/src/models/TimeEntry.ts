import mongoose, { Document, Schema } from 'mongoose'

export interface ITimeEntry extends Document {
  userId: mongoose.Types.ObjectId
  cardId: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  description: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  billable: boolean
  status: 'running' | 'stopped' | 'approved' | 'rejected'
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const timeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    billable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'approved', 'rejected'],
      default: 'stopped',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
timeEntrySchema.index({ userId: 1, projectId: 1 })
timeEntrySchema.index({ cardId: 1 })
timeEntrySchema.index({ startTime: 1, endTime: 1 })
timeEntrySchema.index({ status: 1 })

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema)
