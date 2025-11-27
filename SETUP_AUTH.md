# Authentication & Landing Page Setup

## Installation Required

Run this command in the Frontend directory:

```bash
cd Frontend
npm install react-router-dom
```

## What's Been Added

### 1. **Landing Page** (`Frontend/src/components/LandingPage.jsx`)
   - Beautiful hero section with animated cards
   - Features showcase
   - Call-to-action sections
   - Professional footer

### 2. **Authentication Pages**
   - **Login** (`Frontend/src/components/Auth/Login.jsx`)
   - **Signup** (`Frontend/src/components/Auth/Signup.jsx`)
   - Form validation
   - Social login buttons (GitHub, Google - UI only, needs backend)
   - Error handling

### 3. **Protected Routes**
   - Editor is now protected - requires login
   - Automatic redirect to login if not authenticated
   - User session persists in localStorage

### 4. **Updated App.jsx**
   - React Router integration
   - Authentication state management
   - Protected route wrapper
   - User menu in header with logout

## Routes

- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/editor` - Drawing editor (protected)

## Current Authentication

Currently using **mock authentication** (localStorage only):
- No backend API calls yet
- User data stored in browser localStorage
- Perfect for development and testing

## Next Steps for Production

### Backend Authentication (TODO)

1. **Create Auth Endpoints** in Backend:
   ```python
   # Backend/app/routers/auth_router.py
   POST /auth/signup
   POST /auth/login
   POST /auth/logout
   GET /auth/me
   ```

2. **Add JWT Token Support**:
   - Install: `pip install python-jose[cryptography] passlib[bcrypt]`
   - Generate tokens on login
   - Verify tokens on protected endpoints

3. **Database Integration**:
   - Add user table (SQLAlchemy/MongoDB)
   - Store hashed passwords
   - User profiles

4. **Social OAuth** (Optional):
   - GitHub OAuth
   - Google OAuth
   - Use libraries like `authlib`

### Frontend Updates (TODO)

1. **Replace Mock Auth** with real API calls:
   ```javascript
   // In Login.jsx and Signup.jsx
   const response = await fetch('http://localhost:8000/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   })
   const data = await response.json()
   localStorage.setItem('token', data.token)
   ```

2. **Add Token to API Requests**:
   ```javascript
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ```

3. **Token Refresh Logic**
4. **Password Reset Flow**
5. **Email Verification**

## Features

✅ Beautiful landing page
✅ Login/Signup forms
✅ Protected routes
✅ User session management
✅ Responsive design
✅ Smooth animations
✅ Error handling
✅ Form validation

## Testing

1. Go to `http://localhost:5173/`
2. Click "Get Started Free" or "Sign In"
3. Enter any email/password (mock auth)
4. You'll be redirected to the editor
5. Click logout to return to landing page

## Styling

All styles are in `Frontend/src/index.css`:
- Landing page styles
- Auth page styles
- Responsive breakpoints
- Animations and transitions
