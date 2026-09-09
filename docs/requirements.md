# Requirements

This project is a student-first social platform built on Next.js and Supabase.

## Product goals
- Create a student-focused network for sharing updates, projects, problems, resources, and ideas.
- Keep the architecture modular and production-oriented.
- Prioritize security, performance, accessibility, and maintainability.

## Core requirements
- Authenticated student accounts with role-based access.
- Profile management and onboarding interest selection.
- Flexible post system across multiple content types.
- Social graph features, interactions, bookmarks, notifications, search, and feed ranking.
- Media storage and validation through abstractions.
- RLS and server-side permission checks.
- Documentation, testing, and deployment readiness.

## Functional scope
- Student signup, login, logout, reset password, and email verification.
- Profile pages and public user discovery.
- Personalized home feed with feed variants and recommendation engine.
- Post composer for text, media, links, topics, and hashtags.
- Projects, problems/questions, ideas, resources, and announcements.
- Social interactions: like, dislike, comment, reply, save, share, follow.
- Moderation/reporting/blocking flows.
- Notifications and search/discovery pages.

## Non-goals for V1
- Full machine-learning recommendation engine.
- Native mobile app.
- Large-scale real-time collaboration features beyond targeted use of Supabase Realtime.
- Advanced AI moderation without a clear product requirement.
