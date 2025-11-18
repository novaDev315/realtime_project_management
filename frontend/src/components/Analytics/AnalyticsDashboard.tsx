'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Select, DatePicker } from 'antd'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  ProjectOutlined,
  RocketOutlined,
} from '@ant-design/icons'

interface AnalyticsDashboardProps {
  projectId: string
}

export default function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  // Mock data - in real app, fetch from API
  const [timeRange, setTimeRange] = useState('month')

  const velocityData = [
    { sprint: 'Sprint 1', planned: 40, completed: 35 },
    { sprint: 'Sprint 2', planned: 45, completed: 42 },
    { sprint: 'Sprint 3', planned: 50, completed: 48 },
    { sprint: 'Sprint 4', planned: 55, completed: 52 },
    { sprint: 'Sprint 5', planned: 50, completed: 50 },
    { sprint: 'Sprint 6', planned: 60, completed: 58 },
  ]

  const burndownData = [
    { day: 'Day 1', remaining: 100, ideal: 100 },
    { day: 'Day 2', remaining: 95, ideal: 90 },
    { day: 'Day 3', remaining: 88, ideal: 80 },
    { day: 'Day 4', remaining: 80, ideal: 70 },
    { day: 'Day 5', remaining: 70, ideal: 60 },
    { day: 'Day 6', remaining: 58, ideal: 50 },
    { day: 'Day 7', remaining: 45, ideal: 40 },
    { day: 'Day 8', remaining: 35, ideal: 30 },
    { day: 'Day 9', remaining: 22, ideal: 20 },
    { day: 'Day 10', remaining: 10, ideal: 10 },
    { day: 'Day 11', remaining: 0, ideal: 0 },
  ]

  const taskDistribution = [
    { name: 'To Do', value: 15, color: '#3b82f6' },
    { name: 'In Progress', value: 8, color: '#f59e0b' },
    { name: 'Done', value: 27, color: '#10b981' },
    { name: 'Blocked', value: 3, color: '#ef4444' },
  ]

  const teamPerformance = [
    { member: 'Alice', completed: 18, inProgress: 3 },
    { member: 'Bob', completed: 15, inProgress: 4 },
    { member: 'Charlie', completed: 12, inProgress: 2 },
    { member: 'Diana', completed: 16, inProgress: 3 },
    { member: 'Eve', completed: 14, inProgress: 5 },
  ]

  const priorityData = [
    { priority: 'Critical', count: 3, color: '#dc2626' },
    { priority: 'High', count: 8, color: '#ea580c' },
    { priority: 'Medium', count: 15, color: '#f59e0b' },
    { priority: 'Low', count: 10, color: '#3b82f6' },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={53}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Team Velocity"
              value={58}
              suffix="pts"
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={93.8}
              precision={1}
              suffix="%"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Velocity Chart */}
      <Card title="Sprint Velocity Trend" extra={
        <Select defaultValue="all" style={{ width: 120 }}>
          <Select.Option value="all">All Sprints</Select.Option>
          <Select.Option value="recent">Last 6</Select.Option>
        </Select>
      }>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprint" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="planned" fill="#3b82f6" name="Planned Points" />
            <Bar dataKey="completed" fill="#10b981" name="Completed Points" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16}>
        {/* Burndown Chart */}
        <Col span={12}>
          <Card title="Sprint Burndown Chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ideal"
                  stroke="#94a3b8"
                  fill="#cbd5e1"
                  name="Ideal Burndown"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  name="Actual Remaining"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Task Distribution */}
        <Col span={12}>
          <Card title="Task Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Team Performance */}
        <Col span={12}>
          <Card title="Team Performance">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="member" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
                <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Priority Distribution */}
        <Col span={12}>
          <Card title="Tasks by Priority">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
