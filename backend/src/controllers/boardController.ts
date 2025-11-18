import { Response } from 'express'
import { Board } from '../models/Board'
import { Card } from '../models/Card'
import { Project } from '../models/Project'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const userId = req.user!.userId

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      'members.userId': userId,
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const boards = await Board.find({ projectId })
    res.json(boards)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const board = await Board.findById(id)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    // Populate cards
    const populatedBoard = await Board.findById(id).populate({
      path: 'columns.cards',
      populate: {
        path: 'assignees createdBy',
        select: 'name email avatar',
      },
    })

    res.json(populatedBoard)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { name } = req.body
    const userId = req.user!.userId

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      'members.userId': userId,
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    // Create board with default columns
    const board = await Board.create({
      name,
      projectId,
      columns: [
        { name: 'To Do', position: 0, cards: [], _id: new mongoose.Types.ObjectId() },
        { name: 'In Progress', position: 1, cards: [], _id: new mongoose.Types.ObjectId() },
        { name: 'Done', position: 2, cards: [], _id: new mongoose.Types.ObjectId() },
      ],
    })

    res.status(201).json(board)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, columns } = req.body

    const board = await Board.findById(id)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    if (name) board.name = name
    if (columns) board.columns = columns

    await board.save()
    res.json(board)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const board = await Board.findById(id)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    // Delete all cards in the board
    await Card.deleteMany({ boardId: id })

    await board.deleteOne()
    res.json({ message: 'Board deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const addColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name } = req.body

    const board = await Board.findById(id)
    if (!board) {
      res.status(404).json({ error: 'Board not found' })
      return
    }

    const newColumn = {
      _id: new mongoose.Types.ObjectId(),
      name,
      position: board.columns.length,
      cards: [],
    }

    board.columns.push(newColumn)
    await board.save()

    res.json(board)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
