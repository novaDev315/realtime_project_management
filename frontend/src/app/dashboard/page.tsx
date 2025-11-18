'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { Layout, Menu, Button, Dropdown, Avatar, Space, Card, Row, Col, Statistic } from 'antd'
import {
  ProjectOutlined,
  DashboardOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  RocketOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import NotificationCenter from '@/components/Notifications/NotificationCenter'

const { Header, Sider, Content } = Layout

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: 'sprints',
      icon: <CalendarOutlined />,
      label: 'Sprints',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Project Management
          </h1>
        </div>

        <Space size="large">
          <NotificationCenter />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />}>{user?.name?.[0]?.toUpperCase()}</Avatar>
              <span>{user?.name}</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#fff' }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>

            {/* Statistics Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Active Projects"
                    value={5}
                    prefix={<ProjectOutlined />}
                    valueStyle={{ color: '#3b82f6' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Active Sprints"
                    value={3}
                    prefix={<RocketOutlined />}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Team Members"
                    value={12}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#6366f1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Completed Tasks"
                    value={147}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Recent Projects */}
            <Card
              title="Recent Projects"
              extra={
                <Button type="primary" onClick={() => router.push('/projects/new')}>
                  Create New Project
                </Button>
              }
            >
              <div className="space-y-3">
                {[
                  { name: 'E-commerce Platform', progress: 75, team: 5, tasks: 23 },
                  { name: 'Mobile App Redesign', progress: 45, team: 4, tasks: 15 },
                  { name: 'API Microservices', progress: 90, team: 6, tasks: 31 },
                ].map((project, index) => (
                  <Card
                    key={index}
                    size="small"
                    hoverable
                    onClick={() => router.push('/projects/123')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{project.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span><TeamOutlined /> {project.team} members</span>
                          <span><CheckCircleOutlined /> {project.tasks} tasks</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="text-sm text-gray-500 mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
