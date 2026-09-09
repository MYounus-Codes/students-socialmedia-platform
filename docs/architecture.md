# Architecture

## Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Zod validation
- React Hook Form

## High-level architecture
The app follows a layered architecture:
1. UI layer: app routes and React components
2. Application layer: route handlers, server actions, validation, service functions
3. Domain layer: recommendation, feed, search, notifications, moderation logic
4. Data layer: Supabase client and PostgreSQL with RLS
5. Storage layer: media abstraction for Supabase Storage and future S3/R2 migration

## Design decisions
- Prefer server components and route handlers for sensitive logic.
- Keep authorization checks server-side.
- Keep business logic out of UI components.
- Use a storage abstraction instead of direct file handling in application code.
- Keep future recommendation logic modular and independent from UI rendering.

## Folder conventions
- `src/app` contains route structure and page-level logic.
- `src/components` contains reusable UI and layout building blocks.
- `src/lib` contains services, validation schemas, security helpers, storage abstraction, and feed logic.
- `src/types` contains shared domain types.
- `supabase/migrations` contains DB migrations.
- `docs` contains architecture and operational docs.
