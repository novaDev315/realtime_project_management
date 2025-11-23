'use client'

import { useState } from 'react'
import {
  Modal,
  Button,
  Select,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Space,
  message,
  Spin,
  Tabs,
  Progress,
  Typography,
} from 'antd'
import {
  FilePdfOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Title, Text } = Typography

interface ReportExportProps {
  projectId: string
  sprintId?: string
  open: boolean
  onClose: () => void
}

interface SprintReport {
  sprint: {
    name: string
    goal: string
    startDate: string
    endDate: string
    status: string
    capacity: number
  }
  metrics: {
    totalCards: number
    completedCards: number
    completionRate: number
    totalPoints: number
    completedPoints: number
    velocity: number
    pointsCompletionRate: number
    totalTimeHours: number
    billableTimeHours: number
  }
  cardsByStatus: Record<string, number>
  cardsByAssignee: Array<{ name: string; total: number; completed: number; points: number }>
  burndownData: Array<{ date: string; ideal: number; actual: number }>
  cards: Array<{ title: string; status: string; priority: string; storyPoints: number; assignee: string }>
  generatedAt: string
}

interface ProjectReport {
  project: {
    name: string
    description: string
    createdAt: string
    memberCount: number
  }
  overview: {
    totalCards: number
    completedCards: number
    completionRate: number
    blockedCards: number
    overdueCards: number
    totalSprints: number
    activeSprints: number
    totalTimeHours: number
    billableHours: number
  }
  velocityHistory: Array<{ sprint: string; planned: number; completed: number }>
  teamPerformance: Array<{ name: string; completed: number; inProgress: number; total: number; points: number }>
  cardsByPriority: Record<string, number>
  generatedAt: string
}

interface TimeReport {
  groupBy: string
  dateRange: { from?: string; to?: string }
  data: Array<{
    group: string
    totalHours: number
    billableHours: number
    entryCount: number
  }>
  totals: {
    totalHours: number
    billableHours: number
    entryCount: number
  }
  generatedAt: string
}

export default function ReportExport({ projectId, sprintId, open, onClose }: ReportExportProps) {
  const [reportType, setReportType] = useState<'sprint' | 'project' | 'time'>('project')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<SprintReport | ProjectReport | TimeReport | null>(null)
  const [timeGroupBy, setTimeGroupBy] = useState<'user' | 'card' | 'date'>('user')

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let url = `${process.env.NEXT_PUBLIC_API_URL}/reports`
      const params: any = {}

      if (reportType === 'sprint' && sprintId) {
        url += `/sprint/${sprintId}`
      } else if (reportType === 'project') {
        url += `/project/${projectId}`
        if (dateRange) {
          params.from = dateRange[0].toISOString()
          params.to = dateRange[1].toISOString()
        }
      } else if (reportType === 'time') {
        url += `/time/${projectId}`
        params.groupBy = timeGroupBy
        if (dateRange) {
          params.from = dateRange[0].toISOString()
          params.to = dateRange[1].toISOString()
        }
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })

      setReportData(response.data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      message.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!reportData) return

    // Create printable content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      message.error('Please allow pop-ups to export PDF')
      return
    }

    const content = generatePrintContent()
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const generatePrintContent = (): string => {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .header { margin-bottom: 30px; }
        .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
        .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; min-width: 150px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        .progress-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; }
        .progress-fill { background: #52c41a; height: 100%; }
        @media print { body { padding: 20px; } }
      </style>
    `

    if (reportType === 'sprint' && reportData) {
      const data = reportData as SprintReport
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Sprint Report - ${data.sprint.name}</title>${styles}</head>
        <body>
          <div class="header">
            <h1>Sprint Report: ${data.sprint.name}</h1>
            <p><strong>Goal:</strong> ${data.sprint.goal || 'No goal set'}</p>
            <p><strong>Period:</strong> ${dayjs(data.sprint.startDate).format('MMM D')} - ${dayjs(data.sprint.endDate).format('MMM D, YYYY')}</p>
            <p><strong>Status:</strong> ${data.sprint.status}</p>
          </div>

          <h2>Key Metrics</h2>
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">${data.metrics.completedCards}/${data.metrics.totalCards}</div>
              <div class="metric-label">Cards Completed</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.metrics.completionRate}%</div>
              <div class="metric-label">Completion Rate</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.metrics.velocity}</div>
              <div class="metric-label">Velocity (Points)</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.metrics.totalTimeHours}h</div>
              <div class="metric-label">Total Time</div>
            </div>
          </div>

          <h2>Team Performance</h2>
          <table>
            <thead><tr><th>Team Member</th><th>Total</th><th>Completed</th><th>Points</th></tr></thead>
            <tbody>
              ${data.cardsByAssignee.map(a => `
                <tr><td>${a.name}</td><td>${a.total}</td><td>${a.completed}</td><td>${a.points}</td></tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Cards Summary</h2>
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Points</th><th>Assignee</th></tr></thead>
            <tbody>
              ${data.cards.map(c => `
                <tr><td>${c.title}</td><td>${c.status}</td><td>${c.priority}</td><td>${c.storyPoints || '-'}</td><td>${c.assignee}</td></tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${dayjs(data.generatedAt).format('MMMM D, YYYY h:mm A')}</p>
          </div>
        </body>
        </html>
      `
    }

    if (reportType === 'project' && reportData) {
      const data = reportData as ProjectReport
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Project Report - ${data.project.name}</title>${styles}</head>
        <body>
          <div class="header">
            <h1>Project Report: ${data.project.name}</h1>
            <p>${data.project.description || ''}</p>
            <p><strong>Team Size:</strong> ${data.project.memberCount} members</p>
          </div>

          <h2>Overview</h2>
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">${data.overview.completedCards}/${data.overview.totalCards}</div>
              <div class="metric-label">Cards Completed</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.overview.completionRate}%</div>
              <div class="metric-label">Completion Rate</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.overview.totalSprints}</div>
              <div class="metric-label">Total Sprints</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.overview.totalTimeHours}h</div>
              <div class="metric-label">Total Time</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.overview.blockedCards}</div>
              <div class="metric-label">Blocked Cards</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.overview.overdueCards}</div>
              <div class="metric-label">Overdue Cards</div>
            </div>
          </div>

          <h2>Cards by Priority</h2>
          <table>
            <thead><tr><th>Priority</th><th>Count</th></tr></thead>
            <tbody>
              <tr><td>Critical</td><td>${data.cardsByPriority.critical || 0}</td></tr>
              <tr><td>High</td><td>${data.cardsByPriority.high || 0}</td></tr>
              <tr><td>Medium</td><td>${data.cardsByPriority.medium || 0}</td></tr>
              <tr><td>Low</td><td>${data.cardsByPriority.low || 0}</td></tr>
            </tbody>
          </table>

          <h2>Team Performance</h2>
          <table>
            <thead><tr><th>Team Member</th><th>Completed</th><th>In Progress</th><th>Total</th><th>Points</th></tr></thead>
            <tbody>
              ${data.teamPerformance.map(t => `
                <tr><td>${t.name}</td><td>${t.completed}</td><td>${t.inProgress}</td><td>${t.total}</td><td>${t.points}</td></tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${dayjs(data.generatedAt).format('MMMM D, YYYY h:mm A')}</p>
          </div>
        </body>
        </html>
      `
    }

    if (reportType === 'time' && reportData) {
      const data = reportData as TimeReport
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Time Tracking Report</title>${styles}</head>
        <body>
          <div class="header">
            <h1>Time Tracking Report</h1>
            <p><strong>Grouped by:</strong> ${data.groupBy}</p>
            ${data.dateRange.from ? `<p><strong>Period:</strong> ${dayjs(data.dateRange.from).format('MMM D')} - ${dayjs(data.dateRange.to).format('MMM D, YYYY')}</p>` : ''}
          </div>

          <h2>Summary</h2>
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">${data.totals.totalHours}h</div>
              <div class="metric-label">Total Hours</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totals.billableHours}h</div>
              <div class="metric-label">Billable Hours</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totals.entryCount}</div>
              <div class="metric-label">Total Entries</div>
            </div>
          </div>

          <h2>Breakdown</h2>
          <table>
            <thead><tr><th>${data.groupBy}</th><th>Total Hours</th><th>Billable Hours</th><th>Entries</th></tr></thead>
            <tbody>
              ${data.data.map(d => `
                <tr><td>${d.group}</td><td>${d.totalHours}</td><td>${d.billableHours}</td><td>${d.entryCount}</td></tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${dayjs(data.generatedAt).format('MMMM D, YYYY h:mm A')}</p>
          </div>
        </body>
        </html>
      `
    }

    return ''
  }

  const downloadJSON = () => {
    if (!reportData) return

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${reportType}-${dayjs().format('YYYY-MM-DD')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderSprintReport = (data: SprintReport) => (
    <div className="space-y-6">
      <Card>
        <Title level={4}>{data.sprint.name}</Title>
        <Text type="secondary">{data.sprint.goal}</Text>
        <div className="mt-2">
          <Text>
            {dayjs(data.sprint.startDate).format('MMM D')} - {dayjs(data.sprint.endDate).format('MMM D, YYYY')}
          </Text>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Completion Rate" value={data.metrics.completionRate} suffix="%" />
            <Progress percent={data.metrics.completionRate} showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cards"
              value={data.metrics.completedCards}
              suffix={`/ ${data.metrics.totalCards}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Velocity" value={data.metrics.velocity} suffix="pts" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Time Logged"
              value={data.metrics.totalTimeHours}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Team Performance">
        <Table
          dataSource={data.cardsByAssignee}
          rowKey="name"
          pagination={false}
          columns={[
            { title: 'Member', dataIndex: 'name' },
            { title: 'Total', dataIndex: 'total' },
            { title: 'Completed', dataIndex: 'completed' },
            { title: 'Points', dataIndex: 'points' },
          ]}
        />
      </Card>
    </div>
  )

  const renderProjectReport = (data: ProjectReport) => (
    <div className="space-y-6">
      <Card>
        <Title level={4}>{data.project.name}</Title>
        <Text type="secondary">{data.project.description}</Text>
        <div className="mt-2">
          <TeamOutlined /> {data.project.memberCount} team members
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Completion Rate" value={data.overview.completionRate} suffix="%" />
            <Progress percent={data.overview.completionRate} showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cards"
              value={data.overview.completedCards}
              suffix={`/ ${data.overview.totalCards}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Blocked" value={data.overview.blockedCards} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Overdue" value={data.overview.overdueCards} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Team Performance">
        <Table
          dataSource={data.teamPerformance}
          rowKey="name"
          pagination={false}
          columns={[
            { title: 'Member', dataIndex: 'name' },
            { title: 'Completed', dataIndex: 'completed' },
            { title: 'In Progress', dataIndex: 'inProgress' },
            { title: 'Total', dataIndex: 'total' },
            { title: 'Points', dataIndex: 'points' },
          ]}
        />
      </Card>
    </div>
  )

  const renderTimeReport = (data: TimeReport) => (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Hours" value={data.totals.totalHours} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Billable Hours" value={data.totals.billableHours} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Entries" value={data.totals.entryCount} />
          </Card>
        </Col>
      </Row>

      <Card title={`Breakdown by ${data.groupBy}`}>
        <Table
          dataSource={data.data}
          rowKey="group"
          pagination={false}
          columns={[
            { title: data.groupBy.charAt(0).toUpperCase() + data.groupBy.slice(1), dataIndex: 'group' },
            { title: 'Total Hours', dataIndex: 'totalHours' },
            { title: 'Billable Hours', dataIndex: 'billableHours' },
            { title: 'Entries', dataIndex: 'entryCount' },
          ]}
        />
      </Card>
    </div>
  )

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          Generate Report
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={
        reportData ? (
          <Space>
            <Button onClick={() => setReportData(null)}>Back</Button>
            <Button icon={<DownloadOutlined />} onClick={downloadJSON}>
              Download JSON
            </Button>
            <Button type="primary" icon={<FilePdfOutlined />} onClick={exportToPDF}>
              Export PDF
            </Button>
          </Space>
        ) : null
      }
    >
      {!reportData ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
              options={[
                { value: 'project', label: 'Project Overview Report' },
                { value: 'sprint', label: 'Sprint Report', disabled: !sprintId },
                { value: 'time', label: 'Time Tracking Report' },
              ]}
            />
          </div>

          {reportType === 'time' && (
            <div>
              <label className="block text-sm font-medium mb-2">Group By</label>
              <Select
                value={timeGroupBy}
                onChange={setTimeGroupBy}
                style={{ width: '100%' }}
                options={[
                  { value: 'user', label: 'Team Member' },
                  { value: 'card', label: 'Card' },
                  { value: 'date', label: 'Date' },
                ]}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Date Range (Optional)</label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
            />
          </div>

          <Button type="primary" onClick={fetchReport} loading={loading} block size="large">
            Generate Report
          </Button>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4">Generating report...</p>
        </div>
      ) : (
        <>
          {reportType === 'sprint' && renderSprintReport(reportData as SprintReport)}
          {reportType === 'project' && renderProjectReport(reportData as ProjectReport)}
          {reportType === 'time' && renderTimeReport(reportData as TimeReport)}
        </>
      )}
    </Modal>
  )
}
