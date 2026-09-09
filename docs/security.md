# Security plan

## Security priorities
- Enforce RLS policies on all tables with user-scoped access.
- Require backend validation for profile edits, media uploads, reactions, reports, and follows.
- Avoid leaking internal error messages.
- Keep service-role keys server-only.
- Validate uploads by MIME type, size, and extension.

## Threats addressed
- XSS via sanitization and safe rendering patterns.
- SQL injection via parameterized Supabase queries.
- IDOR via row-level access and ownership checks.
- File upload abuse via extension/MIME size validation.
- Mass abuse via rate limiting architecture and server-side validation.

## Future hardening
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production rate limiting.
- Add moderation tasks and admin dashboards.
- Add Vercel security headers and CSP.

The rate-limit abstraction uses Upstash Redis when these variables are present. It only uses a process-local fallback outside production; production requests fail closed if distributed rate limiting is not configured.
