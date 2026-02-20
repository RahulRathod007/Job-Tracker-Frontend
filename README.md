# JobPortal Frontend

A stunning, production-grade React frontend for the Spring Boot JobPortal backend.

## Tech Stack
- **React 18** + Vite
- **React Router v6** (client-side routing)
- **Axios** (API calls)
- **Bootstrap 5.3** (grid & utilities via CDN)
- **Bootstrap Icons** (via CDN)
- **Google Fonts**: Syne + DM Sans
- **Custom CSS** with CSS Variables (dark editorial theme)

## Project Structure
```
src/
├── components/
│   ├── Navbar.jsx          # Sticky glassmorphism navbar
│   ├── Footer.jsx          # Minimal footer
│   ├── JobCard.jsx         # Animated job listing card
│   ├── Spinner.jsx         # Loading state
│   └── ProtectedRoute.jsx  # Auth guard (available but unused in routes)
├── context/
│   └── AuthContext.jsx     # Global auth state (localStorage)
├── pages/
│   ├── Home.jsx            # Landing with hero + features
│   ├── Jobs.jsx            # Browse + search by location
│   ├── JobDetail.jsx       # Full job view + apply button
│   ├── Login.jsx           # Sign in form
│   ├── Register.jsx        # Register with role toggle
│   ├── Dashboard.jsx       # Role-based dashboard
│   ├── PostJob.jsx         # Employer job posting form
│   └── MyApplications.jsx  # Jobseeker applications tracker
├── services/
│   └── api.js              # Axios instance + all API calls
├── App.jsx                 # Routes
├── main.jsx                # Entry point
└── index.css               # Full design system (dark theme)
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Spring Boot backend running on `http://localhost:8080`

### 2. Install & Run
```bash
cd jobportal-frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 3. Backend CORS
Your backend already has `@CrossOrigin("*")` on all controllers — no changes needed.

## Backend Endpoints Used

| Method | URL | Used By |
|--------|-----|---------|
| POST | `/api/auth/register` | Register page |
| POST | `/api/auth/login` | Login page |
| GET | `/api/jobs/all` | Jobs page, JobDetail page |
| GET | `/api/jobs/search/{location}` | Jobs search |
| POST | `/api/jobs/post/{employerId}` | PostJob page |
| PUT | `/api/jobs/update/{id}` | (available via API service) |
| DELETE | `/api/jobs/delete/{id}` | (available via API service) |
| POST | `/api/applications/apply/{jobId}/{userId}` | JobDetail apply button |

## Missing Backend Endpoint (Optional)

**My Applications page** needs:
```
GET /api/applications/user/{userId}
```

Add to `ApplicationController.java`:
```java
@GetMapping("/user/{userId}")
public List<Application> getUserApplications(@PathVariable Integer userId) {
    return appRepo.findByJobSeekerId(userId);
}
```

And add to `ApplicationRepository.java`:
```java
List<Application> findByJobSeekerId(Integer jobSeekerId);
```

Then uncomment the API call in `src/pages/MyApplications.jsx`.

## Notes
- `getJobById` endpoint doesn't exist in backend → JobDetail fetches all jobs and finds locally.
- No JWT auth — userId stored in localStorage as a simple token (replace with real JWT later).
- Passwords are stored in plaintext in the backend — add BCrypt hashing for production.
