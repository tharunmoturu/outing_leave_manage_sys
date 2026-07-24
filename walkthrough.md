# 🏫 Outing & Leave Management System — Complete Walkthrough

## 📌 What is this project?

This is a **Hostel Outing & Leave Management System** built for a college hostel. It digitizes the process of students applying for outings and leaves, caretakers approving/rejecting them, and security staff tracking who exits and returns. Everything that was once done on paper registers is now managed digitally through this web app.

---

## 🧱 Tech Stack — What's Used

| Layer | Technology |
|---|---|
| **Frontend** | React (TypeScript) + Vite + TailwindCSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Cloud) via Mongoose |
| **Auth** | JWT (JSON Web Tokens) + bcrypt password hashing |
| **Routing** | React Router DOM (frontend) |

---

## 🗂️ Project Folder Structure

```
outing-leave-management/
├── backend/               ← Node.js API server
│   └── src/
│       ├── server.js      ← App entry point
│       ├── config/
│       │   └── db.js      ← MongoDB connection
│       ├── models/        ← MongoDB data schemas
│       │   ├── User.js
│       │   ├── Student.js
│       │   ├── Outing.js
│       │   ├── Leave.js
│       │   └── LoginLog.js
│       ├── controllers/   ← Business logic
│       ├── routes/        ← API endpoint definitions
│       ├── middleware/
│       │   └── auth.js    ← JWT protect + role guard
│       └── utils/
│           └── seeder.js  ← Auto seeds demo data
│
└── frontend/              ← React app
    └── src/
        ├── App.tsx        ← Routing + session management
        ├── pages/
        │   ├── Login.tsx
        │   ├── Signup.tsx
        │   ├── AdminDashboard.tsx
        │   ├── CaretakerDashboard.tsx
        │   ├── StudentDashboard.tsx
        │   ├── SecurityDashboard.tsx
        │   └── ReportsPage.tsx
        ├── components/
        │   ├── Layout.tsx
        │   └── Navbar.tsx
        └── contexts/
            └── AcademicYearContext.tsx
```

---

## 👥 Roles in the System

The entire system revolves around **4 roles**. Each role sees a completely different screen:

| Role | Dashboard | What they can do |
|---|---|---|
| 🔴 **Admin** | `/admin` | Full control — manage students, register staff, view logs, reports |
| 🟡 **Caretaker** | `/caretaker` | Approve/reject outing & leave requests, manage students |
| 🔵 **Security** | `/security` | Mark students as Exited or Returned at the gate |
| 🟢 **Student** | `/student` | Apply for outing/leave, view their own history |

---

## 🚀 How the App Starts — Step by Step

### Backend Startup (`server.js`)

```
1. Load environment variables from .env
2. Connect to MongoDB Atlas (db.js)
   └── On success → Run seeder.js (inserts demo data if DB is empty)
3. Register all API routes under /api/...
4. Start listening on PORT 5000
```

### Frontend Startup (`App.tsx`)

```
1. Check localStorage for saved 'userInfo' (session)
   ├── If found → restore user session (auto-login)
   └── If not   → user is treated as logged out
2. Render BrowserRouter with all routes
3. Wrap everything in AcademicYearProvider context
```

---

## 🔐 Authentication Flow (Login)

This is the first thing that happens when a user visits the app.

```
User visits http://localhost:5173
        │
        ▼
App.tsx checks localStorage
        │
        ├── No session → Redirect to /login
        │
        └── Session found → Redirect to their dashboard by role
```

### Login Request Flow:

```
[Browser]  POST /api/auth/login  { username, password }
    │
    ▼
[authRoutes.js]  →  loginUser() in authController.js
    │
    ▼
[MongoDB]  Find user by username → compare bcrypt password
    │
    ├── ❌ Wrong password →  Log FAILED in LoginLog → return 401
    │
    └── ✅ Correct →
          Log SUCCESS in LoginLog
          Generate JWT token (valid 30 days)
          Return: { _id, username, role, studentProfile, token }
    │
    ▼
[Frontend]  Save full response to localStorage as 'userInfo'
    │
    ▼
[App.tsx]  setUser(userData) → role-based redirect:
    ├── admin    → /admin
    ├── caretaker → /caretaker
    ├── security  → /security
    └── student   → /student
```

---

## 🛡️ How Protected Routes Work

Every API route (except login/signup) is protected by **two middleware layers**:

### Layer 1 — `protect` (Are you logged in?)
```
Request comes in with header:  Authorization: Bearer <JWT_TOKEN>
    │
    ▼
jwt.verify(token, JWT_SECRET)
    ├── ❌ Invalid/expired → 401 Unauthorized
    └── ✅ Valid → Fetch user from DB → attach as req.user → next()
```

### Layer 2 — `authorize(...roles)` (Do you have permission?)
```
req.user.role checked against allowed roles list
    ├── ❌ Wrong role → 403 Forbidden
    └── ✅ Right role → Proceed to controller
```

**Example:** `POST /api/outings/apply` only allows `role: 'student'`
**Example:** `POST /api/outings/:id/approve` only allows `admin` or `caretaker`

---

## 📋 Student Signup Flow

A student can self-register at `/signup`:

```
Student fills form: ID, Name, Year, Branch, Email, Hostel, Room, Password
    │
    ▼
POST /api/auth/signup
    │
    ▼
authController.studentSignup():
    1. Check if username (= student ID lowercase) already exists
       └── If yes → "Account already exists, please login"
    2. Check if Student profile exists in DB by student ID
       ├── Not found → Create new Student document
       └── Found     → Update existing Student profile
    3. Create User account (role: 'student') linked to Student profile
    4. Return success message
```

> **Key concept:** There are TWO separate documents for a student:
> - `Student` — their academic/hostel profile (Name, Room, Hostel, quota etc.)
> - `User` — their login account (username, password, role) linked to Student via `studentProfile` field

---

## 🚶 Outing Request Flow (Complete Journey)

This is the core feature of the system. Here's the complete life of an outing request:

```
STEP 1: Student applies
────────────────────────
Student → POST /api/outings/apply
  { purpose, destination, expected_return }
  Controller: applyOuting()
  → Creates Outing document { status: 'Pending', outing_id: auto-generated }
  → Student's remaining_outings quota is NOT deducted yet

STEP 2: Caretaker reviews
────────────────────────────
Caretaker → GET /api/outings/pending
  → Sees all Pending outing requests

  Option A: APPROVE
  ─────────────────
  POST /api/outings/:id/approve
  → Outing status → 'Approved'
  → Deducts 1 from student's remaining_outings quota

  Option B: REJECT
  ─────────────────
  POST /api/outings/:id/reject  { remarks: "reason" }
  → Outing status → 'Rejected'
  → Quota NOT deducted

STEP 3: Security marks Exit
─────────────────────────────
Security → POST /api/outings/:id/exit
  → Outing status → 'Exited'
  → Student's status → 'Outside'
  → Records actual_exit_time = NOW

STEP 4: Security marks Return
───────────────────────────────
Security → POST /api/outings/:id/return
  → Outing status → 'Returned'
  → Student's status → 'Inside'
  → Records actual_return_time = NOW
```

### Outing Status State Machine:
```
Pending → Approved → Exited → Returned
Pending → Rejected
Pending/Approved → Cancelled (by student or caretaker)
```

---

## 🏖️ Leave Request Flow

Similar to outing but simpler (no Security gate involvement):

```
Student → POST /api/leaves/apply
  { reason, start_date, end_date }
  → Creates Leave { status: 'Pending' }
  → Student status stays 'Inside' until approved

Caretaker → POST /api/leaves/:id/approve
  → Leave status → 'Approved'
  → Student status → 'Leave'

Caretaker → POST /api/leaves/:id/reject
  → Leave status → 'Rejected'
  → Student status stays 'Inside'
```

### Leave Status Machine:
```
Pending → Approved
Pending → Rejected
```

---

## 🗄️ Database Collections (MongoDB)

### 1. `users` — Login accounts
```js
{
  username: "22ag1a0501",      // student ID or staff name
  password: "<hashed>",        // bcrypt hashed
  role: "student",             // admin | caretaker | student | security
  studentProfile: ObjectId     // links to students collection (null for staff)
}
```

### 2. `students` — Hostel profiles
```js
{
  Id: "22AG1A0501",            // unique student ID
  Name: "Ravi Kumar",
  Year: "3rd",
  Branch: "CSE",
  Room_No: "A-204",
  Hostel: "Boys Hostel A",
  Mail_Id: "ravi@gmail.com",
  status: "Inside",            // Inside | Outside | Leave
  remaining_outings: 3,        // weekly quota (resets)
  used_outings: 1,
  Photo: ""                    // base64 or URL
}
```

### 3. `outings` — Outing records
```js
{
  outing_id: "OT-20240721-001",
  student: ObjectId,           // ref to students
  purpose: "Medical",
  destination: "City Hospital",
  out_time: Date,
  expected_return: Date,
  actual_exit_time: Date,
  actual_return_time: Date,
  status: "Approved",          // Pending|Approved|Exited|Returned|Cancelled|Rejected
  approved_by: ObjectId,       // ref to users
  approved_by_name: "Caretaker John",
  remarks: ""
}
```

### 4. `leaves` — Leave records
```js
{
  leave_id: "LV-20240721-001",
  student: ObjectId,
  reason: "Festival at home",
  start_date: Date,
  end_date: Date,
  status: "Pending",           // Pending | Approved | Rejected
  approved_by: ObjectId,
  remarks: ""
}
```

### 5. `loginlogs` — Audit trail
```js
{
  username: "22ag1a0501",
  user: ObjectId,
  role: "student",
  status: "success",           // success | failed
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: Date
}
```

---

## 🖥️ Frontend Pages & What Each Does

### `/login` — Login Page
- Username + password form
- Calls `POST /api/auth/login`
- On success: saves `userInfo` to localStorage, redirects by role

### `/signup` — Student Self-Signup
- Student fills their details + password
- Calls `POST /api/auth/signup`
- Creates both Student profile + User account in one shot

### `/admin` — Admin Dashboard
- View all students, their status (Inside/Outside/Leave)
- Create / Edit / Delete student profiles
- Register new staff (caretaker, security accounts)
- Override student outing quota
- View login audit logs

### `/caretaker` — Caretaker Dashboard
- View pending outing requests → Approve / Reject
- View pending leave requests → Approve / Reject
- View active outings (students currently outside)
- Browse all students

### `/security` — Security Dashboard
- Search students by ID/name
- View currently active (approved) outings
- Mark student as **Exited** (left campus)
- Mark student as **Returned** (came back)

### `/student` — Student Dashboard
- View their own profile, quota remaining
- Apply for Outing (purpose, destination, expected return)
- Apply for Leave (reason, dates)
- View their outing/leave history with status

### `/reports` — Reports Page
- Admin/Caretaker only
- Download outing/leave reports as Excel or PDF
- Filter by date range, student, status

---

## 🔄 Complete Request Flow Summary (Big Picture)

```
Browser (React)
    │
    │  HTTP Request with JWT token in header
    ▼
Express Server (port 5000)
    │
    ├── /api/auth/*      → authController
    ├── /api/students/*  → studentController
    ├── /api/outings/*   → outingController
    ├── /api/leaves/*    → leaveController
    ├── /api/dashboard/* → dashboardController
    └── /api/reports/*   → reportController
    │
    │  Every protected route passes through:
    │  protect() middleware → authorize() middleware
    │
    ▼
MongoDB Atlas (Cloud Database)
    └── Returns data → Controller sends JSON response
    │
    ▼
React updates UI with response data
```

---

## 🌱 Auto-Seeder (Demo Data)

When the backend starts with a **fresh database**, `seeder.js` auto-inserts:
- **3 demo students** with profiles
- **7 system users** (1 admin, 1+ caretakers, 1+ security, students)
- **Sample outing records**
- **Sample leave records**

This means you can log in immediately without manually creating any data!

---

## 🔑 Key Concepts Summary

| Concept | How it works |
|---|---|
| **Session** | JWT token stored in `localStorage` — no server sessions |
| **Password Security** | bcrypt hashes passwords before storing in DB |
| **Role Guards** | Every API route checks role before allowing access |
| **Outing Quota** | Each student gets 3 outings/week; deducted on approval |
| **Student Status** | Automatically changes: Inside → Outside → Inside or Leave |
| **Audit Trail** | Every login attempt (success/fail) is logged in `loginlogs` |
| **Dark Mode** | Supported across all pages via `useDarkMode` hook |
