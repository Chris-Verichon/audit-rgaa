# Audit RGAA

A web application for automated accessibility auditing based on the French **RGAA** (Référentiel Général d'Amélioration de l'Accessibilité) standard. It crawls websites, runs axe-core analysis, maps results to the 106 RGAA 4.1.2 criteria, and generates detailed compliance reports.

## Features

### Accessibility Auditing

- Automated audit of websites against **106 RGAA 4.1.2 criteria**
- SPA-aware page crawler using Puppeteer (discovers internal links and client-side routes)
- axe-core analysis with WCAG 2.1 A/AA rules
- Automatic mapping of axe-core violations to RGAA criteria
- Support for sites requiring authentication (interactive login flow with manual confirmation)
- Configurable additional pages to include in the audit

### Reports & Analytics

- Compliance rate calculation with detailed breakdown (compliant, non-compliant, non-applicable, not tested)
- Per-page audit results with violation counts
- Grouped criteria view by RGAA theme (13 themes)
- Violation details with affected HTML elements and remediation links
- PDF report generation with full audit results and methodology note

### Project Management

- Create and manage audit projects with URL, description, and auth configuration
- Audit history per project with previous results
- Re-run audits and compare compliance over time

### User Management & Access Control

- User registration with name, email, organization type (enterprise/individual), and password
- JWT-based authentication with 7-day token expiry
- Role-based access control (admin / user)
- First registered user is automatically assigned admin role
- Admin panel for managing users: role toggle, account deletion
- Per-project user permissions (grant/revoke access to specific users)

### Internationalization & UI

- Full French and English interface with language toggle
- Dark mode with system preference detection and manual toggle
- Responsive design with Tailwind CSS
- User dropdown menu with profile, theme switch, language switch, and logout

## Tech Stack

### Backend

- **Runtime:** Node.js with TypeScript
- **Framework:** Fastify
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (`@fastify/jwt`) + bcrypt password hashing
- **Auditing:** Puppeteer + axe-core
- **PDF:** PDFKit

### Frontend

- **Framework:** React 19 with TypeScript
- **Build:** Vite
- **Routing:** TanStack Router
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS with class-based dark mode
- **Components:** Radix UI (Accordion, Tabs, Dropdown Menu, Switch, Dialog, Progress, Tooltip)
- **Icons:** Lucide React
- **Toasts:** Sonner

### Infrastructure

- Docker Compose with MongoDB, backend, and frontend services
- Nginx reverse proxy for frontend with API routing
- Multi-stage Docker builds

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (or Docker)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd audit-rgaa
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB** (via Docker or local instance)

   ```bash
   docker compose up mongodb -d
   ```

4. **Start the backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Start the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:3001`.

### Docker Compose (Full Stack)

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- MongoDB: `localhost:27018`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_USER` | `admin` | MongoDB root username |
| `MONGO_PASSWORD` | `admin123` | MongoDB root password |
| `MONGODB_URI` | `mongodb://admin:admin123@localhost:27018/audit-rgaa?authSource=admin` | MongoDB connection string |
| `PORT` | `3001` | Backend server port |
| `JWT_SECRET` | `audit-rgaa-secret-key-change-in-production` | Secret key for JWT signing |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |

## Project Structure

```text
├── backend/
│   └── src/
│       ├── config/         # Database connection
│       ├── data/           # RGAA 4.1.2 criteria dataset
│       ├── middleware/      # Auth & role middleware
│       ├── models/          # Mongoose models (Audit, Project, User)
│       ├── routes/          # REST API routes
│       ├── services/        # Audit engine, auth, PDF generation
│       └── types/           # TypeScript type definitions
├── frontend/
│   └── src/
│       ├── assets/terms/    # i18n translations (FR/EN)
│       ├── components/
│       │   ├── audit/       # Report, summary, criteria, status badge
│       │   ├── layout/      # Header, layout wrappers
│       │   ├── projects/    # Project card, form, permissions, audit history
│       │   └── ui/          # Reusable UI primitives
│       ├── hooks/           # Data fetching, auth, i18n, theme hooks
│       ├── lib/             # API client, utilities
│       ├── pages/           # Route pages
│       └── types/           # Frontend type definitions
├── docker-compose.yml
└── CHANGELOG.md
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes across all versions.
