-- Remove only the original setup examples, if they still exist.
-- Accounts referenced by blog posts or sponsorships are preserved.
START TRANSACTION;

DELETE FROM users
WHERE (
  (email = 'admin@kch.org' AND name = 'Admin User' AND role = 'admin')
  OR (email = 'staff@kch.org' AND name = 'Jane Doe' AND role = 'staff')
  OR (email = 'john@example.com' AND name = 'John Mukasa' AND role = 'donor')
  OR (email = 'vol@kch.org' AND name = 'Alice Volunteer' AND role = 'volunteer')
  OR (email = 'engineer@kch.org' AND name = 'System Engineer' AND role = 'engineer')
)
AND NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE blog_posts.author_id = users.id
)
AND NOT EXISTS (
  SELECT 1 FROM sponsorships WHERE sponsorships.sponsor_id = users.id
)
AND NOT EXISTS (
  SELECT 1 FROM children WHERE children.sponsor_id = users.id
);

DELETE FROM namecheap_services
WHERE service_type = 'Domain'
  AND service_name = 'kch.org'
  AND domain_name = 'kch.org'
  AND purchase_date = '2024-01-15'
  AND expiry_date = '2025-01-15'
  AND renewal_date = '2024-12-15'
  AND price = 8.99;

COMMIT;
