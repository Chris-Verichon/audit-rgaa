# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-02-16

***Added***

- Project management hooks for list, detail, create, and delete operations
- Dashboard page with project listing, loading/error states, and empty state
- New Project page with full project creation form
- Project card and project form components with validation and auth/page options

## [0.8.0] - 2026-02-16

***Added***

- Application header component with brand and primary navigation links
- Global layout wrapper with header, routed main content area, and toast notifications

## [0.7.0] - 2026-02-16

***Added***

- Reusable UI component set based on Radix + Tailwind (Accordion, Tabs, Progress)
- Form primitives (Button, Input, Textarea, Label)
- Display primitives (Card, Badge) with variants
- Shared class variance patterns via CVA for consistent styling

## [0.6.0] - 2026-02-16

***Added***

- Frontend application entry point and global Tailwind theme styles
- Router setup for dashboard, new project, and project detail routes
- Typed API client for projects and audits endpoints
- Shared frontend TypeScript types and utility helpers
- App bootstrap with React Query and TanStack Router providers

## [0.5.0] - 2026-02-16

***Added***

- Audit service with Puppeteer-based SPA-aware page crawler (max 20 pages)
- axe-core accessibility analysis with WCAG 2.1 A/AA rules
- Automatic mapping of axe-core violations to 106 RGAA criteria
- Interactive authentication support with manual confirmation flow
- PDF report generation with compliance rate, criteria details, and methodology note

## [0.4.0] - 2026-02-16

***Added***

- REST API routes for project CRUD (GET, POST, PUT, DELETE /api/projects)
- REST API routes for audit lifecycle (create, list, get, status polling, delete)
- Audit authentication confirmation endpoint (POST /api/audits/:id/confirm-auth)
- PDF report download endpoint (GET /api/audits/:id/pdf)

## [0.3.0] - 2026-02-16

***Added***

- Mongoose Project model with name, description, URL, auth config, and additional pages
- Mongoose Audit model with criteria results, page audit data, summary statistics, and raw violations

## [0.2.0] - 2026-02-16

***Added***

- Backend TypeScript type definitions for projects, audits, and RGAA criteria
- MongoDB connection configuration
- RGAA 4.1.2 criteria dataset (106 criteria) with axe-core WCAG mapping
- Fastify server entry point with CORS and health check endpoint

## [0.1.0] - 2026-02-16

***Added***

- Project `.gitignore` for Node.js, build outputs, and environment files
- `.env.example` with default configuration values
- Docker Compose setup for MongoDB, backend, and frontend services
- Backend Dockerfile with Puppeteer/Chromium dependencies
- Backend `package.json` and TypeScript configuration
- Frontend Dockerfile (multi-stage build with Nginx)
- Frontend tooling: Vite, Tailwind CSS, PostCSS, TypeScript
- Nginx reverse proxy configuration for API routing
