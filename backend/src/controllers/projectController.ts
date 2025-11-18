import { Response } from 'express'
import { Project } from '../models/Project'
import { AuthRequest } from '../middleware/auth'

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId

    const projects = await Project.find({
      'members.userId': userId,
    }).populate('createdBy', 'name email avatar')

    res.json(projects)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const project = await Project.findOne({
      _id: id,
      'members.userId': userId,
    }).populate('members.userId', 'name email avatar')

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body
    const userId = req.user!.userId

    const project = await Project.create({
      name,
      description,
      createdBy: userId,
      members: [
        {
          userId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    })

    res.status(201).json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const userId = req.user!.userId

    const project = await Project.findOne({
      _id: id,
      'members.userId': userId,
      'members.role': { $in: ['owner', 'admin'] },
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' })
      return
    }

    project.name = name || project.name
    project.description = description || project.description
    await project.save()

    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const project = await Project.findOne({
      _id: id,
      'members.userId': userId,
      'members.role': 'owner',
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' })
      return
    }

    await project.deleteOne()
    res.json({ message: 'Project deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { userId: newUserId, role } = req.body
    const userId = req.user!.userId

    const project = await Project.findOne({
      _id: id,
      'members.userId': userId,
      'members.role': { $in: ['owner', 'admin'] },
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' })
      return
    }

    // Check if user is already a member
    const isMember = project.members.some(
      (m) => m.userId.toString() === newUserId
    )

    if (isMember) {
      res.status(400).json({ error: 'User is already a member' })
      return
    }

    project.members.push({
      userId: newUserId,
      role: role || 'member',
      joinedAt: new Date(),
    })

    await project.save()
    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, memberId } = req.params
    const userId = req.user!.userId

    const project = await Project.findOne({
      _id: id,
      'members.userId': userId,
      'members.role': { $in: ['owner', 'admin'] },
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' })
      return
    }

    project.members = project.members.filter(
      (m) => m.userId.toString() !== memberId
    )

    await project.save()
    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
