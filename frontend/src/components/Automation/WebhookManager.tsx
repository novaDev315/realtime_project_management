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
  Tabs,
  Badge,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface WebhookLog {
  timestamp: string
  status: number
  response?: string
  error?: string
  duration: number
}

interface Webhook {
  _id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
  triggerCount: number
  failureCount: number
  lastTriggered?: string
  createdBy: {
    name: string
  }
  logs?: WebhookLog[]
}

interface WebhookManagerProps {
  projectId: string
}

const WEBHOOK_EVENTS = [
  { value: 'card.created', label: 'Card Created' },
  { value: 'card.updated', label: 'Card Updated' },
  { value: 'card.moved', label: 'Card Moved' },
  { value: 'card.deleted', label: 'Card Deleted' },
  { value: 'sprint.started', label: 'Sprint Started' },
  { value: 'sprint.completed', label: 'Sprint Completed' },
  { value: 'comment.added', label: 'Comment Added' },
  { value: 'member.added', label: 'Team Member Added' },
  { value: 'project.updated', label: 'Project Updated' },
]

export default function WebhookManager({ projectId }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [logsModalVisible, setLogsModalVisible] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [selectedWebhookLogs, setSelectedWebhookLogs] = useState<WebhookLog[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    fetchWebhooks()
  }, [projectId])

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/webhooks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setWebhooks(response.data || [])
    } catch (error) {
      message.error('Failed to fetch webhooks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingWebhook(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    form.setFieldsValue({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      enabled: webhook.enabled,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: values.name,
        url: values.url,
        events: values.events,
        enabled: values.enabled !== undefined ? values.enabled : true,
        secret: values.secret,
      }

      if (editingWebhook) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${editingWebhook._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Webhook updated')
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/webhooks`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Webhook created')
      }

      setModalVisible(false)
      form.resetFields()
      fetchWebhooks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save webhook')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/webhooks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('Webhook deleted')
      fetchWebhooks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete webhook')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Webhook toggled')
      fetchWebhooks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to toggle webhook')
    }
  }

  const handleTest = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${id}/test`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.data.success) {
        message.success(`Webhook test successful (${response.data.duration}ms)`)
      } else {
        message.error(`Webhook test failed: ${response.data.error}`)
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to test webhook')
    }
  }

  const handleViewLogs = async (webhook: Webhook) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${webhook._id}/logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSelectedWebhookLogs(response.data || [])
      setLogsModalVisible(true)
    } catch (error) {
      message.error('Failed to fetch webhook logs')
    }
  }

  const columns: ColumnsType<Webhook> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-semibold">{name}</span>
          <span className="text-xs text-gray-500 truncate" style={{ maxWidth: '200px' }}>
            {record.url}
          </span>
        </Space>
      ),
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      render: (events: string[]) => (
        <Space wrap>
          {events.slice(0, 2).map((event) => (
            <Tag key={event} color="blue">
              {event}
            </Tag>
          ))}
          {events.length > 2 && <Tag>+{events.length - 2} more</Tag>}
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
      title: 'Success Rate',
      key: 'successRate',
      render: (_, record) => {
        const total = record.triggerCount
        const failures = record.failureCount
        const success = total - failures
        const rate = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0'
        return (
          <Tooltip title={`${success} successful, ${failures} failed out of ${total} total`}>
            <Badge
              count={`${rate}%`}
              style={{
                backgroundColor: parseFloat(rate) >= 90 ? '#52c41a' : parseFloat(rate) >= 70 ? '#faad14' : '#f5222d',
              }}
            />
          </Tooltip>
        )
      },
    },
    {
      title: 'Triggers',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      sorter: (a, b) => a.triggerCount - b.triggerCount,
    },
    {
      title: 'Last Triggered',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      render: (date) => (date ? dayjs(date).fromNow() : 'Never'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Test Webhook">
            <Button
              type="link"
              icon={<ThunderboltOutlined />}
              onClick={() => handleTest(record._id)}
            />
          </Tooltip>
          <Button type="link" onClick={() => handleViewLogs(record)}>
            Logs
          </Button>
          <Button
            type="link"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggle(record._id)}
          >
            {record.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete this webhook?"
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

  const logColumns: ColumnsType<WebhookLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => dayjs(date).format('MMM D, HH:mm:ss'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Space>
          {status >= 200 && status < 300 ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#f5222d' }} />
          )}
          <span>{status || 'Failed'}</span>
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration}ms`,
    },
    {
      title: 'Response/Error',
      key: 'details',
      render: (_, record) => (
        <span className="text-xs">
          {record.error || record.response?.substring(0, 50) || 'Success'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <ApiOutlined />
            <span>Webhooks</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Webhook
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={webhooks}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
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
            label="Webhook Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a webhook name' }]}
          >
            <Input placeholder="e.g., Slack Notifications" />
          </Form.Item>

          <Form.Item
            label="Payload URL"
            name="url"
            rules={[
              { required: true, message: 'Please enter a URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
          >
            <Input placeholder="https://your-service.com/webhook" />
          </Form.Item>

          <Form.Item
            label="Events"
            name="events"
            rules={[{ required: true, message: 'Please select at least one event' }]}
          >
            <Select mode="multiple" placeholder="Select events to subscribe to">
              {WEBHOOK_EVENTS.map((event) => (
                <Option key={event.value} value={event.value}>
                  {event.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Secret (Optional)" name="secret">
            <Input.Password placeholder="Secret key for webhook signature" />
          </Form.Item>

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
                {editingWebhook ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Webhook Logs"
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={logColumns}
          dataSource={selectedWebhookLogs}
          rowKey="timestamp"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}
