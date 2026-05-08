
# React + TypeScript Student CRUD Dashboard

This project is a responsive student registration dashboard built with React, TypeScript, Node.js, Express, and MongoDB. It supports encrypted student CRUD operations, a default admin login form, backend pagination, and a professional Tailwind CSS interface.

## Features

- Default admin login form with email and password validation
- Student registration form with all required fields
- Create, read, update, and delete student records
- Two-level encryption before and after backend processing
- MongoDB persistence
- Responsive UI for mobile, tablet, and desktop
- Backend pagination for the student directory

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Hook Form
- CryptoJS

### Backend

- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB
- Nodemon
- CryptoJS

## API Routes

Only these student APIs are used in the project:

- `POST /api/register` - Create a student
- `GET /api/students?page=1&limit=6` - Get paginated students
- `PUT /api/student/:id` - Update a student
- `DELETE /api/student/:id` - Delete a student

## Setup Instructions

### Prerequisites

- Node.js 20+ recommended
- npm
- MongoDB local instance or MongoDB Atlas connection string

### 1. Clone and open the project

```bash
git clone <your-repository-url>
cd task-react-node-typescript
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/student_registry
PORT=9000
FRONTEND_SECRET_KEY=frontend_secret_key
BACKEND_SECRET_KEY=backend_secret_key
```

Start the backend:

```bash
npm run dev
```

Notes:

- `npm run dev` uses `nodemon`
- You can replace `MONGODB_URI` with a MongoDB Atlas URI

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```bash
VITE_API_URL=http://localhost:9000/api
VITE_FRONTEND_SECRET_KEY=frontend_secret_key
```

Start the frontend:

```bash
npm run dev
```

### 4. Default admin login

Use these default credentials in the login form:

- Email: `admin@example.com`
- Password: `Admin@123`

## Build Commands

### Backend

```bash
cd server
npm run build
```

### Frontend

```bash
cd client
npm run build
```

## How Encryption Is Implemented

The project uses a two-level AES-based encryption flow for student data.

### 1. Frontend encryption

- File: `client/src/utils/crypto.ts`
- Before sending student data to the backend, the frontend encrypts the payload using `VITE_FRONTEND_SECRET_KEY`
- The encrypted payload is sent as:

```json
{
  "data": "encrypted-string"
}
```

### 2. Backend processing and second encryption

- Files:
  - `server/src/utils/crypto.ts`
  - `server/src/controllers/studentController.ts`
- The backend first decrypts the frontend-encrypted payload using `FRONTEND_SECRET_KEY`
- It validates the decrypted student data
- It then applies a second encryption layer using `BACKEND_SECRET_KEY`
- The final encrypted string is stored in MongoDB

### 3. Data retrieval flow

- When `GET /api/students` is called, the backend decrypts one layer
- The backend sends data back still encrypted with the frontend key
- The frontend decrypts the final layer and renders plain student details in the UI

### Encryption summary

1. Frontend encrypts student form data
2. Backend decrypts the frontend layer
3. Backend validates the payload
4. Backend encrypts the data again with its own secret
5. MongoDB stores the doubly processed encrypted data
6. Backend removes one layer during fetch
7. Frontend removes the final layer for display

## Project Structure

```text
task-react-node-typescript/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ LoginForm.tsx
│  │  │  ├─ StudentForm.tsx
│  │  │  └─ StudentList.tsx
│  │  ├─ utils/
│  │  │  └─ crypto.ts
│  │  └─ App.tsx
├─ server/
│  ├─ src/
│  │  ├─ controllers/
│  │  │  └─ studentController.ts
│  │  ├─ models/
│  │  │  └─ Student.ts
│  │  ├─ routes/
│  │  │  └─ studentRoutes.ts
│  │  ├─ utils/
│  │  │  └─ crypto.ts
│  │  ├─ app.ts
│  │  └─ server.ts
└─ README.md
```

## Sample Screenshots

Add your actual screenshots to `docs/screenshots/` using the paths below:

### Login and locked workspace

![Login and locked workspace](https://github.com/user-attachments/assets/52c863ee-34f7-4620-b007-acb0daf19d45)
<!-- <img width="1879" height="904" alt="Screenshot 2026-05-09 011731" src="https://github.com/user-attachments/assets/52c863ee-34f7-4620-b007-acb0daf19d45" /><img width="1906" height="900" alt="Screenshot 2026-05-09 011755" src="https://github.com/user-attachments/assets/59bc0d29-5ff2-4b60-96e6-1e023089e322" />
 -->


### Admin session and student form

![Admin session and student form](https://github.com/user-attachments/assets/1da1ade7-57f4-4f89-959e-7803ca536845)

### Student directory with backend pagination


![Student directory with pagination](https://github.com/user-attachments/assets/a8e81f0f-ab57-4a87-a9fa-a37da46dc7ae
)

### Responsive preview

![Responsive preview](https://github.com/user-attachments/assets/f705282b-e8a6-4219-a8c8-5683cfd98ac0)

## Notes

- The login form is intentionally frontend-only, using the default admin account requested for this task
- Student data CRUD is handled only through the required backend APIs
- `FRONTEND_SECRET_KEY` and `VITE_FRONTEND_SECRET_KEY` must match
- `BACKEND_SECRET_KEY` is never exposed to the frontend
