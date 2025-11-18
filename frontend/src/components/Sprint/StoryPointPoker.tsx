'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Space, Avatar, Tag, Modal, Select, message, Statistic } from 'antd'
import { TrophyOutlined, EyeOutlined, EyeInvisibleOutlined, RedoOutlined } from '@ant-design/icons'
import { useSocket } from '@/hooks/useSocket'

const { Option } = Select

interface Vote {
  userId: string
  userName: string
  points: number | null
  voted: boolean
}

interface StoryPointPokerProps {
  cardId: string
  cardTitle: string
  currentPoints?: number
  onPointsSelected: (points: number) => void
}

const FIBONACCI_POINTS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
const SPECIAL_CARDS = [
  { value: -1, label: '?' },
  { value: -2, label: '☕' },
]

export default function StoryPointPoker({
  cardId,
  cardTitle,
  currentPoints,
  onPointsSelected,
}: StoryPointPokerProps) {
  const socket = useSocket()
  const [votes, setVotes] = useState<Map<string, Vote>>(new Map())
  const [myVote, setMyVote] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [currentUser, setCurrentUser] = useState({ id: 'user-1', name: 'You' }) // Mock user

  useEffect(() => {
    if (!cardId) return

    // Join poker session
    socket.emit('poker:join', { cardId })

    // Listen for votes
    socket.on('poker:vote', (data: { userId: string; userName: string; voted: boolean }) => {
      setVotes((prev) => {
        const newVotes = new Map(prev)
        newVotes.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          points: null,
          voted: data.voted,
        })
        return newVotes
      })
    })

    // Listen for reveal
    socket.on('poker:reveal', (data: { votes: Record<string, number> }) => {
      setVotes((prev) => {
        const newVotes = new Map(prev)
        Object.entries(data.votes).forEach(([userId, points]) => {
          const existing = newVotes.get(userId)
          if (existing) {
            newVotes.set(userId, { ...existing, points, voted: true })
          }
        })
        return newVotes
      })
      setRevealed(true)
    })

    // Listen for reset
    socket.on('poker:reset', () => {
      setVotes(new Map())
      setMyVote(null)
      setRevealed(false)
    })

    // Listen for session state
    socket.on('poker:session', (data: { active: boolean }) => {
      setSessionActive(data.active)
    })

    return () => {
      socket.emit('poker:leave', { cardId })
      socket.off('poker:vote')
      socket.off('poker:reveal')
      socket.off('poker:reset')
      socket.off('poker:session')
    }
  }, [cardId, socket])

  const handleVote = (points: number) => {
    setMyVote(points)
    socket.emit('poker:vote', {
      cardId,
      userId: currentUser.id,
      userName: currentUser.name,
      points,
      voted: true,
    })

    // Update local votes
    setVotes((prev) => {
      const newVotes = new Map(prev)
      newVotes.set(currentUser.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        points: revealed ? points : null,
        voted: true,
      })
      return newVotes
    })

    message.success(`Voted ${points === -1 ? '?' : points === -2 ? 'Coffee Break' : points} points`)
  }

  const handleReveal = () => {
    socket.emit('poker:reveal', { cardId })
    setRevealed(true)
  }

  const handleReset = () => {
    socket.emit('poker:reset', { cardId })
    setVotes(new Map())
    setMyVote(null)
    setRevealed(false)
    message.info('Voting session reset')
  }

  const handleAcceptPoints = () => {
    const average = calculateAverage()
    if (average !== null) {
      onPointsSelected(average)
      message.success(`Story points set to ${average}`)
      handleReset()
    }
  }

  const calculateAverage = (): number | null => {
    const validVotes = Array.from(votes.values())
      .map((v) => v.points)
      .filter((p): p is number => p !== null && p >= 0)

    if (validVotes.length === 0) return null

    const sum = validVotes.reduce((acc, p) => acc + p, 0)
    const avg = sum / validVotes.length

    // Round to nearest Fibonacci number
    const nearest = FIBONACCI_POINTS.reduce((prev, curr) =>
      Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev
    )

    return nearest
  }

  const getConsensus = (): boolean => {
    const validVotes = Array.from(votes.values())
      .map((v) => v.points)
      .filter((p): p is number => p !== null && p >= 0)

    if (validVotes.length < 2) return false
    return new Set(validVotes).size === 1
  }

  const allVoted = votes.size > 0 && Array.from(votes.values()).every((v) => v.voted)

  return (
    <div className="space-y-4">
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Story Point Poker</span>
            <Tag color="blue">{cardTitle}</Tag>
          </Space>
        }
        extra={
          <Space>
            {currentPoints !== undefined && (
              <Tag color="green">Current: {currentPoints} points</Tag>
            )}
            {allVoted && !revealed && (
              <Button type="primary" icon={<EyeOutlined />} onClick={handleReveal}>
                Reveal Votes
              </Button>
            )}
            {revealed && (
              <Button icon={<RedoOutlined />} onClick={handleReset}>
                New Round
              </Button>
            )}
          </Space>
        }
      >
        {/* Voting Cards */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Select Your Estimate:</h4>
          <div className="flex flex-wrap gap-2">
            {FIBONACCI_POINTS.map((points) => (
              <Button
                key={points}
                type={myVote === points ? 'primary' : 'default'}
                size="large"
                onClick={() => handleVote(points)}
                disabled={revealed}
                className="min-w-[60px] h-[80px] text-2xl font-bold"
              >
                {points}
              </Button>
            ))}
            {SPECIAL_CARDS.map((card) => (
              <Button
                key={card.value}
                type={myVote === card.value ? 'primary' : 'default'}
                size="large"
                onClick={() => handleVote(card.value)}
                disabled={revealed}
                className="min-w-[60px] h-[80px] text-2xl font-bold"
              >
                {card.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-3">
            Participants ({votes.size}):
          </h4>
          <div className="flex flex-wrap gap-3">
            {Array.from(votes.values()).map((vote) => (
              <div
                key={vote.userId}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg min-w-[100px]"
              >
                <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
                  {vote.userName[0].toUpperCase()}
                </Avatar>
                <div className="mt-2 text-sm font-medium">{vote.userName}</div>
                <div className="mt-1">
                  {!revealed ? (
                    vote.voted ? (
                      <Tag color="green" icon={<EyeInvisibleOutlined />}>
                        Voted
                      </Tag>
                    ) : (
                      <Tag color="default">Waiting...</Tag>
                    )
                  ) : (
                    <Tag
                      color={
                        vote.points === -1
                          ? 'orange'
                          : vote.points === -2
                          ? 'purple'
                          : 'blue'
                      }
                      className="text-lg font-bold"
                    >
                      {vote.points === -1
                        ? '?'
                        : vote.points === -2
                        ? '☕'
                        : vote.points}
                    </Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {revealed && votes.size > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title="Average Estimate"
                  value={calculateAverage() || 0}
                  suffix="points"
                  valueStyle={{ color: '#1890ff', fontSize: '32px' }}
                />
                {getConsensus() && (
                  <Tag color="green" className="mt-2">
                    ✓ Consensus Reached!
                  </Tag>
                )}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleAcceptPoints}
                disabled={calculateAverage() === null}
              >
                Accept & Assign Points
              </Button>
            </div>
          </div>
        )}

        {votes.size === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>Waiting for team members to join...</p>
            <p className="text-sm mt-2">Cast your vote to begin!</p>
          </div>
        )}
      </Card>
    </div>
  )
}
