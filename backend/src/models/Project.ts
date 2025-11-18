import mongoose, { Document, Schema } from 'mongoose'

interface IProjectMember {
  userId: mongoose.Types.ObjectId
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: Date
}

export interface IProject extends Document {
  name: string
  description: string
  members: IProjectMember[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    members: [projectMemberSchema],
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

// Index for faster queries
projectSchema.index({ 'members.userId': 1 })
projectSchema.index({ createdBy: 1 })

export const Project = mongoose.model<IProject>('Project', projectSchema)
