'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  DatePicker,
  Select,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Tooltip,
} from 'antd'
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { TextArea } = Input

interface TimeEntry {
  _id: string
  description: string
  startTime: string
  endTime?: string
  duration: number
  status: 'running' | 'stopped' | 'approved' | 'rejected'
  billable: boolean
  tags: string[]
  cardId?: string
  userId: {
    _id: string
    name: string
  }
  approvedBy?: {
    _id: string
    name: string
  }
  approvedAt?: string
}

interface TimeEntryListProps {
  projectId: string
  onRefresh?: () => void
}

export default function TimeEntryList({ projectId, onRefresh }: TimeEntryListProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    userId: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchEntries()
  }, [projectId, filters])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-entries?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setEntries(response.data)
    } catch (error) {
      console.error('Error fetching time entries:', error)
      message.error('Failed to fetch time entries')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/time-entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('Time entry deleted')
      fetchEntries()
      onRefresh?.()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete time entry')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/time-entries/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Time entry approved')
      fetchEntries()
      onRefresh?.()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to approve time entry')
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    form.setFieldsValue({
      description: entry.description,
      billable: entry.billable,
      tags: entry.tags,
    })
    setEditModalVisible(true)
  }

  const handleUpdate = async (values: any) => {
    if (!editingEntry) return
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/time-entries/${editingEntry._id}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Time entry updated')
      setEditModalVisible(false)
      setEditingEntry(null)
      form.resetFields()
      fetchEntries()
      onRefresh?.()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to update time entry')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'blue'
      case 'stopped':
        return 'default'
      case 'approved':
        return 'green'
      case 'rejected':
        return 'red'
      default:
        return 'default'
    }
  }

  const columns: ColumnsType<TimeEntry> = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: 'User',
      dataIndex: ['userId', 'name'],
      key: 'user',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => formatDuration(duration),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Billable',
      dataIndex: 'billable',
      key: 'billable',
      render: (billable: boolean) => (billable ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag, idx) => (
            <Tag key={idx} color="blue">
              {tag}
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
          {record.status === 'stopped' && (
            <Tooltip title="Approve">
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record._id)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          {record.status !== 'running' && (
            <Tooltip title="Edit">
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this time entry?"
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
            <ClockCircleOutlined />
            <span>Time Entries</span>
          </Space>
        }
        extra={
          <Space>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    startDate: dates[0]?.toISOString(),
                    endDate: dates[1]?.toISOString(),
                  })
                } else {
                  setFilters({
                    ...filters,
                    startDate: undefined,
                    endDate: undefined,
                  })
                }
              }}
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="running">Running</Option>
              <Option value="stopped">Stopped</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
            <Button icon={<FilterOutlined />} onClick={fetchEntries}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} entries`,
          }}
        />
      </Card>

      <Modal
        title="Edit Time Entry"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingEntry(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select mode="tags" placeholder="Add tags" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Billable" name="billable" valuePropName="checked">
            <input type="checkbox" className="ml-2" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setEditModalVisible(false)
                  setEditingEntry(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
