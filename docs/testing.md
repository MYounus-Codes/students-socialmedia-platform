# Testing strategy

## Test layers
- Unit tests for validation logic and recommendation scoring.
- Integration tests for Supabase-backed flows and server-side validation.
- End-to-end tests for signup, onboarding, post creation, and moderation flows.

## Coverage focus
- Authentication flows
- Feed generation
- Media validation
- Reactions and follow logic
- Reporting and blocking
- Authorization checks

## Tooling
- Vitest/Jest
- React Testing Library
- Playwright

## Standard
All critical flows should be tested before the production build is considered ready.