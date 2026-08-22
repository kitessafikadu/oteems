# Oteems - Employee Management System

A full-stack **Employee Management System** developed as a pre-employment assessment project for OTech Engineering & Technology Solutions PLC.

The system centralizes employee information and digitizes the employee leave request and approval process, replacing fragmented manual processes with a structured and traceable workflow.

## Overview
The Employee Management System provides a centralized platform for:

- Managing employee records
- Managing departments and department managers
- Submitting and tracking employee leave requests
- Reviewing and approving or rejecting leave requests
- Calculating leave days automatically
- Managing role-based access
- Searching and filtering records
- Generating employee and leave reports

## Core Workflow

The leave request workflow is:

```text
Draft
  ↓
Submitted
  ↓
Approved / Rejected
```

Invalid status transitions are prevented by the system.

## User Roles

The system supports four business roles:

| Role                   | Responsibilities                                                           |
| ---------------------- | -------------------------------------------------------------------------- |
| **Administrator**      | System-wide administration and management                                  |
| **HR User**            | Employee management, leave management, and HR reports                      |
| **Department Manager** | Reviews and approves/rejects leave requests for their department           |
| **Employee**           | Views personal information and creates, submits, and tracks leave requests |

## Main Features

### Employee Management

- Create employee records
- View employee records
- Update employee information
- Delete/deactivate employee records
- Search and filter employees
- Organize employees by department

### Department Management

- Create departments
- View departments
- Update department information
- Assign department managers
- View employees within departments

### Leave Management

- Create leave requests
- Save requests as drafts
- Submit leave requests
- Automatically calculate leave days
- View leave request status
- Review submitted requests
- Approve or reject requests
- Prevent invalid workflow transitions

### Reports

The system provides the required reports:

1. Employee List
2. Employees by Department
3. Leave Requests

## Business Rules

The system enforces the following core business rules:

1. Only authenticated users can access the system.
2. Required employee and leave request fields cannot be empty.
3. Employee IDs must be unique.
4. Only active employees can submit new leave requests.
5. The leave end date cannot be earlier than the start date.
6. Only authorized HR Users, Department Managers, and Administrators can review and approve/reject leave requests.
7. Leave requests must follow the `Draft → Submitted → Approved/Rejected` workflow.
8. Employees can only view and track their own leave requests, while authorized staff can access requests according to their responsibilities.

## Technology Stack

### Frontend

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Hook Form**
- **Zod**
- **Axios**
- **Lucide React**

### Backend

- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **REST API**
- **JWT Authentication**
- **Passport**
- **bcrypt**
- **class-validator**
- **class-transformer**
- **Swagger / OpenAPI**

### Database

- **PostgreSQL**
- **Neon PostgreSQL**

### Development & Deployment

- **Git**
- **GitHub**
- **Docker**
- **Vercel** for frontend deployment
- **Render/Railway** for backend deployment

## System Architecture

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│              Next.js + TypeScript           │
│                                             │
│  Dashboard │ Employees │ Departments       │
│  Requests  │ Reports   │ Authentication     │
└──────────────────────┬──────────────────────┘
                       │
                    REST API
                       │
┌──────────────────────▼──────────────────────┐
│                  BACKEND                    │
│                                             │
│                NestJS API                   │
│                                             │
│  Auth       Employees       Departments     │
│  Requests   Reports         Admin           │
└──────────────────────┬──────────────────────┘
                       │
                     Prisma
                       │
┌──────────────────────▼──────────────────────┐
│                PostgreSQL                   │
│                                             │
│  Users │ Employees │ Departments            │
│  Leave Requests │ Leave Types               │
└─────────────────────────────────────────────┘
```

## Project Structure

```text
employee-management-system/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── requests/
│   │   ├── reports/
│   │   ├── admin/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── public/
│   ├── .env.local
│   └── package.json
│
└── README.md
```

## Database Model

The main business entities are:

```text
Department
    │
    │ 1:N
    ▼
Employee
    │
    │ 1:N
    ▼
Leave Request
```

The system also maintains leave types and authentication information.

### Employee

- Employee ID
- Full Name
- Phone
- Email
- Department
- Position
- Hire Date
- Status

### Department

- Department Name
- Department Manager

### Leave Request

- Request Number
- Employee
- Leave Type
- Start Date
- End Date
- Reason
- Leave Days
- Status

## Required Validations

The system validates:

- Unique Employee ID
- Required fields
- Valid email format
- Valid leave dates
- End date cannot be before start date
- Employee must exist
- Only active employees can submit leave
- Invalid leave status transitions
- Role-based authorization

## Authentication & Authorization

Authentication is implemented using JWT.

Authorization is based on the user's role:

```text
ADMIN
HR_USER
DEPARTMENT_MANAGER
EMPLOYEE
```

Access to protected operations is restricted according to the user's role and responsibility.

## API

The backend exposes a RESTful API.

Example endpoint groups:

```text
/api/auth
/api/employees
/api/departments
/api/requests
/api/reports
/api/admin
```

Swagger/OpenAPI is used to document and test the API during development.

## Environment Variables

### Backend

Create a `.env` file inside `backend`:

```env
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1d"
PORT=3001
```

### Frontend

Create a `.env.local` file inside `frontend`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

Do not commit environment files containing secrets to GitHub.

## Installation

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- PostgreSQL-compatible database or Neon PostgreSQL account

### Clone the Repository

```bash
git clone <repository-url>
cd employee-management-system
```

### Backend Setup

```bash
cd backend
npm install
```

Initialize Prisma:

```bash
npx prisma generate
```

Run the database migration:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run start:dev
```

The backend will run on:

```text
http://localhost:3001
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

## Development Workflow

The project will be developed in the following order:

```text
1. Database schema
       ↓
2. Prisma migration
       ↓
3. Authentication
       ↓
4. Role-based authorization
       ↓
5. Employee CRUD
       ↓
6. Department management
       ↓
7. Leave request workflow
       ↓
8. Reports
       ↓
9. Frontend dashboard
       ↓
10. Frontend forms and tables
       ↓
11. API integration
       ↓
12. Validation and error handling
       ↓
13. Testing
       ↓
14. Deployment
```


## License

This project was developed as a pre-employment assessment project.
