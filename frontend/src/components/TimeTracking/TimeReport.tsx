'use client'

import { useState, useEffect } from 'react'
import { Card, Select, DatePicker, Space, Table, Statistic, Row, Col, Button, message } from 'antd'
import { ClockCircleOutlined, DollarOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface TimeReportData {
  _id: string
  totalDuration: number
  billableDuration: number
  entries: number
  user?: {
    _id: string
    name: string
  }
  card?: {
    _id: string
    title: string
  }
}

interface TimeReportProps {
  projectId: string
}

export default function TimeReport({ projectId }: TimeReportProps) {
  const [reportData, setReportData] = useState<TimeReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [groupBy, setGroupBy] = useState<'user' | 'card'>('user')
  const [dateRange, setDateRange] = useState<[string?, string?]>([undefined, undefined])

  useEffect(() => {
    fetchReport()
  }, [projectId, groupBy, dateRange])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.append('groupBy', groupBy)
      if (dateRange[0]) params.append('startDate', dateRange[0])
      if (dateRange[1]) params.append('endDate', dateRange[1])

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/time-report?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setReportData(response.data)
    } catch (error) {
      console.error('Error fetching time report:', error)
      message.error('Failed to fetch time report')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getTotalDuration = () => {
    return reportData.reduce((sum, item) => sum + item.totalDuration, 0)
  }

  const getTotalBillable = () => {
    return reportData.reduce((sum, item) => sum + item.billableDuration, 0)
  }

  const getTotalEntries = () => {
    return reportData.reduce((sum, item) => sum + item.entries, 0)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Total Duration', 'Billable Duration', 'Entries']
    const rows = reportData.map((item) => [
      groupBy === 'user' ? item.user?.name || 'Unknown' : item.card?.title || 'Unknown',
      formatDuration(item.totalDuration),
      formatDuration(item.billableDuration),
      item.entries.toString(),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `time_report_${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('Report exported')
  }

  const columns: ColumnsType<TimeReportData> = [
    {
      title: groupBy === 'user' ? 'User' : 'Card',
      key: 'name',
      render: (_, record) => {
        if (groupBy === 'user') {
          return record.user?.name || 'Unknown'
        } else {
          return record.card?.title || 'Unknown'
        }
      },
    },
    {
      title: 'Total Duration',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      render: (duration: number) => formatDuration(duration),
      sorter: (a, b) => a.totalDuration - b.totalDuration,
    },
    {
      title: 'Billable Duration',
      dataIndex: 'billableDuration',
      key: 'billableDuration',
      render: (duration: number) => formatDuration(duration),
      sorter: (a, b) => a.billableDuration - b.billableDuration,
    },
    {
      title: 'Non-Billable Duration',
      key: 'nonBillable',
      render: (_, record) => formatDuration(record.totalDuration - record.billableDuration),
    },
    {
      title: 'Entries',
      dataIndex: 'entries',
      key: 'entries',
      sorter: (a, b) => a.entries - b.entries,
    },
    {
      title: 'Billable %',
      key: 'billablePercent',
      render: (_, record) => {
        if (record.totalDuration === 0) return '0%'
        const percent = ((record.billableDuration / record.totalDuration) * 100).toFixed(1)
        return `${percent}%`
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Time Report</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 120 }}
            >
              <Option value="user">By User</Option>
              <Option value="card">By Card</Option>
            </Select>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]?.toISOString(), dates[1]?.toISOString()])
                } else {
                  setDateRange([undefined, undefined])
                }
              }}
            />
            <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
              Export CSV
            </Button>
          </Space>
        }
      >
        {/* Summary Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Time Logged"
                value={formatDuration(getTotalDuration())}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Billable Time"
                value={formatDuration(getTotalBillable())}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Entries"
                value={getTotalEntries()}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Table */}
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} ${groupBy === 'user' ? 'users' : 'cards'}`,
          }}
        />
      </Card>
    </div>
  )
}
