# HocGo10Ngon

A full-stack typing practice and learning platform built with Next.js and NestJS. This project combines interactive typing lessons, personalization, and admin tooling to track progress and improve typing skills.

## Project Highlights
- Interactive typing practice with real-time feedback and audio cues
- Lesson, paragraph, and word management for structured learning
- User authentication and account settings
- Progress tracking and statistics
- Admin area for content management

## Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL Prisma ORM, MongoDB, Redis

## Architecture
- client: Next.js application (UI, pages, components)
- server: NestJS API (modules, services, Prisma, seed scripts)

## Key Work I Did
- Built interactive typing UI components and lesson flow
- Integrated auth flow and account settings screens
- Added services for lessons, words, and statistics
- Implemented admin UI for content management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- A database (configure via environment variables)

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run start:dev
```

## Docker and Databases
The backend uses multiple data stores:
- Postgres for relational data via Prisma
- MongoDB for session-related data via Mongoose
- Redis for reset password key caching

The Docker Compose file is in server/docker-compose.yml and provisions MongoDB, Postgres, and Redis.

### Start services
```bash
cd server
docker compose up -d
```

### Required environment variables (server)
You can copy server/.env.example to server/.env and fill in values. Required keys for Docker:
- MONGO_ROOT
- MONGO_PASSWORD
- MONGO_DB
- MONGO_PORT
- MONGO_URL
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_PORT
- POSTGRES_URL
- REDIS_PORT
- REDIS_URL

## Environment Variables
Create .env files in client and server as needed. Example keys you may need:
- JWT_SECRET
- API_BASE_URL

## Scripts
- client: `npm run dev`, `npm run build`, `npm run lint`, `npm run start`
- server: `npm run start:dev`, `npm run build`, `npm run lint`, `npm run start:prod`

## Demo
- Live demo: https://youtu.be/tsmtnBI0PIE
## Contact
If you want to learn more about the project or my contributions, feel free to reach out.
