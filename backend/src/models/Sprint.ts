import mongoose, { Document, Schema } from 'mongoose'

export interface ISprint extends Document {
  name: string
  goal: string
  projectId: mongoose.Types.ObjectId
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed'
  capacity: number
  velocity?: number
  cards: mongoose.Types.ObjectId[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const sprintSchema = new Schema<ISprint>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
    capacity: {
      type: Number,
      required: true,
      default: 0,
    },
    velocity: {
      type: Number,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
sprintSchema.index({ projectId: 1, status: 1 })
sprintSchema.index({ startDate: 1, endDate: 1 })

// Validate dates
sprintSchema.pre('save', function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'))
  }
  next()
})

export const Sprint = mongoose.model<ISprint>('Sprint', sprintSchema)
