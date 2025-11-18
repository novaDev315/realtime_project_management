'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Tag, message, Statistic, Space, Modal, Form } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { formatDuration } from 'date-fns'
import axios from 'axios'

const { TextArea } = Input
const { Option } = Select

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
  userId: string
}

interface Card {
  _id: string
  title: string
}

interface TimeTrackerProps {
  projectId: string
  cards?: Card[]
}

export default function TimeTracker({ projectId, cards = [] }: TimeTrackerProps) {
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Fetch running timer on mount
  useEffect(() => {
    fetchRunningTimer()
  }, [projectId])

  // Update elapsed time every second for running timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (runningEntry && runningEntry.status === 'running') {
      const startTime = new Date(runningEntry.startTime).getTime()
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [runningEntry])

  const fetchRunningTimer = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-entries?status=running`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.data.length > 0) {
        setRunningEntry(response.data[0])
        const startTime = new Date(response.data[0].startTime).getTime()
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(elapsed)
      }
    } catch (error) {
      console.error('Error fetching running timer:', error)
    }
  }

  const handleStartTimer = async (values: any) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-entries/start`,
        {
          description: values.description,
          cardId: values.cardId,
          billable: values.billable || false,
          tags: values.tags || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRunningEntry(response.data)
      setElapsedTime(0)
      setIsModalVisible(false)
      form.resetFields()
      message.success('Timer started')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to start timer')
    } finally {
      setLoading(false)
    }
  }

  const handleStopTimer = async () => {
    if (!runningEntry) return
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/time-entries/${runningEntry._id}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRunningEntry(null)
      setElapsedTime(0)
      message.success('Timer stopped')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to stop timer')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Time Tracker</span>
          </Space>
        }
        extra={
          !runningEntry && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Start Timer
            </Button>
          )
        }
      >
        {runningEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{runningEntry.description}</h3>
                {runningEntry.cardId && (
                  <div className="text-sm text-gray-500 mb-2">
                    Card: {cards.find((c) => c._id === runningEntry.cardId)?.title || runningEntry.cardId}
                  </div>
                )}
                <div className="flex gap-2 mb-3">
                  {runningEntry.billable && <Tag color="green">Billable</Tag>}
                  {runningEntry.tags.map((tag, idx) => (
                    <Tag key={idx} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <Statistic
                  value={formatTime(elapsedTime)}
                  valueStyle={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}
                />
                <div className="text-sm text-gray-500 mt-1">
                  Started: {new Date(runningEntry.startTime).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <Button
              type="default"
              danger
              icon={<PauseCircleOutlined />}
              size="large"
              block
              onClick={handleStopTimer}
              loading={loading}
            >
              Stop Timer
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <ClockCircleOutlined style={{ fontSize: '48px' }} />
            <p className="mt-4">No timer running</p>
            <p className="text-sm">Click "Start Timer" to begin tracking time</p>
          </div>
        )}
      </Card>

      <Modal
        title="Start Time Tracker"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStartTimer}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea
              rows={3}
              placeholder="What are you working on?"
            />
          </Form.Item>

          <Form.Item
            label="Card (Optional)"
            name="cardId"
          >
            <Select
              placeholder="Select a card"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {cards.map((card) => (
                <Option key={card._id} value={card._id}>
                  {card.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tags (Optional)"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Billable"
            name="billable"
            valuePropName="checked"
          >
            <input type="checkbox" className="ml-2" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<PlayCircleOutlined />}
              >
                Start Timer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
