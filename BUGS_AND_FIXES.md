# Bugs and Fixes Documentation

This document tracks all the bugs, issues, and mistakes encountered during the development and debugging of the Notes App (FastAPI + React).

---

## Table of Contents
1. [CORS Configuration Issues](#1-cors-configuration-issues)
2. [Security Vulnerabilities](#2-security-vulnerabilities)
3. [Data Model Issues](#3-data-model-issues)
4. [Backend Server Issues](#4-backend-server-issues)
5. [Frontend Error Handling](#5-frontend-error-handling)
6. [Routing and Authentication Issues](#6-routing-and-authentication-issues)

---

## 1. CORS Configuration Issues

### Bug #1.1: CORS Only Allowed Port 5173
**Location:** `backend/apps/main.py`

**Problem:**
- Backend CORS middleware only allowed `http://localhost:5173`
- Frontend was running on `http://localhost:5174`
- Result: CORS policy blocked all API requests from the frontend

**Error Message:**
```
Access to fetch at 'http://localhost:8000/auth/login' from origin 'http://localhost:5174' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Fix:**
```python
# Before
allow_origins=["http://localhost:5173"]

# After
allow_origins=["http://localhost:5173", "http://localhost:5174"]
```

**Lesson Learned:**
- Always configure CORS to allow the actual frontend port
- Consider using environment variables for allowed origins
- Test with the actual frontend port, not just the default

---

## 2. Security Vulnerabilities

### Bug #2.1: Login Route Used User-Provided Role Instead of Database Role
**Location:** `backend/apps/route_auth.py` (line 34)

**Problem:**
- Login endpoint accepted `role` field from user input
- Used `user.role` from request body instead of `db_user["role"]` from database
- **CRITICAL SECURITY ISSUE:** Users could potentially escalate their privileges by providing a different role

**Code Before:**
```python
@router.post("/login")
def login_user(user: LoginUser):
    db_user = user_collection.find_one({"email": user.email})
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},  # ❌ WRONG: Using user input
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}
```

**Code After:**
```python
@router.post("/login")
def login_user(user: LoginUser):
    db_user = user_collection.find_one({"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get role from database, default to "user" if not present
    user_role = db_user.get("role", "user")  # ✅ CORRECT: Using database value
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user_role},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user_role}
```

**Lesson Learned:**
- **NEVER trust user input for authorization/authentication**
- Always retrieve sensitive data (like roles) from the database
- Use `.get()` with default values to prevent KeyError exceptions

---

## 3. Data Model Issues

### Bug #3.1: LoginUser Model Had Unnecessary Role Field
**Location:** `backend/apps/models.py`

**Problem:**
- `LoginUser` model included a `role` field
- Users shouldn't provide their role during login
- Role should come from the database, not user input
- Frontend was sending role field unnecessarily

**Code Before:**
```python
class LoginUser(BaseModel):
    email: EmailStr
    password: str
    role: str  # ❌ Unnecessary and insecure
```

**Code After:**
```python
class LoginUser(BaseModel):
    email: EmailStr
    password: str
    # ✅ Removed role field - it comes from database
```

**Impact:**
- Simplified the login process
- Removed potential security risk
- Frontend no longer needs to send role field

---

### Bug #3.2: CreateUser Model Had Unnecessary Role Field
**Location:** `backend/apps/models.py`

**Problem:**
- `CreateUser` model included a `role` field
- Backend always sets role to "user" during registration anyway
- Frontend signup form didn't send role field
- Created inconsistency between model and actual usage

**Code Before:**
```python
class CreateUser(BaseModel):
    email: EmailStr
    password: str
    role: str  # ❌ Unnecessary - always set to "user" in backend
```

**Code After:**
```python
class CreateUser(BaseModel):
    email: EmailStr
    password: str
    # ✅ Removed - backend sets role to "user" automatically
```

**Backend Registration Code:**
```python
user_collection.insert_one({
    "email": user.email,
    "password": hash_password(user.password),
    "role": "user"  # Always set to "user" regardless of input
})
```

---

### Bug #3.3: Login Response Missing Role Field
**Location:** `backend/apps/route_auth.py`

**Problem:**
- Login endpoint didn't return the user's role in the response
- Frontend `AuthContext` expected `data.role` to store in localStorage
- Result: Role was `null` in frontend, causing authentication issues

**Code Before:**
```python
return {"access_token": access_token, "token_type": "bearer"}
```

**Code After:**
```python
return {
    "access_token": access_token, 
    "token_type": "bearer", 
    "role": user_role  # ✅ Added role to response
}
```

**Frontend Usage:**
```typescript
setAuth(data.access_token, data.role); // Needs role from response
```

---

## 4. Backend Server Issues

### Bug #4.1: Multiple Uvicorn Processes Running
**Location:** System processes

**Problem:**
- Multiple uvicorn processes were running simultaneously
- Caused port conflicts and inconsistent behavior
- Some requests went to old server instance, some to new

**Symptoms:**
- CORS errors even after fixing CORS configuration
- 500 Internal Server Errors
- Inconsistent API responses

**Fix:**
```bash
# Kill all uvicorn processes
pkill -f "uvicorn apps.main:app"

# Restart cleanly
cd backend
source venv/bin/activate
uvicorn apps.main:app --reload --host 0.0.0.0 --port 8000
```

**Lesson Learned:**
- Always check for running processes before starting a new server
- Use process managers or proper service management
- Check `ps aux | grep uvicorn` to see running instances

---

### Bug #4.2: Missing Error Handling for Missing Role Field
**Location:** `backend/apps/route_auth.py`

**Problem:**
- Code accessed `db_user["role"]` directly
- If a user document didn't have a role field, it would raise `KeyError`
- Result: 500 Internal Server Error instead of graceful handling

**Code Before:**
```python
if not db_user or not verify_password(user.password, db_user["password"]):
    raise HTTPException(status_code=401, detail="Invalid credentials")

access_token = create_access_token(
    data={"sub": user.email, "role": db_user["role"]},  # ❌ KeyError if role missing
    expires_delta=timedelta(minutes=30)
)
```

**Code After:**
```python
if not db_user:
    raise HTTPException(status_code=401, detail="Invalid credentials")

if not verify_password(user.password, db_user.get("password", "")):
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Get role from database, default to "user" if not present
user_role = db_user.get("role", "user")  # ✅ Safe access with default

access_token = create_access_token(
    data={"sub": user.email, "role": user_role},
    expires_delta=timedelta(minutes=30)
)
```

**Lesson Learned:**
- Always use `.get()` method for dictionary access when field might be missing
- Provide sensible defaults for optional fields
- Separate validation checks for better error messages

---

## 5. Frontend Error Handling

### Bug #5.1: Poor Error Handling in Login Component
**Location:** `note_app/src/auth/Login.tsx`

**Problem:**
- Tried to parse JSON even when response wasn't JSON (network errors, 500 errors)
- Generic error message didn't help debug issues
- No distinction between network errors and API errors

**Code Before:**
```typescript
try {
  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();  // ❌ Crashes if response isn't JSON

  if (!res.ok) {
    setError(data.detail || "Login failed");
    return;
  }

  setAuth(data.access_token, data.role);
  navigate("/dashboard");
} catch {
  setError("Server not reachable");  // ❌ Too generic
}
```

**Code After:**
```typescript
try {
  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // Check if response is ok before trying to parse JSON
  if (!res.ok) {
    let errorMessage = "Login failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If response isn't JSON, use status text
      errorMessage = res.statusText || `Server error (${res.status})`;
    }
    setError(errorMessage);
    return;
  }

  // Parse successful response
  const data = await res.json();
  
  if (!data.access_token) {
    setError("Invalid response from server");
    return;
  }

  setAuth(data.access_token, data.role || "user");
  navigate("/dashboard");
} catch (err) {
  if (err instanceof TypeError && err.message.includes("fetch")) {
    setError("Cannot connect to server. Please check if the backend is running on http://localhost:8000");
  } else {
    setError("An unexpected error occurred. Please try again.");
  }
  console.error("Login error:", err);
}
```

**Improvements:**
- ✅ Handles non-JSON error responses
- ✅ Provides specific error messages
- ✅ Distinguishes between network errors and API errors
- ✅ Validates response structure before using it

---

### Bug #5.2: Login UI Was Basic and Inconsistent
**Location:** `note_app/src/auth/Login.tsx`

**Problem:**
- Login form had minimal styling
- Didn't match the polished Signup page design
- Poor user experience

**Fix:**
- Redesigned to match Signup page with:
  - Card layout with shadow
  - Proper labels and spacing
  - Styled error message display (red alert box)
  - "Welcome Back" heading
  - Link to signup page
  - Improved input styling with focus states

**Before:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <form onSubmit={handleSubmit}>
    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
    <button type="submit">Login</button>
  </form>
  {error && <p>{error}</p>}
</div>
```

**After:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
    <p className="text-center text-gray-600 mb-6">Sign in to your account to continue</p>
    {/* ... styled form with proper error display ... */}
  </div>
</div>
```

---

## 6. Routing and Authentication Issues

### Bug #6.1: Infinite Redirect Loop in RoleRoute
**Location:** `note_app/src/auth/RoleRoute.tsx`

**Problem:**
- `RoleRoute` redirected unauthorized users to `/dashboard`
- But `/dashboard` itself was protected by `RoleRoute` with `allowedRoles={["admin"]}`
- Regular users (role: "user") would:
  1. Try to access `/dashboard`
  2. Get rejected by `RoleRoute` (not admin)
  3. Get redirected to `/dashboard` (infinite loop!)
  4. Page shows white/blank screen

**Code Before:**
```typescript
export default function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { role, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;  // ❌ INFINITE LOOP!
  }

  return children;
}
```

**Code After:**
```typescript
export default function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { role, loading, isLoggedIn } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If role doesn't match allowed roles, redirect to home
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;  // ✅ Redirect to home, not dashboard
  }

  return children;
}
```

**Lesson Learned:**
- Never redirect to a route that has the same protection
- Always redirect to a "safe" route (like home or login)
- Consider the full routing flow when designing redirects

---

### Bug #6.2: Dashboard Route Used Wrong Protection
**Location:** `note_app/src/App.tsx`

**Problem:**
- Dashboard route was protected by `RoleRoute` with `allowedRoles={["admin"]}`
- This meant only admin users could access dashboard
- Regular users should also be able to access dashboard
- Should use `ProtectedRoute` instead (checks if logged in, not role)

**Code Before:**
```tsx
<Route
  path='/dashboard'
  element={
    <RoleRoute allowedRoles={["admin"]}>  {/* ❌ Only admins can access */}
      <Dashboard />
    </RoleRoute>
  }
/>
```

**Code After:**
```tsx
<Route
  path='/dashboard'
  element={
    <ProtectedRoute>  {/* ✅ Any logged-in user can access */}
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Note:** If you need admin-only features in the dashboard, handle that inside the Dashboard component itself:
```tsx
{role === "admin" && (
  <button onClick={deleteAllNotes}>Delete All Notes</button>
)}
```

---

## Summary of Key Lessons

1. **Security First:**
   - Never trust user input for authorization
   - Always retrieve roles/permissions from the database
   - Validate all inputs server-side

2. **Error Handling:**
   - Use `.get()` for dictionary access with defaults
   - Handle both JSON and non-JSON error responses
   - Provide specific, helpful error messages

3. **CORS Configuration:**
   - Match allowed origins with actual frontend ports
   - Test with the actual ports being used

4. **Routing Logic:**
   - Avoid redirect loops by redirecting to "safe" routes
   - Use appropriate route protection (ProtectedRoute vs RoleRoute)
   - Consider the full authentication flow

5. **Server Management:**
   - Check for running processes before starting new ones
   - Use proper process management
   - Restart cleanly when making configuration changes

6. **Data Models:**
   - Only include fields that users should provide
   - Don't expose internal fields (like roles) in user input models
   - Keep models consistent with actual usage

---

## Testing Checklist

After fixing these issues, verify:
- [x] CORS allows requests from frontend port
- [x] Login works for both admin and regular users
- [x] Role is correctly retrieved from database
- [x] Dashboard is accessible to all logged-in users
- [x] Error messages are helpful and specific
- [x] No infinite redirect loops
- [x] UI is consistent across pages

---

**Last Updated:** January 19, 2026
**Total Bugs Fixed:** 10

