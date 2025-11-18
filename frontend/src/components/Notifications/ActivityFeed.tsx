'use client'

import React, { useState } from 'react'
import { Card, Timeline, Avatar, Tag, Input, Button, Select, Space } from 'antd'
import {
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'comment' | 'card_created' | 'card_moved' | 'card_updated' | 'sprint_started' | 'member_added'
  user: {
    name: string
    avatar?: string
  }
  action: string
  target?: string
  timestamp: Date
  metadata?: any
}

interface ActivityFeedProps {
  projectId: string
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real app, fetch from API and listen to real-time updates
  const activities: Activity[] = [
    {
      id: '1',
      type: 'card_created',
      user: { name: 'Alice Johnson' },
      action: 'created card',
      target: 'Implement user authentication',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
      id: '2',
      type: 'comment',
      user: { name: 'Bob Smith' },
      action: 'commented on',
      target: 'Fix login bug',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      metadata: { comment: 'This should be prioritized' },
    },
    {
      id: '3',
      type: 'card_moved',
      user: { name: 'Charlie Brown' },
      action: 'moved',
      target: 'Update API endpoints',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      metadata: { from: 'In Progress', to: 'Done' },
    },
    {
      id: '4',
      type: 'sprint_started',
      user: { name: 'Diana Prince' },
      action: 'started sprint',
      target: 'Sprint 5',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: '5',
      type: 'member_added',
      user: { name: 'Eve Davis' },
      action: 'added',
      target: 'John Doe to the project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: '6',
      type: 'card_updated',
      user: { name: 'Alice Johnson' },
      action: 'updated',
      target: 'Design new dashboard',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      metadata: { field: 'priority', value: 'High' },
    },
    {
      id: '7',
      type: 'comment',
      user: { name: 'Bob Smith' },
      action: 'commented on',
      target: 'Database migration',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      metadata: { comment: 'Need to review this before deployment' },
    },
    {
      id: '8',
      type: 'card_moved',
      user: { name: 'Charlie Brown' },
      action: 'moved',
      target: 'Setup CI/CD pipeline',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      metadata: { from: 'To Do', to: 'In Progress' },
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageOutlined className="text-blue-500" />
      case 'card_created':
        return <FileAddOutlined className="text-green-500" />
      case 'card_moved':
        return <EditOutlined className="text-purple-500" />
      case 'card_updated':
        return <EditOutlined className="text-orange-500" />
      case 'sprint_started':
        return <ClockCircleOutlined className="text-cyan-500" />
      case 'member_added':
        return <UserOutlined className="text-indigo-500" />
      default:
        return <CheckCircleOutlined />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'blue'
      case 'card_created':
        return 'green'
      case 'card_moved':
        return 'purple'
      case 'card_updated':
        return 'orange'
      case 'sprint_started':
        return 'cyan'
      case 'member_added':
        return 'magenta'
      default:
        return 'gray'
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = filter === 'all' || activity.type === filter
    const matchesSearch =
      searchTerm === '' ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <Card
      title="Activity Feed"
      extra={
        <Space>
          <Input.Search
            placeholder="Search activities..."
            style={{ width: 200 }}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'All Activities' },
              { value: 'comment', label: 'Comments' },
              { value: 'card_created', label: 'Cards Created' },
              { value: 'card_moved', label: 'Cards Moved' },
              { value: 'card_updated', label: 'Cards Updated' },
              { value: 'sprint_started', label: 'Sprints' },
              { value: 'member_added', label: 'Team Changes' },
            ]}
          />
        </Space>
      }
    >
      <div style={{ maxHeight: 600, overflowY: 'auto' }}>
        <Timeline>
          {filteredActivities.map((activity) => (
            <Timeline.Item
              key={activity.id}
              dot={getActivityIcon(activity.type)}
              color={getActivityColor(activity.type)}
            >
              <div className="flex items-start gap-3">
                <Avatar size="small">{activity.user.name[0]}</Avatar>
                <div className="flex-1">
                  <div className="text-sm">
                    <strong>{activity.user.name}</strong>{' '}
                    <span className="text-gray-600">{activity.action}</span>{' '}
                    {activity.target && (
                      <span className="font-medium text-blue-600">
                        &quot;{activity.target}&quot;
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="mt-1">
                      {activity.metadata.comment && (
                        <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                          {activity.metadata.comment}
                        </div>
                      )}
                      {activity.metadata.from && activity.metadata.to && (
                        <div className="flex items-center gap-2 mt-1">
                          <Tag color="default">{activity.metadata.from}</Tag>
                          <span>→</span>
                          <Tag color="success">{activity.metadata.to}</Tag>
                        </div>
                      )}
                      {activity.metadata.field && (
                        <div className="text-sm text-gray-600 mt-1">
                          Set {activity.metadata.field} to{' '}
                          <Tag color="orange">{activity.metadata.value}</Tag>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No activities found matching your filters
          </div>
        )}
      </div>
    </Card>
  )
}
