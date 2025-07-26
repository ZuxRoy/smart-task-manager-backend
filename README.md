# Task Management MVP

A comprehensive task management system built with TypeScript, Express.js, and MongoDB.

## Features

### Admin Features
- Create and manage users
- CRUD operations for tasks and assign to users
- View all tasks currently due for all members or individual members
- Check user history for tasks (completed, due, overdue, not completed)
- Get warnings for conflicting timelines of tasks for a user
- Get warnings for high workload on individual users
- Update tasks with conflict resolution options

### Member Features
- View tasks assigned to them
- Mark tasks as complete
- Filter tasks by priority or due date
- View personal task history (complete, overdue, incomplete, due)

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on default port 27017)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=JWT_SECRET_TOKEN
NODE_ENV=development
```
Edit the `.env` file with your configuration.

4. Build the project:
```bash
npm run build
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Admin Routes (require admin role)
- `POST /api/admin/users` - Create a new user
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/tasks` - Create a new task
- `GET /api/admin/tasks` - Get all tasks (with filters)
- `PUT /api/admin/tasks/:id` - Update task
- `DELETE /api/admin/tasks/:id` - Delete task
- `GET /api/admin/tasks/due` - Get due tasks
- `GET /api/admin/users/:userId/history` - Get user task history

### Member Routes (require authentication)
- `GET /api/member/tasks` - Get user's assigned tasks
- `PUT /api/member/tasks/:id/complete` - Mark task as complete
- `GET /api/member/history` - Get user's task history

### Health Check
- `GET /api/health` - Health check endpoint

## Database Schema

### User Schema
```typescript
{
  username: string (unique, required)
  email: string (unique, required)
  password: string (hashed, required)
  role: 'admin' | 'member'
  createdAt: Date
  updatedAt: Date
}
```

### Task Schema
```typescript
{
  title: string (required)
  description: string (required)
  assignedTo: ObjectId (User reference, required)
  assignedBy: ObjectId (User reference, required)
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dueDate: Date (required)
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### Task History Schema
```typescript
{
  taskId: ObjectId (Task reference, required)
  userId: ObjectId (User reference, required)
  action: 'created' | 'assigned' | 'completed' | 'updated' | 'overdue'
  details: string (required)
  timestamp: Date
}
```

## Features Implementation

### Conflict Detection
The system automatically detects when tasks assigned to the same user have conflicting timelines (within 24 hours of each other) and provides warnings.

### Workload Management
Monitors user workload and provides warnings when:
- User has more than 5 active tasks
- User has more than 2 overdue tasks

### Automatic Overdue Detection
A background job runs every hour to automatically update tasks that have passed their due date to "overdue" status.

### Task History Tracking
All task-related actions are logged in a history table for audit and reporting purposes.

## Sample Login Credentials

After running the seed script:

- **Admin**: admin@example.com / admin123
- **Member 1**: john@example.com / password123
- **Member 2**: jane@example.com / password123
- **Member 3**: bob@example.com / password123

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```
