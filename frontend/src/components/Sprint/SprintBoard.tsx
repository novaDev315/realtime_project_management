'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Table,
  Tag,
  Progress,
  Space,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { RootState } from '@/store/store'
import { sprintApi } from '@/services/api'
import { setSprints, setCurrentSprint } from '@/store/slices/sprintSlice'
import dayjs from 'dayjs'

interface SprintBoardProps {
  projectId: string
}

export default function SprintBoard({ projectId }: SprintBoardProps) {
  const dispatch = useDispatch()
  const { sprints, currentSprint } = useSelector((state: RootState) => state.sprint)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadSprints()
  }, [projectId])

  const loadSprints = async () => {
    try {
      const response = await sprintApi.getAll(projectId)
      dispatch(setSprints(response.data))
    } catch (error) {
      console.error('Failed to load sprints:', error)
    }
  }

  const handleCreateSprint = async (values: any) => {
    try {
      setLoading(true)
      const response = await sprintApi.create(projectId, {
        name: values.name,
        goal: values.goal,
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString(),
        capacity: values.capacity,
      })
      dispatch(setSprints([...sprints, response.data]))
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Failed to create sprint:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintApi.start(sprintId)
      await loadSprints()
    } catch (error) {
      console.error('Failed to start sprint:', error)
    }
  }

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await sprintApi.complete(sprintId)
      await loadSprints()
    } catch (error) {
      console.error('Failed to complete sprint:', error)
    }
  }

  const getSprintProgress = (sprint: any) => {
    if (!sprint.cards || sprint.cards.length === 0) return 0
    // This would need to check actual card statuses
    return 0
  }

  const columns = [
    {
      title: 'Sprint Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          <small>{record.goal}</small>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          planning: 'blue',
          active: 'green',
          completed: 'default',
        }
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: any) => (
        <span>
          {dayjs(record.startDate).format('MMM DD')} - {dayjs(record.endDate).format('MMM DD')}
        </span>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity} pts`,
    },
    {
      title: 'Velocity',
      dataIndex: 'velocity',
      key: 'velocity',
      render: (velocity: number) => (velocity ? `${velocity} pts` : '-'),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: any) => {
        const progress = getSprintProgress(record)
        return <Progress percent={progress} size="small" />
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'planning' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartSprint(record._id)}
            >
              Start
            </Button>
          )}
          {record.status === 'active' && (
            <Button
              type="default"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteSprint(record._id)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const activeSprint = sprints.find((s) => s.status === 'active')

  return (
    <div className="space-y-6">
      {/* Active Sprint Summary */}
      {activeSprint && (
        <Card title="Active Sprint" extra={<Tag color="green">IN PROGRESS</Tag>}>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Statistic title="Sprint Goal" value={activeSprint.goal || 'No goal set'} />
            <Statistic
              title="Days Remaining"
              value={dayjs(activeSprint.endDate).diff(dayjs(), 'day')}
              suffix="days"
            />
            <Statistic title="Capacity" value={activeSprint.capacity} suffix="points" />
            <Statistic
              title="Completion"
              value={getSprintProgress(activeSprint)}
              suffix="%"
              prefix={<FireOutlined />}
            />
          </div>
          <Progress percent={getSprintProgress(activeSprint)} status="active" />
        </Card>
      )}

      {/* Sprint List */}
      <Card
        title="All Sprints"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Sprint
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sprints}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Sprint Modal */}
      <Modal
        title="Create New Sprint"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSprint}>
          <Form.Item
            name="name"
            label="Sprint Name"
            rules={[{ required: true, message: 'Please enter sprint name' }]}
          >
            <Input placeholder="e.g., Sprint 1" />
          </Form.Item>

          <Form.Item name="goal" label="Sprint Goal">
            <Input.TextArea
              placeholder="What do you want to achieve in this sprint?"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="dates"
            label="Sprint Duration"
            rules={[{ required: true, message: 'Please select sprint duration' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sprint Capacity (Story Points)"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Sprint
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
