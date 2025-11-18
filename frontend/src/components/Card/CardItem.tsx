'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Tag, Avatar, Tooltip } from 'antd'
import {
  ClockCircleOutlined,
  MessageOutlined,
  PaperClipOutlined,
} from '@ant-design/icons'
import { Card as CardType } from '@/store/slices/boardSlice'
import { format } from 'date-fns'

interface CardItemProps {
  card: CardType
  isDragging?: boolean
}

export default function CardItem({ card, isDragging = false }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const priorityColors: Record<string, string> = {
    low: 'blue',
    medium: 'orange',
    high: 'red',
    critical: 'purple',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        hoverable
        size="small"
        className="shadow-sm cursor-move"
        bodyStyle={{ padding: '12px' }}
      >
        <div className="space-y-2">
          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2">{card.title}</h4>

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.slice(0, 3).map((label, idx) => (
                <Tag key={idx} color="blue" className="text-xs m-0">
                  {label}
                </Tag>
              ))}
              {card.labels.length > 3 && (
                <Tag className="text-xs m-0">+{card.labels.length - 3}</Tag>
              )}
            </div>
          )}

          {/* Priority */}
          <Tag color={priorityColors[card.priority]} className="text-xs m-0">
            {card.priority.toUpperCase()}
          </Tag>

          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {card.storyPoints && (
                <span className="font-medium">{card.storyPoints} pts</span>
              )}
              {card.comments && card.comments.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageOutlined />
                  {card.comments.length}
                </span>
              )}
              {card.attachments && card.attachments.length > 0 && (
                <span className="flex items-center gap-1">
                  <PaperClipOutlined />
                  {card.attachments.length}
                </span>
              )}
            </div>

            {/* Assignees */}
            {card.assignees && card.assignees.length > 0 && (
              <Avatar.Group maxCount={2} size="small">
                {card.assignees.map((assignee: any) => (
                  <Tooltip key={assignee._id || assignee} title={assignee.name || 'User'}>
                    <Avatar size="small">
                      {assignee.name ? assignee.name[0].toUpperCase() : 'U'}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
            )}
          </div>

          {/* Due date */}
          {card.dueDate && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <ClockCircleOutlined />
              {format(new Date(card.dueDate), 'MMM dd')}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
