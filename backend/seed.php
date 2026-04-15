<?php

/**
 * Database Seeding Script - Populates battal_db with demo accounts
 * 
 * Usage: php seed.php
 * 
 * Creates 3 demo accounts:
 * - alex@example.com (Job Seeker)
 * - sarah@example.com (Company Admin)
 * - mike@example.com (Recruiter)
 */

require_once __DIR__ . '/src/Database.php';

// Load BaseModel first
require_once __DIR__ . '/src/Models/BaseModel.php';

// Then load other models
require_once __DIR__ . '/src/Models/User.php';
require_once __DIR__ . '/src/Models/Profile.php';
require_once __DIR__ . '/src/Models/Company.php';
require_once __DIR__ . '/src/Models/Skill.php';
require_once __DIR__ . '/src/Models/WorkExperience.php';
require_once __DIR__ . '/src/Models/Education.php';
require_once __DIR__ . '/src/Models/Job.php';

use App\Database;
use App\Models\User;
use App\Models\Profile;
use App\Models\Company;
use App\Models\Skill;
use App\Models\WorkExperience;
use App\Models\Education;
use App\Models\Job;

// Suppress PDO warnings
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Color codes for terminal output
const COLOR_RESET = "\033[0m";
const COLOR_GREEN = "\033[32m";
const COLOR_YELLOW = "\033[33m";
const COLOR_RED = "\033[31m";
const COLOR_BLUE = "\033[34m";
const COLOR_CYAN = "\033[36m";

echo COLOR_CYAN . "🌱 Database Seeding Script - Battal Pro Max\n" . COLOR_RESET;
echo str_repeat("=", 50) . "\n\n";

try {
    // Initialize database connection
    $db = new Database();
    $conn = $db->getConnection();
    
    echo COLOR_BLUE . "✓ Connected to battal_db\n" . COLOR_RESET;

    // Demo account data
    $demoAccounts = [
        [
            'email' => 'alex@example.com',
            'password' => 'password',
            'first_name' => 'Alex',
            'last_name' => 'Johnson',
            'role' => 'jobseeker',
            'profile_data' => [
                'bio' => 'Experienced software developer looking for new opportunities',
                'location' => 'San Francisco, CA',
                'preferred_locations' => ['San Francisco', 'Remote'],
                'job_categories' => ['Software Development', 'Tech'],
                'min_salary' => 80000,
                'max_salary' => 150000,
            ]
        ],
        [
            'email' => 'sarah@example.com',
            'password' => 'password',
            'first_name' => 'Sarah',
            'last_name' => 'Chen',
            'role' => 'company_admin',
            'company_data' => [
                'name' => 'TechFlow Inc.',
                'industry' => 'Software Development',
                'company_size' => 'medium',
                'location' => 'San Francisco, CA',
                'website' => 'https://techflow.example.com',
                'description' => 'Leading software development company'
            ]
        ],
        [
            'email' => 'mike@example.com',
            'password' => 'password',
            'first_name' => 'Mike',
            'last_name' => 'Rodriguez',
            'role' => 'recruiter',
            'profile_data' => [
                'bio' => 'Tech recruiter with 5+ years of experience',
                'location' => 'New York, NY',
                'preferred_locations' => ['New York', 'Remote', 'Boston'],
            ]
        ]
    ];

    echo COLOR_YELLOW . "\n📋 Seeding Demo Accounts:\n" . COLOR_RESET;
    echo str_repeat("-", 50) . "\n";

    $user = new User($conn);
    $successCount = 0;
    $existingCount = 0;

    foreach ($demoAccounts as $account) {
        echo "\n📧 Processing: " . $account['email'] . " ({$account['role']})\n";

        // Check if user already exists
        $existingUser = $user->findOneBy('email', $account['email']);
        
        if ($existingUser) {
            echo COLOR_YELLOW . "   ⚠️  Already exists - Skipping\n" . COLOR_RESET;
            $existingCount++;
            continue;
        }

        // Create user
        $userId = $user->create([
            'email' => $account['email'],
            'password' => password_hash($account['password'], PASSWORD_BCRYPT),
            'first_name' => $account['first_name'],
            'last_name' => $account['last_name'],
            'role' => $account['role'],
            'avatar' => getAvatarForRole($account['role']),
            'is_verified' => true,
            'status' => 'active'
        ]);

        if ($userId) {
            echo COLOR_GREEN . "   ✓ User created (ID: $userId)\n" . COLOR_RESET;

            // Create job seekers table entry
            if ($account['role'] === 'jobseeker' && isset($account['profile_data'])) {
                $query = "
                    INSERT INTO job_seekers (
                        user_id, bio, location, preferred_locations, job_categories, 
                        min_salary, max_salary, years_experience, headline
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ";
                $stmt = $conn->prepare($query);
                $stmt->execute([
                    $userId,
                    $account['profile_data']['bio'] ?? null,
                    $account['profile_data']['location'] ?? null,
                    isset($account['profile_data']['preferred_locations']) 
                        ? json_encode($account['profile_data']['preferred_locations'])
                        : null,
                    isset($account['profile_data']['job_categories'])
                        ? json_encode($account['profile_data']['job_categories'])
                        : null,
                    $account['profile_data']['min_salary'] ?? null,
                    $account['profile_data']['max_salary'] ?? null,
                    5,
                    $account['first_name'] . ' - Experienced ' . $account['role']
                ]);
                
                echo COLOR_GREEN . "   ✓ Job Seeker profile created\n" . COLOR_RESET;
                
                // Add skills for job seeker
                seedJobSeekerSkills($conn, $userId);
                
                // Add work experience for job seeker
                seedJobSeekerExperience($conn, $userId);
                
                // Add education for job seeker
                seedJobSeekerEducation($conn, $userId);
            }

            // Create recruiter table entry
            if ($account['role'] === 'recruiter' && isset($account['profile_data'])) {
                $query = "
                    INSERT INTO recruiters (
                        user_id, bio, location, preferred_locations, headline
                    ) VALUES (?, ?, ?, ?, ?)
                ";
                $stmt = $conn->prepare($query);
                $stmt->execute([
                    $userId,
                    $account['profile_data']['bio'] ?? null,
                    $account['profile_data']['location'] ?? null,
                    isset($account['profile_data']['preferred_locations'])
                        ? json_encode($account['profile_data']['preferred_locations'])
                        : null,
                    $account['first_name'] . ' - Professional Recruiter'
                ]);
                
                echo COLOR_GREEN . "   ✓ Recruiter profile created\n" . COLOR_RESET;
            }

            // Create company for company admins
            if ($account['role'] === 'company_admin' && isset($account['company_data'])) {
                $query = "
                    INSERT INTO companies (
                        admin_id, name, industry, company_size, location, 
                        website, description, logo_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ";
                $stmt = $conn->prepare($query);
                $companyId = null;
                
                if ($stmt->execute([
                    $userId,
                    $account['company_data']['name'],
                    $account['company_data']['industry'],
                    $account['company_data']['company_size'],
                    $account['company_data']['location'],
                    $account['company_data']['website'],
                    $account['company_data']['description'],
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($account['company_data']['name'])
                ])) {
                    // Get the company ID that was just created
                    $companyQuery = "SELECT id FROM companies WHERE admin_id = ? LIMIT 1";
                    $companyStmt = $conn->prepare($companyQuery);
                    $companyStmt->execute([$userId]);
                    $companyResult = $companyStmt->fetch(\PDO::FETCH_ASSOC);
                    $companyId = $companyResult['id'] ?? null;
                    
                    if ($companyId) {
                        echo COLOR_GREEN . "   ✓ Company created (ID: $companyId)\n" . COLOR_RESET;
                        
                        // Add sample jobs for company
                        seedCompanyJobs($conn, $companyId);
                    }
                } else {
                    echo COLOR_RED . "   ✗ Failed to create company\n" . COLOR_RESET;
                }
            }

            $successCount++;
        } else {
            echo COLOR_RED . "   ✗ Failed to create user\n" . COLOR_RESET;
        }
    }

    echo "\n" . str_repeat("=", 50) . "\n";
    echo COLOR_GREEN . "✓ Seeding Complete!\n" . COLOR_RESET;
    echo COLOR_CYAN . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Results:\n";
    echo "  ✓ Created: $successCount\n";
    echo "  ⚠️  Already Existed: $existingCount\n";
    echo COLOR_CYAN . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" . COLOR_RESET;

    echo "\n" . COLOR_YELLOW . "🔑 Demo Accounts Ready:\n" . COLOR_RESET;
    echo str_repeat("-", 50) . "\n";
    echo "1️⃣  Job Seeker:\n";
    echo "   Email: " . COLOR_CYAN . "alex@example.com\n" . COLOR_RESET;
    echo "   Password: " . COLOR_CYAN . "password\n" . COLOR_RESET;
    echo "\n2️⃣  Company Admin:\n";
    echo "   Email: " . COLOR_CYAN . "sarah@example.com\n" . COLOR_RESET;
    echo "   Password: " . COLOR_CYAN . "password\n" . COLOR_RESET;
    echo "\n3️⃣  Recruiter:\n";
    echo "   Email: " . COLOR_CYAN . "mike@example.com\n" . COLOR_RESET;
    echo "   Password: " . COLOR_CYAN . "password\n" . COLOR_RESET;
    echo "\n" . str_repeat("=", 50) . "\n";

    echo "\n" . COLOR_GREEN . "✨ Ready to test! Use above credentials in the Sign In page.\n\n" . COLOR_RESET;

} catch (Exception $e) {
    echo COLOR_RED . "❌ Error: " . $e->getMessage() . "\n" . COLOR_RESET;
    exit(1);
}

/**
 * Get avatar URL for a role
 */
function getAvatarForRole($role) {
    $avatars = [
        'jobseeker' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        'company_admin' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        'recruiter' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    ];
    
    return $avatars[$role] ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=User';
}

/**
 * Seed skills for job seeker (Alex)
 */
function seedJobSeekerSkills($conn, $userId) {
    global $COLOR_RESET, $COLOR_GREEN;
    
    $skills = [
        ['name' => 'PHP', 'proficiency' => 90, 'category' => 'Backend'],
        ['name' => 'JavaScript', 'proficiency' => 85, 'category' => 'Frontend'],
        ['name' => 'React', 'proficiency' => 88, 'category' => 'Frontend'],
        ['name' => 'TypeScript', 'proficiency' => 82, 'category' => 'Frontend'],
        ['name' => 'PostgreSQL', 'proficiency' => 80, 'category' => 'Database'],
        ['name' => 'REST APIs', 'proficiency' => 85, 'category' => 'Backend'],
        ['name' => 'Git', 'proficiency' => 90, 'category' => 'Tools'],
        ['name' => 'Docker', 'proficiency' => 75, 'category' => 'DevOps']
    ];
    
    $query = "
        INSERT INTO skills (user_id, name, proficiency, category)
        VALUES (?, ?, ?, ?)
    ";
    
    $skillCount = 0;
    foreach ($skills as $s) {
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$userId, $s['name'], $s['proficiency'], $s['category']])) {
            $skillCount++;
        }
    }
    
    echo COLOR_GREEN . "   ✓ Added {$skillCount} skills\n" . COLOR_RESET;
}

/**
 * Seed work experience for job seeker (Alex)
 */
function seedJobSeekerExperience($conn, $userId) {
    global $COLOR_RESET, $COLOR_GREEN;
    
    $jobs = [
        [
            'title' => 'Senior Developer',
            'company' => 'Tech Solutions Ltd',
            'location' => 'San Francisco, CA',
            'start_date' => '2022-01-15',
            'end_date' => null,
            'currently_working' => true,
            'description' => 'Led development of microservices architecture using PHP and React. Managed team of 5 developers.'
        ],
        [
            'title' => 'Full Stack Developer',
            'company' => 'Digital Innovations Inc',
            'location' => 'San Francisco, CA',
            'start_date' => '2020-06-01',
            'end_date' => '2022-01-14',
            'currently_working' => false,
            'description' => 'Developed web applications using PHP, JavaScript, and PostgreSQL. Improved performance by 40%.'
        ],
        [
            'title' => 'Junior Developer',
            'company' => 'StartUp Ventures',
            'location' => 'San Francisco, CA',
            'start_date' => '2019-03-01',
            'end_date' => '2020-05-31',
            'currently_working' => false,
            'description' => 'Built web features using JavaScript and HTML/CSS. Participated in code reviews and testing.'
        ]
    ];
    
    $query = "
        INSERT INTO work_experience (
            user_id, company, position, location, start_date, end_date, current, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ";
    
    $expCount = 0;
    foreach ($jobs as $j) {
        $stmt = $conn->prepare($query);
        if ($stmt->execute([
            $userId,
            $j['company'],
            $j['title'],
            $j['location'],
            $j['start_date'],
            $j['end_date'],
            $j['currently_working'] ? 1 : 0,
            $j['description']
        ])) {
            $expCount++;
        }
    }
    
    echo COLOR_GREEN . "   ✓ Added {$expCount} work experiences\n" . COLOR_RESET;
}

/**
 * Seed education for job seeker (Alex)
 */
function seedJobSeekerEducation($conn, $userId) {
    global $COLOR_RESET, $COLOR_GREEN;
    
    $schools = [
        [
            'institution' => 'State University',
            'degree' => 'Bachelor of Science',
            'field' => 'Computer Science',
            'start_date' => '2015-09-01',
            'end_date' => '2019-05-31',
            'gpa' => 3.8,
            'description' => 'Specialized in Software Engineering and Web Development'
        ],
        [
            'institution' => 'Tech Training Academy',
            'degree' => 'Certificate',
            'field' => 'Full Stack Web Development',
            'start_date' => '2018-06-01',
            'end_date' => '2018-12-31',
            'gpa' => 4.0,
            'description' => 'Intensive bootcamp covering PHP, JavaScript, React, and PostgreSQL'
        ]
    ];
    
    $query = "
        INSERT INTO education (
            user_id, institution, degree, field_of_study, start_date, end_date, gpa, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ";
    
    $eduCount = 0;
    foreach ($schools as $edu) {
        $stmt = $conn->prepare($query);
        if ($stmt->execute([
            $userId,
            $edu['institution'],
            $edu['degree'],
            $edu['field'],
            $edu['start_date'],
            $edu['end_date'],
            $edu['gpa'],
            $edu['description']
        ])) {
            $eduCount++;
        }
    }
    
    echo COLOR_GREEN . "   ✓ Added {$eduCount} education records\n" . COLOR_RESET;
}

/**
 * Seed jobs for company (TechFlow Inc.)
 */
function seedCompanyJobs($conn, $companyId) {
    global $COLOR_RESET, $COLOR_GREEN;
    
    $jobs = [
        [
            'title' => 'Senior React Developer',
            'description' => 'We are looking for an experienced React developer to lead our frontend team. Must have 5+ years of experience with React and TypeScript.',
            'location' => 'San Francisco, CA',
            'employment_type' => 'Full-time',
            'salary_min' => 120000,
            'salary_max' => 180000,
            'experience_level' => 'Senior',
            'skills' => ['React', 'TypeScript', 'JavaScript']
        ],
        [
            'title' => 'Backend PHP Developer',
            'description' => 'Join our backend team to build scalable APIs using PHP and PostgreSQL. Experience with Docker and microservices is a plus.',
            'location' => 'San Francisco, CA',
            'employment_type' => 'Full-time',
            'salary_min' => 100000,
            'salary_max' => 150000,
            'experience_level' => 'Mid-level',
            'skills' => ['PHP', 'PostgreSQL', 'REST APIs', 'Docker']
        ],
        [
            'title' => 'Full Stack Developer',
            'description' => 'We need a versatile developer who can work on both frontend and backend. Perfect for someone who loves full stack development.',
            'location' => 'Remote',
            'employment_type' => 'Full-time',
            'salary_min' => 90000,
            'salary_max' => 140000,
            'experience_level' => 'Mid-level',
            'skills' => ['JavaScript', 'React', 'PHP', 'PostgreSQL']
        ],
        [
            'title' => 'DevOps Engineer',
            'description' => 'Help us scale our infrastructure. Experience with Docker, Kubernetes, and AWS is essential.',
            'location' => 'San Francisco, CA',
            'employment_type' => 'Full-time',
            'salary_min' => 110000,
            'salary_max' => 160000,
            'experience_level' => 'Mid-level',
            'skills' => ['Docker', 'Kubernetes', 'AWS', 'Linux']
        ],
        [
            'title' => 'Junior Developer (Internship)',
            'description' => 'Perfect entry-level position for recent graduates. We will mentor you and help you grow as a developer.',
            'location' => 'San Francisco, CA',
            'employment_type' => 'Internship',
            'salary_min' => 25000,
            'salary_max' => 40000,
            'experience_level' => 'Junior',
            'skills' => ['JavaScript', 'React', 'CSS', 'HTML']
        ],
        [
            'title' => 'Cloud Architect',
            'description' => 'Lead the architectural design and implementation of highly scalable cloud solutions using modern infrastructure as code.',
            'location' => 'Seattle, WA',
            'employment_type' => 'Full-time',
            'salary_min' => 180000,
            'salary_max' => 240000,
            'experience_level' => 'Senior',
            'skills' => ['AWS', 'System Design', 'Kubernetes', 'Terraform']
        ],
        [
            'title' => 'Data Scientist',
            'description' => 'Join our Data Science team to analyze complex healthcare datasets and build predictive models to improve patient care.',
            'location' => 'Boston, MA',
            'employment_type' => 'Full-time',
            'salary_min' => 140000,
            'salary_max' => 180000,
            'experience_level' => 'Senior',
            'skills' => ['Python', 'Machine Learning', 'SQL', 'Pandas']
        ]
    ];
    
    $query = "
        INSERT INTO jobs (
            company_id, title, description, location, job_type,
            salary_min, salary_max, experience_level, required_skills, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    
    $jobCount = 0;
    foreach ($jobs as $j) {
        $stmt = $conn->prepare($query);
        if ($stmt->execute([
            $companyId,
            $j['title'],
            $j['description'],
            $j['location'],
            $j['employment_type'],
            $j['salary_min'],
            $j['salary_max'],
            $j['experience_level'],
            json_encode($j['skills']),
            'active'
        ])) {
            $jobCount++;
        }
    }
    
    echo COLOR_GREEN . "   ✓ Added {$jobCount} job postings\n" . COLOR_RESET;
}
