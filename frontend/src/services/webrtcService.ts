import { Socket } from 'socket.io-client'

interface Peer {
  connection: RTCPeerConnection
  stream?: MediaStream
}

export class WebRTCService {
  private socket: Socket
  private localStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private peers: Map<string, Peer> = new Map()
  private roomId: string | null = null

  // STUN/TURN servers configuration
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]

  constructor(socket: Socket) {
    this.socket = socket
    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    // Handle when a new user joins the room
    this.socket.on('webrtc:user-joined', async ({ userId }) => {
      console.log('[WebRTC] User joined:', userId)
      await this.createPeerConnection(userId, true)
    })

    // Handle when a user leaves
    this.socket.on('webrtc:user-left', ({ userId }) => {
      console.log('[WebRTC] User left:', userId)
      this.removePeer(userId)
    })

    // Handle incoming offer
    this.socket.on('webrtc:offer', async ({ from, offer }) => {
      console.log('[WebRTC] Received offer from:', from)
      await this.handleOffer(from, offer)
    })

    // Handle incoming answer
    this.socket.on('webrtc:answer', async ({ from, answer }) => {
      console.log('[WebRTC] Received answer from:', from)
      await this.handleAnswer(from, answer)
    })

    // Handle ICE candidate
    this.socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
      console.log('[WebRTC] Received ICE candidate from:', from)
      await this.handleIceCandidate(from, candidate)
    })
  }

  // Join a video room
  async joinRoom(roomId: string): Promise<void> {
    this.roomId = roomId
    this.socket.emit('webrtc:join-room', { roomId })
  }

  // Leave the current room
  leaveRoom(): void {
    if (this.roomId) {
      this.socket.emit('webrtc:leave-room', { roomId: this.roomId })
      this.roomId = null
    }

    this.stopAllStreams()
    this.closeAllPeerConnections()
  }

  // Start local video/audio stream
  async startLocalStream(options: {
    video?: boolean | MediaTrackConstraints
    audio?: boolean | MediaTrackConstraints
  } = {}): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: options.video !== undefined ? options.video : true,
        audio: options.audio !== undefined ? options.audio : true,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Add stream to all existing peer connections
      this.peers.forEach((peer) => {
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            peer.connection.addTrack(track, this.localStream!)
          })
        }
      })

      return this.localStream
    } catch (error) {
      console.error('[WebRTC] Failed to get local stream:', error)
      throw error
    }
  }

  // Start screen sharing
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      })

      // Replace video track in all peer connections
      this.peers.forEach((peer) => {
        const videoSender = peer.connection
          .getSenders()
          .find((sender) => sender.track?.kind === 'video')

        if (videoSender && this.screenStream) {
          const screenTrack = this.screenStream.getVideoTracks()[0]
          videoSender.replaceTrack(screenTrack)
        }
      })

      // Listen for screen share stop
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare()
      }

      return this.screenStream
    } catch (error) {
      console.error('[WebRTC] Failed to start screen share:', error)
      throw error
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop())
      this.screenStream = null
    }

    // Switch back to camera if available
    if (this.localStream) {
      this.peers.forEach((peer) => {
        const videoSender = peer.connection
          .getSenders()
          .find((sender) => sender.track?.kind === 'video')

        if (videoSender && this.localStream) {
          const cameraTrack = this.localStream.getVideoTracks()[0]
          if (cameraTrack) {
            videoSender.replaceTrack(cameraTrack)
          }
        }
      })
    }
  }

  // Toggle audio/video
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  // Create a peer connection
  private async createPeerConnection(userId: string, createOffer: boolean): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    })

    // Add local stream if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc:ice-candidate', {
          to: userId,
          candidate: event.candidate,
        })
      }
    }

    // Handle incoming track
    peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track from:', userId)
      const peer = this.peers.get(userId)
      if (peer) {
        peer.stream = event.streams[0]
        // Notify application about new stream
        this.onRemoteStream?.(userId, event.streams[0])
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', peerConnection.connectionState)
      if (peerConnection.connectionState === 'failed') {
        this.removePeer(userId)
      }
    }

    this.peers.set(userId, { connection: peerConnection })

    // Create offer if we're the initiator
    if (createOffer) {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      this.socket.emit('webrtc:offer', {
        to: userId,
        offer: peerConnection.localDescription,
      })
    }
  }

  // Handle incoming offer
  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peers.has(userId)) {
      await this.createPeerConnection(userId, false)
    }

    const peer = this.peers.get(userId)
    if (peer) {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await peer.connection.createAnswer()
      await peer.connection.setLocalDescription(answer)

      this.socket.emit('webrtc:answer', {
        to: userId,
        answer: peer.connection.localDescription,
      })
    }
  }

  // Handle incoming answer
  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(userId)
    if (peer) {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  // Handle ICE candidate
  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(userId)
    if (peer) {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  // Remove a peer
  private removePeer(userId: string): void {
    const peer = this.peers.get(userId)
    if (peer) {
      peer.connection.close()
      this.peers.delete(userId)
      this.onPeerRemoved?.(userId)
    }
  }

  // Stop all streams
  private stopAllStreams(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop())
      this.screenStream = null
    }
  }

  // Close all peer connections
  private closeAllPeerConnections(): void {
    this.peers.forEach((peer) => {
      peer.connection.close()
    })
    this.peers.clear()
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  // Get remote streams
  getRemoteStreams(): Map<string, MediaStream> {
    const streams = new Map<string, MediaStream>()
    this.peers.forEach((peer, userId) => {
      if (peer.stream) {
        streams.set(userId, peer.stream)
      }
    })
    return streams
  }

  // Callbacks
  onRemoteStream?: (userId: string, stream: MediaStream) => void
  onPeerRemoved?: (userId: string) => void
}
