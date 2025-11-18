'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Button, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Title level={1} className="text-5xl font-bold mb-4">
          Real-Time Project Management
        </Title>
        <Paragraph className="text-xl mb-8 text-gray-600">
          Collaborate in real-time with live Kanban boards, sprint planning, and team collaboration.
          Boost your team productivity by 40% with AI-powered insights.
        </Paragraph>

        <div className="flex gap-4 justify-center mb-12">
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/login')}
            className="px-8 py-6 text-lg h-auto"
          >
            Get Started
          </Button>
          <Button
            size="large"
            onClick={() => router.push('/demo')}
            className="px-8 py-6 text-lg h-auto"
          >
            View Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚡</div>
            <Title level={4}>Real-Time Updates</Title>
            <Paragraph>Sub-100ms latency for instant collaboration across your team</Paragraph>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <Title level={4}>Sprint Planning</Title>
            <Paragraph>Intelligent sprint planning with velocity tracking and burndown charts</Paragraph>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤝</div>
            <Title level={4}>Team Collaboration</Title>
            <Paragraph>Built-in chat, comments, and notifications keep everyone aligned</Paragraph>
          </div>
        </div>
      </div>
    </div>
  )
}
