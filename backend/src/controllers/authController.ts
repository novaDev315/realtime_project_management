import { Response } from 'express'
import { User } from '../models/User'
import { generateToken } from '../utils/jwt'
import { AuthRequest } from '../middleware/auth'

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' })
      return
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
    })

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user with password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
