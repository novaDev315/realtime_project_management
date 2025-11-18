'use client'

import { Form, Input, InputNumber, DatePicker, Select, Checkbox, Upload, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface FieldOption {
  label: string
  value: string
}

interface CustomField {
  _id: string
  name: string
  fieldType: string
  required: boolean
  options?: FieldOption[]
  validation?: Array<{ type: string; value: any; message: string }>
  calculation?: string
}

interface CustomFieldRendererProps {
  fields: CustomField[]
  entityType: 'card' | 'project' | 'sprint'
  values?: Record<string, any>
  onChange?: (fieldId: string, value: any) => void
}

export default function CustomFieldRenderer({
  fields,
  entityType,
  values = {},
  onChange,
}: CustomFieldRendererProps) {
  const filteredFields = fields.filter((field) => field.appliesTo?.includes(entityType))

  const getValidationRules = (field: CustomField) => {
    const rules: any[] = []

    if (field.required) {
      rules.push({ required: true, message: `${field.name} is required` })
    }

    if (field.validation) {
      field.validation.forEach((validation) => {
        switch (validation.type) {
          case 'min':
            if (field.fieldType === 'number') {
              rules.push({
                type: 'number',
                min: validation.value,
                message: validation.message || `Minimum value is ${validation.value}`,
              })
            } else if (field.fieldType === 'text') {
              rules.push({
                min: validation.value,
                message: validation.message || `Minimum length is ${validation.value}`,
              })
            }
            break
          case 'max':
            if (field.fieldType === 'number') {
              rules.push({
                type: 'number',
                max: validation.value,
                message: validation.message || `Maximum value is ${validation.value}`,
              })
            } else if (field.fieldType === 'text') {
              rules.push({
                max: validation.value,
                message: validation.message || `Maximum length is ${validation.value}`,
              })
            }
            break
          case 'pattern':
            rules.push({
              pattern: new RegExp(validation.value),
              message: validation.message || 'Invalid format',
            })
            break
        }
      })
    }

    // Built-in validation for specific field types
    if (field.fieldType === 'email') {
      rules.push({
        type: 'email',
        message: 'Please enter a valid email address',
      })
    }

    if (field.fieldType === 'url') {
      rules.push({
        type: 'url',
        message: 'Please enter a valid URL',
      })
    }

    return rules
  }

  const renderField = (field: CustomField) => {
    const fieldName = `customField_${field._id}`
    const fieldValue = values[field._id]

    switch (field.fieldType) {
      case 'text':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Input
              placeholder={`Enter ${field.name.toLowerCase()}`}
              onChange={(e) => onChange?.(field._id, e.target.value)}
            />
          </Form.Item>
        )

      case 'number':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <InputNumber
              placeholder={`Enter ${field.name.toLowerCase()}`}
              style={{ width: '100%' }}
              onChange={(value) => onChange?.(field._id, value)}
            />
          </Form.Item>
        )

      case 'date':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue ? dayjs(fieldValue) : undefined}
          >
            <DatePicker
              style={{ width: '100%' }}
              onChange={(date) => onChange?.(field._id, date?.toISOString())}
            />
          </Form.Item>
        )

      case 'select':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Select
              placeholder={`Select ${field.name.toLowerCase()}`}
              onChange={(value) => onChange?.(field._id, value)}
            >
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'multi_select':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Select
              mode="multiple"
              placeholder={`Select ${field.name.toLowerCase()}`}
              onChange={(value) => onChange?.(field._id, value)}
            >
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'checkbox':
        return (
          <Form.Item
            key={field._id}
            name={fieldName}
            valuePropName="checked"
            initialValue={fieldValue || false}
          >
            <Checkbox onChange={(e) => onChange?.(field._id, e.target.checked)}>
              {field.name}
            </Checkbox>
          </Form.Item>
        )

      case 'email':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Input
              type="email"
              placeholder={`Enter ${field.name.toLowerCase()}`}
              onChange={(e) => onChange?.(field._id, e.target.value)}
            />
          </Form.Item>
        )

      case 'phone':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Input
              type="tel"
              placeholder={`Enter ${field.name.toLowerCase()}`}
              onChange={(e) => onChange?.(field._id, e.target.value)}
            />
          </Form.Item>
        )

      case 'url':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <Input
              type="url"
              placeholder={`Enter ${field.name.toLowerCase()}`}
              onChange={(e) => onChange?.(field._id, e.target.value)}
            />
          </Form.Item>
        )

      case 'file':
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e
              }
              return e?.fileList
            }}
          >
            <Upload
              beforeUpload={() => false}
              onChange={(info) => onChange?.(field._id, info.fileList)}
            >
              <Button icon={<UploadOutlined />}>Upload {field.name}</Button>
            </Upload>
          </Form.Item>
        )

      case 'calculated':
        // Calculated fields are read-only and computed based on formula
        return (
          <Form.Item
            key={field._id}
            label={field.name}
          >
            <Input
              value={fieldValue || 'N/A'}
              disabled
              placeholder="Calculated value"
            />
          </Form.Item>
        )

      default:
        return (
          <Form.Item
            key={field._id}
            label={field.name}
            name={fieldName}
            rules={getValidationRules(field)}
            initialValue={fieldValue}
          >
            <TextArea
              rows={3}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              onChange={(e) => onChange?.(field._id, e.target.value)}
            />
          </Form.Item>
        )
    }
  }

  if (filteredFields.length === 0) {
    return null
  }

  return (
    <div className="custom-fields-section">
      <div className="text-sm font-semibold text-gray-600 mb-4 uppercase">Custom Fields</div>
      {filteredFields.map((field) => renderField(field))}
    </div>
  )
}
