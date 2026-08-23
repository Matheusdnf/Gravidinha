---
name: project-architecture
description: Detailed description of the Gravidinha project architecture. Use this skill when making architectural changes or creating new screens/APIs.
---

# Gravidinha Project Architecture

This project follows a clear Client-Server separation using Expo Router and React Native.

## Core Principles
- **Separation of Concerns:** UI is completely decoupled from business logic and database access.
- **Client-Side (`app/` and `components/`):** React Native screens handle UI rendering, local state (`useState`), and lifecycle (`useEffect`). They communicate with the backend exclusively via HTTP requests (`fetch`) to `/api` routes.
- **Server-Side (`app/api/`):** Expo API Routes handle all business logic, data validation, and direct database operations.
- **Reusable UI:** Components are modularized inside the `components/` folder and grouped by feature/screen (e.g., `inicio`, `perfil`).
- **Database Access:** Encapsulated in `lib/db.ts` and used exclusively by API routes.
- **Global State:** Shared context and mock data are stored in the `state/` directory.

## Directory Structure Overview
- `app/(tabs)/`: Main application screen components.
- `app/api/`: Backend API routes (business logic & database).
- `components/`: Modular, reusable UI components.
- `lib/`: Shared utilities, primarily database configuration.
- `state/`: Global contexts and mock data stores.

**Guideline:** When adding new features, ensure that database interactions are placed strictly in `app/api/` and the UI consumes them via HTTP endpoints.
