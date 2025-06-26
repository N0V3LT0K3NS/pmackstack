-- Migration: Add sample data for Renoja stores
-- This creates realistic sample data for testing and development

-- Insert sample data for the past 12 weeks for all 3 Renoja stores
INSERT INTO renoja_weekly_metrics (
  store_code, fiscal_year, week_number, week_ending,
  digital_posts, new_google_reviews, total_google_reviews, new_partnerships,
  events_in_studio, events_outside_studio,
  new_members_signed, total_paying_members, members_lost, avg_member_rate,
  review_growth_rate, member_retention_rate, notes
)
VALUES
  -- Renoja Downtown - Week 14-25 of 2025
  ('ren001', 2025, 14, '2025-04-06', 5, 3, 127, 1, 2, 1, 12, 245, 3, 89.99, 2.4, 98.8, 'Spring promotion launch'),
  ('ren001', 2025, 15, '2025-04-13', 6, 2, 129, 0, 3, 0, 8, 250, 3, 89.99, 1.6, 98.8, null),
  ('ren001', 2025, 16, '2025-04-20', 4, 4, 133, 2, 2, 2, 15, 262, 3, 89.99, 3.1, 98.9, 'Partnership with local gym'),
  ('ren001', 2025, 17, '2025-04-27', 7, 1, 134, 0, 1, 1, 6, 265, 3, 92.99, 0.8, 98.9, 'Rate increase implemented'),
  ('ren001', 2025, 18, '2025-05-04', 5, 5, 139, 1, 3, 0, 10, 272, 3, 92.99, 3.7, 98.9, 'Mother''s Day special event'),
  ('ren001', 2025, 19, '2025-05-11', 6, 3, 142, 0, 2, 1, 8, 277, 3, 92.99, 2.2, 98.9, null),
  ('ren001', 2025, 20, '2025-05-18', 4, 2, 144, 1, 1, 2, 11, 285, 3, 92.99, 1.4, 98.9, null),
  ('ren001', 2025, 21, '2025-05-25', 8, 4, 148, 0, 4, 0, 14, 296, 3, 92.99, 2.8, 99.0, 'Memorial Day week activities'),
  ('ren001', 2025, 22, '2025-06-01', 5, 2, 150, 2, 2, 1, 9, 302, 3, 92.99, 1.4, 99.0, 'Summer kickoff'),
  ('ren001', 2025, 23, '2025-06-08', 6, 3, 153, 0, 3, 0, 7, 306, 3, 94.99, 2.0, 99.0, 'Premium tier introduced'),
  ('ren001', 2025, 24, '2025-06-15', 5, 1, 154, 1, 2, 2, 12, 315, 3, 94.99, 0.7, 99.0, null),
  ('ren001', 2025, 25, '2025-06-22', 7, 4, 158, 0, 3, 1, 10, 322, 3, 94.99, 2.6, 99.1, 'Current week'),

  -- Renoja North Shore - Week 14-25 of 2025
  ('ren002', 2025, 14, '2025-04-06', 4, 2, 98, 0, 2, 0, 8, 187, 2, 94.99, 2.1, 98.9, null),
  ('ren002', 2025, 15, '2025-04-13', 5, 1, 99, 1, 1, 1, 6, 191, 2, 94.99, 1.0, 99.0, 'New corporate partnership'),
  ('ren002', 2025, 16, '2025-04-20', 3, 3, 102, 0, 2, 0, 10, 199, 2, 94.99, 3.0, 99.0, null),
  ('ren002', 2025, 17, '2025-04-27', 6, 0, 102, 0, 3, 0, 5, 202, 2, 97.99, 0.0, 99.0, 'Rate adjustment'),
  ('ren002', 2025, 18, '2025-05-04', 4, 4, 106, 2, 2, 1, 9, 209, 2, 97.99, 3.9, 99.0, 'Community wellness fair'),
  ('ren002', 2025, 19, '2025-05-11', 5, 2, 108, 0, 1, 0, 7, 214, 2, 97.99, 1.9, 99.1, null),
  ('ren002', 2025, 20, '2025-05-18', 3, 1, 109, 1, 2, 1, 8, 220, 2, 97.99, 0.9, 99.1, null),
  ('ren002', 2025, 21, '2025-05-25', 7, 3, 112, 0, 3, 0, 11, 229, 2, 97.99, 2.8, 99.1, 'Holiday week boost'),
  ('ren002', 2025, 22, '2025-06-01', 4, 2, 114, 0, 2, 0, 6, 233, 2, 97.99, 1.8, 99.1, null),
  ('ren002', 2025, 23, '2025-06-08', 5, 1, 115, 1, 1, 1, 5, 236, 2, 99.99, 0.9, 99.2, 'Premium pricing test'),
  ('ren002', 2025, 24, '2025-06-15', 4, 3, 118, 0, 2, 0, 9, 243, 2, 99.99, 2.6, 99.2, null),
  ('ren002', 2025, 25, '2025-06-22', 6, 2, 120, 0, 3, 0, 7, 248, 2, 99.99, 1.7, 99.2, 'Current week'),

  -- Renoja West Loop - Week 14-25 of 2025
  ('ren003', 2025, 14, '2025-04-06', 6, 4, 156, 2, 3, 2, 18, 312, 5, 84.99, 2.6, 98.4, 'New location grand opening'),
  ('ren003', 2025, 15, '2025-04-13', 7, 3, 159, 1, 4, 1, 14, 321, 5, 84.99, 1.9, 98.4, 'Opening week continues'),
  ('ren003', 2025, 16, '2025-04-20', 5, 5, 164, 3, 3, 2, 22, 338, 5, 84.99, 3.1, 98.5, 'Corporate accounts added'),
  ('ren003', 2025, 17, '2025-04-27', 8, 2, 166, 0, 2, 1, 10, 343, 5, 87.99, 1.2, 98.5, 'Intro pricing ended'),
  ('ren003', 2025, 18, '2025-05-04', 6, 6, 172, 1, 4, 0, 16, 354, 5, 87.99, 3.6, 98.6, 'Mother''s Day campaign'),
  ('ren003', 2025, 19, '2025-05-11', 7, 4, 176, 0, 3, 1, 12, 361, 5, 87.99, 2.3, 98.6, null),
  ('ren003', 2025, 20, '2025-05-18', 5, 3, 179, 2, 2, 2, 14, 370, 5, 87.99, 1.7, 98.6, 'New equipment installed'),
  ('ren003', 2025, 21, '2025-05-25', 9, 5, 184, 0, 5, 0, 20, 385, 5, 87.99, 2.8, 98.7, 'Memorial Day promotions'),
  ('ren003', 2025, 22, '2025-06-01', 6, 3, 187, 1, 3, 1, 11, 391, 5, 87.99, 1.6, 98.7, 'Summer schedule launched'),
  ('ren003', 2025, 23, '2025-06-08', 7, 2, 189, 0, 4, 0, 9, 395, 5, 89.99, 1.1, 98.7, 'Rate increase'),
  ('ren003', 2025, 24, '2025-06-15', 5, 4, 193, 2, 3, 2, 15, 405, 5, 89.99, 2.1, 98.8, 'Father''s Day special'),
  ('ren003', 2025, 25, '2025-06-22', 8, 3, 196, 0, 4, 1, 13, 413, 5, 89.99, 1.6, 98.8, 'Current week')
ON CONFLICT (store_code, fiscal_year, week_number) DO NOTHING; 