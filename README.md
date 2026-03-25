# KinderQuest

KinderQuest is a family task and rewards app with separate parent and child experiences.

This repo contains the mobile app, shared domain logic, and Supabase backend used for:

- family creation and membership
- parent task and reward management
- child task claiming and reward redemption
- parent approvals
- push notifications
- EAS Android distribution and iOS readiness

This is the main GitHub-facing overview. For deeper build context and prompt history, see [CLAUDE.md](/Users/prateek.ladha/git/child_tasks_app/CLAUDE.md).

## Stack

- `apps/mobile`: Expo + React Native app for child and parent mobile experiences
- `apps/web`: Next.js app for a richer parent control panel when needed
- `packages/types`: shared domain types and validation schemas
- `packages/api`: shared data access and Supabase client boundary
- `packages/ui`: shared design tokens and reusable UI primitives
- `supabase`: database migrations, policies, seed data, and edge functions

## Why a Monorepo

This product shares one domain model across multiple surfaces:

- tasks, rewards, approvals, notifications, and streaks
- family, parent, and child roles
- shared design tokens and copy
- shared API contracts and validation
- one source of truth for app and backend workflows

Keeping everything in one repo avoids drift between mobile, web, and backend code.

## Features

Parent:

- family dashboard
- approvals queue
- history
- task creation
- reward creation
- child/member management

Child:

- home dashboard
- today's tasks
- rewards
- store
- recent wins and progress tracking

Platform:

- Supabase auth and database
- push token registration
- push delivery through Supabase Edge Function + Expo push
- EAS build configuration
- OTA-ready update channel setup

## Folder Layout

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

## Local Setup

Install dependencies:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm install
```

Run the mobile app:

```bash
cd apps/mobile
COREPACK_HOME=/tmp/corepack corepack pnpm run android
```

or:

```bash
cd apps/mobile
COREPACK_HOME=/tmp/corepack corepack pnpm run ios
```

## Environment

Copy [apps/mobile/.env.example](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/.env.example) to [apps/mobile/.env](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/.env) and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The mobile app uses live Supabase data when configured and authenticated.

## Push Notifications

Push notifications are implemented end to end, but require native platform setup:

- Android: `google-services.json`
- iOS: `GoogleService-Info.plist`
- Supabase `send-push` edge function
- Expo/EAS delivery credentials

Use a real device for push testing, not a simulator.

## Distribution

EAS is configured for:

- `preview` internal builds
- `production` builds
- OTA-ready channels for future JS-only updates

For distribution details, see [distribution.md](/Users/prateek.ladha/git/child_tasks_app/docs/distribution.md).
For local run instructions, see [running.md](/Users/prateek.ladha/git/child_tasks_app/docs/running.md).

## Notes

The mobile scripts set workspace-local `HOME`, `XDG_CACHE_HOME`, and `XDG_CONFIG_HOME` paths.
This avoids Expo writing to global folders like `~/.expo`, which is useful in sandboxed or CI-like environments.
