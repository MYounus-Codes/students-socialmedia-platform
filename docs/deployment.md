# Deployment plan

## Vercel deployment flow
1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in Supabase Dashboard -> SQL Editor, or apply it with the Supabase CLI. If it was already applied, run `supabase/migrations/002_social_read_policies.sql`, `supabase/migrations/003_interaction_read_policies.sql`, `supabase/migrations/004_guarantee_profiles.sql`, `supabase/migrations/005_profile_media_storage.sql`, `supabase/migrations/006_post_media_storage.sql`, `supabase/migrations/007_notifications_write_policy.sql`, and `supabase/migrations/008_blocking_enforcement.sql` as well.
3. Run `supabase/seed.sql` to add the onboarding interest catalog.
4. Configure storage buckets.
5. Configure Supabase Auth.
6. Add environment variables in Vercel.
7. Connect the GitHub repository.
8. Deploy production build.
9. Validate auth, uploads, and database calls.

## Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `UPSTASH_REDIS_REST_URL` (required for production distributed rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` (required for production distributed rate limiting)

## Supabase Auth configuration
In Supabase Dashboard -> Authentication -> URL Configuration:
- Set Site URL to `http://localhost:3000` for local development.
- Add `http://localhost:3000/**` to Redirect URLs.
- For production, replace both values with the Vercel production URL.

The signup route creates the Auth user first and then creates the matching `profiles` row using the server-only service-role key. The migration must be applied before signup, otherwise profile provisioning will fail and the Auth user will be rolled back.

## Operational notes
- Use Vercel-managed deployments.
- Keep all secrets in environment variables and never store them in source control.
- Use Supabase storage for media assets rather than local files.
