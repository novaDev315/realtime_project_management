# Real-Time Project Management Platform

A cutting-edge real-time collaborative project management platform with live Kanban boards, sprint planning, resource allocation, and team collaboration.

## Features

### Core Features (All Implemented ✅)

#### 1. Real-Time Kanban Boards
- Sub-100ms update propagation across all connected users
- Drag-and-drop card management with @dnd-kit
- Live cursor tracking and presence indicators
- Multi-column board support
- Card details with priority, assignees, story points
- Real-time synchronization via WebSocket

#### 2. Sprint Planning Module
- Create and manage sprints with start/end dates
- Sprint capacity planning and allocation
- Velocity tracking across sprints
- Active sprint monitoring with progress indicators
- Story point estimation
- Burndown chart visualization
- Sprint goal setting and tracking

#### 3. Resource Allocation Manager
- Team capacity visualization and planning
- Real-time utilization tracking (color-coded alerts)
- Workload distribution charts
- Team member availability status
- Skills-based resource matching
- Overload detection with smart recommendations
- Automatic workload balancing suggestions
- Export capacity reports

#### 4. Interactive Gantt Charts
- Visual timeline representation of all tasks
- Task dependencies management
- Progress tracking per task
- Team member assignment
- Priority and status indicators
- Add/Edit/Delete task functionality
- Duration calculation and visualization
- Critical path analysis

#### 5. Team Collaboration Hub
- Real-time notification center with badge counter
- Activity feed with timeline view
- Multiple notification types:
  - @mentions and comments
  - Task assignments
  - Status changes
  - Deadline alerts
  - Team updates
- Mark as read/unread functionality
- Search and filter activities
- User presence tracking

#### 6. Real-Time Analytics Dashboard
- Sprint velocity trend analysis (Bar charts)
- Burndown charts with ideal vs actual
- Task distribution by status (Pie charts)
- Team performance metrics
- Priority distribution visualization
- Key Performance Indicators (KPIs):
  - Active tasks counter
  - Team velocity tracking
  - Completion rate metrics
  - Team size overview
- Time range filtering
- Export capabilities

## Tech Stack

### Frontend
- React 18+ with Next.js 14
- TypeScript 5.0+
- Socket.io-client 4.5+ for real-time communication
- Redux Toolkit for state management
- Ant Design 5.0 + Tailwind CSS for UI
- React DnD Kit for drag-and-drop functionality
- Recharts for data visualization
- date-fns & dayjs for date handling
- Axios for HTTP requests

### Backend
- Node.js 20 LTS
- Express 4.18+ for REST API
- Socket.io 4.5+ for WebSocket server
- @socket.io/redis-adapter for horizontal scaling
- TypeScript 5.0+
- MongoDB 6.0 with Mongoose ODM
- Redis 7.0 for caching and pub/sub
- JWT Authentication with bcrypt
- Express Validator for input validation
- Helmet for security headers
- Morgan for logging
- Compression middleware

## Project Structure

```
realtime_project_management/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js backend API and WebSocket server
├── docs/             # Documentation
└── docker-compose.yml # Development infrastructure
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (for MongoDB and Redis)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realtime_project_management
```

2. Start infrastructure services (MongoDB and Redis):
```bash
docker-compose up -d
```

3. Set up backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your configuration
npm run dev
```

The backend will start on http://localhost:5000

4. Set up frontend (in a new terminal):
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local if needed
npm run dev
```

The frontend will start on http://localhost:3000

5. Open http://localhost:3000 in your browser

### Default Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

## Development

### Backend API
- REST API: http://localhost:5000/api
- WebSocket: ws://localhost:5000

### Frontend
- Development: http://localhost:3000
- Hot reload enabled

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project_management
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:memberId` - Remove member

#### Boards
- `GET /api/projects/:projectId/boards` - List project boards
- `POST /api/projects/:projectId/boards` - Create board
- `GET /api/boards/:id` - Get board with cards
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/columns` - Add column

#### Cards
- `POST /api/boards/:boardId/columns/:columnId/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `PUT /api/cards/:id/move` - Move card between columns
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/comments` - Add comment

#### Sprints
- `GET /api/projects/:projectId/sprints` - List sprints
- `POST /api/projects/:projectId/sprints` - Create sprint
- `GET /api/sprints/:id` - Get sprint details
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint
- `POST /api/sprints/:id/start` - Start sprint
- `POST /api/sprints/:id/complete` - Complete sprint
- `POST /api/sprints/:id/cards/:cardId` - Add card to sprint
- `DELETE /api/sprints/:id/cards/:cardId` - Remove card from sprint

### WebSocket Events

#### Client → Server
- `board:join` - Join board room
- `board:leave` - Leave board room
- `card:create` - Create new card
- `card:update` - Update card
- `card:move` - Move card
- `card:delete` - Delete card
- `cursor:move` - Update cursor position
- `user:typing` - Typing indicator
- `sprint:join` / `sprint:leave` - Sprint room management
- `sprint:update` - Update sprint
- `comment:add` - Add comment

#### Server → Client
- `card:created` - Card was created
- `card:updated` - Card was updated
- `card:moved` - Card was moved
- `card:deleted` - Card was deleted
- `user:joined` - User joined board
- `user:left` - User left board
- `cursor:moved` - User cursor moved
- `user:typing` - User is typing
- `sprint:updated` - Sprint updated
- `sprint:started` - Sprint started
- `sprint:completed` - Sprint completed
- `comment:added` - Comment added

## Component Architecture

```
frontend/src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx          # Authentication
│   ├── dashboard/page.tsx      # Main dashboard
│   └── projects/[id]/page.tsx  # Project workspace
├── components/
│   ├── Board/
│   │   ├── KanbanBoard.tsx     # Main board component
│   │   └── BoardColumn.tsx     # Column component
│   ├── Card/
│   │   └── CardItem.tsx        # Card component
│   ├── Sprint/
│   │   └── SprintBoard.tsx     # Sprint management
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx   # Charts & metrics
│   │   └── ResourceAllocation.tsx   # Team resources
│   ├── Gantt/
│   │   └── GanttChart.tsx      # Timeline view
│   └── Notifications/
│       ├── NotificationCenter.tsx   # Notification bell
│       └── ActivityFeed.tsx    # Activity timeline
├── store/
│   ├── store.ts                # Redux store
│   └── slices/
│       ├── authSlice.ts        # Auth state
│       ├── projectSlice.ts     # Projects state
│       ├── boardSlice.ts       # Boards state
│       └── sprintSlice.ts      # Sprints state
├── services/
│   ├── api.ts                  # REST API client
│   └── socket.ts               # WebSocket client
└── hooks/
    └── useSocket.ts            # Socket.io hooks

backend/src/
├── server.ts                   # Express + Socket.io server
├── config/
│   ├── database.ts             # MongoDB connection
│   └── redis.ts                # Redis connection
├── models/
│   ├── User.ts                 # User model
│   ├── Project.ts              # Project model
│   ├── Board.ts                # Board model
│   ├── Card.ts                 # Card model
│   └── Sprint.ts               # Sprint model
├── controllers/
│   ├── authController.ts       # Auth logic
│   ├── projectController.ts    # Project CRUD
│   ├── boardController.ts      # Board CRUD
│   ├── cardController.ts       # Card CRUD
│   └── sprintController.ts     # Sprint CRUD
├── routes/
│   ├── auth.ts                 # Auth routes
│   ├── projects.ts             # Project routes
│   ├── boards.ts               # Board routes
│   ├── cards.ts                # Card routes
│   └── sprints.ts              # Sprint routes
├── middleware/
│   └── auth.ts                 # JWT middleware
├── socket/
│   └── socketHandler.ts        # WebSocket events
└── utils/
    └── jwt.ts                  # JWT utilities
```

## Key Features Showcase

### Real-Time Collaboration
All users see changes instantly:
- Card moved? Everyone sees it in real-time
- Comment added? Notification appears immediately
- Sprint started? Team gets instant update

### Intelligent Resource Management
- Automatic detection of team member overload
- Smart recommendations for workload balancing
- Skills-based task suggestions
- Real-time capacity visualization

### Comprehensive Analytics
- Historical velocity tracking
- Burndown chart predictions
- Team performance insights
- Priority distribution analysis

### Professional Project Management
- Agile sprint methodology support
- Gantt chart for waterfall/hybrid projects
- Flexible board customization
- Multi-project portfolio management

## Production Deployment

### Environment Setup
1. Set up MongoDB Atlas cluster
2. Set up Redis Cloud instance
3. Configure environment variables
4. Deploy backend to AWS/Heroku/DigitalOcean
5. Deploy frontend to Vercel/Netlify

### Scaling Considerations
- WebSocket horizontal scaling via Redis adapter
- MongoDB read replicas for high traffic
- CDN for static assets
- Load balancer for API servers
- Redis Cluster for large teams

## Security Features
- JWT-based authentication
- Bcrypt password hashing
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Rate limiting (configurable)
- SQL injection prevention (NoSQL)
- XSS protection

## Development Status

✅ All PRD Phase 1-3 Features Complete:
- Real-Time Kanban Boards
- Sprint Planning Module
- Resource Allocation Manager
- Interactive Gantt Charts
- Team Collaboration Hub
- Analytics Dashboard
- Authentication System
- WebSocket Infrastructure
- Database Models & API
- Redis Integration

## Future Enhancements (Post-MVP)
- AI-powered insights and predictions
- Advanced automation workflows
- Mobile native applications (iOS/Android)
- Offline mode with sync
- Advanced integrations (Slack, Teams, GitHub, etc.)
- Custom reporting engine
- Portfolio management for executives
- White-label options for enterprise

## Contributing
Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

MIT License
