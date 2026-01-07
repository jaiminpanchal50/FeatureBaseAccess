# Code Flow Explanation - Authentication & RBAC System

This document explains the code flow for the two main systems in this application:
1. **Authentication Flow** (Login, Token Management)
2. **RBAC/Permission Flow** (Authorization, Access Control)

---

## 1. Authentication Flow

### Overview
The authentication system uses JWT (JSON Web Tokens) with access tokens and refresh tokens. The flow involves both frontend (React) and backend (Express) components.

### Frontend Flow (Client-Side)

#### Step 1: User Login (`client/src/pages/Login.jsx`)

```javascript
// User enters credentials and submits form
handleSubmit → login(email, password)
```

**Flow:**
1. User enters email and password
2. Form submission triggers `handleSubmit`
3. Calls `login()` from `AuthContext`

#### Step 2: AuthContext Login (`client/src/context/AuthContext.jsx`)

```javascript
const login = async (email, password) => {
  // Calls API endpoint
  const response = await authAPI.login({ email, password });
  
  // Extracts data from response
  const { user, permissions, accessToken, refreshToken } = response.data.data;
  
  // Stores in localStorage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('permissions', JSON.stringify(permissions));
  
  // Updates React state
  setUser(user);
  setPermissions(permissions);
}
```

**What happens:**
1. Makes API call to `/api/auth/login`
2. Receives user data, permissions, and tokens
3. Stores tokens and user data in localStorage
4. Updates React context state
5. Returns success/error to Login component

#### Step 3: API Service (`client/src/services/api.js`)

```javascript
// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - adds token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      // Retry original request
      return api(originalRequest);
    }
  }
);
```

**Key Features:**
- **Request Interceptor**: Automatically adds `Authorization: Bearer <token>` header to all API requests
- **Response Interceptor**: Automatically handles 401 errors by refreshing the token
- **Token Refresh**: If access token expires, uses refresh token to get new access token

#### Step 4: Backend Login (`server/src/controllers/authController.js`)

```javascript
export const login = async (req, res, next) => {
  // 1. Find user by email
  const user = await User.findOne({ email }).populate('role');
  
  // 2. Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  // 3. Generate tokens
  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });
  
  // 4. Resolve user permissions
  const permissions = await resolveUserPermissions(user, Role);
  
  // 5. Return response
  res.json({
    user: { _id, name, email, role, permissionsOverride, isSuperAdmin },
    permissions,
    accessToken,
    refreshToken
  });
}
```

**Flow:**
1. Find user in database by email
2. Verify password using bcrypt comparison
3. Generate JWT tokens (access + refresh)
4. Resolve user's effective permissions
5. Return user data, permissions, and tokens

#### Step 5: Token Generation (`server/src/config/jwt.js`)

```javascript
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};
```

**What happens:**
- Creates signed JWT tokens with user ID
- Access token expires in 15 minutes
- Refresh token expires in 7 days

### Authentication Middleware Flow

#### Step 1: Request Arrives (`server/src/middleware/authenticate.js`)

```javascript
export const authenticate = async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  // 2. Verify token
  const decoded = verifyAccessToken(token);
  
  // 3. Get user from database
  const user = await User.findById(decoded.userId).populate('role');
  
  // 4. Attach user to request
  req.user = user;
  next();
}
```

**Flow:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiration
3. Gets user from database
4. Attaches user object to `req.user` for use in controllers
5. Calls `next()` to continue to next middleware/route

**Used in:**
- All protected routes (users, roles, admin, etc.)
- Applied before route handlers

---

## 2. RBAC/Permission Flow

### Overview
The RBAC (Role-Based Access Control) system determines what actions a user can perform based on their role and permissions.

### Permission Resolution Flow

#### Step 1: User Permissions Structure

A user can have permissions from three sources:
1. **Role permissions** - Permissions assigned to their role
2. **Permissions override** - Individual permissions added/removed
3. **Super admin** - All permissions (`*`)

#### Step 2: Permission Resolution (`server/src/utils/permissions.js`)

```javascript
export const resolveUserPermissions = async (user, Role) => {
  // 1. Check if super admin
  if (user.isSuperAdmin) {
    return ['*']; // All permissions
  }
  
  // 2. Get role permissions
  let permissions = [];
  if (user.role) {
    const roleDoc = await Role.findById(user.role).lean();
    if (roleDoc) {
      permissions = [...roleDoc.permissions];
      
      // If role has '*', user has all permissions
      if (permissions.includes('*')) {
        return ['*'];
      }
    }
  }
  
  // 3. Add/override with permissionsOverride
  const overrideSet = new Set(permissions);
  user.permissionsOverride.forEach((perm) => {
    if (perm === '*') {
      return ['*'];
    }
    overrideSet.add(perm);
  });
  
  return Array.from(overrideSet);
}
```

**Resolution Order:**
1. **Super Admin Check**: If `isSuperAdmin = true`, return `['*']` (all permissions)
2. **Role Permissions**: Get permissions from assigned role
3. **Override Check**: If role has `*`, return all permissions
4. **Permissions Override**: Merge role permissions with `permissionsOverride` array
5. **Return**: Final array of effective permissions

**Example:**
```
User has:
- Role: "manager" with permissions: ['user.read', 'user.create']
- permissionsOverride: ['user.delete', 'report.view']

Result: ['user.read', 'user.create', 'user.delete', 'report.view']
```

#### Step 3: Permission Checking (`server/src/utils/permissions.js`)

```javascript
export const hasPermission = (userPermissions, requiredPermissions) => {
  // If user has '*', they have all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];
  
  // Check if user has all required permissions
  return required.every((perm) => userPermissions.includes(perm));
}
```

**Logic:**
- If user has `*`, return `true` (has all permissions)
- Check if user's permissions include all required permissions
- Returns `true` if user has permission, `false` otherwise

### Authorization Middleware Flow

#### Step 1: Authorization Middleware (`server/src/middleware/authorize.js`)

```javascript
export const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    // 1. Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    // 2. Resolve user's effective permissions
    const userPermissions = await resolveUserPermissions(req.user, Role);
    
    // 3. Check if user has required permissions
    if (!hasPermission(userPermissions, requiredPermissions)) {
      throw new AppError('You do not have permission', 403);
    }
    
    // 4. Attach permissions to request
    req.userPermissions = userPermissions;
    next();
  };
}
```

**Flow:**
1. **Check Authentication**: Ensures `req.user` exists (from authenticate middleware)
2. **Resolve Permissions**: Gets user's effective permissions
3. **Check Permission**: Verifies user has required permission(s)
4. **Allow/Deny**: 
   - If authorized: Attach permissions to request and call `next()`
   - If not authorized: Throw 403 error

**Usage Example:**
```javascript
// Route requires 'user.read' permission
router.get('/users', 
  authenticate,           // First: verify token
  authorize('user.read'), // Then: check permission
  getAllUsers            // Finally: execute controller
);
```

### Frontend Permission Flow

#### Step 1: Permission Helpers (`client/src/utils/permissions.js`)

```javascript
export const can = (userPermissions, permission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  // If user has '*', they have all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  return userPermissions.includes(permission);
};

export const canAny = (userPermissions, permissions) => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return permissions.some((perm) => userPermissions.includes(perm));
};
```

**Functions:**
- `can()`: Check if user has a specific permission
- `canAny()`: Check if user has any of the provided permissions
- `canAll()`: Check if user has all of the provided permissions

#### Step 2: Protected Routes (`client/src/components/auth/ProtectedRoute.jsx`)

```javascript
const ProtectedRoute = ({ children, requiredPermissions }) => {
  const { isAuthenticated, permissions, loading } = useAuth();
  
  // 1. Check if loading
  if (loading) return <Loading />;
  
  // 2. Check if authenticated
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // 3. Check permissions
  if (requiredPermissions) {
    const hasPermission = canAny(permissions, requiredPermissions);
    if (!hasPermission) {
      return <AccessDenied />;
    }
  }
  
  // 4. Render children
  return children;
}
```

**Flow:**
1. Check if auth is loading
2. Redirect to login if not authenticated
3. Check if user has required permissions
4. Show access denied or render protected content

#### Step 3: Conditional Rendering (`client/src/components/auth/RequirePermission.jsx`)

```javascript
const RequirePermission = ({ children, permission, fallback = null }) => {
  const { permissions } = useAuth();
  const hasPermission = can(permissions, permission);
  
  if (!hasPermission) {
    return fallback; // Usually null (hides element)
  }
  
  return children; // Shows element
}
```

**Usage:**
```jsx
<RequirePermission permission="user.create">
  <Button>Create User</Button>
</RequirePermission>

// Button only shows if user has 'user.create' permission
```

#### Step 4: Permission Checks in Components

```javascript
// In Users.jsx
const Users = () => {
  const { permissions } = useAuth();
  
  // Show button only if user has permission
  {can(permissions, 'user.create') && (
    <Button onClick={handleCreate}>Create User</Button>
  )}
  
  // Show manage button only if user has permission
  {can(permissions, 'admin.manage') && (
    <Button onClick={handleManageAccess}>Manage Access</Button>
  )}
}
```

---

## Complete Request Flow Example

### Example: User tries to access `/api/users`

```
1. Frontend Request
   └─> api.get('/users')
       └─> Axios interceptor adds: Authorization: Bearer <token>

2. Backend Route
   └─> GET /api/users
       └─> authenticate middleware
           ├─> Extract token from header
           ├─> Verify token
           ├─> Get user from DB
           └─> Attach to req.user
       └─> authorize('user.read') middleware
           ├─> Resolve user permissions
           ├─> Check if user has 'user.read'
           └─> Allow or deny (403)
       └─> getAllUsers controller
           ├─> Fetch users from DB
           └─> Return response

3. Frontend Response
   └─> Receive users data
       └─> Update React state
       └─> Render in UI
```

### Example: User tries to create a new user

```
1. Frontend Action
   └─> User clicks "Create User" button
       └─> Opens modal form
       └─> User fills form and submits
       └─> authAPI.register({ name, email, password })

2. Backend Processing
   └─> POST /api/auth/register
       └─> Validation middleware
           └─> Check name, email, password format
       └─> register controller
           ├─> Check if user exists
           ├─> Hash password (bcrypt)
           ├─> Create user in DB
           ├─> Generate tokens
           ├─> Resolve permissions
           └─> Return user + tokens

3. Frontend Update
   └─> Receive new user data
       └─> Refresh users list
       └─> Close modal
       └─> Show success message
```

---

## Key Files and Their Roles

### Frontend Files

| File | Purpose |
|------|---------|
| `context/AuthContext.jsx` | Manages authentication state, login/logout, token storage |
| `services/api.js` | Axios instance with token interceptors, API functions |
| `utils/permissions.js` | Permission checking helpers (can, canAny, canAll) |
| `components/auth/ProtectedRoute.jsx` | Route guard - checks auth and permissions |
| `components/auth/RequirePermission.jsx` | Conditional rendering based on permissions |
| `pages/Login.jsx` | Login form and authentication UI |

### Backend Files

| File | Purpose |
|------|---------|
| `controllers/authController.js` | Login, register, refresh token logic |
| `middleware/authenticate.js` | JWT token verification, user attachment |
| `middleware/authorize.js` | Permission checking middleware |
| `utils/permissions.js` | Permission resolution and checking logic |
| `config/jwt.js` | Token generation and verification |
| `models/User.js` | User schema with password hashing |
| `models/Role.js` | Role schema with permissions array |

---

## Permission System Details

### Permission Format
Permissions are strings in format: `resource.action`

**Examples:**
- `user.read` - Can view users
- `user.create` - Can create users
- `user.update` - Can edit users
- `user.delete` - Can delete users
- `report.view` - Can view reports
- `report.download` - Can download reports
- `billing.view` - Can view billing
- `billing.manage` - Can manage billing
- `admin.manage` - Can manage access control
- `*` - All permissions (super admin)

### Permission Hierarchy

1. **Super Admin** (`isSuperAdmin: true`)
   - Has `['*']` permissions
   - Can do everything
   - Bypasses all permission checks

2. **Role Permissions**
   - Permissions assigned to a role
   - All users with that role get those permissions
   - Can include `*` for role-level super admin

3. **Permissions Override**
   - Individual permissions added to a user
   - Merged with role permissions
   - Can add permissions not in role
   - Can override role permissions

### Permission Resolution Example

```
User Configuration:
- Role: "manager" with permissions: ['user.read', 'user.create']
- permissionsOverride: ['user.delete', 'report.view']
- isSuperAdmin: false

Resolution Process:
1. Check isSuperAdmin → false, continue
2. Get role permissions → ['user.read', 'user.create']
3. Check for '*' in role → not found, continue
4. Merge with override → ['user.read', 'user.create', 'user.delete', 'report.view']
5. Return final permissions

Result: ['user.read', 'user.create', 'user.delete', 'report.view']
```

---

## Error Handling Flow

### Authentication Errors

1. **Invalid Token** (401)
   - Frontend interceptor catches 401
   - Attempts token refresh
   - If refresh fails → logout and redirect to login

2. **Expired Token** (401)
   - Same as invalid token
   - Automatic refresh attempt

3. **No Token** (401)
   - Redirect to login page
   - Show login form

### Authorization Errors

1. **Missing Permission** (403)
   - Backend: Returns 403 error
   - Frontend: Shows "Access Denied" message
   - UI: Hides protected elements

2. **Route Protection**
   - If user lacks permission for route
   - Shows access denied page
   - Doesn't redirect (stays on page)

---

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration**: Access tokens expire quickly (15min), refresh tokens longer (7days)
3. **Password Hashing**: Bcrypt with salt rounds
4. **Permission Checks**: Both frontend (UI) and backend (API) validation
5. **Super Admin**: Special flag that bypasses all checks
6. **Token Refresh**: Automatic refresh on 401 errors

---

## Summary

**Authentication Flow:**
1. User logs in → API call → Backend verifies → Returns tokens
2. Tokens stored in localStorage
3. Every API request includes token in header
4. Backend verifies token on each request
5. Token refresh happens automatically

**RBAC Flow:**
1. User permissions resolved from role + overrides
2. Backend checks permissions before allowing actions
3. Frontend checks permissions before showing UI elements
4. Super admin bypasses all checks
5. Permission format: `resource.action`

Both systems work together to provide secure, role-based access control throughout the application.

