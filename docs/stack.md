# Stack Decision

## Chosen Stack

- Mobile app: Expo + React Native + TypeScript
- Optional web app: Next.js + TypeScript
- Backend: Supabase
- Shared contracts and data layer: workspace packages

## Why This Fits KinderQuest

- One mobile codebase covers Android, iPhone, and iPad.
- The UI is custom and animation-heavy but still well within React Native's range.
- The product domain is relational, which favors Postgres over a document-first backend.
- Parents may eventually want a richer browser view, which is easy to add in the same repo.

## Product Shape Implied by the Design

- child mode: dashboard, tasks, reward store, progress
- parent mode: approvals, setup, history, rewards, family controls
- shared family account and role model underneath
