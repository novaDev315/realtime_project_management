'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [isDark, setIsDark] = useState(false)

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode
    if (saved) {
      setModeState(saved)
    }
  }, [])

  // Detect system preference and apply theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      let dark = false
      if (mode === 'dark') {
        dark = true
      } else if (mode === 'system') {
        dark = mediaQuery.matches
      }

      setIsDark(dark)

      // Apply to document
      if (dark) {
        document.documentElement.classList.add('dark')
        document.body.style.backgroundColor = '#141414'
        document.body.style.color = '#ffffff'
      } else {
        document.documentElement.classList.remove('dark')
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
      }
    }

    updateTheme()

    // Listen for system changes
    mediaQuery.addEventListener('change', updateTheme)
    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [mode])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark')
  }

  // Ant Design theme configuration
  const antTheme = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      ...(isDark ? {
        colorBgContainer: '#1f1f1f',
        colorBgElevated: '#262626',
        colorBgLayout: '#141414',
        colorBorder: '#434343',
        colorText: '#ffffff',
        colorTextSecondary: '#a6a6a6',
      } : {})
    }
  }

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, toggleTheme }}>
      <ConfigProvider theme={antTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
