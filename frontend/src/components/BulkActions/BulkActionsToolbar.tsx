'use client'

import { useState } from 'react'
import {
  Button,
  Space,
  Dropdown,
  Modal,
  Select,
  DatePicker,
  message,
  Tag,
  Popconfirm,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  UserAddOutlined,
  TagOutlined,
  FlagOutlined,
  CalendarOutlined,
  RightOutlined,
  ThunderboltOutlined,
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Text } = Typography

interface BulkActionsToolbarProps {
  selectedCardIds: string[]
  boardId: string
  columns: Array<{ _id: string; name: string }>
  members: Array<{ _id: string; name: string; email: string }>
  sprints?: Array<{ _id: string; name: string }>
  labels?: string[]
  onClearSelection: () => void
  onActionComplete: () => void
}

export default function BulkActionsToolbar({
  selectedCardIds,
  boardId,
  columns,
  members,
  sprints = [],
  labels = [],
  onClearSelection,
  onActionComplete,
}: BulkActionsToolbarProps) {
  const [loading, setLoading] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [labelModal, setLabelModal] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [assignMode, setAssignMode] = useState<'add' | 'remove' | 'replace'>('add')
  const [labelMode, setLabelMode] = useState<'add' | 'remove' | 'replace'>('add')

  const count = selectedCardIds.length

  if (count === 0) return null

  const bulkAction = async (
    endpoint: string,
    body: any,
    successMessage: string
  ) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bulk${endpoint}`,
        { cardIds: selectedCardIds, ...body },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      message.success(successMessage)
      onClearSelection()
      onActionComplete()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMove = async (columnId: string) => {
    await bulkAction('/cards/move', { columnId, boardId }, `Moved ${count} cards`)
  }

  const handlePriority = async (priority: string) => {
    await bulkAction('/cards/priority', { priority }, `Set priority on ${count} cards`)
  }

  const handleSprint = async (sprintId: string | null) => {
    await bulkAction(
      '/cards/sprint',
      { sprintId },
      sprintId ? `Added ${count} cards to sprint` : `Removed ${count} cards from sprint`
    )
  }

  const handleDueDate = async (date: dayjs.Dayjs | null) => {
    await bulkAction(
      '/cards/due-date',
      { dueDate: date?.toISOString() || null },
      `Set due date on ${count} cards`
    )
  }

  const handleAssign = async () => {
    await bulkAction(
      '/cards/assign',
      { assigneeIds: selectedAssignees, mode: assignMode },
      `Updated assignees on ${count} cards`
    )
    setAssignModal(false)
    setSelectedAssignees([])
  }

  const handleLabels = async () => {
    await bulkAction(
      '/cards/labels',
      { labels: selectedLabels, mode: labelMode },
      `Updated labels on ${count} cards`
    )
    setLabelModal(false)
    setSelectedLabels([])
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bulk/cards`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { cardIds: selectedCardIds },
      })
      message.success(`Deleted ${count} cards`)
      onClearSelection()
      onActionComplete()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const priorityItems = [
    { key: 'critical', label: <Tag color="red">Critical</Tag> },
    { key: 'high', label: <Tag color="orange">High</Tag> },
    { key: 'medium', label: <Tag color="blue">Medium</Tag> },
    { key: 'low', label: <Tag color="green">Low</Tag> },
  ]

  const columnItems = columns.map((col) => ({
    key: col._id,
    label: col.name,
  }))

  const sprintItems = [
    { key: 'none', label: 'Remove from sprint' },
    ...sprints.map((s) => ({ key: s._id, label: s.name })),
  ]

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3">
          <Space size="middle">
            <div className="flex items-center gap-2">
              <CheckOutlined className="text-blue-500" />
              <Text strong>{count} selected</Text>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Move to column */}
            <Dropdown
              menu={{
                items: columnItems,
                onClick: ({ key }) => handleMove(key),
              }}
              disabled={loading}
            >
              <Button icon={<RightOutlined />} size="small">
                Move to
              </Button>
            </Dropdown>

            {/* Set priority */}
            <Dropdown
              menu={{
                items: priorityItems,
                onClick: ({ key }) => handlePriority(key),
              }}
              disabled={loading}
            >
              <Button icon={<FlagOutlined />} size="small">
                Priority
              </Button>
            </Dropdown>

            {/* Assign */}
            <Button
              icon={<UserAddOutlined />}
              size="small"
              onClick={() => setAssignModal(true)}
              disabled={loading}
            >
              Assign
            </Button>

            {/* Labels */}
            <Button
              icon={<TagOutlined />}
              size="small"
              onClick={() => setLabelModal(true)}
              disabled={loading}
            >
              Labels
            </Button>

            {/* Sprint */}
            {sprints.length > 0 && (
              <Dropdown
                menu={{
                  items: sprintItems,
                  onClick: ({ key }) => handleSprint(key === 'none' ? null : key),
                }}
                disabled={loading}
              >
                <Button icon={<ThunderboltOutlined />} size="small">
                  Sprint
                </Button>
              </Dropdown>
            )}

            {/* Due date */}
            <DatePicker
              placeholder="Set due date"
              size="small"
              onChange={handleDueDate}
              disabled={loading}
              suffixIcon={<CalendarOutlined />}
              style={{ width: 130 }}
            />

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Delete */}
            <Popconfirm
              title={`Delete ${count} cards?`}
              description="This action cannot be undone."
              onConfirm={handleDelete}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small" disabled={loading}>
                Delete
              </Button>
            </Popconfirm>

            {/* Clear selection */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              size="small"
              onClick={onClearSelection}
            />
          </Space>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        title="Bulk Assign"
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        onOk={handleAssign}
        okButtonProps={{ disabled: selectedAssignees.length === 0 }}
      >
        <Space direction="vertical" className="w-full" size="middle">
          <div>
            <Text strong className="block mb-2">Mode</Text>
            <Select
              value={assignMode}
              onChange={setAssignMode}
              style={{ width: '100%' }}
              options={[
                { value: 'add', label: 'Add assignees' },
                { value: 'remove', label: 'Remove assignees' },
                { value: 'replace', label: 'Replace all assignees' },
              ]}
            />
          </div>
          <div>
            <Text strong className="block mb-2">Team Members</Text>
            <Select
              mode="multiple"
              value={selectedAssignees}
              onChange={setSelectedAssignees}
              style={{ width: '100%' }}
              placeholder="Select team members"
              options={members.map((m) => ({
                value: m._id,
                label: m.name || m.email,
              }))}
            />
          </div>
        </Space>
      </Modal>

      {/* Labels Modal */}
      <Modal
        title="Bulk Labels"
        open={labelModal}
        onCancel={() => setLabelModal(false)}
        onOk={handleLabels}
        okButtonProps={{ disabled: selectedLabels.length === 0 }}
      >
        <Space direction="vertical" className="w-full" size="middle">
          <div>
            <Text strong className="block mb-2">Mode</Text>
            <Select
              value={labelMode}
              onChange={setLabelMode}
              style={{ width: '100%' }}
              options={[
                { value: 'add', label: 'Add labels' },
                { value: 'remove', label: 'Remove labels' },
                { value: 'replace', label: 'Replace all labels' },
              ]}
            />
          </div>
          <div>
            <Text strong className="block mb-2">Labels</Text>
            <Select
              mode="tags"
              value={selectedLabels}
              onChange={setSelectedLabels}
              style={{ width: '100%' }}
              placeholder="Select or create labels"
              options={labels.map((l) => ({ value: l, label: l }))}
            />
          </div>
        </Space>
      </Modal>
    </>
  )
}
