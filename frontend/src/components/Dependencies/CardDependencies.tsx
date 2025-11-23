'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Select,
  Button,
  List,
  Tag,
  Space,
  Typography,
  Empty,
  message,
  Popconfirm,
  Tabs,
  Badge,
  Tooltip,
} from 'antd'
import {
  LinkOutlined,
  DeleteOutlined,
  StopOutlined,
  ArrowRightOutlined,
  SwapOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { Text } = Typography

interface Dependency {
  _id: string
  cardId: {
    _id: string
    title: string
    status: string
    priority: string
  }
  type: 'blocks' | 'blocked_by' | 'relates_to'
}

interface CardDependenciesProps {
  cardId: string
  boardId: string
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface BoardCard {
  _id: string
  title: string
  status: string
  columnId: string
}

export default function CardDependencies({
  cardId,
  boardId,
  open,
  onClose,
  onUpdate,
}: CardDependenciesProps) {
  const [dependencies, setDependencies] = useState<{
    blocking: Dependency[]
    blockedBy: Dependency[]
    relatedTo: Dependency[]
    isBlocked: boolean
  }>({ blocking: [], blockedBy: [], relatedTo: [], isBlocked: false })
  const [boardCards, setBoardCards] = useState<BoardCard[]>([])
  const [loading, setLoading] = useState(false)
  const [addingType, setAddingType] = useState<'blocks' | 'blocked_by' | 'relates_to' | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchDependencies()
      fetchBoardCards()
    }
  }, [open, cardId, boardId])

  const fetchDependencies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/dependencies/card/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setDependencies(response.data)
    } catch (error) {
      console.error('Failed to fetch dependencies:', error)
    }
  }

  const fetchBoardCards = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}/cards`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Filter out current card
      setBoardCards(response.data.filter((c: BoardCard) => c._id !== cardId))
    } catch (error) {
      console.error('Failed to fetch board cards:', error)
    }
  }

  const addDependency = async () => {
    if (!selectedCardId || !addingType) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/dependencies/card/${cardId}`,
        { targetCardId: selectedCardId, type: addingType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      message.success('Dependency added')
      setSelectedCardId(null)
      setAddingType(null)
      fetchDependencies()
      onUpdate?.()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to add dependency')
    } finally {
      setLoading(false)
    }
  }

  const removeDependency = async (dependencyId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/dependencies/card/${cardId}/${dependencyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      message.success('Dependency removed')
      fetchDependencies()
      onUpdate?.()
    } catch (error) {
      message.error('Failed to remove dependency')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'green'
      case 'in_progress':
        return 'blue'
      case 'blocked':
        return 'red'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'blue'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blocks':
        return <StopOutlined className="text-red-500" />
      case 'blocked_by':
        return <ArrowRightOutlined className="text-orange-500" />
      case 'relates_to':
        return <SwapOutlined className="text-blue-500" />
      default:
        return <LinkOutlined />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blocks':
        return 'Blocks'
      case 'blocked_by':
        return 'Blocked By'
      case 'relates_to':
        return 'Related To'
      default:
        return type
    }
  }

  const renderDependencyList = (deps: Dependency[], type: string) => {
    if (deps.length === 0) {
      return <Empty description={`No ${getTypeLabel(type).toLowerCase()} cards`} />
    }

    return (
      <List
        dataSource={deps}
        renderItem={(dep) => (
          <List.Item
            actions={[
              <Popconfirm
                key="delete"
                title="Remove this dependency?"
                onConfirm={() => removeDependency(dep._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={getTypeIcon(dep.type)}
              title={dep.cardId?.title || 'Unknown Card'}
              description={
                <Space size="small">
                  <Tag color={getStatusColor(dep.cardId?.status)}>
                    {dep.cardId?.status || 'unknown'}
                  </Tag>
                  <Tag color={getPriorityColor(dep.cardId?.priority)}>
                    {dep.cardId?.priority || 'medium'}
                  </Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  const availableCards = boardCards.filter((card) => {
    if (!addingType) return true
    // Filter out cards that already have this dependency
    const allDeps = [...dependencies.blocking, ...dependencies.blockedBy, ...dependencies.relatedTo]
    return !allDeps.some((dep) => dep.cardId?._id === card._id)
  })

  const tabItems = [
    {
      key: 'blocks',
      label: (
        <Badge count={dependencies.blocking.length} size="small" offset={[10, 0]}>
          <Space>
            <StopOutlined className="text-red-500" />
            Blocks
          </Space>
        </Badge>
      ),
      children: renderDependencyList(dependencies.blocking, 'blocks'),
    },
    {
      key: 'blocked_by',
      label: (
        <Badge count={dependencies.blockedBy.length} size="small" offset={[10, 0]}>
          <Space>
            <ArrowRightOutlined className="text-orange-500" />
            Blocked By
          </Space>
        </Badge>
      ),
      children: renderDependencyList(dependencies.blockedBy, 'blocked_by'),
    },
    {
      key: 'relates_to',
      label: (
        <Badge count={dependencies.relatedTo.length} size="small" offset={[10, 0]}>
          <Space>
            <SwapOutlined className="text-blue-500" />
            Related
          </Space>
        </Badge>
      ),
      children: renderDependencyList(dependencies.relatedTo, 'relates_to'),
    },
  ]

  return (
    <Modal
      title={
        <Space>
          <LinkOutlined />
          Card Dependencies
          {dependencies.isBlocked && (
            <Tag color="red">BLOCKED</Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {/* Add new dependency section */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Text strong className="block mb-2">Add Dependency</Text>
        <Space direction="vertical" className="w-full">
          <div className="flex gap-2">
            <Select
              placeholder="Select dependency type"
              value={addingType}
              onChange={setAddingType}
              style={{ width: 150 }}
              options={[
                { value: 'blocks', label: 'Blocks' },
                { value: 'blocked_by', label: 'Blocked By' },
                { value: 'relates_to', label: 'Related To' },
              ]}
            />
            <Select
              placeholder="Select a card"
              value={selectedCardId}
              onChange={setSelectedCardId}
              style={{ flex: 1 }}
              showSearch
              optionFilterProp="label"
              options={availableCards.map((card) => ({
                value: card._id,
                label: card.title,
              }))}
              disabled={!addingType}
            />
            <Tooltip title="Add dependency">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addDependency}
                disabled={!selectedCardId || !addingType}
                loading={loading}
              />
            </Tooltip>
          </div>
        </Space>
      </div>

      {/* Dependencies tabs */}
      <Tabs items={tabItems} />

      {/* Dependency explanation */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
        <Text type="secondary">
          <strong>Blocks:</strong> This card prevents other cards from being completed.<br />
          <strong>Blocked By:</strong> This card cannot be completed until other cards are done.<br />
          <strong>Related:</strong> Cards that are related but don't block each other.
        </Text>
      </div>
    </Modal>
  )
}
