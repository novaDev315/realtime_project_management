'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Space, Avatar, Tooltip, message } from 'antd'
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  DesktopOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useSocket } from '@/hooks/useSocket'
import { WebRTCService } from '@/services/webrtcService'

interface VideoCallProps {
  roomId: string
  onLeave?: () => void
}

interface RemoteUser {
  userId: string
  userName: string
  stream: MediaStream
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
  const socket = useSocket()
  const [webrtc, setWebrtc] = useState<WebRTCService | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map())
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    if (!socket) return

    // Initialize WebRTC service
    const webrtcService = new WebRTCService(socket)
    setWebrtc(webrtcService)

    // Set up callbacks
    webrtcService.onRemoteStream = (userId: string, stream: MediaStream) => {
      setRemoteUsers((prev) => {
        const newMap = new Map(prev)
        newMap.set(userId, {
          userId,
          userName: `User ${userId.substring(0, 6)}`,
          stream,
        })
        return newMap
      })
    }

    webrtcService.onPeerRemoved = (userId: string) => {
      setRemoteUsers((prev) => {
        const newMap = new Map(prev)
        newMap.delete(userId)
        return newMap
      })
    }

    // Join the room and start local stream
    const initializeCall = async () => {
      try {
        await webrtcService.joinRoom(roomId)
        const stream = await webrtcService.startLocalStream({
          video: true,
          audio: true,
        })
        setLocalStream(stream)
      } catch (error) {
        console.error('Failed to initialize call:', error)
        message.error('Failed to access camera/microphone')
      }
    }

    initializeCall()

    // Cleanup on unmount
    return () => {
      webrtcService.leaveRoom()
    }
  }, [socket, roomId])

  // Update local video ref
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Update remote video refs
  useEffect(() => {
    remoteUsers.forEach((user, userId) => {
      const videoElement = remoteVideosRef.current.get(userId)
      if (videoElement && user.stream) {
        videoElement.srcObject = user.stream
      }
    })
  }, [remoteUsers])

  const toggleAudio = () => {
    if (webrtc) {
      const newState = !isAudioEnabled
      webrtc.toggleAudio(newState)
      setIsAudioEnabled(newState)
      message.success(newState ? 'Microphone enabled' : 'Microphone muted')
    }
  }

  const toggleVideo = () => {
    if (webrtc) {
      const newState = !isVideoEnabled
      webrtc.toggleVideo(newState)
      setIsVideoEnabled(newState)
      message.success(newState ? 'Camera enabled' : 'Camera disabled')
    }
  }

  const toggleScreenShare = async () => {
    if (!webrtc) return

    try {
      if (isScreenSharing) {
        await webrtc.stopScreenShare()
        setIsScreenSharing(false)
        message.success('Screen sharing stopped')
      } else {
        await webrtc.startScreenShare()
        setIsScreenSharing(true)
        message.success('Screen sharing started')
      }
    } catch (error) {
      console.error('Screen share error:', error)
      message.error('Failed to toggle screen sharing')
    }
  }

  const leaveCall = () => {
    if (webrtc) {
      webrtc.leaveRoom()
    }
    onLeave?.()
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Remote videos grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {remoteUsers.size === 0 ? (
          <div className="col-span-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <UserOutlined style={{ fontSize: '64px' }} />
              <p className="mt-4 text-lg">Waiting for others to join...</p>
            </div>
          </div>
        ) : (
          Array.from(remoteUsers.entries()).map(([userId, user]) => (
            <Card
              key={userId}
              className="bg-gray-800 border-gray-700"
              bodyStyle={{ padding: 0 }}
            >
              <div className="relative aspect-video bg-black">
                <video
                  ref={(el) => {
                    if (el) remoteVideosRef.current.set(userId, el)
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
                  {user.userName}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-24 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs">
          You
        </div>
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Avatar size={64} icon={<UserOutlined />} />
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
            <Button
              shape="circle"
              size="large"
              type={isAudioEnabled ? 'default' : 'primary'}
              danger={!isAudioEnabled}
              icon={isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleAudio}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            />
          </Tooltip>

          <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            <Button
              shape="circle"
              size="large"
              type={isVideoEnabled ? 'default' : 'primary'}
              danger={!isVideoEnabled}
              icon={<VideoCameraOutlined />}
              onClick={toggleVideo}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            />
          </Tooltip>

          <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <Button
              shape="circle"
              size="large"
              type={isScreenSharing ? 'primary' : 'default'}
              icon={<DesktopOutlined />}
              onClick={toggleScreenShare}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            />
          </Tooltip>

          <Tooltip title="Leave call">
            <Button
              shape="circle"
              size="large"
              danger
              type="primary"
              icon={<PhoneOutlined rotate={135} />}
              onClick={leaveCall}
            />
          </Tooltip>
        </div>

        <div className="text-center mt-2 text-gray-400 text-sm">
          {remoteUsers.size} {remoteUsers.size === 1 ? 'participant' : 'participants'}
        </div>
      </div>
    </div>
  )
}
