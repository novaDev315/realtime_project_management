'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DragOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

interface CustomField {
  _id: string
  name: string
  fieldType: string
  required: boolean
  appliesTo: string[]
  options?: Array<{ label: string; value: string }>
  validation?: Array<{ type: string; value: any; message: string }>
  position: number
}

interface CustomFieldBuilderProps {
  projectId: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (Single)' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'file', label: 'File Upload' },
  { value: 'calculated', label: 'Calculated' },
]

const APPLIES_TO_OPTIONS = [
  { value: 'card', label: 'Cards' },
  { value: 'project', label: 'Projects' },
  { value: 'sprint', label: 'Sprints' },
]

export default function CustomFieldBuilder({ projectId }: CustomFieldBuilderProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [form] = Form.useForm()
  const [fieldType, setFieldType] = useState<string>('text')
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    fetchFields()
  }, [projectId])

  const fetchFields = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/custom-fields`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setFields(response.data)
    } catch (error) {
      console.error('Error fetching custom fields:', error)
      message.error('Failed to fetch custom fields')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingField(null)
    setFieldType('text')
    setOptions([])
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (field: CustomField) => {
    setEditingField(field)
    setFieldType(field.fieldType)
    setOptions(field.options || [])
    form.setFieldsValue({
      name: field.name,
      fieldType: field.fieldType,
      required: field.required,
      appliesTo: field.appliesTo,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...values,
        options: ['select', 'multi_select'].includes(fieldType) ? options : undefined,
      }

      if (editingField) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/custom-fields/${editingField._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Custom field updated')
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/custom-fields`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Custom field created')
      }
      setModalVisible(false)
      form.resetFields()
      setOptions([])
      fetchFields()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save custom field')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/custom-fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('Custom field deleted')
      fetchFields()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete custom field')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/custom-fields/${id}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Custom field duplicated')
      fetchFields()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to duplicate custom field')
    }
  }

  const addOption = () => {
    setOptions([...options, { label: '', value: '' }])
  }

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const columns: ColumnsType<CustomField> = [
    {
      title: '',
      key: 'drag',
      width: 40,
      render: () => <DragOutlined style={{ cursor: 'move', color: '#999' }} />,
    },
    {
      title: 'Field Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'fieldType',
      key: 'fieldType',
      render: (type: string) => {
        const typeInfo = FIELD_TYPES.find((t) => t.value === type)
        return <Tag color="blue">{typeInfo?.label || type}</Tag>
      },
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => (required ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag>),
    },
    {
      title: 'Applies To',
      dataIndex: 'appliesTo',
      key: 'appliesTo',
      render: (appliesTo: string[]) => (
        <>
          {appliesTo.map((type) => (
            <Tag key={type} color="green">
              {type}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button type="link" icon={<CopyOutlined />} onClick={() => handleDuplicate(record._id)} />
          </Tooltip>
          <Popconfirm
            title="Delete this custom field?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Custom Fields</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Field
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={fields}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingField ? 'Edit Custom Field' : 'Create Custom Field'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setOptions([])
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Field Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a field name' }]}
          >
            <Input placeholder="e.g., Client Name, Project Budget" />
          </Form.Item>

          <Form.Item
            label="Field Type"
            name="fieldType"
            rules={[{ required: true, message: 'Please select a field type' }]}
          >
            <Select
              placeholder="Select field type"
              onChange={(value) => setFieldType(value)}
            >
              {FIELD_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {['select', 'multi_select'].includes(fieldType) && (
            <Form.Item label="Options">
              <div className="space-y-2">
                {options.map((option, index) => (
                  <Space key={index} className="w-full">
                    <Input
                      placeholder="Label"
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Input
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Button danger onClick={() => removeOption(index)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={addOption} block icon={<PlusOutlined />}>
                  Add Option
                </Button>
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Applies To"
            name="appliesTo"
            rules={[{ required: true, message: 'Please select where this field applies' }]}
          >
            <Select mode="multiple" placeholder="Select entity types">
              {APPLIES_TO_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Required" name="required" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                  setOptions([])
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingField ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
