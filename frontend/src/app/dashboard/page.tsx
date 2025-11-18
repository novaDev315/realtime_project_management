'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd'
import {
  ProjectOutlined,
  DashboardOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'

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

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />}>{user?.name?.[0]?.toUpperCase()}</Avatar>
            <span>{user?.name}</span>
          </Space>
        </Dropdown>
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
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minHeight: '80vh' }}>
            <h2>Welcome to Real-Time Project Management</h2>
            <p>Select a project from the sidebar to get started, or create a new project.</p>

            <div style={{ marginTop: '32px' }}>
              <Button type="primary" size="large">
                Create New Project
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
