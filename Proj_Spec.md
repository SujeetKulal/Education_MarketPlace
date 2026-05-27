1. Project OverviewA specialized university-centric educational marketplace and LMS designed for high-performance content delivery. The platform enables students to purchase curriculum-aligned materials, including PDF E-books, Video lessons, and MCQ test sets. The architecture supports a three-way ecosystem: Student (Learner), Author (Verified Content Creator), and Admin (Platform Moderator).  

2. Technical Stack
Backend: Django 5.x + Django REST Framework (DRF).  
Database & Auth: Supabase (PostgreSQL + Supabase Auth).  
Frontend: React.js (Vite) + Tailwind CSS + Lucide React.  Storage: Supabase Buckets (Private for paid materials; Public for thumbnails/assets).  

3. Detailed Features & Functionality
Student Role
Discovery: Advanced filtering of materials by University, Course, and Semester to ensure curriculum alignment.  Commerce: Seamless purchase of individual items or bundles via integrated payment gateways.  
Learning: Secure access to a private "My Library" to view E-books (PDF) and stream Video lessons.  
Assessment: Capability to take MCQ practice tests with immediate grading and participate in community forums. 
Author Role
Onboarding: Professional registration and credential submission for verification by administrators.  Publishing: Secure tools to upload PDF/Video files and design MCQ test sets using an interactive builder.  Metadata Management: Define subject tags, price, target university, and semester for each listing.  
Analytics: A comprehensive dashboard to monitor sales volume, revenue trends, and student engagement.  
Admin Role
Moderation: Review and approve/reject newly uploaded content for quality and compliance.  
User Management: Approve author verification requests and manage global platform-wide configurations.  Oversight: Access to global logistics and metrics showing total revenue and active users.  

4. Logical Workflow (The "Flow")
Registration: Users register via Supabase Auth; Authors are restricted until Admin verification confirms their status.  
Inventory Creation: Verified Authors upload curriculum materials to Private Supabase Buckets via secure Django endpoints.  
Transaction: A student purchases material; the backend creates an Enrollment record to track ownership.  Secure Delivery: The system verifies the purchase and generates a Time-Limited Signed URL from Supabase for content consumption.  
Engagement: Students complete MCQ assessments and post in forums; Authors monitor their sales performance.  

5. Database Schema
Profiles: id (UUID), role (STUDENT, AUTHOR, ADMIN), university, is_verified.  
Materials: id, author_id (FK), type (PDF/VIDEO/MCQ), price, file_path, university, semester.  
Enrollments: id, user_id (FK), material_id (FK), purchase_date, status.  
MCQs: id, material_id (FK), questions (JSONB), timer_limit.  
ForumPosts: id, user_id (FK), content, parent_id (for threaded discussions).  

6. Detailed Implementation Roadmap
Phase 1: Authentication & Role-Based Access Control (RBAC)Backend: Integrate Supabase Auth with Django; define custom permissions for each role.  Frontend: Setup Vite + React; implement an AuthProvider to manage JWTs and restrict routes.  

Phase 2: Author Onboarding & Content ManagementBackend: Create endpoints for Material CRUD; implement secure upload logic to Private Buckets.  Frontend: Develop the Author Dashboard and a multi-part form for asset uploads with university metadata.  

Phase 3: Marketplace & Student DiscoveryBackend: Develop public GET endpoints for materials with robust filtering for University and Semester.  Frontend: Create a high-converting storefront grid using Lucide React for professional iconography.  

Phase 4: Payments & Secure Library AccessBackend: Integrate payment webhooks; implement the Signed URL generator to verify enrollment before delivery.  Frontend: Build "My Library" to render secure PDFs and videos using temporary URLs.  

Phase 5: Assessments & ForumsBackend: Create the MCQ engine (processing JSONB questions) and Forum CRUD endpoints.  Frontend: Develop the Quiz UI (timers, score summaries) and threaded forum discussion interfaces.

Phase 6: Admin Panel & AnalyticsBackend: Develop aggregate analytics endpoints for platform revenue, user growth, and content moderation.  Frontend: Build the Admin panel for approving content and verifying author credentials.  