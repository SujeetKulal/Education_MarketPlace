# Education Marketplace Frontend

Frontend application for the university-focused Education Marketplace LMS.  
Built with React + Vite and integrated with Supabase Auth plus a Django REST backend.

## Tech Stack

- React 19
- Vite 8
- React Router DOM 7
- Tailwind CSS 4
- Supabase JS (auth/session)
- Axios (API client with JWT interceptor)
- Recharts and Framer Motion

## Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+
- Running backend API (default: `http://localhost:8000/api`)

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite dev server will start (typically at `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

## App Features and Routes

Public routes:

- `/` - Home
- `/login` - Login
- `/register` - Register
- `/marketplace` - Browse materials
- `/material/:id` - Material detail
- `/forums` - Forum page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

Protected routes (role-based):

- `/library` - Purchased content library (`STUDENT`, `AUTHOR`, `ADMIN`)
- `/quiz/:materialId` - Quiz page (authenticated users)
- `/viewer/pdf/:materialId` - Secure PDF viewer (`STUDENT`, `AUTHOR`, `ADMIN`)
- `/viewer/video/:materialId` - Secure video viewer (`STUDENT`, `AUTHOR`, `ADMIN`)
- `/author` - Author dashboard (`AUTHOR`)
- `/admin` - Admin panel (`ADMIN`)

## Auth and API Notes

- Supabase handles authentication/session.
- Access token is stored in `localStorage` as `access_token`.
- Axios automatically sends `Authorization: Bearer <token>` for API calls.
- On `401`, the app clears local auth state and redirects to `/login` (except during auth/bootstrap flows).

## Project Structure

```text
src/
  components/    # Shared UI + auth/layout components
  constants/     # App constants
  context/       # Auth context/provider
  lib/           # API client and Supabase client
  pages/         # Route-level pages
  styles/        # Additional styling files
```

## Backend Dependency

This frontend expects the Django backend from the same repository (`../backend`) to be running and configured with matching Supabase project credentials.
