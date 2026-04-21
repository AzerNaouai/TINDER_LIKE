-- Seed data for testing

-- Insert test users
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'alex@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alex', 'Johnson', 'jobseeker'),
('22222222-2222-2222-2222-222222222222', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Williams', 'company_admin'),
('33333333-3333-3333-3333-333333333333', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Brown', 'recruiter')
ON CONFLICT (email) DO NOTHING;

-- Insert test companies
INSERT INTO companies (id, name, description, industry, company_size, location, country) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TechCorp Inc.', 'Leading technology company', 'Technology', 'enterprise', 'San Francisco', 'USA'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'StartupXYZ', 'Fast-growing fintech startup', 'Finance', 'startup', 'Austin', 'USA'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HealthTech Solutions', 'Healthcare technology company', 'Healthcare', 'sme', 'Boston', 'USA')
ON CONFLICT (id) DO NOTHING;

-- Insert test jobs
INSERT INTO jobs (id, company_id, title, description, requirements, responsibilities, city, country, remote, job_type, experience_level, salary_min, salary_max, skills, industry, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Senior Full Stack Developer', 'We are looking for an experienced Full Stack Developer', ARRAY['5+ years experience', 'React expertise', 'Node.js proficiency'], ARRAY['Design scalable applications', 'Mentor junior developers'], 'San Francisco', 'USA', true, 'full-time', 'senior', 130000, 180000, ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 'Technology', 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Frontend Engineer', 'Join our innovative fintech startup', ARRAY['3+ years frontend experience', 'React expert'], ARRAY['Build responsive UIs', 'Optimize performance'], 'Remote', 'USA', true, 'full-time', 'mid', 100000, 140000, ARRAY['React', 'TypeScript', 'Tailwind CSS'], 'Finance', 'active'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Backend Developer - Python', 'Build robust backend systems', ARRAY['4+ years Python experience', 'Django or FastAPI'], ARRAY['Design RESTful APIs', 'Ensure data security'], 'Boston', 'USA', false, 'full-time', 'mid', 110000, 150000, ARRAY['Python', 'Django', 'PostgreSQL'], 'Healthcare', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert test profiles
INSERT INTO profiles (user_id, headline, summary, city, country, remote, salary_min, salary_max) VALUES
('11111111-1111-1111-1111-111111111111', 'Senior Full Stack Developer', 'Passionate developer with 6+ years experience', 'San Francisco', 'USA', true, 120000, 160000)
ON CONFLICT (user_id) DO NOTHING;
