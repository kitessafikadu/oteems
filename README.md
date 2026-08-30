# OTEEMS - Employee Management System

OTEEMS is a full-stack Employee Management System, that centralizes employee information and digitizes employee leave
management through a structured, role-based workflow.

## Features

- Employee management
- Department management
- Leave request management
- Leave approval and rejection workflow
- Automatic leave-day calculation
- Role-based access control
- Employee and leave reports
- Search and filtering
- JWT authentication
- API documentation with Swagger

## Leave Workflow

```text
Draft
  ↓
Submitted
  ↓
Approved / Rejected
```

The system prevents invalid status transitions.

## User Roles

---

Role Responsibilities

---

**Administrator** System-wide administration

**HR User** Employee management, leave
management, and HR reports

**Department Manager** Reviews and approves/rejects leave
requests for their department

**Employee** Manages personal information and
creates, submits, and tracks leave
requests

---

## Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Axios
- Lucide React

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- bcrypt
- class-validator
- class-transformer
- Swagger / OpenAPI

### Database

- PostgreSQL
- Neon PostgreSQL

## Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│                              │
│     Next.js + TypeScript     │
│                              │
│ Dashboard │ Employees        │
│ Departments │ Requests       │
│ Reports │ Authentication     │
└──────────────┬───────────────┘
               │
             REST API
               │
┌──────────────▼───────────────┐
│           Backend            │
│                              │
│        NestJS + Prisma       │
│                              │
│ Auth │ Employees             │
│ Departments │ Requests       │
│ Reports │ Admin              │
└──────────────┬───────────────┘
               │
               ▼
        PostgreSQL / Neon
```

## Project Structure

```text
oteems/
├── api/
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
│   └── package.json
│
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── public/
│   ├── .env.local
│   └── package.json
│
└── README.md
```

## API

The backend provides a REST API with the following main endpoint groups:

```text
/api/auth
/api/employees
/api/departments
/api/requests
/api/reports
/api/admin
```

Swagger/OpenAPI documentation is available when the backend is running.

## Authentication & Authorization

OTEEMS uses **JWT authentication** and role-based authorization.

Supported roles:

```text
ADMIN
HR_USER
DEPARTMENT_MANAGER
EMPLOYEE
```

Access to protected resources is determined by the user's role and
responsibilities.

## Environment Variables

### Backend

Create `api/.env`:

```env
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1d"
PORT=3001
```

### Frontend

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Do not commit environment files containing secrets.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL-compatible database or Neon PostgreSQL

### Clone

```bash
git clone [<repository-url>](https://github.com/kitessafikadu/oteems.git)
cd oteems
```

### Backend

```bash
cd api
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm start:dev
```

Backend:

```text
http://localhost:3001
```

### Frontend

Open another terminal:

```bash
cd web
pnpm install
pnpm dev
```

Frontend:

```text
http://localhost:3000
```
