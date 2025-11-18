'use client'

import { useState } from 'react'
import { Layout, Menu, Breadcrumb, Card } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BarChartOutlined,
  TeamOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import KanbanBoard from '@/components/Board/KanbanBoard'
import SprintBoard from '@/components/Sprint/SprintBoard'
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard'
import ResourceAllocation from '@/components/Analytics/ResourceAllocation'
import GanttChart from '@/components/Gantt/GanttChart'
import ActivityFeed from '@/components/Notifications/ActivityFeed'
import TimeTracker from '@/components/TimeTracking/TimeTracker'
import TimeEntryList from '@/components/TimeTracking/TimeEntryList'
import TimeReport from '@/components/TimeTracking/TimeReport'
import CustomFieldBuilder from '@/components/CustomFields/CustomFieldBuilder'

const { Sider, Content } = Layout

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('board')
  const projectId = params.id

  const menuItems = [
    {
      key: 'board',
      icon: <ProjectOutlined />,
      label: 'Kanban Board',
    },
    {
      key: 'sprints',
      icon: <CalendarOutlined />,
      label: 'Sprints',
    },
    {
      key: 'gantt',
      icon: <ScheduleOutlined />,
      label: 'Gantt Chart',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'resources',
      icon: <TeamOutlined />,
      label: 'Resources',
    },
    {
      key: 'time-tracking',
      icon: <ClockCircleOutlined />,
      label: 'Time Tracking',
    },
    {
      key: 'custom-fields',
      icon: <SettingOutlined />,
      label: 'Custom Fields',
    },
    {
      key: 'activity',
      icon: <HistoryOutlined />,
      label: 'Activity',
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'board':
        return <KanbanBoard boardId="mock-board-id" />
      case 'sprints':
        return <SprintBoard projectId={projectId} />
      case 'gantt':
        return <GanttChart projectId={projectId} />
      case 'analytics':
        return <AnalyticsDashboard projectId={projectId} />
      case 'resources':
        return <ResourceAllocation projectId={projectId} />
      case 'time-tracking':
        return (
          <div className="space-y-6">
            <TimeTracker projectId={projectId} />
            <TimeEntryList projectId={projectId} />
            <TimeReport projectId={projectId} />
          </div>
        )
      case 'custom-fields':
        return <CustomFieldBuilder projectId={projectId} />
      case 'activity':
        return <ActivityFeed projectId={projectId} />
      default:
        return <KanbanBoard boardId="mock-board-id" />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg m-0">Project Name</h2>
          <p className="text-sm text-gray-500 m-0">Team Workspace</p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[
              { title: 'Projects' },
              { title: 'Current Project' },
              { title: menuItems.find((item) => item.key === activeTab)?.label },
            ]}
          />

          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}
