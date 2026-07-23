# 🎓 Smart School Learning Management System (LMS)

> A modern, full-stack web application built for academic institutions to streamline digital education, coursework management, homework grading, attendance tracking, and performance analytics across Students, Teachers, and Administrators. Developed as a final year B.Tech minor project.

---

## 📋 Table of Contents
- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
  - [👨‍🎓 Student Portal](#-student-portal)
  - [👩‍🏫 Teacher Portal](#-teacher-portal)
  - [🛡️ Admin Portal](#-admin-portal)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone The Repository](#1-clone-the-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Database Setup](#3-database-setup)
  - [4. Install Dependencies & Start Applications](#4-install-dependencies--start-applications)
- [API Reference](#-api-reference)
- [Future Enhancements](#-future-enhancements)
- [Contributors](#-contributors)
- [License](#-license)

---

## 📖 About The Project

The **Smart School LMS** is a unified digital learning management platform designed to replace manual paperwork with an intuitive, automated web portal. Built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js/Express**, and **PostgreSQL**, the system provides role-gated access with strict security mechanisms (JWT authentication & bcrypt hashing).

---

## ✨ Key Features

### 👨‍🎓 Student Portal
- **Dashboard Overview**: Quick statistics on enrolled subjects, pending homework assignments, and attendance percentage.
- **Subject & Chapter Materials**: Access subject syllabi, chapters, and download PDFs, notes, or watch video lectures.
- **Homework Submissions**: View assigned homework, submission deadlines, submit file solution links, and review instructor scores.
- **Attendance Monitor**: Track real-time daily attendance with automated percentage calculations for academic compliance.
- **Performance Evaluation**: Review instructor score cards, evaluation marks, and personalized feedback notes.

### 👩‍🏫 Teacher Portal
- **Course & Chapter Management**: Create course subjects, organize chapter syllabi, and upload study materials (PDFs, notes, videos).
- **Homework & Grading Engine**: Post new homework assignments with due dates, review student file submissions, and assign numerical grades.
- **Class Attendance Marker**: Roll call interface with Present/Absent status toggles and date selection for daily attendance tracking.
- **Student Performance Reports**: Issue subject-wise evaluation scores (0 - 100) and feedback notes directly to students.

### 🛡️ Admin Portal
- **Executive System Dashboard**: Live analytics monitoring total students, teachers, subjects, homework, and study materials.
- **User Account Management**: Full directory listing with role filtering (Student/Teacher/Admin), live search, and deletion capabilities with foreign-key safety.
- **Institutional Subject Catalog**: Add or remove academic course subjects system-wide.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v3 (Custom color tokens, HSL gradients, glassmorphism)
- **Routing**: React Router DOM v7 (Role-protected nested routes & URL parameters)
- **Icons**: Lucide React
- **HTTP Client**: Axios (Centralized instance with JWT Bearer token auto-attachment)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database Driver**: `pg` (node-postgres connection pool)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing

### Database
- **Database Engine**: PostgreSQL 14+
- **Schema Design**: Normalized relational tables (`users`, `subjects`, `chapters`, `study_materials`, `homework`, `homework_submissions`, `attendance`, `performance_reports`) with UNIQUE constraints and foreign keys.

---

## 📁 Project Structure

```text
smart-school-lms/
├── client/                        # React + Vite Frontend
│   ├── public/                    # Static assets & favicon
│   ├── src/
│   │   ├── api/                   # Axios client instance
│   │   ├── components/            # UI components
│   │   │   ├── shared/            # Shared components (ConfirmDialog, Navbar, Footer)
│   │   │   ├── student/           # Student portal views
│   │   │   ├── teacher/           # Teacher portal views
│   │   │   └── admin/             # Admin portal views
│   │   ├── context/               # AuthContext state provider
│   │   ├── pages/                 # Top-level page routes (Landing, Login, Dashboards, 404)
│   │   ├── App.jsx                # Main route configuration
│   │   └── main.jsx               # Entry point
│   ├── tailwind.config.js         # Tailwind configuration
│   └── package.json
│
├── server/                        # Node.js + Express Backend
│   ├── config/                    # DB pool & SQL schema definition
│   │   ├── db.js                  # PostgreSQL pool setup
│   │   └── schema.sql             # SQL database DDL script
│   ├── controllers/               # Express request handlers
│   │   ├── authController.js      # Register & Login logic
│   │   ├── userController.js      # User management APIs
│   │   ├── adminController.js     # System statistics API
│   │   ├── subjectController.js   # Subject CRUD
│   │   ├── chapterController.js   # Chapter CRUD
│   │   ├── materialController.js  # Study material CRUD
│   │   ├── homeworkController.js  # Homework & grading APIs
│   │   ├── attendanceController.js# Attendance marking & report APIs
│   │   └── performanceController.js# Performance evaluation APIs
│   ├── middleware/                # Route security
│   │   └── authMiddleware.js      # JWT token & role verification
│   ├── routes/                    # API route declarations
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express app entry point
│   └── package.json
│
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following software installed locally:
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.0 or higher)
- [Git](https://git-scm.com/)

---

### 1. Clone The Repository

```bash
git clone https://github.com/your-username/smart-school-lms.git
cd smart-school-lms
```

---

### 2. Environment Configuration

Create a `.env` file in the `/server` folder:

```bash
# Location: server/.env

PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=smart_school_lms
JWT_SECRET=your_super_secret_jwt_key_here
```

---

### 3. Database Setup

1. Open your PostgreSQL command line tool (`psql`) or a GUI tool like pgAdmin / DBeaver.
2. Create a new database named `smart_school_lms`:

```sql
CREATE DATABASE smart_school_lms;
```

3. Execute the SQL schema script provided in `server/config/schema.sql` against the database to create all required tables and indexes:

```bash
psql -U postgres -d smart_school_lms -f server/config/schema.sql
```

---

### 4. Install Dependencies & Start Applications

#### Terminal 1: Start Backend Server

```bash
# Navigate to server directory
cd server

# Install Node modules
npm install

# Run backend server in development mode
npm run dev
```
*The backend API server will start at `http://localhost:5000`.*

#### Terminal 2: Start Frontend Application

```bash
# Navigate to client directory
cd client

# Install Node modules
npm install

# Run React Vite frontend server
npm run dev
```
*The React application will launch at `http://localhost:5173`.*

---

## 🔌 API Reference

### 🔐 Authentication Module (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (student/teacher/admin) |
| `POST` | `/api/auth/login` | Public | Login user & return JWT Bearer token |

### 📚 Subjects Module (`/api/subjects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Authenticated | List all course subjects |
| `POST` | `/api/subjects` | Teacher, Admin | Create a new subject |
| `DELETE` | `/api/subjects/:id` | Admin | Delete a subject |

### 📖 Chapters Module (`/api/chapters`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chapters/subject/:subjectId` | Authenticated | List chapters for a subject |
| `POST` | `/api/chapters` | Teacher, Admin | Create a new chapter |

### 📄 Study Materials Module (`/api/materials`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/materials/chapter/:chapterId` | Authenticated | List materials for a chapter |
| `POST` | `/api/materials` | Teacher | Upload material (pdf/video/note) |
| `DELETE` | `/api/materials/:id` | Teacher (Owner), Admin | Delete a material |

### 📝 Homework Module (`/api/homework`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/homework` | Teacher | Assign new homework |
| `GET` | `/api/homework/subject/:subjectId` | Authenticated | List homework for a subject |
| `GET` | `/api/homework/subject/:subjectId/my-status` | Student | List student homework with submission status |
| `POST` | `/api/homework/submit` | Student | Submit solution link for homework |
| `GET` | `/api/homework/:id/submissions` | Teacher | View all student submissions for homework |
| `PUT` | `/api/homework/submissions/:id/grade` | Teacher | Grade a student submission |

### 📅 Attendance Module (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/mark` | Teacher | Mark/update student attendance (upsert) |
| `GET` | `/api/attendance/subject/:id?date=...` | Teacher | Get existing attendance for subject & date |
| `GET` | `/api/attendance/my-summary` | Student | Get student attendance percentage summary |

### 📊 Performance Module (`/api/performance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/performance` | Teacher | Post a student performance evaluation report |
| `GET` | `/api/performance/student/:studentId` | Authenticated | Get performance reports for a student |

### 👥 Users & Admin Module (`/api/users`, `/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/students` | Teacher, Admin | Fetch list of all registered students |
| `GET` | `/api/users?role=...` | Admin | Fetch user directory with role filtering |
| `DELETE` | `/api/users/:id` | Admin | Delete a user account |
| `GET` | `/api/admin/stats` | Admin | Fetch system analytics overview |

---

## 🔮 Future Enhancements

- 📱 **Mobile Application**: Cross-platform React Native / Flutter app for push notifications and offline study note access.
- 🤖 **AI-Powered Personalized Learning**: Integration with LLM APIs for automated homework assistance and smart study recommendation engines.
- 📝 **Online Examination & Quiz Engine**: Automated multiple-choice quiz evaluation with timed test sessions.
- 👨‍👩‍👧 **Parent Portal**: Dedicated access portal for parents to monitor attendance alerts and academic performance reports.

---

## 👥 Contributors

- **Arun Kumar Mahato** - *Full Stack Development & System Architecture* - Final Year B.Tech Computer Science & Engineering.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
