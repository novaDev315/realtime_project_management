import axios from 'axios'
import { Card } from '../models/Card'
import { Sprint } from '../models/Sprint'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIConfig {
  apiKey: string
  baseURL?: string
  model?: string
}

class AIService {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || ''
    this.baseURL = config.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4'
  }

  private async callOpenAI(messages: OpenAIMessage[], temperature: number = 0.7): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      return response.data.choices[0].message.content
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message)
      throw new Error('Failed to generate AI response')
    }
  }

  async predictSprintCompletion(sprint: any, historicalSprints: any[]): Promise<{
    prediction: string
    confidence: number
    recommendedActions: string[]
    estimatedCompletionDate: string
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert agile project management AI assistant. Analyze sprint data and provide accurate predictions about sprint completion.`,
      },
      {
        role: 'user',
        content: `
Current Sprint:
- Name: ${sprint.name}
- Start Date: ${sprint.startDate}
- End Date: ${sprint.endDate}
- Total Story Points: ${sprint.totalPoints}
- Completed Points: ${sprint.completedPoints}
- Days Remaining: ${Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}

Historical Sprint Data:
${historicalSprints.map((s: any, i: number) => `
Sprint ${i + 1}:
- Planned Points: ${s.plannedPoints}
- Completed Points: ${s.completedPoints}
- Velocity: ${s.velocity}
`).join('\n')}

Provide a JSON response with:
1. prediction: Will the sprint be completed on time? (yes/no/at-risk)
2. confidence: Confidence level (0-100)
3. recommendedActions: Array of 3-5 specific actions to improve sprint success
4. estimatedCompletionDate: ISO date string of predicted completion

Return ONLY valid JSON, no additional text.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.3)
    return JSON.parse(response)
  }

  async generateRetroInsights(sprint: any, cards: any[]): Promise<{
    whatWentWell: string[]
    whatCouldImprove: string[]
    actionItems: string[]
    teamSentiment: 'positive' | 'neutral' | 'negative'
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert agile coach helping teams conduct retrospectives. Analyze sprint data and generate meaningful insights.`,
      },
      {
        role: 'user',
        content: `
Sprint Summary:
- Name: ${sprint.name}
- Velocity: ${sprint.velocity}
- Completed Cards: ${cards.filter((c: any) => c.status === 'done').length}
- Total Cards: ${cards.length}
- Blocked Cards: ${cards.filter((c: any) => c.blocked).length}

Card Details:
${cards.slice(0, 20).map((c: any) => `
- ${c.title} (${c.status}) - Points: ${c.storyPoints || 0}
  Comments: ${c.comments?.length || 0}
  Time in column: ${c.columnTime || 'N/A'}
`).join('\n')}

Generate retrospective insights in JSON format:
{
  "whatWentWell": ["achievement 1", "achievement 2", "achievement 3"],
  "whatCouldImprove": ["improvement 1", "improvement 2", "improvement 3"],
  "actionItems": ["action 1", "action 2", "action 3"],
  "teamSentiment": "positive" | "neutral" | "negative"
}

Return ONLY valid JSON.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.7)
    return JSON.parse(response)
  }

  async generateTasksFromDescription(description: string, projectContext: any): Promise<{
    tasks: Array<{
      title: string
      description: string
      priority: 'low' | 'medium' | 'high' | 'critical'
      estimatedPoints: number
      dependencies: string[]
    }>
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert project manager. Break down high-level requirements into specific, actionable tasks.`,
      },
      {
        role: 'user',
        content: `
Project Context:
- Project: ${projectContext.name}
- Team Size: ${projectContext.teamSize || 5}
- Tech Stack: ${projectContext.techStack || 'Web application'}

User Request:
${description}

Generate a list of specific tasks in JSON format:
{
  "tasks": [
    {
      "title": "Brief task title",
      "description": "Detailed description",
      "priority": "low|medium|high|critical",
      "estimatedPoints": 1-13,
      "dependencies": ["task title if dependent"]
    }
  ]
}

Return ONLY valid JSON. Generate 3-8 tasks.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.8)
    return JSON.parse(response)
  }

  async summarizeMeeting(transcript: string): Promise<{
    summary: string
    keyPoints: string[]
    actionItems: Array<{
      task: string
      assignee?: string
      dueDate?: string
    }>
    decisions: string[]
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert meeting facilitator. Summarize meeting transcripts and extract actionable items.`,
      },
      {
        role: 'user',
        content: `
Meeting Transcript:
${transcript}

Generate a structured summary in JSON format:
{
  "summary": "2-3 sentence overview",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": [
    {
      "task": "specific action",
      "assignee": "person name if mentioned",
      "dueDate": "date if mentioned"
    }
  ],
  "decisions": ["decision 1", "decision 2", ...]
}

Return ONLY valid JSON.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.5)
    return JSON.parse(response)
  }

  async predictRisks(projectData: any): Promise<{
    risks: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      probability: number
      impact: string
      mitigation: string
    }>
    overallRiskScore: number
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a risk management expert. Analyze project data and predict potential risks.`,
      },
      {
        role: 'user',
        content: `
Project Data:
- Active Sprints: ${projectData.activeSprints}
- Overdue Tasks: ${projectData.overdueTasks}
- Team Velocity Trend: ${projectData.velocityTrend}
- Resource Utilization: ${projectData.resourceUtilization}%
- Blocked Tasks: ${projectData.blockedTasks}
- Recent Delays: ${projectData.recentDelays}

Analyze and predict risks in JSON format:
{
  "risks": [
    {
      "type": "Risk category",
      "severity": "low|medium|high|critical",
      "probability": 0-100,
      "impact": "Description of potential impact",
      "mitigation": "Recommended mitigation strategy"
    }
  ],
  "overallRiskScore": 0-100
}

Return ONLY valid JSON. Include 3-6 most significant risks.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.4)
    return JSON.parse(response)
  }

  async optimizeResourceAllocation(resources: any[], tasks: any[]): Promise<{
    recommendations: Array<{
      resource: string
      currentLoad: number
      recommendedLoad: number
      reassignments: Array<{
        task: string
        from: string
        to: string
        reason: string
      }>
    }>
    efficiencyScore: number
  }> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a resource management expert. Optimize team workload distribution.`,
      },
      {
        role: 'user',
        content: `
Team Resources:
${resources.map((r: any) => `
- ${r.name}: ${r.currentLoad}% utilized, Skills: ${r.skills.join(', ')}
`).join('\n')}

Active Tasks:
${tasks.slice(0, 15).map((t: any) => `
- ${t.title}: Assigned to ${t.assignee || 'Unassigned'}, Points: ${t.storyPoints}, Skills: ${t.requiredSkills?.join(', ') || 'Any'}
`).join('\n')}

Generate resource optimization recommendations in JSON format:
{
  "recommendations": [
    {
      "resource": "person name",
      "currentLoad": percentage,
      "recommendedLoad": percentage,
      "reassignments": [
        {
          "task": "task title",
          "from": "current assignee",
          "to": "recommended assignee",
          "reason": "why this change"
        }
      ]
    }
  ],
  "efficiencyScore": 0-100
}

Return ONLY valid JSON.
`,
      },
    ]

    const response = await this.callOpenAI(messages, 0.6)
    return JSON.parse(response)
  }
}

export default AIService
