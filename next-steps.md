You are continuing development of the existing Campusly student social platform.

IMPORTANT:

Do NOT rebuild the application.

Do NOT replace working functionality.

Do NOT start from scratch.

The existing project already has a working core social platform including:

* Next.js 16
* React 19
* TypeScript
* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage
* RLS
* User profiles
* Interest onboarding
* Posts
* Images/videos
* Likes/dislikes
* Comments
* Bookmarks
* Follow/unfollow
* Profile pages
* Basic Explore
* Basic recommendation scoring

The current project also passes:

* ESLint
* Vitest
* TypeScript
* Production build

Your job is to continue from the CURRENT CODEBASE and improve it toward a production-quality scalable student social platform.

==================================================
FIRST: INSPECT THE CURRENT PROJECT
==================================

Before changing anything:

1. Inspect the entire existing project structure.
2. Read the current README.
3. Read the existing documentation.
4. Inspect:

   * src/app
   * src/components
   * src/lib
   * supabase/migrations
   * tests
5. Inspect the current database schema and RLS policies.
6. Inspect authentication/session handling.
7. Inspect existing feed implementation.
8. Inspect existing recommendation implementation.
9. Inspect existing storage implementation.
10. Run:

npm run lint
npm test
npx tsc --noEmit
npm run build

Do not assume the report is still 100% accurate.

Verify the actual current codebase first.

==================================================
RULE #1 — PROTECT EXISTING FUNCTIONALITY
========================================

Before implementing new features:

Understand how the existing functionality works.

Do not rewrite working systems unnecessarily.

If something is already implemented correctly, reuse it.

Only refactor when there is a clear architectural or scalability benefit.

After each major change:

* Run TypeScript
* Run lint
* Run tests
* Fix errors
* Verify existing functionality

==================================================
PHASE 1 — AUTHENTICATION & SESSION HARDENING
============================================

This is the first priority.

Implement a robust Supabase authentication/session architecture for Next.js App Router.

Add proper middleware/session refresh handling.

Protect authenticated routes such as:

/home
/explore
/settings
/interests
/create
/notifications
/bookmarks

Prevent unauthenticated users from accessing protected pages.

Prevent authenticated users from incorrectly seeing login/signup pages.

Handle:

* Expired sessions
* Refreshing sessions
* Logout
* Email verification state
* Password reset flow

Do not expose sensitive Supabase service-role credentials.

Verify server/client Supabase boundaries.

==================================================
PHASE 2 — SECURITY HARDENING
============================

Perform a security audit of the existing code.

Check for:

* Broken access control
* IDOR
* Unsafe database queries
* Missing server-side validation
* Unsafe URL handling
* XSS
* Unsafe HTML rendering
* File upload abuse
* Unauthorized profile editing
* Unauthorized post editing/deletion
* Unauthorized reactions
* Unauthorized comments
* Unauthorized follows
* Unauthorized bookmarks
* RLS bypasses
* Service-role misuse

Implement:

1. Strong URL validation
2. Content sanitization where required
3. Security headers
4. Content Security Policy
5. Proper authorization helpers
6. Consistent API validation

Do not blindly add a CSP that breaks the application.

Test the final headers against the actual application.

==================================================
PHASE 3 — RATE LIMITING
=======================

Add production-ready rate limiting architecture.

Prefer Upstash Redis for production.

Protect:

* Signup
* Login
* Password reset
* Post creation
* Comment creation
* Reactions
* Follow/unfollow
* Search
* Upload initialization
* Reports

Do not use an in-memory production rate limiter.

Create a clean abstraction so the rate limiter can be changed later.

Document required environment variables.

Update:

.env.example

==================================================
PHASE 4 — TESTING FOUNDATION
============================

The current unit tests are not enough for a social platform.

Add Playwright E2E testing.

Create:

tests/
├── e2e/
├── integration/
└── unit/

Create E2E flows for:

1. Signup
2. Duplicate email
3. Login
4. Logout
5. Onboarding
6. Interest selection
7. Profile editing
8. Avatar upload
9. Post creation
10. Image upload
11. Video upload
12. Like
13. Dislike
14. Switching reaction
15. Comment
16. Follow
17. Unfollow
18. Bookmark
19. Search
20. Protected routes

Do not write fake tests that only test mocked success.

Where practical, test against a dedicated test Supabase environment.

==================================================
PHASE 5 — DATABASE / RLS TESTING
================================

Create a real authorization test matrix.

Verify that:

User A cannot:

* Edit User B's profile
* Delete User B's post
* Modify User B's comment
* Create reactions on behalf of User B
* Create bookmarks on behalf of User B
* Modify User B's follow relationships
* Access private content they shouldn't see

Verify owner permissions.

Verify public read permissions.

Verify authenticated read permissions.

Verify blocked-user restrictions when implemented.

==================================================
PHASE 6 — REFACTOR DATA LAYER
=============================

Inspect:

src/lib/platform/data.ts

If it has become too large or mixes unrelated responsibilities, gradually split it into domain-specific modules.

Preferred architecture:

src/lib/
├── auth/
├── users/
├── posts/
├── comments/
├── reactions/
├── follows/
├── bookmarks/
├── feed/
├── recommendations/
├── notifications/
├── search/
├── media/
├── moderation/
├── storage/
└── utils/

Do not perform a massive rewrite.

Move functionality incrementally.

Keep public interfaces stable where possible.

==================================================
PHASE 7 — POST DETAIL PAGE
==========================

Implement:

/post/[id]

The page should display:

* Author
* Profile image
* Post type
* Title
* Content
* Media
* Hashtags
* Like
* Dislike
* Bookmark
* Share
* Comment count
* Comments
* Replies

Make posts directly shareable through URLs.

Add dynamic metadata for public posts where appropriate.

==================================================
PHASE 8 — COMMENTS 2.0
======================

Upgrade comments.

Implement:

* Nested replies
* Reply composer
* Comment reactions
* Delete own comment
* Delete own reply
* Pagination
* Loading states
* Empty states

Avoid loading hundreds of comments at once.

Use pagination/cursor pagination.

==================================================
PHASE 9 — NOTIFICATION SYSTEM
=============================

This is a major missing feature.

Implement notification generation for:

* Follow
* Like
* Dislike
* Comment
* Reply
* Mention
* Bookmark where appropriate

Create:

notifications service
notifications database queries
notification UI

Notification should contain:

* recipient
* actor
* type
* target entity
* read/unread
* created_at

Do not notify a user about their own action.

Implement:

* Notification page
* Unread count
* Mark as read
* Mark all as read
* Appropriate realtime behavior

Use Supabase Realtime only where useful.

==================================================
PHASE 10 — BLOCKING & REPORTING
===============================

Complete the existing database foundations.

Implement UI and backend behavior for:

BLOCK:

* Block user
* Unblock user
* Hide blocked user's content
* Prevent unwanted interactions
* Prevent follow relationships

REPORT:

Users can report:

* Post
* Comment
* User

Reasons:

* Spam
* Harassment
* Inappropriate content
* Abuse
* Misinformation
* Copyright concern
* Other

Enforce blocking server-side.

Do not rely only on frontend filtering.

==================================================
PHASE 11 — FEED ARCHITECTURE
============================

The current feed is only a foundation.

Build:

/home

with a scalable feed architecture.

Create separate feed services:

* personalized
* following
* latest
* trending

Implement cursor pagination.

Do NOT use offset pagination for the main infinite feed if cursor pagination is more appropriate.

The feed should return:

* posts
* author
* media
* interaction counts
* current user's interaction state

Avoid N+1 queries.

Add indexes where required.

==================================================
PHASE 12 — INFINITE SCROLL
==========================

Implement smooth infinite scrolling.

Requirements:

* Cursor pagination
* Loading skeleton
* End-of-feed state
* Retry on failure
* No duplicate posts
* Preserve scroll position where appropriate

Do not fetch the entire database.

==================================================
PHASE 13 — RECOMMENDATION ENGINE
================================

Improve:

src/lib/recommendations/

The recommendation system should use real interaction history.

Candidate signals:

* Selected interests
* Followed users
* Likes
* Dislikes
* Comments
* Saves
* Views
* Post type
* Hashtags
* Recency
* Engagement
* Popularity

Create a configurable scoring model.

Example conceptual score:

interestScore

* relationshipScore
* engagementScore
* freshnessScore
* popularityScore
* interactionSimilarityScore

Use reasonable normalization.

Avoid allowing extremely popular posts to dominate everything.

Avoid repeatedly showing the same posts.

Create diversity rules.

Keep recommendation logic independent from React components.

Do NOT implement machine learning yet.

Build a strong deterministic recommendation engine first.

==================================================
PHASE 14 — FOLLOWING / TRENDING / LATEST
========================================

Add feed filters/tabs:

For You
Following
Latest
Trending

For You:

Personalized recommendations.

Following:

Posts from followed users.

Latest:

Chronological recent posts.

Trending:

Recent engagement + velocity + freshness.

Do not calculate trending only from lifetime likes.

==================================================
PHASE 15 — SEARCH
=================

Implement proper PostgreSQL full-text search.

Search:

* Users
* Posts
* Projects
* Problems
* Hashtags
* Topics

Use appropriate PostgreSQL indexes.

Avoid naive:

ILIKE '%query%'

for every field if it becomes inefficient.

Create a search abstraction:

src/lib/search/

Design it so a future search engine such as Meilisearch/Typesense/OpenSearch can replace PostgreSQL search.

==================================================
PHASE 16 — HASHTAGS
===================

Implement:

* Hashtag extraction
* Hashtag normalization
* Hashtag persistence
* Post hashtag relationships
* Hashtag pages

Route:

/explore/tag/[tag]

Display:

* Recent posts
* Popular posts
* Projects
* Ideas
* Problems

==================================================
PHASE 17 — STUDENT-SPECIFIC FEATURES
====================================

Make Campusly meaningfully different from a generic social network.

Build dedicated areas for:

PROJECTS
PROBLEMS
IDEAS

Projects should support:

* Project title
* Description
* Technologies
* GitHub
* Live demo
* Team members
* Images/videos
* Category

Problems should support:

* Problem title
* Description
* Tags
* Status
* Comments
* Solutions
* Future accepted solution support

Ideas should support:

* Idea title
* Description
* Category
* Feedback
* Reactions
* Comments

Create dedicated discovery pages where useful.

==================================================
PHASE 18 — SHARING
==================

Implement proper sharing.

Users should be able to:

* Copy post link
* Share internally where appropriate
* Use Web Share API on supported devices
* Share public URLs

Track share events if analytics infrastructure supports it.

==================================================
PHASE 19 — MOBILE EXPERIENCE
============================

The application must feel like a real mobile social platform.

Add:

Mobile bottom navigation:

Home
Explore
Create
Notifications
Profile

Ensure:

* Touch-friendly controls
* Responsive feed
* Responsive post composer
* Mobile profile
* Mobile comments
* Mobile search
* Mobile notifications

Do not simply shrink desktop components.

==================================================
PHASE 20 — DARK MODE
====================

Implement proper theme support.

Add:

* Light
* Dark
* System

Persist the user's preference.

Avoid flash of incorrect theme where possible.

==================================================
PHASE 21 — SEO
==============

Implement:

* Dynamic metadata
* Open Graph metadata
* Sitemap
* robots.txt
* Canonical URLs where appropriate

Do not expose private user information.

Optimize public profiles/posts for search engines where appropriate.

==================================================
PHASE 22 — OBSERVABILITY
========================

Create a production-friendly error logging strategy.

Do not expose sensitive information.

Structure the application so a service such as Sentry can be added easily.

Add useful server-side logging for:

* Authentication failures
* Upload failures
* API errors
* Database failures
* Unexpected exceptions

Never log:

* passwords
* access tokens
* service-role keys
* sensitive user data

==================================================
PHASE 23 — CI/CD
================

Create GitHub Actions.

On pull request:

* Install dependencies
* Lint
* Typecheck
* Unit tests
* Build

On main branch:

* Run validation
* Prepare deployment

Do not create unnecessary deployment complexity.

==================================================
PHASE 24 — PERFORMANCE AUDIT
============================

Inspect:

* Database queries
* React rendering
* Server/client component boundaries
* Image loading
* Video loading
* Feed pagination
* Search
* Bundle size

Fix:

* N+1 queries
* Duplicate requests
* Unnecessary client components
* Excessive data fetching
* Unnecessary re-renders

Use Next.js image optimization where appropriate.

Replace unnecessary raw `<img>` usage with deliberate image handling.

==================================================
PHASE 25 — FINAL SECURITY REVIEW
================================

Before declaring completion:

Audit every API route.

For every mutation ask:

1. Is the user authenticated?
2. Is the user authorized?
3. Is input validated?
4. Is RLS protecting the database?
5. Can another user manipulate the target ID?
6. Can this endpoint be abused?
7. Is rate limiting required?
8. Could this expose private information?

Fix anything discovered.

==================================================
PHASE 26 — FINAL VALIDATION
===========================

Run:

npm run lint
npm test
npx tsc --noEmit
npm run build

Run Playwright tests.

Verify the database/RLS test suite.

Verify all critical user flows.

Do not declare success if critical tests fail.

==================================================
IMPORTANT DEVELOPMENT RULE
==========================

Work incrementally.

For every phase:

1. Inspect.
2. Implement.
3. Test.
4. Fix.
5. Refactor if necessary.
6. Move to the next phase.

Do not make a giant rewrite.

Do not delete working features just to simplify implementation.

Do not use placeholder functionality where real functionality is expected.

Do not fake database responses.

Do not fake authentication.

Do not use hardcoded production data.

==================================================
START NOW
=========

Start by auditing the CURRENT CODEBASE.

Do not start coding immediately.

First provide:

1. Current architecture assessment
2. Critical issues discovered
3. Recommended implementation order
4. Files that need modification
5. New files that need creation
6. Database migrations required
7. Security risks discovered
8. Testing gaps

Then begin with PHASE 1 — Authentication & Session Hardening.

After Phase 1 is implemented and verified, continue to Phase 2.

Keep the existing working Campusly functionality intact.
