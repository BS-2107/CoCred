# CoCred — Student Academic & Co-Curricular Credential Management Platform (v2.0)

CoCred is a centralized, enterprise-grade credential management and peer verification web application built for university ecosystems. It enables students to maintain verified academic transcripts, attendance records, industry certifications, hackathon victories, research publications, and internships—empowering them with shareable public portfolios and verifiable QR codes for recruiters and placement officers.

---

## 🚀 Live Demo & Key Highlights

- **Frontend Application**: Running locally on `http://localhost:5173/`
- **Backend API Server**: Running locally on `http://localhost:5000/` (Health: `http://localhost:5000/api/health`)
- **Interactive 1-Click Role Switcher**: Instant switching between **Student**, **Faculty Reviewer**, **Placement Officer**, and **Administrator** directly from the top banner for hackathon evaluations and real-world deployment demos.
- **Sample Verified Public Portfolio**: `http://localhost:5173/portfolio/arjun-mehta` (features live QR code, institutional verification checkmarks, and PDF export).

---

## 🛠 Technology Stack

- **Client**: React 19 + TypeScript + Vite + Tailwind CSS + React Router + Lucide Icons + Recharts
- **Server**: Node.js + Express.js + TypeScript (`tsx`)
- **Database & Storage**: Dual-mode engine supporting PostgreSQL with Supabase (schema provided in `supabase/schema.sql` with Row Level Security) and resilient embedded relational JSON persistence with automated seeding.
- **Authentication**: JWT-based session tokens, password hashing with bcrypt, and backend role-based access control (RBAC).
- **Document & Certificate Storage**: Multer file upload pipeline with PDF & image validation, supporting Supabase Storage bucket uploads with local fallback.

---

## 👥 Demo Accounts & Role Permissions

All accounts come pre-configured with the default demo password: `password123`.

| Role | Account Email | Name | Capabilities & Access |
|---|---|---|---|
| **Student** | `student@cocred.edu` | Arjun Mehta (CSE '25) | Upload certificates, track attendance, manage grades, edit profile, view completeness score, generate public portfolio & QR code. |
| **Student 2** | `student2@cocred.edu` | Sneha Rao (ECE '24) | Secondary student profile for multi-candidate placement filtering. |
| **Faculty** | `faculty@cocred.edu` | Dr. Ramesh Sharma | Verification queue, preview student certificate proofs, approve/reject with mandatory rejection reasons, audit history. |
| **Placement** | `placement@cocred.edu` | Priya Nair | Candidate talent search, filter by department, graduation year, min CGPA, verified certificate counts, and inspect candidate portfolios. |
| **Administrator** | `admin@cocred.edu` | Prof. Vikram Malhotra | Platform oversight, provision authorized faculty accounts, adjust user roles, manage departments, inspect tamper-evident audit logs. |

---

## 📋 Certificate Verification Workflow

1. **Student Submission**: The student enters certificate metadata (title, issuing org, issue/expiry dates, credential ID, verification URL, description) and uploads a PDF or image document.
2. **Secure Ingestion**: The certificate is securely stored, given a unique ID, and marked with a `Pending Verification` status.
3. **Faculty Queue**: Authorized faculty members view pending submissions filtered by department and category.
4. **Document Inspection**: Faculty preview the original certificate document in-browser and review student academic context (CGPA, roll number, department).
5. **Decision & Audit**:
   - **Approval**: Faculty approve the credential with optional verification notes. The certificate gains a verified badge and is published to the student's public portfolio.
   - **Rejection**: Faculty must provide a mandatory rejection reason (e.g., unproctored credential, illegible scan).
6. **Real-Time Notification**: The student is immediately alerted on their dashboard with updated status badges and review comments.

---

## 💻 Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended, v22 tested)
- npm (v9+ recommended, v11 tested)

### 1. Installation
Run the following command in the project root to install all workspaces:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment Configuration
Both `server/.env` and `client/.env` come pre-configured for local execution.
- `server/.env.example` & `server/.env`:
  ```env
  PORT=5000
  NODE_ENV=development
  JWT_SECRET=cocred_jwt_super_secret_production_key_change_in_real_env_2025
  # Optional: Configure Supabase to connect to a live Supabase PostgreSQL instance
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- `client/.env.example` & `client/.env`:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### 3. Running the Application
In two separate terminals:
- **Terminal 1 (Backend API)**:
  ```bash
  npm run dev:server
  ```
- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev:client
  ```

Open your browser at `http://localhost:5173/`.

---

## 🗄 PostgreSQL & Supabase Database Schema

The complete database schema with Row Level Security (RLS) policies and performance indexes is located at:
[`supabase/schema.sql`](file:///c:/Users/binit/Downloads/Cocred%202.0/supabase/schema.sql)

### Core Tables
1. `users`: Credentials, full name, role (`student`, `faculty`, `placement_officer`, `admin`), department, roll number, graduation year.
2. `student_profiles`: Bio, CGPA, semester, skills array, portfolio slug, public visibility toggle, LinkedIn & GitHub URLs.
3. `academic_records`: Semester-wise course code, credits, letter grades, and SGPA.
4. `attendance_records`: Course attendance with attended vs. total classes and automatic percentage calculation with 75% threshold alerts.
5. `certificates`: Title, issuing organization, dates, file URL, status (`pending`, `approved`, `rejected`), reviewer ID, rejection reason.
6. `verification_reviews`: Audit log of faculty review decisions, timestamps, and validation notes.
7. `achievements`: Hackathon prizes, research papers, awards, workshops with proof links.
8. `projects`: Technical title, description, tech stack, GitHub repository, live demo URL.
9. `internships`: Company, role, location, dates, stipend, completion certificates.
10. `notifications`: In-app alerts for certificate approval, rejection feedback, and low attendance warnings.
11. `audit_logs`: Tamper-evident system activity ledger with user IDs, action names, timestamps, and IP addresses.

---

## 🧪 Verification & Build Status

- **Typecheck & Production Build**: Passed (`tsc -b && vite build` completed in `client/dist/`).
- **Browser Subagent Test**: Complete walkthrough of landing page, student dashboard, certificate verification, faculty queue, and public portfolio completed and recorded.
