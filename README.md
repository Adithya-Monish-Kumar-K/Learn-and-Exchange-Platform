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

## Files explained (what lives where)

Backend (Node/Express + TypeScript)
- `Backend/src/app.ts` – Boots Express, enables CORS/cookies/JSON, mounts all routers under `/api/*`, health route `/`, and starts HTTP + Socket.IO server from `config/socket.ts`.
- `Backend/src/config/db.ts` – Connects to MongoDB via `MONGODB_URI`; exposes `connectToDb()` and `getDb()`.
- `Backend/src/config/socket.ts` – Creates the HTTP server and Socket.IO instance, configures CORS, tracks online users (user→socket map), and exports `{ app, server, io }`.
- `Backend/src/config/cloudinary.ts` – Cloudinary client setup (used by upload flows for profile image/resume/certifications).
- `Backend/src/controllers/` – Request handlers:
	- `auth.controller.ts` – Register/login/refresh/logout, email flows (forgot/reset), PASETO access + JWT refresh issuance.
	- `user.controller.ts` – Get current user, get by id/email, partial profile update, uploads (image/resume/certifications).
	- `Task.controllers.ts` – Task CRUD + actions (apply/assign/complete) and stats.
	- `offer.controller.ts` – Offer CRUD, accept/withdraw, feedback.
	- `chat.controller.ts` – Sidebar users, messages CRUD, chat requests workflow.
	- `reviewSupport.controller.ts` – Reviews and support tickets CRUD.
	- `stats.controller.ts` / `chart.controller.ts` – Aggregates and chart/trend data.
- `Backend/src/routes/` – Route definitions mounted in `app.ts`:
	- `auth.routes.ts` → `/api/auth/*`
	- `user.routes.ts` → `/api/users/*`
	- `task.routes.ts` → `/api/tasks/*`
	- `offer.routes.ts` → `/api/offers/*`
	- `chat.routes.ts` → `/api/chat/*`
	- `reviewSupport.routes.ts` → `/api/*` (reviews/tickets under `/api/reviews` and `/api/tickets`)
	- `stats.routes.ts` → `/api/stats/*`, `chart.routes.ts` → `/api/charts/*`
- `Backend/src/models/` – Mongoose schemas:
	- `User.model.ts`, `Task.model.ts`, `Offer.model.ts`, `Message.model.ts` (Chat), `Review.model.ts`, `supportTicket.model.ts`, `Asset.model.ts`, `Token.model.ts`.
- `Backend/src/middlewares/`
	- `auth/tokenValidation.ts` – Verifies PASETO access token, attaches claims to `req.auth`; helpers for email/reset token verification.
	- `auth/tokenCreation.ts` – Signs PASETO access tokens and JWT refresh tokens; creates single-use email/reset tokens stored in `Token`.
	- `mail/*` – Email utilities (registration/forgot flows). `rsa/` – key material used for PASETO in production.
- `Backend/src/validators/` – Schema helpers (e.g., additional user validation schemas).

Frontend (React + Vite)
- `Frontend/src/main.tsx` – App bootstrap, React Router mounting.
- `Frontend/src/App.tsx` – App routes and layout container.
- `Frontend/src/components/` – Reusable UI and feature components:
	- `Chat.tsx`, `ChatUserList.tsx`, `ChatRequestsList.tsx` – Chat UIs.
	- `TaskList.tsx`, `TaskForm.tsx`, `TaskEditForm.tsx` – Task screens and forms.
	- `StatsCard.tsx`, `TaskStatsChart.tsx`, `ChartCard.tsx` – Dashboard metrics and charts (Recharts/Chart.js).
	- `Navbar.tsx`, `Sidebar.tsx`, `Layout.tsx`, `ProtectedRoute.tsx` – Shell, navigation and route protection.
- `Frontend/src/pages/` – Top-level pages (Dashboard, Offers, Chat, Reviews, Support, Settings, Auth pages).
- `Frontend/src/services/` – API clients (Axios): `apiClient.ts`, `offerService.ts`, `taskService.ts`.
- `Frontend/src/contexts/ThemeContext.tsx` – Theme provider and variables used by components.
- `Frontend/vite.config.ts` – Vite dev/build configuration.

> Tip: The dashboard charts consume `/api/stats/*` and `/api/charts/*`; chat screens call `/api/chat/*`; tasks/offers use `/api/tasks/*` and `/api/offers/*` respectively.

## Procedure to run locally (Windows / PowerShell)

1) Install dependencies

```powershell
# From repo root
cd Backend
npm install

cd ..\Frontend
npm install
```

2) Configure backend environment

Create `Backend/.env` with at least:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/learn-exchange
# Minimal auth settings for local development
SECRET_KEY=123                # PASETO access token shared secret marker (dev fallback)
REFRESH_SECRET_KEY=dev-secret # JWT refresh signing secret
EXPIRES_IN=15m                # access token lifetime
REFRESH_EXPIRES_IN=7d         # refresh token lifetime
MAIL_SECRET_KEY=123           # for registration links (dev fallback)
FORGOT_SECRET_KEY=123         # for password reset links (dev fallback)
MAIL_EXPIRES_IN=1d
```

Notes:
- In development, if RSA keys are not present, the token code falls back to a dummy value (`"123"`) so you can run without key files. For production, configure proper keys and secrets.
- Ensure your MongoDB instance is running and reachable at `MONGODB_URI`.

3) Start backend and frontend (two terminals)

```powershell
# Terminal A – Backend
cd Backend
npm run dev
# Starting the backend is not needed since frontend is already connected to the bacekend deployed in cloud. So, you can just run the frontend alone. This is the Backend URL:https://skill-exchange-platform-9s6c.onrender.com

# Terminal B – Frontend
cd Frontend
npm run dev
```

4) Open the apps

- Backend API + Socket.IO: http://localhost:3000
- Backend Cloud Deployment URL: https://skill-exchange-platform-9s6c.onrender.com
- Front Cloud Deployment URL: https://skill-exchange-platform-nu.vercel.app/ 
- Frontend (Vite): as shown in the terminal (http://localhost:5173)

If your backend runs elsewhere, update the frontend API base (e.g., in `services/*.ts` or by introducing a `VITE_API_URL` env and using it in `apiClient.ts`).


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
# Starting the backend is not needed since frontend is already connected to the bacekend deployed in cloud. So, you can just run the frontend alone. This is the Backend URL:https://skill-exchange-platform-9s6c.onrender.com

# Terminal B - Frontend
cd Frontend
npm run dev
```

- Backend API + Socket.IO: http://localhost:3000
- Backend Cloud Deployment URL: https://skill-exchange-platform-9s6c.onrender.com
- Front Cloud Deployment URL: https://skill-exchange-platform-nu.vercel.app/ 
- Frontend (Vite): as shown in the terminal (http://localhost:5173)

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
- Starting the backend is not needed since frontend is already connected to the bacekend deployed in cloud. So, you can just run the frontend alone. This is the Backend URL:https://skill-exchange-platform-9s6c.onrender.com

Frontend:

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier

## License

This project is provided as-is for learning and demonstration purposes.
