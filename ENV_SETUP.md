# Environment Variables Setup Guide

## Server Environment Variables (.env file in `server/` folder)

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/rbac-admin

# Option 2: MongoDB Atlas (cloud) - replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rbac-admin?retryWrites=true&w=majority

# JWT Configuration
# IMPORTANT: Generate strong random strings for production!
# You can generate secrets using: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars

# Token Expiration Times
JWT_EXPIRE=15m          # Access token expiration (15 minutes)
JWT_REFRESH_EXPIRE=7d   # Refresh token expiration (7 days)
```

### Required Variables:

1. **PORT** (optional, defaults to 5000)
   - The port your backend server will run on

2. **NODE_ENV** (optional, defaults to development)
   - Set to `development` for dev, `production` for production

3. **MONGODB_URI** (required)
   - Your MongoDB connection string
   - For local: `mongodb://localhost:27017/rbac-admin`
   - For Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

4. **JWT_SECRET** (required)
   - Secret key for signing access tokens
   - Must be a strong random string (minimum 32 characters)
   - Generate with: `openssl rand -base64 32`

5. **JWT_REFRESH_SECRET** (required)
   - Secret key for signing refresh tokens
   - Must be different from JWT_SECRET
   - Generate with: `openssl rand -base64 32`

6. **JWT_EXPIRE** (optional, defaults to 15m)
   - Access token expiration time
   - Format: `15m`, `1h`, `24h`, etc.

7. **JWT_REFRESH_EXPIRE** (optional, defaults to 7d)
   - Refresh token expiration time
   - Format: `7d`, `30d`, etc.

## Client Environment Variables (.env file in `client/` folder)

Create a `.env` file in the `client/` directory (optional):

```env
# Frontend API URL
# Only needed if your backend is running on a different URL
# Defaults to: http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
```

### Required Variables:

1. **VITE_API_URL** (optional)
   - The base URL of your backend API
   - Defaults to `http://localhost:5000/api` if not set
   - Must start with `VITE_` for Vite to expose it to the frontend

## Quick Setup Steps

1. **Create server/.env file:**
   ```bash
   cd server
   cp .env.example .env
   # Then edit .env with your values
   ```

2. **Generate JWT secrets (recommended):**
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32
   
   # Generate JWT_REFRESH_SECRET (different from above)
   openssl rand -base64 32
   ```

3. **Update MongoDB URI:**
   - For local MongoDB: `mongodb://localhost:27017/rbac-admin`
   - For MongoDB Atlas: Use your connection string from Atlas dashboard

4. **Create client/.env file (optional):**
   ```bash
   cd client
   # Only needed if backend URL is different from default
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to version control (they're in `.gitignore`)
- Use strong, random secrets in production
- Never share your JWT secrets publicly
- Use different secrets for development and production
- For production, use environment variables from your hosting platform

## Example Production Values

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rbac-admin
JWT_SECRET=<generated-64-char-random-string>
JWT_REFRESH_SECRET=<different-64-char-random-string>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

