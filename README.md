# Real-Time Project Management Platform

A cutting-edge real-time collaborative project management platform with live Kanban boards, sprint planning, resource allocation, and team collaboration.

## Features

- **Real-Time Kanban Boards**: Sub-100ms update propagation with drag-and-drop
- **Live Sprint Planning**: Collaborative sprint planning with story points and velocity tracking
- **Resource Allocation**: Optimize team resources across projects
- **Interactive Gantt Charts**: Visualize project timelines with dependencies
- **Team Collaboration**: In-context comments, notifications, and activity feeds
- **Real-Time Analytics**: Live project metrics and insights

## Tech Stack

### Frontend
- React 18+ with Next.js 14
- TypeScript 5.0+
- Socket.io-client for real-time
- Redux Toolkit for state management
- Ant Design + Tailwind CSS
- React DnD Kit for drag-and-drop

### Backend
- Node.js 20 LTS
- Express + Socket.io
- TypeScript 5.0+
- MongoDB 6.0
- Redis 7.0
- JWT Authentication

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

## MVP Timeline

- **Phase 1 (Weeks 1-4)**: Foundation - WebSocket infrastructure, authentication, basic Kanban board
- **Phase 2 (Weeks 5-8)**: Project Management - Sprint features, collaboration tools
- **Phase 3 (Weeks 9-12)**: Polish & Launch - Advanced features, optimization, production ready

## License

MIT License
