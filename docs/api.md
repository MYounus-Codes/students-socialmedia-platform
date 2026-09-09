# API design

The app uses Next.js route handlers and server-side data access patterns.

## Response contract
{
  "success": true,
  "data": { ... },
  "error": null
}

Failure:
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}

## Route groups
- `/api/auth/*`
- `/api/posts/*`
- `/api/comments/*`
- `/api/reactions/*`
- `/api/follows/*`
- `/api/feed/*`
- `/api/search/*`
- `/api/notifications/*`
- `/api/media/*`
- `/api/reports/*`

## Security notes
- Validate all inputs with Zod.
- Treat route handlers as untrusted entry points.
- Enforce authorization server-side.
- Never trust client-side permission checks.
