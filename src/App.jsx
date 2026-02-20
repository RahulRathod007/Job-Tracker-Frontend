// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext.jsx'

// import Home           from './pages/Home.jsx'
// import Jobs           from './pages/Jobs.jsx'
// import JobDetail      from './pages/JobDetail.jsx'
// import Login          from './pages/Login.jsx'
// import Register       from './pages/Register.jsx'
// import Dashboard      from './pages/Dashboard.jsx'
// import PostJob        from './pages/PostJob.jsx'
// import Profile        from './pages/Profile.jsx'
// import MyApplications from './pages/MyApplications.jsx'

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/"                element={<Home />} />
//           <Route path="/jobs"            element={<Jobs />} />
//           <Route path="/jobs/:id"        element={<JobDetail />} />
//           <Route path="/login"           element={<Login />} />
//           <Route path="/register"        element={<Register />} />
//           <Route path="/dashboard"       element={<Dashboard />} />
//           <Route path="/post-job"        element={<PostJob />} />
//           <Route path="/profile"         element={<Profile />} />
//           <Route path="/my-applications" element={<MyApplications />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   )
// }

// export default App


import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

import Home           from './pages/Home.jsx'
import Jobs           from './pages/Jobs.jsx'
import JobDetail      from './pages/JobDetail.jsx'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import PostJob        from './pages/PostJob.jsx'
import Profile        from './pages/Profile.jsx'
import MyApplications from './pages/MyApplications.jsx'
import JobApplicants  from './pages/Jobapplicants.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/jobs"                    element={<Jobs />} />
          <Route path="/jobs/:id"                element={<JobDetail />} />
          <Route path="/jobs/:id/applicants"     element={<JobApplicants />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"                element={<Register />} />
          <Route path="/dashboard"               element={<Dashboard />} />
          <Route path="/post-job"                element={<PostJob />} />
          <Route path="/profile"                 element={<Profile />} />
          <Route path="/my-applications"         element={<MyApplications />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App