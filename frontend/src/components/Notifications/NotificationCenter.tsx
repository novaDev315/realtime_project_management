'use client'

import React, { useState, useEffect } from 'react'
import { Badge, Dropdown, List, Avatar, Typography, Tag, Button, Empty } from 'antd'
import {
  BellOutlined,
  MessageOutlined,
  UserAddOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'

const { Text } = Typography

interface Notification {
  id: string
  type: 'comment' | 'mention' | 'assignment' | 'status_change' | 'deadline'
  title: string
  message: string
  timestamp: Date
  read: boolean
  user?: {
    name: string
    avatar?: string
  }
  link?: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned',
      message: '@you Alice mentioned you in "Update Login Flow"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      user: { name: 'Alice' },
    },
    {
      id: '2',
      type: 'assignment',
      title: 'New task assigned',
      message: 'Bob assigned you to "Fix Navigation Bug"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      user: { name: 'Bob' },
    },
    {
      id: '3',
      type: 'comment',
      title: 'New comment',
      message: 'Charlie commented on "API Integration"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      user: { name: 'Charlie' },
    },
    {
      id: '4',
      type: 'status_change',
      title: 'Task completed',
      message: 'Diana moved "User Authentication" to Done',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      read: true,
      user: { name: 'Diana' },
    },
    {
      id: '5',
      type: 'deadline',
      title: 'Deadline approaching',
      message: '"Database Migration" is due in 2 hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      read: false,
    },
  ])

  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageOutlined style={{ color: '#3b82f6' }} />
      case 'mention':
        return <MessageOutlined style={{ color: '#8b5cf6' }} />
      case 'assignment':
        return <UserAddOutlined style={{ color: '#10b981' }} />
      case 'status_change':
        return <CheckOutlined style={{ color: '#06b6d4' }} />
      case 'deadline':
        return <ClockCircleOutlined style={{ color: '#f59e0b' }} />
      default:
        return <BellOutlined />
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const menu = (
    <div className="bg-white rounded-lg shadow-lg" style={{ width: 380, maxHeight: 500 }}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-semibold text-lg">Notifications</div>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            className="py-8"
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`px-4 hover:bg-gray-50 cursor-pointer ${
                  !item.read ? 'bg-blue-50' : ''
                }`}
                actions={[
                  !item.read && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(item.id)
                      }}
                    />
                  ),
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.user ? (
                      <Avatar>{item.user.name[0]}</Avatar>
                    ) : (
                      <Avatar icon={getIcon(item.type)} />
                    )
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className={!item.read ? 'font-semibold' : ''}>
                        {item.title}
                      </span>
                      {!item.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div className="text-sm">{item.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t text-center">
          <Button type="link" onClick={() => setOpen(false)}>
            View all notifications
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          className="flex items-center justify-center"
        />
      </Badge>
    </Dropdown>
  )
}
