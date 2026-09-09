# Campusly

Campusly is a student-first social platform for connecting, sharing, learning, and collaborating across academic communities.

## Overview
Campusly helps students:
- build a profile
- follow peers and mentors
- share posts, ideas, projects, and problems
- discover content based on interests and interactions
- upload and manage media securely
- participate in a safe and moderated community

## Stack
- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Zod

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase values.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`

## Architecture
See the documentation under `docs/` for requirements, architecture, database, API, security, deployment, and testing guidance.

## Notes
This project is intentionally built with modular abstractions so it can evolve toward advanced feeds, moderation, and future ML-driven recommendations.
