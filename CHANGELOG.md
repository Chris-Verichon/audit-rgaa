# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-16

### Added

- Backend TypeScript type definitions for projects, audits, and RGAA criteria
- MongoDB connection configuration
- RGAA 4.1.2 criteria dataset (106 criteria) with axe-core WCAG mapping
- Fastify server entry point with CORS and health check endpoint

## [0.1.0] - 2026-02-16

### Added

- Project `.gitignore` for Node.js, build outputs, and environment files
- `.env.example` with default configuration values
- Docker Compose setup for MongoDB, backend, and frontend services
- Backend Dockerfile with Puppeteer/Chromium dependencies
- Backend `package.json` and TypeScript configuration
- Frontend Dockerfile (multi-stage build with Nginx)
- Frontend tooling: Vite, Tailwind CSS, PostCSS, TypeScript
- Nginx reverse proxy configuration for API routing
