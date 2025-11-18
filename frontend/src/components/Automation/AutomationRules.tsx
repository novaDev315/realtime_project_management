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
  Tag,
  Popconfirm,
  message,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

interface Condition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

interface Action {
  type: string
  parameters: Record<string, any>
}

interface AutomationRule {
  _id: string
  name: string
  description?: string
  enabled: boolean
  trigger: {
    type: string
    conditions?: Condition[]
  }
  actions: Action[]
  executionCount: number
  lastExecuted?: string
  createdBy: {
    name: string
  }
}

interface AutomationRulesProps {
  projectId: string
}

const TRIGGER_TYPES = [
  { value: 'card_created', label: 'Card Created' },
  { value: 'card_moved', label: 'Card Moved' },
  { value: 'card_updated', label: 'Card Updated' },
  { value: 'status_changed', label: 'Status Changed' },
  { value: 'assignee_changed', label: 'Assignee Changed' },
  { value: 'due_date_approaching', label: 'Due Date Approaching' },
  { value: 'sprint_started', label: 'Sprint Started' },
  { value: 'sprint_completed', label: 'Sprint Completed' },
]

const ACTION_TYPES = [
  { value: 'assign_user', label: 'Assign User', params: ['userId'] },
  { value: 'add_label', label: 'Add Label', params: ['label'] },
  { value: 'change_priority', label: 'Change Priority', params: ['priority'] },
  { value: 'add_comment', label: 'Add Comment', params: ['text'] },
  { value: 'send_notification', label: 'Send Notification', params: ['message'] },
  { value: 'move_column', label: 'Move to Column', params: ['columnId'] },
]

export default function AutomationRules({ projectId }: AutomationRulesProps) {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchRules()
  }, [projectId])

  const fetchRules = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/automation-rules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRules(response.data || [])
    } catch (error) {
      message.error('Failed to fetch automation rules')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRule(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule)
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      triggerType: rule.trigger.type,
      enabled: rule.enabled,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: values.name,
        description: values.description,
        enabled: values.enabled !== undefined ? values.enabled : true,
        trigger: {
          type: values.triggerType,
          conditions: [],
        },
        actions: values.actions || [
          {
            type: 'send_notification',
            parameters: { message: `Automated action triggered for ${values.name}` },
          },
        ],
      }

      if (editingRule) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/automation-rules/${editingRule._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Automation rule updated')
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/automation-rules`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Automation rule created')
      }

      setModalVisible(false)
      form.resetFields()
      fetchRules()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save automation rule')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/automation-rules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('Automation rule deleted')
      fetchRules()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete automation rule')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/automation-rules/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Automation rule toggled')
      fetchRules()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to toggle automation rule')
    }
  }

  const columns: ColumnsType<AutomationRule> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-semibold">{name}</span>
          {record.description && (
            <span className="text-sm text-gray-500">{record.description}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Trigger',
      dataIndex: ['trigger', 'type'],
      key: 'trigger',
      render: (type) => {
        const trigger = TRIGGER_TYPES.find((t) => t.value === type)
        return <Tag color="blue">{trigger?.label || type}</Tag>
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (actions: Action[]) => (
        <Space wrap>
          {actions.map((action, index) => {
            const actionType = ACTION_TYPES.find((a) => a.value === action.type)
            return (
              <Tag key={index} color="green">
                {actionType?.label || action.type}
              </Tag>
            )
          })}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) =>
        enabled ? <Tag color="green">Active</Tag> : <Tag color="red">Disabled</Tag>,
    },
    {
      title: 'Executions',
      dataIndex: 'executionCount',
      key: 'executionCount',
      sorter: (a, b) => a.executionCount - b.executionCount,
    },
    {
      title: 'Actions',
      key: 'actions_buttons',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggle(record._id)}
          >
            {record.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete this automation rule?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
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
            <ThunderboltOutlined />
            <span>Automation Rules</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Rule
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Rule Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a rule name' }]}
          >
            <Input placeholder="e.g., Auto-assign critical issues" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={2} placeholder="Describe what this rule does" />
          </Form.Item>

          <Divider>Trigger</Divider>

          <Form.Item
            label="When this happens..."
            name="triggerType"
            rules={[{ required: true, message: 'Please select a trigger' }]}
          >
            <Select placeholder="Select trigger event">
              {TRIGGER_TYPES.map((trigger) => (
                <Option key={trigger.value} value={trigger.value}>
                  {trigger.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Actions</Divider>

          <div className="mb-4 p-4 bg-blue-50 rounded">
            <p className="text-sm">
              Actions will be added in a future update. For now, rules will send notifications when
              triggered.
            </p>
          </div>

          <Form.Item label="Enabled" name="enabled" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRule ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
