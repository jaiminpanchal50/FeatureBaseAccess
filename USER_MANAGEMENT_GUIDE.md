# User Management & Permission Guide

## How to Create New Users as Admin

### Method 1: Using the UI (Recommended)

1. **Login as Admin** (email: `admin@example.com`, password: `admin123`)

2. **Go to Users Page**
   - Click on "Users" in the sidebar

3. **Click "Create User" Button**
   - Top right corner of the Users page
   - Only visible if you have `user.create` permission

4. **Fill in the Form:**
   - **Name**: User's full name
   - **Email**: User's email address (must be unique)
   - **Password**: Minimum 6 characters

5. **Click "Create User"**
   - User will be created immediately
   - They will appear in the users table

6. **Assign Permissions:**
   - Click "Manage Access" button next to the new user
   - Assign role and/or permissions as needed

### Method 2: Using API (For Developers)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

## How to Give a User Permission to Create Other Users

To allow a user to create other users and assign rights, you need to grant them specific permissions:

### Step-by-Step Process:

1. **Login as Super Admin** (or user with `admin.manage` permission)

2. **Go to Users Page**

3. **Click "Manage Access"** on the user you want to grant permissions to

4. **Grant the Following Permissions:**

   **Option A: Give Full Admin Access (Easiest)**
   - Toggle "Super Admin" ON
   - OR click "Give All Access" button
   - This gives them ALL permissions including ability to create users and manage access

   **Option B: Grant Specific Permissions (More Controlled)**
   
   In the **Users** permission group, check:
   - ✅ `user.read` - View users list
   - ✅ `user.create` - Create new users
   - ✅ `user.update` - Edit users
   - ✅ `user.delete` - Delete users

   In the **Admin** permission group, check:
   - ✅ `admin.manage` - Manage user access, assign roles, set permissions

   **Optional - If you want them to manage roles too:**
   - In the **Roles** permission group, check:
     - ✅ `role.read` - View roles
     - ✅ `role.create` - Create roles
     - ✅ `role.update` - Edit roles
     - ✅ `role.delete` - Delete roles

5. **Click "Save Changes"**

### What Permissions Are Needed?

To create users and assign rights, a user needs:

**Minimum Required:**
- `user.create` - To create new users
- `admin.manage` - To assign roles and set permissions

**Recommended (Full User Management):**
- `user.read` - View users
- `user.create` - Create users
- `user.update` - Edit users
- `user.delete` - Delete users
- `admin.manage` - Manage access control

**Optional (Role Management):**
- `role.read` - View roles
- `role.create` - Create roles
- `role.update` - Edit roles
- `role.delete` - Delete roles

## Creating a "User Manager" Role

Instead of manually assigning permissions, you can create a role with these permissions:

1. **Go to Roles Page**

2. **Click "Create Role"**

3. **Fill in:**
   - **Name**: `user-manager` (or any name)
   - **Description**: "Can create and manage users"

4. **Select Permissions:**
   - ✅ `user.read`
   - ✅ `user.create`
   - ✅ `user.update`
   - ✅ `user.delete`
   - ✅ `admin.manage`
   - ✅ `role.read` (optional)
   - ✅ `role.create` (optional)
   - ✅ `role.update` (optional)
   - ✅ `role.delete` (optional)

5. **Click "Create"**

6. **Assign this role to users** who should have user management capabilities

## Example Workflow

### Scenario: You want "John" to be able to create users and assign permissions

1. **Create John's Account:**
   - Go to Users → Create User
   - Name: John Doe
   - Email: john@example.com
   - Password: (set a password)

2. **Grant Permissions:**
   - Click "Manage Access" on John
   - Check these permissions:
     - Users: `user.read`, `user.create`, `user.update`, `user.delete`
     - Admin: `admin.manage`
   - Click "Save Changes"

3. **John can now:**
   - ✅ View all users
   - ✅ Create new users
   - ✅ Edit existing users
   - ✅ Delete users
   - ✅ Assign roles to users
   - ✅ Set permissions for users
   - ✅ Make users super admin

## Permission Hierarchy

1. **Super Admin** (`isSuperAdmin: true`)
   - Has ALL permissions automatically
   - Can do everything

2. **Admin Role** (with `admin.manage`)
   - Can manage users and access
   - Can assign roles and permissions

3. **User Manager** (with `user.create` + `admin.manage`)
   - Can create users
   - Can assign roles and permissions

4. **Regular User** (no special permissions)
   - Can only view their own profile
   - Cannot create users or manage access

## Important Notes

⚠️ **Security Considerations:**
- Only grant `admin.manage` to trusted users
- Users with `admin.manage` can grant themselves more permissions
- Super Admin has unlimited access - use carefully
- Always review permissions before granting

💡 **Best Practices:**
- Create roles for common permission sets (e.g., "User Manager", "HR Admin")
- Use roles instead of individual permission overrides when possible
- Regularly audit user permissions
- Remove permissions when users change roles

## Troubleshooting

**Q: I don't see "Create User" button**
- You need `user.create` permission
- Ask an admin to grant you this permission

**Q: I can create users but can't assign permissions**
- You need `admin.manage` permission
- Ask an admin to grant you this permission

**Q: User created but can't login**
- Check if user is active (`isActive: true`)
- Verify email and password are correct

**Q: How to remove a user's ability to create users?**
- Go to Users → Manage Access
- Uncheck `user.create` permission
- Or remove `admin.manage` if they only need to create but not manage

