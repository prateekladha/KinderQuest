# KinderQuest

Monorepo for the KinderQuest family task and rewards app.

## Stack

- `apps/mobile`: Expo + React Native app for child and parent mobile experiences
- `apps/web`: Next.js app for a richer parent control panel when needed
- `packages/types`: shared domain types and validation schemas
- `packages/api`: shared data access and Supabase client boundary
- `packages/ui`: shared design tokens and reusable UI primitives
- `supabase`: database migrations, policies, seed data, and edge functions

## Why a Monorepo

This product shares one domain model across multiple surfaces:

- tasks, rewards, approvals, and streaks
- family, parent, and child roles
- shared design tokens and copy
- shared API contracts and validation

Keeping everything in one repo avoids drift between mobile, web, and backend code.

## Initial Folder Layout

```text
apps/
  mobile/
  web/
packages/
  api/
  config/
  types/
  ui/
supabase/
  functions/
  migrations/
  seed.sql
docs/
```

## Next Setup Steps

1. Install workspace dependencies with `pnpm install`.
2. Run the mobile app with `pnpm dev:mobile`.
3. Initialize the Next.js app in `apps/web` if you want the web panel in MVP.
4. Run `supabase init` to connect local project config if Supabase CLI is installed.
5. Define the domain schema before building screens.

## Environment

Copy [apps/mobile/.env.example](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/.env.example) to [apps/mobile/.env](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/.env) and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The mobile app currently attempts live Supabase reads for the family snapshot and today's tasks, then falls back to mock data if env or auth is not ready.

## Expo Sandbox Note

The mobile scripts set workspace-local `HOME`, `XDG_CACHE_HOME`, and `XDG_CONFIG_HOME` paths.
This avoids Expo writing to global folders like `~/.expo`, which is useful in sandboxed or CI-like environments.
