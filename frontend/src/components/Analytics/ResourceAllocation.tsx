'use client'

import React, { useState } from 'react'
import { Card, Table, Progress, Tag, Avatar, Space, Tooltip, Select, Button } from 'antd'
import {
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  capacity: number
  allocated: number
  tasks: number
  skills: string[]
  availability: 'available' | 'busy' | 'overloaded'
}

interface ResourceAllocationProps {
  projectId: string
}

export default function ResourceAllocation({ projectId }: ResourceAllocationProps) {
  const [timeRange, setTimeRange] = useState('week')

  // Mock data - in real app, fetch from API
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Frontend Developer',
      capacity: 40,
      allocated: 35,
      tasks: 5,
      skills: ['React', 'TypeScript', 'CSS'],
      availability: 'available',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Backend Developer',
      capacity: 40,
      allocated: 42,
      tasks: 6,
      skills: ['Node.js', 'MongoDB', 'Express'],
      availability: 'overloaded',
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'Full Stack Developer',
      capacity: 40,
      allocated: 38,
      tasks: 4,
      skills: ['React', 'Node.js', 'PostgreSQL'],
      availability: 'busy',
    },
    {
      id: '4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'UI/UX Designer',
      capacity: 40,
      allocated: 25,
      tasks: 3,
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      availability: 'available',
    },
    {
      id: '5',
      name: 'Eve Davis',
      email: 'eve@example.com',
      role: 'QA Engineer',
      capacity: 40,
      allocated: 32,
      tasks: 7,
      skills: ['Jest', 'Cypress', 'Selenium'],
      availability: 'busy',
    },
  ]

  const getUtilization = (allocated: number, capacity: number) => {
    return Math.round((allocated / capacity) * 100)
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return '#ef4444'
    if (utilization > 85) return '#f59e0b'
    if (utilization > 60) return '#10b981'
    return '#3b82f6'
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircleOutlined style={{ color: '#10b981' }} />
      case 'busy':
        return <ClockCircleOutlined style={{ color: '#f59e0b' }} />
      case 'overloaded':
        return <WarningOutlined style={{ color: '#ef4444' }} />
      default:
        return <UserOutlined />
    }
  }

  const columns = [
    {
      title: 'Team Member',
      key: 'member',
      width: 250,
      render: (_: any, record: TeamMember) => (
        <Space>
          <Avatar icon={<UserOutlined />}>{record.name[0]}</Avatar>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">{record.role}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      width: 120,
      render: (availability: string, record: TeamMember) => (
        <Tooltip title={`${getUtilization(record.allocated, record.capacity)}% utilized`}>
          <Space>
            {getAvailabilityIcon(availability)}
            <span className="capitalize">{availability}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Capacity (hrs/week)',
      key: 'capacity',
      width: 150,
      render: (_: any, record: TeamMember) => (
        <div>
          <div className="text-sm">
            {record.allocated} / {record.capacity} hrs
          </div>
          <Progress
            percent={getUtilization(record.allocated, record.capacity)}
            strokeColor={getUtilizationColor(getUtilization(record.allocated, record.capacity))}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Utilization',
      key: 'utilization',
      width: 100,
      render: (_: any, record: TeamMember) => {
        const utilization = getUtilization(record.allocated, record.capacity)
        return (
          <Tag color={getUtilizationColor(utilization)}>
            {utilization}%
          </Tag>
        )
      },
    },
    {
      title: 'Active Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      width: 100,
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.slice(0, 3).map((skill) => (
            <Tag key={skill} color="blue">
              {skill}
            </Tag>
          ))}
          {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
        </Space>
      ),
    },
  ]

  // Chart data
  const chartData = teamMembers.map((member) => ({
    name: member.name.split(' ')[0],
    capacity: member.capacity,
    allocated: member.allocated,
    utilization: getUtilization(member.allocated, member.capacity),
  }))

  // Summary stats
  const totalCapacity = teamMembers.reduce((sum, m) => sum + m.capacity, 0)
  const totalAllocated = teamMembers.reduce((sum, m) => sum + m.allocated, 0)
  const avgUtilization = Math.round((totalAllocated / totalCapacity) * 100)
  const overloadedCount = teamMembers.filter((m) => m.availability === 'overloaded').length
  const availableCount = teamMembers.filter((m) => m.availability === 'available').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Total Capacity</div>
          <div className="text-2xl font-bold">{totalCapacity} hrs</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Allocated</div>
          <div className="text-2xl font-bold">{totalAllocated} hrs</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Avg Utilization</div>
          <div className="text-2xl font-bold" style={{ color: getUtilizationColor(avgUtilization) }}>
            {avgUtilization}%
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Team Status</div>
          <div className="flex gap-2 mt-2">
            <Tag color="green">{availableCount} Available</Tag>
            <Tag color="red">{overloadedCount} Overloaded</Tag>
          </div>
        </Card>
      </div>

      {/* Utilization Chart */}
      <Card
        title="Team Capacity Utilization"
        extra={
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Select.Option value="day">Today</Select.Option>
            <Select.Option value="week">This Week</Select.Option>
            <Select.Option value="month">This Month</Select.Option>
          </Select>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
            <Bar dataKey="allocated" name="Allocated">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getUtilizationColor(entry.utilization)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Team Members Table */}
      <Card
        title="Team Resource Allocation"
        extra={
          <Space>
            <Button>Export Report</Button>
            <Button type="primary">Rebalance Workload</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={teamMembers}
          rowKey="id"
          pagination={false}
          rowClassName={(record) => {
            if (record.availability === 'overloaded') return 'bg-red-50'
            if (record.availability === 'available') return 'bg-green-50'
            return ''
          }}
        />
      </Card>

      {/* Recommendations */}
      <Card title="Resource Optimization Recommendations">
        <div className="space-y-3">
          {overloadedCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded">
              <WarningOutlined className="text-red-500 mt-1" />
              <div>
                <div className="font-medium text-red-700">
                  {overloadedCount} team member(s) are overloaded
                </div>
                <div className="text-sm text-red-600">
                  Consider redistributing tasks or adjusting sprint capacity
                </div>
              </div>
            </div>
          )}
          {availableCount > 2 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
              <CheckCircleOutlined className="text-blue-500 mt-1" />
              <div>
                <div className="font-medium text-blue-700">
                  {availableCount} team member(s) have available capacity
                </div>
                <div className="text-sm text-blue-600">
                  Consider assigning additional high-priority tasks
                </div>
              </div>
            </div>
          )}
          {avgUtilization < 70 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded">
              <ClockCircleOutlined className="text-yellow-500 mt-1" />
              <div>
                <div className="font-medium text-yellow-700">Team is under-utilized</div>
                <div className="text-sm text-yellow-600">
                  Average utilization is {avgUtilization}%. Consider planning more work.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
