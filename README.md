# Learn & Exchange Platform

An end-to-end web application for learning, bartering skills, and collaborating through tasks, offers, chat, reviews, and support tickets. Built with a modern TypeScript stack and real-time updates.

## Overview

This platform enables users to:

- Create and manage tasks
- Make offers (services/skills/assets) on tasks
- Chat in real-time with Socket.IO
- Submit and browse reviews
- Open and track support tickets
- View dashboards and statistics
- Manage personal settings (theme, notifications, privacy)

## Tech Stack

- Frontend: React + TypeScript + Vite, React Router, Tailwind-style utility classes, lucide-react icons, react-hot-toast
- Backend: Node.js + Express + TypeScript, Mongoose (MongoDB), Socket.IO, express-validator
- Auth: Token-based (via `apiClient` integration)
- Build/Dev: Vite (FE), Nodemon/ts-node-dev (BE)

## Monorepo Structure

```
Backend/
	src/
		app.ts                # Express app + Socket.IO server
		config/               # DB, Cloudinary, socket setup
		controllers/          # route controllers
		models/               # Mongoose models
		routes/               # Express routes
Frontend/
	src/
		pages/                # Pages (Dashboard, Offers, Settings, etc.)
		components/           # UI components
		services/             # apiClient and feature services
```

## Prerequisites

- Node.js 18+ (recommended)
- Yarn or npm
- MongoDB instance (local or cloud)

## Quick Start

1. Install dependencies

```bash
# In Backend
cd Backend
npm install

# In Frontend
cd ../Frontend
npm install
```

2. Configure environment

Create `Backend/.env` with at least:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/learn-exchange
JWT_SECRET=your-secret
```

Optionally configure Cloudinary, email, etc., if used in your environment.

3. Run the app (two terminals)

```bash
# Terminal A - Backend
cd Backend
npm run dev

# Terminal B - Frontend
cd Frontend
npm run dev
```

Backend runs on http://localhost:3000 (Express + Socket.IO)

Frontend runs on the port shown by Vite (usually http://localhost:5173)

Make sure the frontend is configured to talk to port 3000 for API calls. The provided `apiClient` and various components already use absolute URLs (http://localhost:3000) where needed.

## Key Features

- Tasks: Create/edit/delete, export tasks as JSON from UI
- Offers: Create/update/delete, filter/search, export offers as JSON
- Chat: Real-time messaging with object-id enforcement and history sync
- Reviews: Create and list, export reviews as JSON
- Support: Submit tickets, view list, export tickets as JSON
- Settings: Theme (Light/Dark), notifications, privacy; save/reset/download settings

## Important Routes (Backend)

- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Tasks: `/api/tasks/*`
- Offers: `/api/offers/*`
- Chat: `/api/chat/*`
- Reviews: `/api/reviews` (GET/POST), `/api/reviews/update/:id`, `/api/reviews/delete/:id`
- Tickets: `/api/tickets` (GET/POST), `/api/tickets/update/:id`, `/api/tickets/delete/:id`
- Stats: `/api/stats/*`
- Charts: `/api/charts/*`

Socket.IO server shares the same port as Express (default 3000).

## Frontend Navigation

- Dashboard: `/dashboard`
- Chat: `/chat`
- Tasks: `/tasks`
- Offers: `/offers`
- Reviews: `/reviews`
- Support: `/support`
- Settings: `/settings`

All above are protected routes behind the main layout and require authentication.

## Environment Tips

- If you host Backend on another URL/port, update the frontend API base usage (e.g., via `apiClient` or .env for the front-end if you add one).
- Ensure CORS is enabled for your frontend origin (backend has permissive CORS in development).

## Troubleshooting

- 404 on a route: Confirm the router is mounted in `Backend/src/app.ts` and you’re using the correct base path `/api/...`.
- Mongo connection issues: Check `MONGODB_URI` in `.env` and that MongoDB is running.
- Socket.IO connection issues: Ensure the backend is on port 3000 and CORS allows your frontend origin.
- Type errors: Run Prettier/ESLint/TypeScript checks as configured.

## Scripts

Backend:

- `npm run dev` - Start backend with nodemon
- `npm run format` - Format code with Prettier

Frontend:

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier

## License

This project is provided as-is for learning and demonstration purposes.
