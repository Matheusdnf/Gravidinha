---
name: project-architecture
description: Detailed description of the Gravidinha project architecture. Use this skill when making architectural changes or creating new screens/APIs.
---

# Gravidinha Project Architecture

This project is an Expo Router / React Native app backed directly by Supabase (Postgres + Auth). There is no custom API server.

## Core Principles
- **Separation of Concerns:** UI is completely decoupled from business logic and database access.
- **Screens (`app/` and `components/`):** React Native screens handle UI rendering, local state (`useState`), and lifecycle (`useEffect`). They never call `supabase` directly; they call the functions in `lib/dados.ts`.
- **Data access (`lib/dados.ts`):** One function per operation (listarGestacoes, criarConsulta, ...) using the Supabase client from `lib/supabase.ts`. Functions throw `Error` with a user-facing message.
- **Security (`supabase/migrations/`):** Row Level Security policies in the database decide what each user can read/write. The app only has the publishable key, so every rule that matters (ownership, "no new records on a finished gestação", one active gestação) lives in the database, not in app code.
- **Reusable UI:** Components are modularized inside the `components/` folder and grouped by feature/screen (e.g., `inicio`, `perfil`).
- **Auth:** Supabase Auth (e-mail/senha). `state/auth.tsx` mirrors the session; the profile row in `usuario` is created by a trigger on signup.
- **Global State:** Shared context and mock data are stored in the `state/` directory.

## Directory Structure Overview
- `app/(tabs)/`: Main application screen components.
- `components/`: Modular, reusable UI components.
- `lib/`: Supabase client (`supabase.ts`), data functions (`dados.ts`) and shared utilities.
- `supabase/migrations/`: Database schema, RLS policies and functions (SQL).
- `state/`: Global contexts and mock data stores.

**Guideline:** New data features = a migration (table + RLS policies) in `supabase/migrations/` plus a function in `lib/dados.ts`. Never put the secret/service_role key in the app.
