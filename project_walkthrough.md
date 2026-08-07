# 🎓 RGUKT Nuzvid Outing Management System — Complete Walkthrough

> A digital system to manage hostel student outings and leaves at RGUKT Nuzvid. This guide explains everything: what the system does, who uses it, how it works, and how each part is built.

---

## 🏫 What is This Project?

This is a **full-stack web application** that replaces the traditional paper-based outing request system in a hostel. 

**Before this system:** Students physically go to the caretaker, fill paper forms, wait for approval, and security checks paper passes manually.

**After this system:** Everything is digital — students apply online, caretakers approve/reject with one click, security scans a QR code, and admins see all data in real-time.

---

## 👥 Who Uses This System? (4 Roles)

| Role | Who They Are | What They Can Do |
|---|---|---|
| 🧑‍🎓 **Student** | Hostel student | Apply for outings, check status, view history |
| 🧑‍💼 **Caretaker** | Hostel warden | Review & approve/reject outing requests |
| 👮 **Security** | Gate guard | Scan/verify student gate passes at exit/return |
| 🛠️ **Admin** | Hostel administrator | Manage all users, generate reports, full oversight |

---

## 🏗️ System Architecture (How It's Built)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│            Running at http://localhost:5173           │
│  • Built with React + TypeScript + Vite             │
│  • UI pages for each role (Student, Caretaker, etc.) │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Requests (API calls)
                       ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                  │
│            Running at http://localhost:5000           │
│  • Built with Express.js                             │
│  • Handles all business logic, auth, data           │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB Atlas)            │
│        Hosted on cloud: outingleavecluster           │
│  • Stores Users, Outings, Notifications, Logs        │
└─────────────────────────────────────────────────────┘
```

### Tech Stack Summary:
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB (Atlas cloud) with Mongoose
- **Authentication:** Google OAuth 2.0 + JWT Tokens
- **Email:** Nodemailer via Gmail SMTP
- **Deployment Ready:** Vercel (frontend + backend)

---

## 📁 Project Folder Structure

```
outing-leave-management/
│
├── backend/                    ← Server-side code
│   └── src/
│       ├── config/
│       │   └── db.js           ← MongoDB connection (with Google DNS fix)
│       ├── controllers/        ← Business logic for each feature
│       │   ├── authController.js
│       │   ├── caretakerController.js
│       │   ├── outingController.js
│       │   ├── studentController.js
│       │   ├── dashboardController.js
│       │   ├── notificationController.js
│       │   ├── reportController.js
│       │   └── userController.js
│       ├── middleware/
│       │   └── auth.js         ← JWT verification + role-based access guard
│       ├── models/             ← MongoDB database schemas
│       │   ├── User.js         ← Students, Caretakers, Admin accounts
│       │   ├── Outing.js       ← All outing/leave requests
│       │   ├── Notification.js ← In-app notifications
│       │   └── LoginLog.js     ← Security: tracks all login attempts
│       ├── routes/             ← URL endpoints
│       │   ├── authRoutes.js
│       │   ├── outingRoutes.js
│       │   ├── caretakerRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── notificationRoutes.js
│       │   └── reportRoutes.js
│       ├── utils/
│       │   ├── emailService.js ← Sends approval/rejection emails to students
│       │   ├── hostelUtils.js  ← Helpers: get students by hostel
│       │   ├── timeUtils.js    ← Helpers: calculate if student is outside/overdue
│       │   ├── pdfGenerator.js ← Generate PDF reports
│       │   └── excelGenerator.js ← Generate Excel reports
│       └── server.js           ← App entry point, all routes wired here
│
└── frontend/                   ← Client-side code (what users see)
    └── src/
        ├── pages/              ← One page per major screen
        │   ├── Login.tsx
        │   ├── StudentDashboard.tsx
        │   ├── NormalOutingPage.tsx
        │   ├── EmergencyOutingPage.tsx
        │   ├── GatePassPage.tsx
        │   ├── StudentHistoryPage.tsx
        │   ├── CaretakerDashboard.tsx
        │   ├── PendingNormalPage.tsx
        │   ├── CaretakerPendingEmergencyPage.tsx
        │   ├── StudentsOutsidePage.tsx
        │   ├── CaretakerHistoryPage.tsx
        │   ├── CaretakerStudentSearchPage.tsx
        │   ├── SecurityDashboard.tsx
        │   ├── ReportsPage.tsx
        │   └── admin/          ← Admin-only pages
        │       ├── AdminDashboard.tsx
        │       ├── AdminStudentManagement.tsx
        │       ├── AdminCaretakerManagement.tsx
        │       ├── AdminUserOnboarding.tsx
        │       └── AdminOperationsDashboard.tsx
        ├── contexts/
        │   └── AuthContext.tsx  ← Holds logged-in user info globally
        ├── components/         ← Reusable UI pieces
        └── App.tsx             ← Routes + Role-based navigation
```

---

## 🔐 Authentication Flow (How Login Works)

This system uses **Google OAuth** — no passwords to remember.

```
1. User opens the app → Sees Login page
2. Clicks "Continue with Google"
3. Google popup appears → User signs in with their college email
4. Google sends a token back to our app
5. Our backend verifies the token with Google
6. Backend looks up the email in the database (User collection)
   ✅ Found → Generate JWT token → Send back to frontend
   ❌ Not Found → Return "You are not authorized" error
7. Frontend stores the JWT token in localStorage
8. Every future API request includes the JWT in the header
9. Backend's auth.js middleware verifies the JWT on every request
```

**Key Security Points:**
- Only pre-registered college emails work (e.g., `n220096@rguktn.ac.in`)
- JWT tokens expire after 30 days
- All login attempts (success & failure) are logged in `LoginLog` collection
- Role is stored in JWT so the frontend knows which dashboard to show

---

## 🧑‍🎓 Student Flow (Step by Step)

### Dashboard
When a student logs in, they see:
- Their current status (Inside / Outside / On Leave)
- Monthly outing quota (e.g., 2/3 used)
- Active outing pass (if any)
- Recent notifications

### Applying for a Normal Outing
```
Student clicks "Apply for Outing"
    ↓
Fills form:
  - Purpose / Reason
  - Destination
  - Leaving Time
  - Expected Return Time
  - Phone, Parent Phone
    ↓
Submits → Backend creates an Outing document with status = "Pending"
    ↓
Caretaker sees it in Pending Requests
    ↓
[Approved] → Status = "Approved", Student gets email + notification
[Rejected] → Status = "Rejected", Student gets email + notification with reason
    ↓
If Approved → Student goes to Gate Pass page
Student shows QR code / Pass to Security Guard at gate
    ↓
Security scans → marks Exit → Status = "Exited"
Student comes back → Security marks Return → Status = "Returned"
```

### Emergency Outing
Same flow but labeled as **Emergency**. Has a category field (Medical, Family Emergency, etc.). The caretaker sees these in a separate "Emergency Requests" tab with higher priority.

### Gate Pass
- After approval, student can view a digital gate pass
- Shows: Student name, ID, destination, leaving & return time, approval info
- Caretaker name and signature info is shown
- Can be shown to security as QR or on-screen

---

## 🧑‍💼 Caretaker Flow (Step by Step)

### Dashboard Overview
When caretaker logs in, they see 4 live statistics:
- **Students Currently Outside**
- **Pending Normal Requests** (needs approval)
- **Pending Emergency Requests** (urgent!)
- **Approved Today**

### Reviewing a Pending Request
```
Caretaker sees a request card with:
  - Student Name, ID, Hostel, Room
  - Purpose, Destination
  - Leaving & Return Times
  - Monthly outings remaining (e.g., 1/3 remaining)
    ↓
Caretaker clicks "View Details" → Full detail drawer opens
  - Shows: Student profile (branch, year, phone, parent phone)
  - Shows: Last 5 outings history for this student
  - Shows: Current request details
    ↓
Caretaker decides:
  ✅ "Approve" → One click → Status = Approved → Email sent to student
  ❌ "Reject" → Must type a reason → Status = Rejected → Email sent with reason
```

**Hostel Restriction:** Caretakers can only see/approve students from their assigned hostel. A boys hostel caretaker cannot approve a girls hostel request.

### Students Outside (Live Tracking)
- Shows all students currently outside the campus
- Dynamically calculated using leaving time and expected return time
- Shows: Student name, destination, time left before expected return
- Flags **overdue** students (those who haven't returned on time)

### Outing History
- Full searchable history of all outings from the last 30 days
- Filter by: Date Range, Status, Outing Type
- Sort by: Newest / Oldest
- **Date filter fix:** Filters by actual outing date (not database record date)

### Student Search
- Search any student by name or roll number
- View their complete profile and outing history

---

## 👮 Security Guard Flow

### Dashboard
The security guard has a simple, focused interface:

```
Security scans student's gate pass (by outing_id)
    ↓
System shows: Student name, photo, destination, time, approval status
    ↓
Student is LEAVING campus:
  Guard clicks "Mark Exit" → Status changes from Approved → Exited
    ↓
Student is RETURNING to campus:
  Guard clicks "Mark Return" → Status changes from Exited → Returned
```

This creates a complete digital trail of every student's movement.

---

## 🛠️ Admin Flow

Admin has the highest access level and can see everything across all hostels.

### Admin Dashboard
- System-wide statistics
- All pending requests, all active outings
- Login audit logs

### Student Management
- View all registered students
- Edit student profiles (hostel, room, branch, year)
- Reset outing quotas
- Activate/deactivate accounts

### Caretaker Management
- View all caretakers
- Assign/change hostel assignments
- Activate/deactivate accounts

### User Onboarding
- Add new students or staff to the system
- Bulk upload via Excel/CSV

### Reports
- Generate PDF or Excel reports
- Filter by date range, hostel, status
- Export outing history, attendance data

---

## 🗄️ Database Design (4 Collections)

### 1. `User` Collection
Stores everyone who can log in.

```json
{
  "name": "K. BENARJI",
  "email": "n220096@rguktn.ac.in",
  "role": "student",            // student | caretaker | admin
  "studentId": "n220096",
  "branch": "CSE",
  "year": "3rd",
  "hostel": "BH3",
  "roomNo": "101",
  "phone": "9876543210",
  "parentPhone": "9876543211",
  "remaining_outings": 3,       // Monthly quota (resets each period)
  "used_outings": 0,
  "status": "Inside",           // Inside | Outside | Leave
  "isActive": true,
  "googleId": "Google's unique user ID"
}
```

### 2. `Outing` Collection
Every single outing request, from pending to completed.

```json
{
  "outing_id": "OUT-20260725-1234",   // Unique readable ID
  "student": "ObjectId → User",        // Reference to student
  "outingType": "Normal",              // Normal | Emergency
  "purpose": "Medical checkup",
  "destination": "Vijayawada",
  "leaving_time": "10:00 AM",
  "reporting_time": "06:00 PM",
  "submitted_date": "2026-07-25",
  "status": "Approved",                // Pending→Approved→Exited→Returned | Rejected
  "emergencyCategory": null,           // For emergency: Medical, Family, etc.
  "approved_by": "ObjectId → User",   // Caretaker who approved
  "approved_by_name": "Bunny Konna",
  "approved_at": "2026-07-25T08:30:00Z",
  "gate_pass_expiry": "2026-07-25T18:00:00Z",
  "rejection_reason": null
}
```

### 3. `Notification` Collection
In-app alerts sent to students.

```json
{
  "studentId": "n220096",
  "outingId": "ObjectId → Outing",
  "type": "APPROVED",           // APPROVED | REJECTED
  "title": "Outing Approved",
  "message": "Your outing to Vijayawada has been approved.",
  "isRead": false
}
```

### 4. `LoginLog` Collection
Security audit trail of every login attempt.

```json
{
  "username": "n220096@rguktn.ac.in",
  "user": "ObjectId → User",
  "role": "student",
  "status": "success",          // success | failed
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

---

## 📡 API Endpoints (Backend Routes)

| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/auth/google` | Anyone | Login with Google |
| GET | `/api/auth/me` | Logged in | Get current user profile |
| POST | `/api/outings/apply` | Student | Submit normal outing request |
| GET | `/api/outings/my` | Student | Get own outing history |
| PUT | `/api/caretaker/outings/:id/approve` | Caretaker | Approve a pending request |
| PUT | `/api/caretaker/outings/:id/reject` | Caretaker | Reject with reason |
| GET | `/api/caretaker/dashboard` | Caretaker | Get dashboard stats |
| GET | `/api/caretaker/pending-normal` | Caretaker | Get pending normal requests |
| GET | `/api/caretaker/emergency-requests` | Caretaker | Get emergency requests |
| GET | `/api/caretaker/students-outside` | Caretaker | Live outside students |
| GET | `/api/caretaker/history` | Caretaker | Outing history with filters |
| POST | `/api/outings/:id/exit` | Security | Mark student exit |
| POST | `/api/outings/:id/return` | Security | Mark student return |
| GET | `/api/admin/students` | Admin | All students |
| POST | `/api/admin/onboard` | Admin | Add new user |
| GET | `/api/reports/export` | Admin | Download PDF/Excel |
| GET | `/api/notifications` | Student | Get notifications |

---

## 📧 Email Notification System

When a caretaker approves or rejects an outing:

```
Caretaker clicks Approve/Reject
     ↓
Backend saves the decision to database
     ↓
Backend calls emailService.js asynchronously (doesn't block the response)
     ↓
emailService reads SMTP credentials from .env:
  SMTP_USER = konnabenarji75@gmail.com
  SMTP_PASS = [App Password]
     ↓
Sends HTML email to student's registered email
     ↓
✅ Approval email: Green template, shows outing details
❌ Rejection email: Red template, shows rejection reason
```

**Failsafe:** If SMTP is not configured, email is logged to the terminal instead of crashing the app.

---

## ⚙️ Environment Configuration (.env)

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://...  # Atlas connection string

# Security
JWT_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password      # Google App Password (not your Gmail password)
EMAIL_FROM="Hostel Portal <your_email@gmail.com>"
```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+)
- Internet connection (for MongoDB Atlas)

### Step 1 — Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure .env
Create `backend/.env` with the configuration shown above.

### Step 3 — Start Both Servers
```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### Step 4 — Open in Browser
Visit: **http://localhost:5173**

---

## 🔄 Complete Outing Lifecycle (At a Glance)

```
Student Applies (status: Pending)
        ↓
Caretaker Reviews
        ↓
    ┌───┴───┐
 Approve   Reject
    │         │
    ↓         ↓
 Approved  Rejected
 (email)   (email)
    │
    ↓
Student shows gate pass
    │
    ↓
Security scans → Exit marked (status: Exited)
    │
    ↓
Student returns → Return marked (status: Returned)
    │
    ↓
System marks as Completed ✅
```

---

## 📊 Key Features Summary

| Feature | Status |
|---|---|
| Google OAuth Login | ✅ Working |
| Role-Based Access Control | ✅ Working |
| Normal Outing Application | ✅ Working |
| Emergency Outing Application | ✅ Working |
| Caretaker Approve/Reject | ✅ Working |
| Email on Approve/Reject | ✅ Working |
| Digital Gate Pass | ✅ Working |
| Security Exit/Return Marking | ✅ Working |
| Live Students Outside Tracking | ✅ Working |
| Outing History with Date Filter | ✅ Working (Fixed) |
| In-App Notifications | ✅ Working |
| Admin Student Management | ✅ Working |
| Admin Reports (PDF/Excel) | ✅ Working |
| Hostel-wise Access Restriction | ✅ Working |
| Login Audit Logs | ✅ Working |
| Monthly Quota System | ✅ Working |

---

*Project built by students of RGUKT Nuzvid as a practical hostel management solution.*
