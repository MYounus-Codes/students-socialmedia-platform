# Database design

## Core entities
- profiles
- interests
- user_interests
- posts
- post_media
- projects
- reactions
- comments
- comment_reactions
- follows
- bookmarks
- hashtags
- post_hashtags
- notifications
- reports
- blocks
- views
- user_preferences

## Database principles
- Use UUIDs for primary keys.
- Use timestamps for created_at and updated_at.
- Add constraints to prevent duplicates and invalid states.
- Add indexes on high-frequency query patterns.
- Use RLS to restrict access.

## Example concerns
- A user can follow another user only once.
- A user can only have one reaction per post.
- Report tables should include reason and moderation status.
- Media metadata is stored in PostgreSQL while binary assets live in object storage.
