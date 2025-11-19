'use client'

import { useState } from 'react'
import {
  Card,
  Button,
  Input,
  Tabs,
  List,
  Tag,
  Space,
  Alert,
  Spin,
  Typography,
  Progress,
  Divider,
  message,
} from 'antd'
import {
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { TextArea } = Input
const { TabPane } = Tabs
const { Title, Text, Paragraph } = Typography

interface AIInsightsProps {
  projectId: string
  sprintId?: string
}

export default function AIInsights({ projectId, sprintId }: AIInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [sprintPrediction, setSprintPrediction] = useState<any>(null)
  const [retroInsights, setRetroInsights] = useState<any>(null)
  const [generatedTasks, setGeneratedTasks] = useState<any>(null)
  const [riskPrediction, setRiskPrediction] = useState<any>(null)
  const [taskDescription, setTaskDescription] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])

  const predictSprintCompletion = async () => {
    if (!sprintId) {
      message.error('No sprint selected')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/sprints/${sprintId}/predict-completion`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSprintPrediction(response.data)
      message.success('Sprint prediction generated')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to predict sprint completion')
    } finally {
      setLoading(false)
    }
  }

  const generateRetroInsights = async () => {
    if (!sprintId) {
      message.error('No sprint selected')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/sprints/${sprintId}/retro-insights`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRetroInsights(response.data)
      message.success('Retrospective insights generated')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to generate retrospective insights')
    } finally {
      setLoading(false)
    }
  }

  const generateTasks = async () => {
    if (!taskDescription.trim()) {
      message.error('Please enter a task description')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/projects/${projectId}/generate-tasks`,
        { description: taskDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setGeneratedTasks(response.data)
      message.success('Tasks generated successfully')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to generate tasks')
    } finally {
      setLoading(false)
    }
  }

  const predictRisks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/projects/${projectId}/predict-risks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setRiskPrediction(response.data)
      message.success('Risk prediction generated')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to predict risks')
    } finally {
      setLoading(false)
    }
  }

  const chatWithAI = async () => {
    if (!chatMessage.trim()) return

    const userMessage = chatMessage
    setChatMessage('')
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }])

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/chat`,
        {
          message: userMessage,
          context: { projectId, sprintId },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setChatHistory((prev) => [...prev, { role: 'assistant', content: response.data.response }])
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'gold'
      default:
        return 'blue'
    }
  }

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'yes':
        return 'success'
      case 'at-risk':
        return 'warning'
      default:
        return 'error'
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>AI-Powered Insights</span>
          </Space>
        }
      >
        <Tabs defaultActiveKey="sprint">
          {/* Sprint Prediction Tab */}
          <TabPane
            tab={
              <span>
                <ThunderboltOutlined />
                Sprint Prediction
              </span>
            }
            key="sprint"
          >
            <div className="space-y-4">
              <Button type="primary" onClick={predictSprintCompletion} loading={loading}>
                Predict Sprint Completion
              </Button>

              {sprintPrediction && (
                <div className="space-y-4">
                  <Alert
                    message="Sprint Prediction"
                    description={
                      <div>
                        <p>
                          <strong>Will Complete On Time:</strong>{' '}
                          <Tag color={getPredictionColor(sprintPrediction.prediction)}>
                            {sprintPrediction.prediction.toUpperCase()}
                          </Tag>
                        </p>
                        <p>
                          <strong>Confidence:</strong>{' '}
                          <Progress
                            percent={sprintPrediction.confidence}
                            size="small"
                            status={
                              sprintPrediction.confidence > 70 ? 'success' : 'exception'
                            }
                          />
                        </p>
                        <p>
                          <strong>Estimated Completion:</strong>{' '}
                          {new Date(sprintPrediction.estimatedCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    }
                    type="info"
                  />

                  <Card title="Recommended Actions" size="small">
                    <List
                      dataSource={sprintPrediction.recommendedActions}
                      renderItem={(action: string) => (
                        <List.Item>
                          <CheckCircleOutlined className="mr-2 text-green-500" />
                          {action}
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
              )}
            </div>
          </TabPane>

          {/* Retrospective Tab */}
          <TabPane
            tab={
              <span>
                <BulbOutlined />
                Retrospective
              </span>
            }
            key="retro"
          >
            <div className="space-y-4">
              <Button type="primary" onClick={generateRetroInsights} loading={loading}>
                Generate Retrospective Insights
              </Button>

              {retroInsights && (
                <div className="space-y-4">
                  <Card title="What Went Well" size="small" className="border-green-300">
                    <List
                      dataSource={retroInsights.whatWentWell}
                      renderItem={(item: string) => (
                        <List.Item>
                          <CheckCircleOutlined className="mr-2 text-green-500" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Card title="What Could Improve" size="small" className="border-orange-300">
                    <List
                      dataSource={retroInsights.whatCouldImprove}
                      renderItem={(item: string) => (
                        <List.Item>
                          <WarningOutlined className="mr-2 text-orange-500" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Card title="Action Items" size="small" className="border-blue-300">
                    <List
                      dataSource={retroInsights.actionItems}
                      renderItem={(item: string) => (
                        <List.Item>
                          <ClockCircleOutlined className="mr-2 text-blue-500" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Alert
                    message={`Team Sentiment: ${retroInsights.teamSentiment}`}
                    type={
                      retroInsights.teamSentiment === 'positive'
                        ? 'success'
                        : retroInsights.teamSentiment === 'neutral'
                        ? 'info'
                        : 'warning'
                    }
                  />
                </div>
              )}
            </div>
          </TabPane>

          {/* Task Generation Tab */}
          <TabPane
            tab={
              <span>
                <ThunderboltOutlined />
                Generate Tasks
              </span>
            }
            key="tasks"
          >
            <div className="space-y-4">
              <TextArea
                rows={4}
                placeholder="Describe what you want to build in natural language..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
              <Button type="primary" onClick={generateTasks} loading={loading}>
                Generate Tasks
              </Button>

              {generatedTasks && (
                <List
                  dataSource={generatedTasks.tasks}
                  renderItem={(task: any) => (
                    <Card size="small" className="mb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Title level={5}>{task.title}</Title>
                          <Paragraph>{task.description}</Paragraph>
                          <Space>
                            <Tag color={getSeverityColor(task.priority)}>{task.priority}</Tag>
                            <Tag color="blue">{task.estimatedPoints} points</Tag>
                          </Space>
                          {task.dependencies.length > 0 && (
                            <div className="mt-2">
                              <Text type="secondary">Dependencies: </Text>
                              {task.dependencies.map((dep: string, i: number) => (
                                <Tag key={i}>{dep}</Tag>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button type="primary" size="small">
                          Create
                        </Button>
                      </div>
                    </Card>
                  )}
                />
              )}
            </div>
          </TabPane>

          {/* Risk Prediction Tab */}
          <TabPane
            tab={
              <span>
                <WarningOutlined />
                Risk Analysis
              </span>
            }
            key="risks"
          >
            <div className="space-y-4">
              <Button type="primary" onClick={predictRisks} loading={loading}>
                Predict Project Risks
              </Button>

              {riskPrediction && (
                <div className="space-y-4">
                  <Alert
                    message={`Overall Risk Score: ${riskPrediction.overallRiskScore}/100`}
                    type={
                      riskPrediction.overallRiskScore > 70
                        ? 'error'
                        : riskPrediction.overallRiskScore > 40
                        ? 'warning'
                        : 'success'
                    }
                  />

                  <List
                    dataSource={riskPrediction.risks}
                    renderItem={(risk: any) => (
                      <Card size="small" className="mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Space>
                              <Tag color={getSeverityColor(risk.severity)}>{risk.severity}</Tag>
                              <Text strong>{risk.type}</Text>
                            </Space>
                            <Paragraph className="mt-2">{risk.impact}</Paragraph>
                            <div className="mt-2">
                              <Text type="secondary">Probability: </Text>
                              <Progress
                                percent={risk.probability}
                                size="small"
                                status={risk.probability > 70 ? 'exception' : 'normal'}
                              />
                            </div>
                            <Alert
                              message="Mitigation Strategy"
                              description={risk.mitigation}
                              type="info"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </Card>
                    )}
                  />
                </div>
              )}
            </div>
          </TabPane>

          {/* AI Chat Tab */}
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                AI Assistant
              </span>
            }
            key="chat"
          >
            <div className="space-y-4">
              <div
                className="border rounded p-4 h-96 overflow-y-auto bg-gray-50"
                style={{ minHeight: '400px' }}
              >
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <RobotOutlined style={{ fontSize: '48px' }} />
                    <p className="mt-4">Ask me anything about your project!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Space.Compact className="w-full">
                <Input
                  placeholder="Ask AI assistant..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onPressEnter={chatWithAI}
                  disabled={loading}
                />
                <Button type="primary" onClick={chatWithAI} loading={loading}>
                  Send
                </Button>
              </Space.Compact>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
