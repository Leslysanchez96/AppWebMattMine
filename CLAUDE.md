# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppWebMattMine is an educational web application with AI capabilities for measuring primary math student performance. It consists of a Vue 3 frontend (Argon Dashboard template) and an Express.js backend connected to a PostgreSQL database ("BD-MattMine").

## Commands

### Frontend (root directory)
```bash
npm install                  # Install dependencies
npm run serve                # Dev server (port 8080)
npm run build                # Production build → dist/
npm run lint                 # ESLint
npm run prettify             # Prettier on all files
```

### Backend (server/ directory)
```bash
cd server && npm install     # Install backend dependencies
cd server && npm start       # Start server (port 3001)
cd server && npm run dev     # Dev server with nodemon auto-reload
cd server && node verificar_db.js  # Verify database tables exist
```

### Running both together
Start backend and frontend in separate terminals:
```bash
npm run start-backend        # Runs cd server && npm start
npm run serve                # Vue dev server
```

## Architecture

### Frontend (`src/`)
- **Framework**: Vue 3 (Composition API with `<script setup>`) + Vue Router 4 + Vuex 4 + Bootstrap 5
- **Entry**: `src/main.js` → mounts app with store, router, and ArgonDashboard plugin
- **Router** (`src/router/index.js`): Web History mode. Default route `/` redirects to `/signin`. Key routes: `/dashboard-default`, `/tables`, `/billing`, `/profile`, `/signin`, `/signup`
- **Store** (`src/store/index.js`): Vuex store manages UI layout state only (sidebar, navbar, dark mode, RTL). No data/API state yet.
- **Components** (`src/components/`): Reusable Argon UI primitives (ArgonButton, ArgonInput, ArgonAlert, etc.)
- **Examples** (`src/examples/`): Layout components (Sidenav, Navbar, Cards, Charts, Breadcrumbs, Footer, Configurator)
- **Views** (`src/views/`): Page-level components. Currently UI scaffolds without API integration.

### Backend (`server/`)
- **Entry**: `server/index.js` — Express app with CORS and JSON middleware on port 3001 (or `PORT` env var)
- **Database**: `server/db.js` — PostgreSQL connection pool via `pg`. Exports `query()` method. Config from env vars.
- **Current endpoints**: Only `GET /` (welcome) and `GET /api/test-db` (connection test). No application endpoints yet.

### Database (`db/schema.sql`)
PostgreSQL schema with 20 tables (snake_case naming, SERIAL PKs) across modules:
- **Seguridad**: `usuario` (rol: Estudiante/Docente/Administrador), `pregunta_seguridad`, `usuario_pregunta`, `recuperar_password`
- **Estructura Académica**: `aula` (grado+seccion+anio unique), `estudiante`, `docente`, `asignacion_aula`, `preferencia_estudiante`
- **Cursos y Contenidos**: `cursos`, `aula_curso`, `temas`, `material`
- **Evaluaciones con IA**: `evaluacion` (estados: Borrador/Publicada/Finalizada/Cancelada), `pregunta_generada_ia` (opciones A-D, dificultad: Fácil/Medio/Difícil)
- **Respuestas y Resultados**: `respuesta_estudiante`, `resultado_evaluacion`, `rendimiento_por_tema`
- **Reportes y Alertas**: `reporte_estudiante`, `alerta_riesgo` (estados: Pendiente/Atendida/Resuelta/Descartada)

Includes performance indexes and seed data (preguntas de seguridad, curso Matemática, aulas 1.°A y 1.°B para 2026).

### Environment Variables (server/.env)
```
PORT=3001
DB_USER=postgres
DB_PASSWORD=admin1234
DB_HOST=localhost
DB_PORT=5432
DB_NAME=BD-MattMine
```

## Deployment

Configured for Genezio (`genezio.yaml`): builds frontend with `npm install --legacy-peer-deps && npm run build`, deploys `dist/` folder. Frontend-only deployment; backend requires separate hosting.

## Current State

The frontend is a UI scaffold based on Vue Argon Dashboard. The backend is minimal (no application routes). The database schema is complete. The main gap is connecting views to API endpoints — no API client layer, authentication logic, or data fetching exists yet.
