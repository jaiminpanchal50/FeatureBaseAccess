# RBAC Admin Dashboard

A production-ready Role & Feature-based Access Control Admin Dashboard built with MERN stack and Tailwind CSS.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 👥 User management with role assignment
- 🛡️ Role-based access control (RBAC)
- 🔑 Per-feature permission overrides
- 🎨 Modern, responsive Tailwind CSS design
- 📱 Mobile-first responsive layout
- 🚀 Built with React, Express, MongoDB, and Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

## Project Structure

```
FeatureBaseAccess/
├── server/          # Backend Express API
├── client/          # Frontend React app
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac-admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

5. (Optional) Seed an admin user:
```bash
npm run seed:admin
```

This will create:
- An admin role with all permissions
- An admin user (email: `admin@example.com`, password: `admin123`)

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (requires `user.read`)
- `GET /api/users/:id` - Get user by ID (requires `user.read`)
- `PATCH /api/users/:id` - Update user (requires `user.update`)
- `DELETE /api/users/:id` - Delete user (requires `user.delete`)

### Roles
- `GET /api/roles` - Get all roles (requires `role.read`)
- `GET /api/roles/:id` - Get role by ID (requires `role.read`)
- `POST /api/roles` - Create role (requires `role.create`)
- `PATCH /api/roles/:id` - Update role (requires `role.update`)
- `DELETE /api/roles/:id` - Delete role (requires `role.delete`)

### Admin
- `POST /api/admin/assign-role` - Assign role to user (requires `admin.manage`)
- `POST /api/admin/set-permissions` - Set permissions override (requires `admin.manage`)
- `POST /api/admin/set-super-admin` - Set/unset super admin (requires `admin.manage`)
- `GET /api/admin/user/:userId/permissions` - Get user permissions (requires `admin.manage`)

## Permission System

### Permission Format
Permissions are strings in the format: `resource.action`

Examples:
- `user.read` - Read users
- `user.create` - Create users
- `user.update` - Update users
- `user.delete` - Delete users
- `report.view` - View reports
- `report.download` - Download reports
- `billing.manage` - Manage billing
- `admin.manage` - Manage admin functions

### Super Admin
Users with `isSuperAdmin: true` have all permissions (`*`).

### Permission Resolution
1. If user is super admin → all permissions
2. Start with role permissions
3. Add/override with `permissionsOverride` array
4. If role has `*` → all permissions

## Usage

1. Start MongoDB
2. Start backend server (`cd server && npm run dev`)
3. Start frontend (`cd client && npm run dev`)
4. Register a new user or login
5. Create roles and assign permissions
6. Manage user access through the Users page

## Default Setup

After starting the server, you can:
1. Register a new user via the login page
2. The first user can be manually set as super admin in the database
3. Or create an admin role with all permissions and assign it

## Development

- Backend uses `nodemon` for auto-restart
- Frontend uses Vite for fast HMR
- Both support hot reloading

## License

ISC

