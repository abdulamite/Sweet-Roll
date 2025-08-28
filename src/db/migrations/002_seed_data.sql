-- Migration: 002_seed_data.sql
-- Description: Insert initial seed data for testing and development
-- Created: 2025-08-27

-- Insert sample schools
INSERT INTO schools (name, domain, phone, website, support_email, onboarding_status) VALUES 
('Demo Elementary School', 'demo-elementary.edu', '(555) 123-4567', 'https://demo-elementary.edu', 'support@demo-elementary.edu', 'completed'),
('Test High School', 'test-high.edu', '(555) 987-6543', 'https://test-high.edu', 'support@test-high.edu', 'completed')
ON CONFLICT (domain) DO NOTHING;

-- Insert school addresses
INSERT INTO school_address (school_id, street, city, state, zip_code) VALUES 
(
    (SELECT id FROM schools WHERE domain = 'demo-elementary.edu'),
    '123 Education Street',
    'Demo City',
    'CA',
    '90210'
),
(
    (SELECT id FROM schools WHERE domain = 'test-high.edu'),
    '456 Learning Avenue',
    'Test Town',
    'NY',
    '10001'
)
ON CONFLICT DO NOTHING;

-- Insert school owners
INSERT INTO school_owner (school_id, name, email, phone) VALUES 
(
    (SELECT id FROM schools WHERE domain = 'demo-elementary.edu'),
    'Dr. Sarah Johnson',
    'sarah.johnson@demo-elementary.edu',
    '(555) 123-4567'
),
(
    (SELECT id FROM schools WHERE domain = 'test-high.edu'),
    'Mr. Michael Chen',
    'michael.chen@test-high.edu',
    '(555) 987-6543'
)
ON CONFLICT DO NOTHING;

-- Insert sample users (without passwords - they'll be in separate table)
INSERT INTO users (email, name) VALUES 
('admin@demo-elementary.edu', 'School Administrator'),
('teacher@demo-elementary.edu', 'Jane Teacher'),
('principal@test-high.edu', 'John Principal')
ON CONFLICT (email) DO NOTHING;

-- Insert passwords in separate table (passwords should be hashed in real implementation)
INSERT INTO user_passwords (user_id, hashed_password) VALUES 
(
    (SELECT id FROM users WHERE email = 'admin@demo-elementary.edu'),
    '$2b$10$example.hash.for.admin'
),
(
    (SELECT id FROM users WHERE email = 'teacher@demo-elementary.edu'),
    '$2b$10$example.hash.for.teacher'
),
(
    (SELECT id FROM users WHERE email = 'principal@test-high.edu'),
    '$2b$10$example.hash.for.principal'
)
ON CONFLICT DO NOTHING;

-- Link users to schools with roles
INSERT INTO user_schools (user_id, school_id, role, permissions) VALUES 
(
    (SELECT id FROM users WHERE email = 'admin@demo-elementary.edu'),
    (SELECT id FROM schools WHERE domain = 'demo-elementary.edu'),
    'admin',
    '["upload_logo", "manage_users", "view_reports", "manage_school"]'::jsonb
),
(
    (SELECT id FROM users WHERE email = 'teacher@demo-elementary.edu'),
    (SELECT id FROM schools WHERE domain = 'demo-elementary.edu'),
    'teacher',
    '["view_students", "manage_grades"]'::jsonb
),
(
    (SELECT id FROM users WHERE email = 'principal@test-high.edu'),
    (SELECT id FROM schools WHERE domain = 'test-high.edu'),
    'principal',
    '["upload_logo", "manage_users", "view_reports", "manage_school", "manage_teachers"]'::jsonb
)
ON CONFLICT (user_id, school_id) DO NOTHING;
