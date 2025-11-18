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
  Tooltip,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface ScheduledTask {
  _id: string
  name: string
  description?: string
  schedule: string
  action: {
    type: string
    parameters: Record<string, any>
  }
  enabled: boolean
  timezone: string
  lastRun?: string
  nextRun?: string
  runCount: number
  failureCount: number
  createdBy: {
    name: string
  }
}

interface ScheduledTaskManagerProps {
  projectId: string
}

const ACTION_TYPES = [
  { value: 'create_card', label: 'Create Card', params: ['title', 'columnId'] },
  { value: 'send_report', label: 'Send Report', params: ['reportType', 'recipients'] },
  { value: 'update_sprint', label: 'Update Sprint', params: ['sprintId', 'action'] },
  { value: 'send_notification', label: 'Send Notification', params: ['message', 'recipients'] },
  { value: 'run_automation', label: 'Run Automation', params: ['automationRuleId'] },
]

const CRON_PRESETS = [
  { value: '0 9 * * 1-5', label: 'Every weekday at 9 AM' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 0 * * 0', label: 'Weekly on Sunday at midnight' },
  { value: '0 0 1 * *', label: 'Monthly on the 1st at midnight' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
  { value: '0 */2 * * *', label: 'Every 2 hours' },
]

export default function ScheduledTaskManager({ projectId }: ScheduledTaskManagerProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/scheduled-tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setTasks(response.data || [])
    } catch (error) {
      message.error('Failed to fetch scheduled tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTask(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (task: ScheduledTask) => {
    setEditingTask(task)
    form.setFieldsValue({
      name: task.name,
      description: task.description,
      schedule: task.schedule,
      actionType: task.action.type,
      enabled: task.enabled,
      timezone: task.timezone,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: values.name,
        description: values.description,
        schedule: values.schedule,
        action: {
          type: values.actionType,
          parameters: values.parameters || {
            message: `Scheduled action: ${values.name}`,
          },
        },
        enabled: values.enabled !== undefined ? values.enabled : true,
        timezone: values.timezone || 'UTC',
      }

      if (editingTask) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/scheduled-tasks/${editingTask._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Scheduled task updated')
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/scheduled-tasks`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        message.success('Scheduled task created')
      }

      setModalVisible(false)
      form.resetFields()
      fetchTasks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save scheduled task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/scheduled-tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('Scheduled task deleted')
      fetchTasks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete scheduled task')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/scheduled-tasks/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Scheduled task toggled')
      fetchTasks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to toggle scheduled task')
    }
  }

  const handleRunNow = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/scheduled-tasks/${id}/run`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Scheduled task executed')
      fetchTasks()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to run scheduled task')
    }
  }

  const columns: ColumnsType<ScheduledTask> = [
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
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => (
        <Tooltip title={schedule}>
          <Tag icon={<ClockCircleOutlined />} color="blue">
            {CRON_PRESETS.find((p) => p.value === schedule)?.label || 'Custom'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      dataIndex: ['action', 'type'],
      key: 'action',
      render: (type) => {
        const action = ACTION_TYPES.find((a) => a.value === type)
        return <Tag color="green">{action?.label || type}</Tag>
      },
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (nextRun) =>
        nextRun ? (
          <Tooltip title={dayjs(nextRun).format('YYYY-MM-DD HH:mm:ss')}>
            <Text>{dayjs(nextRun).fromNow()}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
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
      key: 'executions',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-sm">Runs: {record.runCount}</Text>
          {record.failureCount > 0 && (
            <Text type="danger" className="text-sm">
              Failures: {record.failureCount}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Run now">
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunNow(record._id)}
            />
          </Tooltip>
          <Button
            type="link"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggle(record._id)}
          >
            {record.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete this scheduled task?"
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
            <ClockCircleOutlined />
            <span>Scheduled Tasks</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Task
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTask ? 'Edit Scheduled Task' : 'Create Scheduled Task'}
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
            label="Task Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input placeholder="e.g., Daily standup reminder" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={2} placeholder="Describe what this task does" />
          </Form.Item>

          <Divider>Schedule</Divider>

          <Form.Item
            label={
              <Space>
                <span>Cron Schedule</span>
                <Tooltip title="Cron expression format: minute hour day-of-month month day-of-week">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            name="schedule"
            rules={[{ required: true, message: 'Please enter a cron schedule' }]}
          >
            <Select
              placeholder="Select a preset or enter custom cron expression"
              allowClear
              showSearch
              mode="tags"
              maxCount={1}
            >
              {CRON_PRESETS.map((preset) => (
                <Option key={preset.value} value={preset.value}>
                  {preset.label} ({preset.value})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Timezone" name="timezone" initialValue="UTC">
            <Select placeholder="Select timezone">
              <Option value="UTC">UTC</Option>
              <Option value="America/New_York">America/New_York</Option>
              <Option value="America/Los_Angeles">America/Los_Angeles</Option>
              <Option value="Europe/London">Europe/London</Option>
              <Option value="Asia/Tokyo">Asia/Tokyo</Option>
            </Select>
          </Form.Item>

          <Divider>Action</Divider>

          <Form.Item
            label="Action Type"
            name="actionType"
            rules={[{ required: true, message: 'Please select an action type' }]}
          >
            <Select placeholder="Select action to perform">
              {ACTION_TYPES.map((action) => (
                <Option key={action.value} value={action.value}>
                  {action.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="mb-4 p-4 bg-blue-50 rounded">
            <p className="text-sm">
              Action parameters will be configured in a future update. For now, tasks will use
              default parameters.
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
                {editingTask ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
