'use client'

import React, { useState } from 'react'
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface Task {
  id: string
  name: string
  assignee: string
  startDate: string
  endDate: string
  progress: number
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  dependencies: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface GanttChartProps {
  projectId: string
}

export default function GanttChart({ projectId }: GanttChartProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Project Planning',
      assignee: 'Alice',
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      progress: 100,
      status: 'completed',
      dependencies: [],
      priority: 'high',
    },
    {
      id: '2',
      name: 'UI/UX Design',
      assignee: 'Bob',
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      progress: 75,
      status: 'in-progress',
      dependencies: ['1'],
      priority: 'high',
    },
    {
      id: '3',
      name: 'Backend Development',
      assignee: 'Charlie',
      startDate: '2025-01-20',
      endDate: '2025-03-15',
      progress: 40,
      status: 'in-progress',
      dependencies: ['1'],
      priority: 'critical',
    },
    {
      id: '4',
      name: 'Frontend Development',
      assignee: 'Diana',
      startDate: '2025-02-01',
      endDate: '2025-03-20',
      progress: 30,
      status: 'in-progress',
      dependencies: ['2'],
      priority: 'high',
    },
    {
      id: '5',
      name: 'Testing & QA',
      assignee: 'Eve',
      startDate: '2025-03-10',
      endDate: '2025-04-05',
      progress: 0,
      status: 'not-started',
      dependencies: ['3', '4'],
      priority: 'medium',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()

  const getDuration = (start: string, end: string) => {
    return dayjs(end).diff(dayjs(start), 'day')
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'default',
      'in-progress': 'blue',
      completed: 'green',
      blocked: 'red',
    }
    return colors[status as keyof typeof colors]
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple',
    }
    return colors[priority as keyof typeof colors]
  }

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left' as const,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_: any, record: Task) => `${getDuration(record.startDate, record.endDate)} days`,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress: number) => `${progress}%`,
    },
    {
      title: 'Dependencies',
      dataIndex: 'dependencies',
      key: 'dependencies',
      width: 120,
      render: (deps: string[]) =>
        deps.length > 0 ? (
          <Space>
            <LinkOutlined />
            {deps.join(', ')}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Task) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    form.setFieldsValue({
      ...task,
      dates: [dayjs(task.startDate), dayjs(task.endDate)],
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleSubmit = (values: any) => {
    const taskData = {
      ...values,
      startDate: values.dates[0].format('YYYY-MM-DD'),
      endDate: values.dates[1].format('YYYY-MM-DD'),
    }
    delete taskData.dates

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t)))
    } else {
      setTasks([
        ...tasks,
        {
          id: String(tasks.length + 1),
          ...taskData,
        },
      ])
    }

    setIsModalOpen(false)
    setEditingTask(null)
    form.resetFields()
  }

  // Simple Gantt visualization using CSS
  const renderGanttBar = (task: Task) => {
    const projectStart = dayjs('2025-01-01')
    const projectEnd = dayjs('2025-04-30')
    const totalDays = projectEnd.diff(projectStart, 'day')

    const taskStart = dayjs(task.startDate)
    const taskDuration = getDuration(task.startDate, task.endDate)

    const startOffset = ((taskStart.diff(projectStart, 'day') / totalDays) * 100).toFixed(2)
    const width = ((taskDuration / totalDays) * 100).toFixed(2)

    const bgColors = {
      'not-started': '#e5e7eb',
      'in-progress': '#3b82f6',
      completed: '#10b981',
      blocked: '#ef4444',
    }

    return (
      <div className="relative h-8 bg-gray-100 rounded">
        <div
          className="absolute h-full rounded flex items-center px-2 text-white text-xs font-medium"
          style={{
            left: `${startOffset}%`,
            width: `${width}%`,
            backgroundColor: bgColors[task.status],
          }}
        >
          {task.progress}%
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card
        title="Gantt Chart - Project Timeline"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            Add Task
          </Button>
        }
      >
        {/* Timeline Header */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-64">Task</div>
          <div className="flex-1 flex justify-between px-4">
            <span>Jan 2025</span>
            <span>Feb 2025</span>
            <span>Mar 2025</span>
            <span>Apr 2025</span>
          </div>
        </div>

        {/* Gantt Bars */}
        <div className="space-y-2 mb-8">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <div className="w-64 text-sm font-medium truncate">{task.name}</div>
              <div className="flex-1">{renderGanttBar(task)}</div>
            </div>
          ))}
        </div>

        {/* Detailed Table */}
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={false}
        />
      </Card>

      {/* Add/Edit Task Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="assignee"
            label="Assignee"
            rules={[{ required: true, message: 'Please select assignee' }]}
          >
            <Select>
              <Select.Option value="Alice">Alice</Select.Option>
              <Select.Option value="Bob">Bob</Select.Option>
              <Select.Option value="Charlie">Charlie</Select.Option>
              <Select.Option value="Diana">Diana</Select.Option>
              <Select.Option value="Eve">Eve</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dates"
            label="Duration"
            rules={[{ required: true, message: 'Please select dates' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="not-started">Not Started</Select.Option>
              <Select.Option value="in-progress">In Progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="blocked">Blocked</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="critical">Critical</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="progress" label="Progress (%)" initialValue={0}>
            <Input type="number" min={0} max={100} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTask(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
