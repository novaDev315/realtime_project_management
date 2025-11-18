'use client'

import { useState, useEffect } from 'react'
import { Card, Alert, Tag, Progress, Table, Space, Statistic, Row, Col } from 'antd'
import {
  WarningOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  StopOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import axios from 'axios'

interface RiskIndicator {
  id: string
  type: 'overdue' | 'blocked' | 'overallocated' | 'velocity_drop' | 'aging' | 'dependency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedItems: number
  recommendation: string
}

interface BottleneckData {
  columnId: string
  columnName: string
  cardCount: number
  wipLimit: number
  avgAge: number
  blocked: number
  isBottleneck: boolean
}

interface RiskDashboardProps {
  projectId: string
}

export default function RiskDashboard({ projectId }: RiskDashboardProps) {
  const [risks, setRisks] = useState<RiskIndicator[]>([])
  const [bottlenecks, setBottlenecks] = useState<BottleneckData[]>([])
  const [loading, setLoading] = useState(false)
  const [riskScore, setRiskScore] = useState(0)

  useEffect(() => {
    fetchRiskData()
    fetchBottlenecks()
  }, [projectId])

  const fetchRiskData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/risks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRisks(response.data.risks || [])
      setRiskScore(response.data.riskScore || 0)
    } catch (error) {
      // Generate mock data for demo
      generateMockRisks()
    } finally {
      setLoading(false)
    }
  }

  const fetchBottlenecks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/bottlenecks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setBottlenecks(response.data || [])
    } catch (error) {
      // Generate mock data for demo
      generateMockBottlenecks()
    }
  }

  const generateMockRisks = () => {
    const mockRisks: RiskIndicator[] = [
      {
        id: '1',
        type: 'overdue',
        severity: 'high',
        title: 'Overdue Tasks',
        description: '8 tasks are past their due date',
        affectedItems: 8,
        recommendation: 'Review and reassign overdue tasks to available team members',
      },
      {
        id: '2',
        type: 'velocity_drop',
        severity: 'medium',
        title: 'Velocity Decline',
        description: 'Team velocity dropped by 25% in the last sprint',
        affectedItems: 1,
        recommendation: 'Conduct retrospective to identify blockers and process improvements',
      },
      {
        id: '3',
        type: 'blocked',
        severity: 'critical',
        title: 'Blocked Tasks',
        description: '5 tasks have been blocked for more than 3 days',
        affectedItems: 5,
        recommendation: 'Urgently address blockers in daily standup',
      },
      {
        id: '4',
        type: 'overallocated',
        severity: 'high',
        title: 'Resource Overallocation',
        description: '3 team members are allocated beyond capacity',
        affectedItems: 3,
        recommendation: 'Redistribute workload or extend sprint timeline',
      },
      {
        id: '5',
        type: 'aging',
        severity: 'medium',
        title: 'Aging Tasks',
        description: '12 tasks have been in "In Progress" for over 5 days',
        affectedItems: 12,
        recommendation: 'Review task complexity and break down into smaller units',
      },
    ]
    setRisks(mockRisks)
    setRiskScore(68)
  }

  const generateMockBottlenecks = () => {
    const mockBottlenecks: BottleneckData[] = [
      {
        columnId: '1',
        columnName: 'In Progress',
        cardCount: 15,
        wipLimit: 10,
        avgAge: 6.5,
        blocked: 3,
        isBottleneck: true,
      },
      {
        columnId: '2',
        columnName: 'Code Review',
        cardCount: 8,
        wipLimit: 5,
        avgAge: 4.2,
        blocked: 2,
        isBottleneck: true,
      },
      {
        columnId: '3',
        columnName: 'Testing',
        cardCount: 4,
        wipLimit: 8,
        avgAge: 2.1,
        blocked: 0,
        isBottleneck: false,
      },
      {
        columnId: '4',
        columnName: 'Done',
        cardCount: 23,
        wipLimit: 999,
        avgAge: 0,
        blocked: 0,
        isBottleneck: false,
      },
    ]
    setBottlenecks(mockBottlenecks)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'gold'
      case 'low':
        return 'blue'
      default:
        return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FireOutlined />
      case 'high':
        return <WarningOutlined />
      case 'medium':
        return <ClockCircleOutlined />
      default:
        return <WarningOutlined />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return '#f5222d' // Critical
    if (score >= 60) return '#fa8c16' // High
    if (score >= 40) return '#faad14' // Medium
    return '#52c41a' // Low
  }

  const getRiskScoreStatus = (score: number) => {
    if (score >= 80) return 'Critical Risk'
    if (score >= 60) return 'High Risk'
    if (score >= 40) return 'Medium Risk'
    return 'Low Risk'
  }

  const bottleneckColumns: ColumnsType<BottleneckData> = [
    {
      title: 'Column',
      dataIndex: 'columnName',
      key: 'columnName',
      render: (name, record) => (
        <Space>
          {name}
          {record.isBottleneck && <Tag color="red">Bottleneck</Tag>}
        </Space>
      ),
    },
    {
      title: 'Cards',
      dataIndex: 'cardCount',
      key: 'cardCount',
      render: (count, record) => (
        <Space>
          <span className="font-semibold">{count}</span>
          {record.wipLimit < 999 && (
            <span className="text-gray-500">/ {record.wipLimit} WIP</span>
          )}
        </Space>
      ),
    },
    {
      title: 'WIP Status',
      key: 'wipStatus',
      render: (_, record) => {
        if (record.wipLimit === 999) return <Tag>No Limit</Tag>
        const percentage = (record.cardCount / record.wipLimit) * 100
        return (
          <Progress
            percent={percentage}
            size="small"
            status={percentage > 100 ? 'exception' : percentage > 80 ? 'normal' : 'success'}
            format={(percent) => `${percent?.toFixed(0)}%`}
          />
        )
      },
    },
    {
      title: 'Avg Age',
      dataIndex: 'avgAge',
      key: 'avgAge',
      render: (age) => `${age.toFixed(1)} days`,
      sorter: (a, b) => a.avgAge - b.avgAge,
    },
    {
      title: 'Blocked',
      dataIndex: 'blocked',
      key: 'blocked',
      render: (blocked) =>
        blocked > 0 ? (
          <Tag color="red" icon={<StopOutlined />}>
            {blocked}
          </Tag>
        ) : (
          <Tag color="green">0</Tag>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Project Risk Score"
              value={riskScore}
              suffix="/ 100"
              valueStyle={{ color: getRiskScoreColor(riskScore) }}
              prefix={<WarningOutlined />}
            />
            <div className="mt-2">
              <Tag color={getSeverityColor(riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : 'medium')}>
                {getRiskScoreStatus(riskScore)}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Risk Indicators"
              value={risks.length}
              valueStyle={{ color: risks.length > 5 ? '#fa8c16' : '#1890ff' }}
              prefix={<FireOutlined />}
            />
            <div className="mt-2 text-sm text-gray-500">
              {risks.filter((r) => r.severity === 'critical' || r.severity === 'high').length} high
              priority
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Bottlenecks Detected"
              value={bottlenecks.filter((b) => b.isBottleneck).length}
              valueStyle={{
                color: bottlenecks.filter((b) => b.isBottleneck).length > 0 ? '#fa8c16' : '#52c41a',
              }}
              prefix={<StopOutlined />}
            />
            <div className="mt-2 text-sm text-gray-500">
              Workflow efficiency {bottlenecks.filter((b) => b.isBottleneck).length === 0 ? 'good' : 'needs attention'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Risk Indicators */}
      <Card title={<Space><WarningOutlined /> Risk Indicators</Space>} loading={loading}>
        <div className="space-y-3">
          {risks.map((risk) => (
            <Alert
              key={risk.id}
              message={
                <Space>
                  {getSeverityIcon(risk.severity)}
                  <span className="font-semibold">{risk.title}</span>
                  <Tag color={getSeverityColor(risk.severity)}>{risk.severity.toUpperCase()}</Tag>
                  <Tag>{risk.affectedItems} affected</Tag>
                </Space>
              }
              description={
                <div>
                  <p className="mb-2">{risk.description}</p>
                  <div className="text-sm bg-blue-50 p-2 rounded">
                    <strong>Recommendation:</strong> {risk.recommendation}
                  </div>
                </div>
              }
              type={
                risk.severity === 'critical'
                  ? 'error'
                  : risk.severity === 'high'
                  ? 'warning'
                  : 'info'
              }
              showIcon
            />
          ))}
          {risks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FireOutlined style={{ fontSize: '48px' }} />
              <p className="mt-4">No risk indicators detected</p>
              <p className="text-sm">Your project is on track!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Bottleneck Analysis */}
      <Card title={<Space><StopOutlined /> Bottleneck Analysis</Space>}>
        <Table
          columns={bottleneckColumns}
          dataSource={bottlenecks}
          rowKey="columnId"
          pagination={false}
          rowClassName={(record) => (record.isBottleneck ? 'bg-red-50' : '')}
        />
        {bottlenecks.filter((b) => b.isBottleneck).length > 0 && (
          <Alert
            className="mt-4"
            message="Workflow Bottlenecks Detected"
            description={
              <ul className="list-disc pl-5 mt-2">
                <li>Review WIP limits for bottleneck columns</li>
                <li>Identify and resolve blocking issues</li>
                <li>Consider redistributing team resources</li>
                <li>Monitor task aging to prevent further accumulation</li>
              </ul>
            }
            type="warning"
            showIcon
          />
        )}
      </Card>
    </div>
  )
}
