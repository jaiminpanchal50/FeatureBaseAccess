# How to Generate JWT Secrets

## Quick Method (Recommended)

### Using OpenSSL (Available on Linux, macOS, and Windows with Git Bash)

1. **Generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   This will output something like: `xK9mP2vQ7wR4tY8uI3oP6aS9dF1gH4jK7lM0nO2pQ5rT8=`

2. **Generate JWT_REFRESH_SECRET (different value):**
   ```bash
   openssl rand -base64 32
   ```
   This will output a different value like: `aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6=`

### Using Node.js (Alternative Method)

If you have Node.js installed, you can also use:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run it twice to get two different secrets.

### Using Online Generator (Less Secure - Use Only for Development)

You can use online tools like:
- https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
- https://generate-secret.vercel.app/32

⚠️ **Warning:** Only use online generators for development/testing. For production, always generate secrets locally.

## Where to Put the Secrets

1. **Navigate to your server folder:**
   ```bash
   cd server
   ```

2. **Create or edit the `.env` file:**
   ```bash
   nano .env
   # or
   code .env
   # or use any text editor
   ```

3. **Add the generated secrets:**
   ```env
   JWT_SECRET=xK9mP2vQ7wR4tY8uI3oP6aS9dF1gH4jK7lM0nO2pQ5rT8=
   JWT_REFRESH_SECRET=aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6=
   ```

## Step-by-Step Example

### On Linux/macOS:

```bash
# 1. Go to server directory
cd /home/tms/Desktop/FeatureBaseAccess/server

# 2. Generate first secret
openssl rand -base64 32
# Copy the output (e.g., xK9mP2vQ7wR4tY8uI3oP6aS9dF1gH4jK7lM0nO2pQ5rT8=)

# 3. Generate second secret (different one)
openssl rand -base64 32
# Copy the output (e.g., aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6=)

# 4. Create/edit .env file
nano .env

# 5. Paste your secrets:
# JWT_SECRET=xK9mP2vQ7wR4tY8uI3oP6aS9dF1gH4jK7lM0nO2pQ5rT8=
# JWT_REFRESH_SECRET=aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6=

# 6. Save and exit (Ctrl+X, then Y, then Enter in nano)
```

### On Windows (PowerShell):

```powershell
# 1. Go to server directory
cd C:\Users\YourName\Desktop\FeatureBaseAccess\server

# 2. Generate secrets using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy the output

# 3. Run again for second secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy the output

# 4. Create/edit .env file (use Notepad or VS Code)
notepad .env
# or
code .env

# 5. Add your secrets to the file
```

### On Windows (Git Bash):

```bash
# Same as Linux/macOS
cd /c/Users/YourName/Desktop/FeatureBaseAccess/server
openssl rand -base64 32
openssl rand -base64 32
# Then edit .env file
```

## Complete .env File Example

After generating your secrets, your `server/.env` file should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rbac-admin

# JWT Configuration (Replace with your generated secrets!)
JWT_SECRET=xK9mP2vQ7wR4tY8uI3oP6aS9dF1gH4jK7lM0nO2pQ5rT8=
JWT_REFRESH_SECRET=aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6=

# Token Expiration
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

## Important Notes

1. **Never share these secrets** - They are used to sign and verify JWT tokens
2. **Use different secrets for development and production**
3. **Keep secrets long** - At least 32 characters (base64 encoding gives you ~44 characters)
4. **Never commit `.env` to Git** - It's already in `.gitignore`
5. **For production**, use environment variables from your hosting platform (Heroku, AWS, etc.)

## Verification

After setting up your `.env` file, you can verify it's working by:

```bash
cd server
npm run dev
```

If the server starts without errors, your secrets are configured correctly!

