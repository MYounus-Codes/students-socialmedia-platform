# Campusly Project Report

**Report date:** 2026-09-09  
**Project:** Campusly student social platform  
**Repository:** `d:\students-partner-platform`  
**Status:** Core social platform slice implemented and production build verified. Authentication/session hardening, security headers, rate limiting, Playwright setup, post detail, and notifications have since been added. Several large product areas remain planned or partial.

## 1. Product Summary

Campusly is a student-focused social platform where users can:

- Create an account with email and password.
- Build a student profile with a unique username.
- Select interests during onboarding.
- Publish text, image, and video posts.
- Follow other students.
- View a feed containing other users' posts.
- Like, dislike, comment on, bookmark, edit, and delete posts.
- View individual student profiles.
- Upload profile pictures and cover images.
- Search and discover other students.
- View followers and following lists.

The application uses a custom student-community visual direction rather than copying any existing social platform's branding or exact layout.

## 2. Technology Stack

### Frontend

- Next.js 16.3.4
- React 19
- TypeScript with strict checking
- Next.js App Router
- Tailwind CSS 4
- Lucide React icons
- Radix UI Slot
- Class Variance Authority
- `clsx` and `tailwind-merge`

### Backend and platform services

- Next.js Route Handlers
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Row Level Security
- Zod validation

### Testing and quality

- Vitest
- Testing Library dependencies
- ESLint
- TypeScript compiler
- Production Next.js build

### Deployment target

- Vercel for the Next.js application
- Supabase for Auth, Postgres, and Storage

## 3. Current Frontend Routes

### Public and authentication routes

- `/` - Campusly landing page.
- `/login` - Email/password login form.
- `/signup` - Signup form with full name, email, and password.

### Onboarding routes

- `/interests` - Supabase-backed interest selector that saves normalized user interests and completes onboarding.

### Authenticated platform routes

- `/home` - Authenticated social feed and post composer.
- `/explore` - Student search and deterministic recommendations.
- `/settings` - Profile settings, avatar upload, and cover upload.
- `/notifications` - Notification list, unread state, mark read, and mark all read.
- `/post/[id]` - Shareable post detail page with copy-link action.
- `/u/[username]` - Individual student profile pages.

### API routes

- `POST /api/auth/signup` - Validates signup input, creates Supabase Auth user, and provisions a profile.
- `POST /api/auth/login` - Validates credentials and authenticates through Supabase Auth.
- `POST /api/media/upload` - Validates upload metadata and allowed MIME types.

## 3.1 Recent Roadmap Implementation

The following `next-steps.md` work is now implemented:

- Supabase SSR cookie client in `src/lib/supabase/server.ts`.
- Next.js 16 `proxy.ts` route protection for protected routes.
- Redirect of authenticated users away from login/signup/reset pages.
- Safe post-login return path handling.
- Password reset and reset-password screens.
- Security headers and CSP in `next.config.ts`.
- Zod profile URL/content validation.
- Upstash-compatible distributed rate-limit abstraction.
- Development-only rate-limit fallback; production fails closed without Upstash configuration.
- Rate limiting on signup, login, and media API requests.
- Playwright configuration and protected-route E2E specs.
- Shareable `/post/[id]` detail page.
- Copy post link action.
- Notification creation for follows, likes, dislikes, comments, and replies.
- Notification list, unread styling, mark read, and mark all read.
- Notification RLS write policy in migration `007_notifications_write_policy.sql`.
- Profile block/unblock and report operations.
- Feed-level blocked-user filtering and database-level blocked follow/post visibility enforcement.

Playwright browser execution is configured but the local Chromium download could not complete because the Playwright CDN request timed out in this environment. The E2E specs are not reported as passed until the browser is installed and executed.

## 4. Implemented Frontend Features

### Landing and design system

- Campusly brand identity and metadata.
- Responsive landing page.
- Shared Button component with variants and sizes.
- Shared Back button using browser history.
- Responsive layouts for desktop and mobile widths.
- Focus-visible states on interactive controls.
- Semantic labels on forms and icon-only buttons.

### Authentication UI

- Signup form with validation feedback.
- Login form with validation feedback.
- Loading states during authentication requests.
- Duplicate email and email-confirmation error handling.
- Supabase session establishment in the browser after successful authentication.

### Onboarding

- Interest catalog loaded from Supabase.
- Multi-select interest interface.
- Selected state and accessible `aria-pressed` behavior.
- Normalized `user_interests` persistence.
- Profile onboarding completion flag.
- Redirect to `/home` after completion.

### Home feed

- Feed loads posts from other users.
- The signed-in user's own posts are intentionally excluded from the home feed.
- Own posts remain visible on the user's profile.
- Feed includes author name, username, avatar, post type, title, caption, date, media, and interaction counts.
- Empty feed state.
- Loading state.
- Error state.
- Sidebar navigation to Home, Explore, Profile, and Settings.
- Logout action.

### Post composer

Users can create posts with:

- Caption/text.
- Optional title.
- Post type selection:
  - Normal
  - Project
  - Idea
  - Problem
  - Question
  - Resource
  - Announcement
- Multiple images.
- Multiple videos.
- Image/video previews.
- Media removal before publishing.
- Image crop action using browser canvas processing.
- Upload progress percentage.
- Maximum 10 attachments per post.

Supported post media:

- JPG
- PNG
- WebP
- MP4
- WebM

### Post cards

- Full-width single image/video display.
- Responsive 16:9 video frame for single videos.
- Two-column gallery for multiple media files.
- Like button.
- Dislike button.
- Reaction switching with one active reaction per user/post.
- Bookmark button.
- Comment count.
- Expandable comment list.
- New comment form.
- Owner-only edit control.
- Owner-only delete control.
- Inline title/content editing.
- Confirmation before deletion.
- Media cleanup when deleting a post.

### Profiles

Profile pages include:

- Cover/banner image.
- Profile image.
- Full name.
- Unique username.
- Bio.
- Institution.
- Major or field.
- Location.
- Website.
- GitHub.
- LinkedIn.
- Joined date.
- Post count.
- Project count.
- Follower count.
- Following count.
- Follow/unfollow control.
- Edit profile control for the profile owner.
- Followers list.
- Following list.
- Posts tab.
- Projects tab.
- Ideas tab.
- Problems tab.
- Saved tab.
- Profile post media rendering.

### Profile settings

- Edit full name.
- Edit bio.
- Edit institution.
- Edit education level.
- Edit major.
- Edit location.
- Edit website.
- Edit GitHub URL.
- Edit LinkedIn URL.
- Upload profile image.
- Upload cover/banner image.
- Upload validation for MIME type and size.
- Success and failure messages.

### Explore

- Search students by name, username, major, or institution.
- Student cards linking to profile pages.
- Empty search state.
- Basic deterministic recommendation panel.

## 5. Backend and Service Layer

### Supabase clients

- Browser Supabase client for authenticated client-side operations.
- Public server client for server-side Auth operations using the anon key.
- Admin client for server-only profile provisioning using the service-role key.
- Service-role key is never intended for browser exposure.

### Platform data services

`src/lib/platform/data.ts` currently provides:

- Current profile retrieval.
- Interest retrieval.
- Interest persistence.
- Post creation.
- Post creation with media.
- Feed loading.
- Reaction persistence.
- Bookmark toggling.
- Comment creation.
- Comment retrieval.
- Profile updates.
- Post editing.
- Owner-scoped post deletion.
- Linked media cleanup during post deletion.

`src/lib/platform/profile-data.ts` currently provides:

- Profile page loading.
- Profile tab filtering.
- Saved post loading.
- Profile statistics.
- Follow state lookup.
- Follow/unfollow operations.
- Followers lookup.
- Following lookup.

### Authentication behavior

Signup flow:

1. Validate full name, email, and password with Zod.
2. Create a Supabase Auth account.
3. Generate a readable unique handle based on the full name and Auth user ID.
4. Upsert the profile row.
5. Return the session or email-confirmation state.
6. Roll back the Auth user if profile provisioning fails.

Profile provisioning is also protected by a Supabase Auth trigger and a backfill migration for older users.

## 6. Database Schema

The initial schema is in:

`supabase/migrations/001_initial_schema.sql`

Core tables:

- `profiles`
- `interests`
- `user_interests`
- `posts`
- `media`
- `post_media`
- `projects`
- `reactions`
- `comments`
- `comment_reactions`
- `follows`
- `bookmarks`
- `hashtags`
- `post_hashtags`
- `notifications`
- `reports`
- `blocks`
- `views`
- `user_preferences`

Database protections include:

- UUID primary keys.
- Foreign keys with cascade behavior where appropriate.
- Unique usernames.
- Unique user/interest pairs.
- Unique user/post reactions.
- Unique user/post bookmarks.
- Unique follow pairs.
- Self-follow prevention.
- Reaction type constraints.
- Visibility constraints.
- Post type constraints.
- Report reason/status constraints.
- Created and updated timestamps.
- Indexes for post, profile, follow, reaction, comment, media, and notification access patterns.

## 7. Database Migration History

### `001_initial_schema.sql`

Creates the main relational schema, indexes, RLS enablement, and initial policies.

### `002_social_read_policies.sql`

Updates post visibility policies and adds authenticated read policies for social relationships and interactions.

### `003_interaction_read_policies.sql`

Ensures authenticated users can read reaction/comment rows needed to calculate feed counts.

### `004_guarantee_profiles.sql`

Creates an Auth user profile trigger and backfills existing Auth users without profiles. Generates a unique `student-<id>` fallback handle.

### `005_profile_media_storage.sql`

Creates `avatars` and `covers` storage buckets with MIME, size, and per-user folder policies.

### `006_post_media_storage.sql`

Creates the `post-media` bucket and storage policies for post image/video uploads. Adds read and owner-scoped write policies for media metadata and post-media links.

### `007_notifications_write_policy.sql`

Allows authenticated users to create notifications only when they are the actor and the recipient is a different user.

### `008_blocking_enforcement.sql`

Enforces blocked-user restrictions for follows and post visibility at the RLS boundary.

## 8. Storage Architecture

Profile media:

- Bucket: `avatars`
- Bucket: `covers`
- Public read access.
- Authenticated user uploads limited to a folder beginning with their own user ID.
- JPG, PNG, and WebP only.
- Maximum 5MB per profile image.

Post media:

- Bucket: `post-media`
- Public read access for the current V1 public-post model.
- Authenticated upload limited to the user's folder.
- JPG, PNG, WebP, MP4, and WebM.
- Maximum 100MB configured for the bucket.
- Database stores metadata and storage references rather than binary files.

The storage layer is intended to remain replaceable with S3, R2, Mux, or another object-storage provider later.

## 9. Authorization and Security

Current security measures:

- Supabase Auth handles account identity and password authentication.
- Email uniqueness is enforced by Supabase Auth.
- Service-role key is used only in server-side modules.
- Server-side Zod validation exists for Auth and upload metadata.
- RLS is enabled on core application tables.
- Profile updates are scoped to the authenticated user.
- Post edit/delete operations include the author ID condition.
- Reaction and bookmark writes are user-scoped.
- Follow writes are user-scoped and self-follow is blocked by a database check constraint.
- Storage upload paths are scoped to the authenticated user ID.
- File MIME type and size validation exists for profile and post media.
- Post media cleanup is attempted when an owned post is deleted.

Security areas still needing hardening:

- Add a complete middleware-based protected-route/session refresh strategy.
- Add rate limiting to the actual Auth, post, comment, reaction, follow, search, and upload endpoints.
- Add stronger URL validation and content sanitization.
- Add moderation enforcement for blocked users across every read/write path.
- Review public bucket strategy before production if private visibility is required.
- Add automated RLS integration tests against a real Supabase project.
- Add security headers and a production Content Security Policy.

## 10. Testing Status

Current test files:

- `src/lib/validations/auth.test.ts`
- `src/lib/recommendations/scoring.test.ts`
- `src/lib/auth/username.test.ts`
- `src/lib/platform/counts.test.ts`

Current verified behaviors:

- Valid Auth signup input.
- Invalid login email rejection.
- Recommendation score ordering.
- Recommendation ranking.
- Unique username generation.
- Username fallback generation.
- Like/dislike/comment count calculation.
- Empty interaction state.

Latest verification commands:

```powershell
npm run lint
npm test
npx tsc --noEmit
npm run build
```

Latest observed status:

- ESLint: passes with two non-blocking native-preview `<img>` warnings.
- Vitest: 4 test files, 8 tests passed.
- TypeScript: passes.
- Next production build: passes.

Testing gaps:

- No Playwright end-to-end suite yet.
- No React Testing Library component tests yet.
- No real Supabase integration test suite yet.
- No automated Auth/signup duplicate-email browser flow test.
- No automated media upload test against Storage.
- No automated authorization/RLS test matrix.

## 11. Known Limitations and Partial Features

The following areas exist as architecture or schema foundations but are not complete product features yet:

- Notifications UI and notification generation.
- Supabase Realtime integration.
- Dedicated Projects management experience.
- Dedicated Problems/Questions experience.
- Hashtag creation, parsing, and tag pages.
- Full-text search across users, posts, projects, topics, and hashtags.
- Following-based feed ranking.
- Trending feed.
- Latest feed.
- Cursor pagination and infinite scrolling.
- Complete recommendation scoring from real user interaction history.
- Blocking behavior across all content and interactions.
- Reporting submission UI.
- Moderator/admin dashboard.
- Admin role management UI.
- Account/password reset UI.
- Email verification UI.
- Notification preferences UI.
- Dark mode persistence and full theme controls.
- Draft posts.
- Share links and share analytics.
- Media dimensions, duration extraction, and video processing.
- Comment reactions and full reply composer UI.
- Post detail page.
- Mobile bottom navigation.
- Complete SEO metadata, sitemap, and robots configuration.
- CI/CD workflow.

## 12. Current User Flows

### Signup

1. Visit `/signup`.
2. Enter full name, email, and password.
3. Auth account and profile are created.
4. If email confirmation is enabled, verify email.
5. Select interests at `/interests`.
6. Continue to `/home`.

### Create a post

1. Sign in.
2. Open `/home`.
3. Enter a title and caption/text, or attach media.
4. Select a post type.
5. Add images/videos.
6. Crop selected images if desired.
7. Publish and wait for upload progress to finish.

### Edit/delete a post

1. Open a post authored by the current user.
2. Use the pencil icon to edit title/content.
3. Use the trash icon to delete.
4. Confirm deletion.
5. Linked media is cleaned up where permissions allow.

### Profile

1. Open `/u/[username]`.
2. Review profile information and statistics.
3. Open followers/following lists.
4. Follow another user or unfollow them.
5. Browse Posts, Projects, Ideas, Problems, or Saved tabs.
6. Use Settings to edit profile details and upload media.

## 13. Local Development

Required environment file:

`.env.local`

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`

Commands:

```powershell
npm install
npm run dev
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The application runs on:

`http://localhost:3000`

## 14. Supabase Setup Checklist

For an existing Supabase project, run migrations in this order:

1. `001_initial_schema.sql`
2. `002_social_read_policies.sql`
3. `003_interaction_read_policies.sql`
4. `004_guarantee_profiles.sql`
5. `005_profile_media_storage.sql`
6. `006_post_media_storage.sql`
7. `007_notifications_write_policy.sql`
8. `008_blocking_enforcement.sql`
9. `supabase/seed.sql`

If `001_initial_schema.sql` was already run, apply only the newer migrations that have not yet been applied.

Also configure Supabase Auth URL settings:

- Local Site URL: `http://localhost:3000`
- Local redirect: `http://localhost:3000/**`
- Production values should use the deployed Vercel URL.

## 15. Recommended Next Improvements

### Priority 1: production correctness

1. Add Supabase session middleware and protected route redirects.
2. Add Playwright coverage for signup, onboarding, post creation, media upload, reactions, comments, follow, and profile editing.
3. Add real RLS integration tests.
4. Add server-side rate limiting using Upstash Redis.
5. Add robust error logging and observability.

### Priority 2: social completeness

1. Add notifications for likes, comments, follows, mentions, and replies.
2. Add comment replies and comment reactions.
3. Add block/report UI and server-side enforcement.
4. Add dedicated Projects and Problems pages.
5. Add post detail route and share links.

### Priority 3: discovery and scale

1. Add cursor pagination.
2. Add following/trending/latest feed modes.
3. Improve recommendation scoring using real interests and interactions.
4. Add PostgreSQL full-text search.
5. Add caching for public discovery data.
6. Add media optimization and CDN/video processing.

### Priority 4: polish and deployment

1. Add mobile bottom navigation.
2. Add dark mode persistence.
3. Add SEO metadata, sitemap, and robots rules.
4. Add GitHub Actions for lint, tests, typecheck, and build.
5. Replace preview `<img>` warnings with deliberate optimized media components.

## 16. Files to Review First for Future Improvements

Frontend:

- `src/components/feed/home-feed.tsx`
- `src/components/feed/post-composer.tsx`
- `src/components/feed/post-card.tsx`
- `src/components/profile/profile-view.tsx`
- `src/components/profile/profile-settings.tsx`
- `src/components/explore/explore-page.tsx`

Data and business logic:

- `src/lib/platform/data.ts`
- `src/lib/platform/profile-data.ts`
- `src/lib/platform/media.ts`
- `src/lib/recommendations/`
- `src/lib/storage/`

Backend and database:

- `src/app/api/auth/`
- `src/app/api/media/`
- `supabase/migrations/`
- `supabase/seed.sql`

Documentation:

- `docs/architecture.md`
- `docs/database.md`
- `docs/security.md`
- `docs/deployment.md`
- `docs/testing.md`

## 17. Overall Assessment

Campusly has a working foundation and a usable core social loop:

- Authentication works.
- Profiles work.
- Onboarding interests work.
- Posts work.
- Images and videos can be attached to posts.
- Media is visible in the home feed and profile pages.
- Users can interact with posts.
- Users can follow each other.
- Users can inspect followers and following.
- Users can edit and delete their own posts.
- Profile media uploads work through Supabase Storage.
- The project passes lint, tests, TypeScript, and production build verification.

The next development focus should be production hardening and social completeness rather than rebuilding the existing core. The highest-value next step is a full end-to-end test suite combined with protected-route/session middleware and notification infrastructure.
