import { Response } from 'express'
import { CustomField } from '../models/CustomField'
import { AuthRequest } from '../middleware/auth'

export const getCustomFields = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { appliesTo } = req.query

    const query: any = { projectId }
    if (appliesTo) {
      query.appliesTo = appliesTo
    }

    const customFields = await CustomField.find(query)
      .populate('createdBy', 'name email')
      .sort({ position: 1 })

    res.json(customFields)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getCustomFieldById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const customField = await CustomField.findById(id)
      .populate('createdBy', 'name email')

    if (!customField) {
      res.status(404).json({ error: 'Custom field not found' })
      return
    }

    res.json(customField)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createCustomField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const {
      name,
      description,
      fieldType,
      options,
      defaultValue,
      validation,
      conditionalLogic,
      calculation,
      required,
      appliesTo,
    } = req.body
    const userId = req.user!.userId

    // Get current max position
    const maxPosition = await CustomField.findOne({ projectId }).sort({ position: -1 })
    const position = maxPosition ? maxPosition.position + 1 : 0

    const customField = await CustomField.create({
      projectId,
      name,
      description,
      fieldType,
      options,
      defaultValue,
      validation,
      conditionalLogic,
      calculation,
      required: required || false,
      position,
      appliesTo: appliesTo || ['card'],
      createdBy: userId,
    })

    const populatedField = await CustomField.findById(customField._id)
      .populate('createdBy', 'name email')

    res.status(201).json(populatedField)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateCustomField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body

    const customField = await CustomField.findById(id)
    if (!customField) {
      res.status(404).json({ error: 'Custom field not found' })
      return
    }

    Object.assign(customField, updateData)
    await customField.save()

    const populatedField = await CustomField.findById(customField._id)
      .populate('createdBy', 'name email')

    res.json(populatedField)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteCustomField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const customField = await CustomField.findById(id)
    if (!customField) {
      res.status(404).json({ error: 'Custom field not found' })
      return
    }

    await customField.deleteOne()
    res.json({ message: 'Custom field deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const reorderCustomFields = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { fieldIds } = req.body // Array of field IDs in new order

    // Update positions
    const updatePromises = fieldIds.map((fieldId: string, index: number) =>
      CustomField.findByIdAndUpdate(fieldId, { position: index })
    )

    await Promise.all(updatePromises)

    const customFields = await CustomField.find({ projectId }).sort({ position: 1 })
    res.json(customFields)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const duplicateCustomField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const originalField = await CustomField.findById(id)
    if (!originalField) {
      res.status(404).json({ error: 'Custom field not found' })
      return
    }

    const maxPosition = await CustomField.findOne({ projectId: originalField.projectId }).sort({ position: -1 })
    const position = maxPosition ? maxPosition.position + 1 : 0

    const duplicatedField = await CustomField.create({
      projectId: originalField.projectId,
      name: `${originalField.name} (Copy)`,
      description: originalField.description,
      fieldType: originalField.fieldType,
      options: originalField.options,
      defaultValue: originalField.defaultValue,
      validation: originalField.validation,
      conditionalLogic: originalField.conditionalLogic,
      calculation: originalField.calculation,
      required: originalField.required,
      position,
      appliesTo: originalField.appliesTo,
      createdBy: userId,
    })

    const populatedField = await CustomField.findById(duplicatedField._id)
      .populate('createdBy', 'name email')

    res.status(201).json(populatedField)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
