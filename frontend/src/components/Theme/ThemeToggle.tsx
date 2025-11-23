'use client'

import { Button, Dropdown, Tooltip } from 'antd'
import { SunOutlined, MoonOutlined, SettingOutlined } from '@ant-design/icons'
import { useTheme } from '@/contexts/ThemeContext'
import type { MenuProps } from 'antd'

export default function ThemeToggle() {
  const { mode, isDark, setMode, toggleTheme } = useTheme()

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: 'Light',
      icon: <SunOutlined />,
      onClick: () => setMode('light')
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: <MoonOutlined />,
      onClick: () => setMode('dark')
    },
    {
      key: 'system',
      label: 'System',
      icon: <SettingOutlined />,
      onClick: () => setMode('system')
    }
  ]

  return (
    <Dropdown menu={{ items, selectedKeys: [mode] }} trigger={['click']}>
      <Tooltip title={`Theme: ${mode}`}>
        <Button
          type="text"
          icon={isDark ? <MoonOutlined /> : <SunOutlined />}
          onClick={(e) => e.preventDefault()}
          className={isDark ? 'text-yellow-400' : 'text-gray-600'}
        />
      </Tooltip>
    </Dropdown>
  )
}

// Simple toggle button variant
export function ThemeToggleSimple() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Button
        type="text"
        shape="circle"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        className={isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-800'}
      />
    </Tooltip>
  )
}
