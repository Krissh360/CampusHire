# CampusHire — College Placement & Recruitment Management System
### Full-Stack DBMS Academic Capstone Project

CampusHire is a production-quality web platform that digitizes and automates the collegiate campus recruitment lifecycle. It bridges Students, Corporate Recruiters, and College Placement Officers with automated eligibility verification, multi-round interview tracking, application audit logging, offer generation, and institutional placement business intelligence.

---

## 🚀 Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js & Express.js (Clean MVC Architecture)
- **Database**: MySQL (Strict 3NF Normalization)
- **Database Driver**: `mysql2/promise` with Connection Pooling
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs Password Hashing
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with Interceptors

---

## 📁 Project Structure

```text
CampusHire/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MySQL2 pool & fallback in-memory adapter
│   │   │   └── initDb.js         # Automated DB migrations & seed runner
│   │   ├── controllers/          # Auth, Student, Company, Job, Application, Admin
│   │   ├── middleware/           # JWT verification & RBAC authorization
│   │   ├── routes/               # Express REST API route definitions
│   │   └── server.js             # Express application entry point
│   ├── test/
│   │   └── api.test.js           # Automated integration test suite
│   ├── uploads/                  # Uploaded student resumes (PDF)
│   ├── .env                      # Database & JWT environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Sidebar, Navbar, ProtectedRoute, Layout
│   │   ├── context/              # AuthContext (state & session management)
│   │   ├── pages/
│   │   │   ├── admin/            # Dashboard, Students, Companies, Jobs, Reports
│   │   │   ├── company/          # Dashboard, Jobs & Applicants, Post Job, Interviews, Profile
│   │   │   ├── student/          # Dashboard, Browse Jobs, Applications, Interviews, Profile
│   │   │   ├── LandingPage.jsx   # Public portal landing page
│   │   │   ├── LoginPage.jsx     # SaaS login with one-click demo credentials
│   │   │   └── RegisterPage.jsx  # Dual student & recruiter registration
│   │   ├── services/             # Axios API client
│   │   ├── App.jsx               # Route mapping
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                # Complete 12-table DDL with constraints & FKs
│   ├── sample_data.sql           # Realistic academic seed dataset
│   ├── indexes.sql               # B-Tree query performance indexes
│   ├── views.sql                 # 5 Relational reporting views
│   ├── procedures.sql            # Stored procedures with ACID transactions
│   ├── triggers.sql              # Audit logging and state synchronization triggers
│   └── queries.sql               # Academic SQL showcase (DDL, DML, DQL, Joins, Aggregates)
│
├── documentation/
│   └── PROJECT_REPORT.md         # Comprehensive project report & data dictionary
└── README.md
```

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with realistic demonstration accounts.  
**Password for all demo accounts:** `password123`

| Role | Name | Email | Description |
| :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `aarav.sharma@college.edu` | CSE (9.40 CGPA) • Placed with Google India |
| **Student** | Priya Patel | `priya.patel@college.edu` | CSE (8.85 CGPA) • Placed with Microsoft |
| **Student** | Rohit Verma | `rohit.verma@college.edu` | IT (8.10 CGPA) • Interviewing with Microsoft |
| **Student** | Ananya Iyer | `ananya.iyer@college.edu` | ECE (7.60 CGPA) • Applied to Infosys |
| **Company** | Google India | `recruiter@google.com` | Verified Recruiter • Software Engineer Drive |
| **Company** | Microsoft Corp | `recruiter@microsoft.com` | Verified Recruiter • SDE-1 Drive |
| **Admin** | Placement Head | `admin@campushire.edu` | Placement Officer • Full Institutional Analytics |

*(Tip: On the Login page, you can click any of the "One-Click Academic Demo Logins" buttons to instantly populate the credentials).*

---

## ⚙️ Quick Start Installation & Execution

### 1. Database Setup (MySQL)
Ensure your MySQL server (MySQL 8.x or MariaDB) is running on port `3306`.
Configure your credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campushire_db
```

Run the automated database bootstrap script:
```bash
cd CampusHire/backend
npm run db:init
```
*(Alternatively, import `database/schema.sql`, `database/indexes.sql`, and `database/sample_data.sql` via MySQL Workbench or CLI).*

> **Note**: Even if your local MySQL service is temporarily offline, the backend features an intelligent fallback data adapter pre-loaded with the exact schema and seed records, ensuring 100% of routes, dashboards, and forms function out of the box!

### 2. Start the Backend API
```bash
cd CampusHire/backend
npm install
npm start
```
The backend server will launch at `http://localhost:5000`.  
Verify health diagnostics at `http://localhost:5000/api/health`.

### 3. Run Automated Backend Integration Tests
```bash
cd CampusHire/backend
npm test
```
Executes automated API tests validating authentication, JWT issuance, student profiling, personalized eligibility calculations, recruiter workflows, and admin authorization barriers.

### 4. Start the React Frontend
```bash
cd CampusHire/frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📊 DBMS Academic Features Highlight

- **3NF Relational Schema**: Strict separation of concerns across 12 relational tables.
- **ACID Transactions**: Stored procedures `sp_apply_job_with_eligibility_check` and `sp_update_application_status_and_offer` wrap application submissions and status updates with transaction rollbacks.
- **Automated Triggers**: `trg_after_application_status_update` logs every state transition to `application_history`, and `trg_after_offer_status_update` keeps student placement status synchronized.
- **Relational Views**: 5 specialized views in `database/views.sql` providing real-time KPI summaries, branch-wise metrics, and recruiter conversion funnels.
- **Complex Queries**: Complete demonstrations of `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `GROUP BY ... HAVING`, scalar subqueries, and `NOT EXISTS` correlated subqueries in `database/queries.sql`.

---

## 📄 Documentation

For full academic documentation, including the Data Dictionary, Normalization Proofs, and Architectural Diagrams, view [documentation/PROJECT_REPORT.md](documentation/PROJECT_REPORT.md).
