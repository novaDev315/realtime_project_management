import mongoose, { Document, Schema } from 'mongoose'

interface IColumn {
  _id: mongoose.Types.ObjectId
  name: string
  position: number
  cards: mongoose.Types.ObjectId[]
}

export interface IBoard extends Document {
  name: string
  projectId: mongoose.Types.ObjectId
  columns: IColumn[]
  createdAt: Date
  updatedAt: Date
}

const columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
  },
  {
    _id: true,
  }
)

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    columns: [columnSchema],
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
boardSchema.index({ projectId: 1 })

export const Board = mongoose.model<IBoard>('Board', boardSchema)
