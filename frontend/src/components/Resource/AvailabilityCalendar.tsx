'use client'

import { useState, useEffect } from 'react'
import { Card, Calendar, Badge, Modal, Form, Select, DatePicker, Input, Button, Space, Tag, message } from 'antd'
import { CalendarOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import axios from 'axios'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

interface TimeOffEntry {
  _id: string
  userId: string
  userName: string
  type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'conference'
  startDate: string
  endDate: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
}

interface TeamMember {
  _id: string
  name: string
  role: string
  avatar?: string
}

interface AvailabilityCalendarProps {
  projectId: string
  teamMembers?: TeamMember[]
}

export default function AvailabilityCalendar({ projectId, teamMembers = [] }: AvailabilityCalendarProps) {
  const [timeOffEntries, setTimeOffEntries] = useState<TimeOffEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTimeOffEntries()
  }, [projectId])

  const fetchTimeOffEntries = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-off`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setTimeOffEntries(response.data || [])
    } catch (error) {
      // Generate mock data for demo
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const mockEntries: TimeOffEntry[] = [
      {
        _id: '1',
        userId: 'user-1',
        userName: 'John Doe',
        type: 'vacation',
        startDate: dayjs().add(3, 'day').toISOString(),
        endDate: dayjs().add(7, 'day').toISOString(),
        reason: 'Family vacation',
        status: 'approved',
      },
      {
        _id: '2',
        userId: 'user-2',
        userName: 'Jane Smith',
        type: 'conference',
        startDate: dayjs().add(10, 'day').toISOString(),
        endDate: dayjs().add(12, 'day').toISOString(),
        reason: 'Tech conference in SF',
        status: 'approved',
      },
      {
        _id: '3',
        userId: 'user-3',
        userName: 'Bob Wilson',
        type: 'sick',
        startDate: dayjs().subtract(2, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        status: 'approved',
      },
      {
        _id: '4',
        userId: 'user-1',
        userName: 'John Doe',
        type: 'personal',
        startDate: dayjs().add(15, 'day').toISOString(),
        endDate: dayjs().add(15, 'day').toISOString(),
        reason: 'Doctor appointment',
        status: 'pending',
      },
    ]
    setTimeOffEntries(mockEntries)
  }

  const handleAddTimeOff = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-off`,
        {
          ...values,
          startDate: values.dateRange[0].toISOString(),
          endDate: values.dateRange[1].toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      message.success('Time off request submitted')
      setModalVisible(false)
      form.resetFields()
      fetchTimeOffEntries()
    } catch (error) {
      message.error('Failed to submit time off request')
    }
  }

  const getEntriesForDate = (date: Dayjs): TimeOffEntry[] => {
    return timeOffEntries.filter((entry) => {
      const entryStart = dayjs(entry.startDate)
      const entryEnd = dayjs(entry.endDate)
      return date.isBetween(entryStart, entryEnd, 'day', '[]')
    })
  }

  const getAvailableMembers = (date: Dayjs): number => {
    const unavailable = getEntriesForDate(date).length
    const total = teamMembers.length || 8 // Default to 8 if no team members
    return Math.max(0, total - unavailable)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'blue'
      case 'sick':
        return 'red'
      case 'personal':
        return 'purple'
      case 'holiday':
        return 'green'
      case 'conference':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const dateCellRender = (date: Dayjs) => {
    const entries = getEntriesForDate(date)
    const available = getAvailableMembers(date)

    return (
      <div className="h-full">
        {entries.map((entry) => (
          <div key={entry._id} className="mb-1">
            <Badge
              status={entry.status === 'approved' ? 'success' : 'processing'}
              text={
                <span className="text-xs truncate">
                  {entry.userName}: {getTypeLabel(entry.type)}
                </span>
              }
            />
          </div>
        ))}
        {entries.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {available} available
          </div>
        )}
      </div>
    )
  }

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date)
    const entries = getEntriesForDate(date)
    if (entries.length > 0) {
      Modal.info({
        title: `Availability for ${date.format('MMMM D, YYYY')}`,
        content: (
          <div className="mt-4 space-y-3">
            <div className="mb-4">
              <Tag color="blue" className="text-base">
                {getAvailableMembers(date)} / {teamMembers.length || 8} Available
              </Tag>
            </div>
            {entries.map((entry) => (
              <div key={entry._id} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{entry.userName}</div>
                  <Tag color={getTypeColor(entry.type)}>{getTypeLabel(entry.type)}</Tag>
                </div>
                <div className="text-sm text-gray-600">
                  {dayjs(entry.startDate).format('MMM D')} - {dayjs(entry.endDate).format('MMM D, YYYY')}
                </div>
                {entry.reason && (
                  <div className="text-sm text-gray-500 mt-1">{entry.reason}</div>
                )}
                <div className="mt-2">
                  <Tag color={entry.status === 'approved' ? 'green' : 'gold'}>
                    {entry.status.toUpperCase()}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        ),
        width: 500,
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Team Availability Calendar</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Request Time Off
          </Button>
        }
      >
        <Calendar
          cellRender={dateCellRender}
          onSelect={onSelect}
          value={selectedDate}
        />

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <div className="font-semibold mb-2">Legend:</div>
          <Space wrap>
            <Tag color="blue">Vacation</Tag>
            <Tag color="red">Sick Leave</Tag>
            <Tag color="purple">Personal</Tag>
            <Tag color="green">Holiday</Tag>
            <Tag color="orange">Conference</Tag>
          </Space>
        </div>

        {/* Upcoming Time Off */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3">Upcoming Time Off</h4>
          <div className="space-y-2">
            {timeOffEntries
              .filter((entry) => dayjs(entry.startDate).isAfter(dayjs()))
              .sort((a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix())
              .slice(0, 5)
              .map((entry) => (
                <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <UserOutlined />
                    <div>
                      <div className="font-medium">{entry.userName}</div>
                      <div className="text-sm text-gray-600">
                        {dayjs(entry.startDate).format('MMM D')} - {dayjs(entry.endDate).format('MMM D, YYYY')}
                      </div>
                    </div>
                  </div>
                  <Space>
                    <Tag color={getTypeColor(entry.type)}>{getTypeLabel(entry.type)}</Tag>
                    <Tag color={entry.status === 'approved' ? 'green' : 'gold'}>
                      {entry.status.toUpperCase()}
                    </Tag>
                  </Space>
                </div>
              ))}
          </div>
        </div>
      </Card>

      <Modal
        title="Request Time Off"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTimeOff}>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select placeholder="Select type">
              <Option value="vacation">Vacation</Option>
              <Option value="sick">Sick Leave</Option>
              <Option value="personal">Personal</Option>
              <Option value="holiday">Holiday</Option>
              <Option value="conference">Conference</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Reason (Optional)" name="reason">
            <TextArea rows={3} placeholder="Provide a reason for your time off request" />
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
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
