# Testing Guide - TipsterPro MVP

Complete step-by-step guide to test your application.

## Prerequisites

- Node.js installed
- Docker installed (for PostgreSQL)
- Git repository cloned

---

## Step 1: Start PostgreSQL Database

```bash
# From project root
docker-compose up -d

# Verify it's running
docker-compose ps
```

**Expected output:** `tipster-postgres` should be running on port 5432

---

## Step 2: Setup Backend Database

```bash
cd backend

# Run Prisma migrations
npx prisma migrate dev --name init

# OR if migrations don't work
npx prisma db push
npx prisma generate

# Seed the database (optional - creates a test tipster)
npx prisma db seed
```

**Expected output:** Tables created: User, Tipster, Tip

---

## Step 3: Start Backend Server

```bash
# Still in /backend directory
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3000
```

**Leave this terminal running!**

---

## Step 4: Test Backend API (Optional)

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

**Expected response:** `{"status":"ok"}`

---

## Step 5: Start Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies if not done yet
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173/
```

---

## Step 6: Test Complete User Journey

### 6.1 Open Browser

Navigate to: **http://localhost:5173**

### 6.2 Register a New User

1. Click **"Sign up"** button in navbar
2. Fill out the registration form:
   - **Username:** `testuser`
   - **Email:** `test@example.com`
   - **Password:** `password123`
   - **Birth Date:** Choose a date that makes you 18+ (e.g., `2000-01-01`)
3. Click **"Sign up"**

**Expected result:**
- ✅ Redirected to `/dashboard`
- ✅ Navbar shows "Hi, testuser" and "Dashboard" link
- ✅ "Logout" button visible

**Error cases to test:**
- Try registering with age < 18 → Should show error "You must be at least 18 years old"
- Try same email again → Should show "Email already registered"

---

### 6.3 Test Logout

1. Click **"Logout"** in navbar

**Expected result:**
- ✅ Redirected to home page
- ✅ Navbar shows "Login" and "Sign up" buttons
- ✅ Token removed from localStorage

---

### 6.4 Test Login

1. Click **"Login"**
2. Enter credentials:
   - **Email:** `test@example.com`
   - **Password:** `password123`
3. Click **"Sign in"**

**Expected result:**
- ✅ Redirected to `/dashboard`
- ✅ User logged in successfully

**Error case to test:**
- Wrong password → Should show "Invalid email or password"

---

### 6.5 View Homepage

1. Click **"Home"** in navbar

**Expected result:**
- ✅ See "Welcome to TipsterPro" heading
- ✅ See "Recent Tips" section
- ✅ If no tips: "No tips yet. Be the first to publish!"

---

### 6.6 Test Protected Routes

1. Logout (if logged in)
2. Try to access: **http://localhost:5173/dashboard**

**Expected result:**
- ✅ Automatically redirected to `/login`

---

## Backend API Endpoints to Test (using curl or Postman)

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "birthDate": "1995-06-15"
  }'
```

**Save the token from response!**

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get All Tips (Public)
```bash
curl http://localhost:3000/api/tips
```

### Create Tipster Profile (Protected)
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3000/api/tipsters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "displayName": "BetMaster Pro",
    "bio": "Expert NBA tipster with 10 years experience"
  }'
```

### Create a Tip (Protected - requires tipster profile)
```bash
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event": "Lakers vs Warriors - NBA",
    "prediction": "Lakers to win",
    "odds": 2.15,
    "explanation": "Lakers strong at home, Warriors missing key players"
  }'
```

---

## Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Check if Docker is running
docker-compose ps

# Restart Docker
docker-compose down
docker-compose up -d
```

### Port Already in Use

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in backend/.env
PORT=3001
```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npx prisma generate
```

### Frontend Build Errors

**Error:** Module not found

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Register new user | ✅ Auto-login → Dashboard |
| Login | ✅ Redirect to Dashboard |
| Logout | ✅ Redirect to Home, show login buttons |
| Access /dashboard without auth | ✅ Redirect to /login |
| View homepage | ✅ Show all tips from database |
| Backend health check | ✅ `{"status":"ok"}` |

---

## What to Test Next

Once basic authentication works:

1. **Create tipster profile** in Dashboard
2. **Publish a tip** as a tipster
3. **View tips** on Homepage
4. **Edit/Delete tips** (once UI is built)
5. **Browse tipsters** (once page is built)

---

## Database Inspection

View database contents with Prisma Studio:

```bash
cd backend
npx prisma studio
```

Opens at: **http://localhost:5555**

You can:
- View all users, tipsters, and tips
- Manually add/edit/delete data
- Verify relationships

---

## Clean Start (Reset Everything)

```bash
# Stop and remove database
docker-compose down -v

# Start fresh
docker-compose up -d
cd backend
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

Happy testing! 🚀
