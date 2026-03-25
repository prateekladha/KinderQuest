# CLAUDE.md

## Project

KinderQuest is a family task and rewards app with two roles:

- Parent
- Child

Primary platform:

- Expo React Native mobile app

Backend:

- Supabase Auth
- Supabase Postgres
- Supabase Edge Functions

Repo structure:

- `apps/mobile` for the Expo app
- `packages/api` for app data and backend-facing repository logic
- `packages/types` for shared types and mock app shapes
- `packages/ui` for shared design tokens
- `supabase/migrations` for schema and SQL workflows
- `supabase/functions` for edge functions such as push delivery

## Product Goals

Build a polished mobile-first app where:

- parents create and manage a family
- parents create tasks with points
- children claim tasks
- parents approve or reject tasks
- parents create rewards with star cost
- children redeem rewards
- parents approve or reject reward requests
- children mark rewards fulfilled
- push notifications work on real devices

## Current Architecture

Mobile stack:

- Expo SDK 53
- Expo Router
- React Native
- TypeScript

Backend stack:

- Supabase email/password auth
- row-level security
- SQL migrations for workflow logic
- edge function `send-push`

App routing:

- signed-out flow under root routes like `/`, `/sign-in`, `/create-family`, `/accept-invite`
- signed-in tab flow under `apps/mobile/app/(tabs)`

Role behavior:

- parent tabs: dashboard, approvals, history, manage
- child tabs: home, tasks, rewards, store

## Important App Behavior

Parent flows:

- view family dashboard
- approve and reject tasks
- approve and reject reward requests
- invite family members
- create tasks and rewards

Child flows:

- view today's tasks
- claim tasks
- browse rewards
- redeem rewards
- mark approved rewards fulfilled

Push notification flows:

- child claims task -> parent push
- parent approves task -> child push
- parent rejects task -> child push
- child requests reward -> parent push
- parent approves reward -> child push
- parent rejects reward -> child push
- child fulfills reward -> parent push

## Push Notification Notes

Client-side:

- notification permission and Expo token registration are handled in:
  - `apps/mobile/components/notification-provider.tsx`
- push tokens are stored in:
  - `public.push_tokens`

Server-side:

- push sending is handled by:
  - `supabase/functions/send-push/index.ts`

Native config files:

- Android: `apps/mobile/google-services.json`
- iOS: `apps/mobile/GoogleService-Info.plist`

These files are intentionally gitignored and should be provided locally and through EAS file environment variables.

## EAS / Build Notes

EAS build config:

- `apps/mobile/eas.json`

Expo app config:

- `apps/mobile/app.config.js`

Important:

- Android and iOS Firebase client files are read from:
  - `GOOGLE_SERVICES_JSON`
  - `GOOGLE_SERVICE_INFO_PLIST`
- preview builds are intended for internal distribution
- OTA is configured using EAS channels and `runtimeVersion.policy = "appVersion"`

## Promptset

### Master Product Prompt

```text
Build a mobile-first family task and rewards app called KinderQuest.

Users:
- Parent
- Child

Core flows:
- Parent creates family
- Parent invites/adds child
- Parent creates tasks with points
- Child sees assigned tasks
- Child claims/completes task
- Parent approves/rejects task
- Parent creates rewards with star cost
- Child redeems reward
- Parent approves/rejects reward
- Child marks reward fulfilled

Requirements:
- Expo React Native app
- Supabase backend
- Role-based parent/child experience
- Clean, polished UI
- Real device push notifications
- Android EAS distribution first
- iOS support too, but preserve separation between native prerequisites and app logic

Do not give me only a plan. Implement the app end to end, including schema, app screens, navigation, auth, and data wiring.
```

### Tech Stack Prompt

```text
Use this stack:

- Expo Router
- React Native
- Supabase Auth, Postgres, Edge Functions
- TypeScript
- Monorepo structure:
  - apps/mobile
  - packages/api
  - packages/types
  - packages/ui
  - supabase/functions
  - supabase/migrations

Requirements:
- keep app logic in shared repository layer
- keep types explicit
- add migrations instead of ad hoc SQL
- use EAS for builds
- preserve a clean file structure
```

### UI Prompt

```text
Design the app to feel intentional, playful, and premium, not generic dashboard boilerplate.

Parent UX:
- overview dashboard
- approvals
- history
- family management

Child UX:
- home
- tasks
- rewards
- store/reward browsing

Style:
- bright but tasteful
- rounded cards
- friendly language
- mobile-first spacing
- strong visual hierarchy
- polished empty/loading states

Do not use bland admin UI patterns.
```

### Data Model Prompt

```text
Create Supabase schema and migrations for:

- families
- family_members
- family_member_invites
- task_definitions
- task_assignments
- reward_definitions
- reward_redemptions
- push_tokens

Also create:
- RLS policies
- helper functions/RPCs for approval and workflow actions
- indexes for real query paths
```

### Auth and Role Prompt

```text
Implement auth with Supabase email/password.

Rules:
- a signed-in user maps to a family_member
- parent and child see different tabs and screens
- parents cannot use child-only actions
- children cannot access parent-only views
- redirect safely based on role and membership state
```

### Push Notification Prompt

```text
Implement push notifications end to end.

Requirements:
- request notification permission on device
- fetch Expo push token
- save token to Supabase push_tokens
- create Supabase Edge Function send-push
- trigger notifications for:
  - child claims task -> parent
  - parent approves/rejects task -> child
  - child requests reward -> parent
  - parent approves/rejects reward -> child
  - child fulfills reward -> parent
- add debug visibility for notification state during development
- support Android and iOS native config through Expo/EAS
```

### Distribution Prompt

```text
Prepare the app for EAS distribution.

Requirements:
- eas.json with preview and production profiles
- app config with project id
- Android package and iOS bundle id
- icons/adaptive icon
- support Firebase config files through EAS file env vars
- configure app for future OTA updates using channels and runtimeVersion
```

### Reliability Prompt

```text
Do not stop at happy path code.

Also:
- fix build issues
- diagnose native/EAS failures
- add necessary indexes
- avoid silent failures
- add concise debug logging where needed
- keep the app shippable, not just demoable
```

## Working Rules For Future Iterations

- prefer changing migrations over manual database edits
- keep notification logic debuggable until both Android and iOS are stable
- treat local build success and cloud build success as separate concerns
- prefer EAS file env vars for native config files
- for JS-only fixes, prefer EAS Update after a build has established the correct runtime/channel contract
- when performance issues appear, inspect actual business queries first, not Supabase metadata queries

## Key Files

- [apps/mobile/app.config.js](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/app.config.js)
- [apps/mobile/eas.json](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/eas.json)
- [apps/mobile/components/notification-provider.tsx](/Users/prateek.ladha/git/child_tasks_app/apps/mobile/components/notification-provider.tsx)
- [packages/api/src/index.ts](/Users/prateek.ladha/git/child_tasks_app/packages/api/src/index.ts)
- [supabase/functions/send-push/index.ts](/Users/prateek.ladha/git/child_tasks_app/supabase/functions/send-push/index.ts)
- [supabase/migrations/20260323182000_initial_schema.sql](/Users/prateek.ladha/git/child_tasks_app/supabase/migrations/20260323182000_initial_schema.sql)
- [supabase/migrations/20260325110000_performance_indexes.sql](/Users/prateek.ladha/git/child_tasks_app/supabase/migrations/20260325110000_performance_indexes.sql)
