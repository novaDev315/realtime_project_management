'use client'

import { useState, useEffect, useRef } from 'react'
import { Input, Modal, List, Tag, Space, Typography, Empty, Spin, Tabs, Badge } from 'antd'
import {
  SearchOutlined,
  ProjectOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

const { Text } = Typography

interface SearchResult {
  type: 'project' | 'card' | 'sprint'
  id: string
  title: string
  description?: string
  status?: string
  projectId?: string
  projectName?: string
  highlight?: string
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [grouped, setGrouped] = useState<{
    projects: SearchResult[]
    cards: SearchResult[]
    sprints: SearchResult[]
  }>({ projects: [], cards: [], sprints: [] })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const inputRef = useRef<any>(null)
  const router = useRouter()
  const { isDark } = useTheme()

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Search as user types
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setGrouped({ projects: [], cards: [], sprints: [] })
      return
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setResults(response.data.results)
        setGrouped(response.data.grouped)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    setOpen(false)
    setQuery('')

    switch (result.type) {
      case 'project':
        router.push(`/projects/${result.id}`)
        break
      case 'card':
        router.push(`/projects/${result.projectId}?card=${result.id}`)
        break
      case 'sprint':
        router.push(`/projects/${result.projectId}?tab=sprints&sprint=${result.id}`)
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <ProjectOutlined className="text-blue-500" />
      case 'card':
        return <FileTextOutlined className="text-green-500" />
      case 'sprint':
        return <ThunderboltOutlined className="text-purple-500" />
      default:
        return <FileTextOutlined />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'green'
      case 'in_progress':
      case 'active':
        return 'blue'
      case 'blocked':
        return 'red'
      default:
        return 'default'
    }
  }

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter(r => r.type === activeTab)

  const renderResultItem = (item: SearchResult) => (
    <List.Item
      onClick={() => handleResultClick(item)}
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-3 py-2 ${
        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
      }`}
    >
      <List.Item.Meta
        avatar={getTypeIcon(item.type)}
        title={
          <Space>
            <Text strong>{item.title}</Text>
            {item.status && (
              <Tag color={getStatusColor(item.status)} className="text-xs">
                {item.status}
              </Tag>
            )}
          </Space>
        }
        description={
          <div>
            {item.projectName && (
              <Text type="secondary" className="text-xs">
                {item.projectName}
              </Text>
            )}
            {item.highlight && (
              <Text type="secondary" className="text-xs block">
                {item.highlight}
              </Text>
            )}
          </div>
        }
      />
    </List.Item>
  )

  return (
    <>
      {/* Search trigger button */}
      <div
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
          isDark
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
            : 'bg-gray-100 border-gray-200 hover:border-gray-300'
        }`}
      >
        <SearchOutlined className="text-gray-400" />
        <span className="text-gray-400 text-sm">Search...</span>
        <kbd className={`px-1.5 py-0.5 text-xs rounded ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          ⌘K
        </kbd>
      </div>

      {/* Search modal */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closable={false}
        width={700}
        className="global-search-modal"
        styles={{
          body: { padding: 0 },
          content: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            borderRadius: 12
          }
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: isDark ? '#434343' : '#f0f0f0' }}>
          <Input
            ref={inputRef}
            placeholder="Search projects, cards, sprints..."
            prefix={<SearchOutlined />}
            suffix={
              query && (
                <CloseOutlined
                  onClick={() => setQuery('')}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                />
              )
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="large"
            variant="borderless"
            className="text-lg"
          />
        </div>

        {/* Tabs for filtering */}
        <div className="px-4 border-b" style={{ borderColor: isDark ? '#434343' : '#f0f0f0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: (
                  <Badge count={results.length} size="small" offset={[10, 0]}>
                    All
                  </Badge>
                )
              },
              {
                key: 'project',
                label: (
                  <Badge count={grouped.projects.length} size="small" offset={[10, 0]}>
                    Projects
                  </Badge>
                )
              },
              {
                key: 'card',
                label: (
                  <Badge count={grouped.cards.length} size="small" offset={[10, 0]}>
                    Cards
                  </Badge>
                )
              },
              {
                key: 'sprint',
                label: (
                  <Badge count={grouped.sprints.length} size="small" offset={[10, 0]}>
                    Sprints
                  </Badge>
                )
              }
            ]}
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-8">
              <Spin />
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-8 text-gray-400">
              <SearchOutlined style={{ fontSize: 32 }} />
              <p className="mt-2">Type at least 2 characters to search</p>
              <div className="mt-4 text-xs">
                <p><kbd className="px-1 bg-gray-200 rounded">↵</kbd> to select</p>
                <p><kbd className="px-1 bg-gray-200 rounded">↑↓</kbd> to navigate</p>
                <p><kbd className="px-1 bg-gray-200 rounded">esc</kbd> to close</p>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <Empty description="No results found" className="py-8" />
          ) : (
            <List
              dataSource={filteredResults}
              renderItem={renderResultItem}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-xs text-gray-400 border-t flex justify-between"
          style={{ borderColor: isDark ? '#434343' : '#f0f0f0' }}
        >
          <span>
            {results.length} results
          </span>
          <span>
            Press <kbd className="px-1 bg-gray-200 rounded mx-1">⌘K</kbd> to open search
          </span>
        </div>
      </Modal>
    </>
  )
}
