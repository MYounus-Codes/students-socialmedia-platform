-- Development seed data for Campusly.
INSERT INTO public.interests (id, name, slug)
VALUES
  (gen_random_uuid(), 'Programming', 'programming'),
  (gen_random_uuid(), 'Artificial Intelligence', 'artificial-intelligence'),
  (gen_random_uuid(), 'Machine Learning', 'machine-learning'),
  (gen_random_uuid(), 'Data Science', 'data-science'),
  (gen_random_uuid(), 'Web Development', 'web-development'),
  (gen_random_uuid(), 'Mobile Development', 'mobile-development'),
  (gen_random_uuid(), 'Cybersecurity', 'cybersecurity'),
  (gen_random_uuid(), 'Robotics', 'robotics'),
  (gen_random_uuid(), 'Mathematics', 'mathematics');

-- Note: application-specific seed users should be created through Supabase Auth in development.
