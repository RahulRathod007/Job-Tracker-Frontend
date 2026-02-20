// import { createContext, useState, useEffect, useContext } from 'react'

// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [isReady, setIsReady] = useState(false)

//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem('jp_user')
//       if (stored) setUser(JSON.parse(stored))
//     } catch {}
//     setIsReady(true)
//   }, [])

//   const loginUser = (userData) => {
//     localStorage.setItem('jp_user', JSON.stringify(userData))
//     setUser(userData)
//   }

//   // Update user data in context + localStorage (e.g. after file upload)
//   const updateUser = (updatedData) => {
//     const merged = { ...user, ...updatedData }
//     localStorage.setItem('jp_user', JSON.stringify(merged))
//     setUser(merged)
//   }

//   const logout = () => {
//     localStorage.removeItem('jp_user')
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, loginUser, updateUser, logout, isReady }}>
//       {isReady ? children : null}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)


import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

// Synchronous read — prevents the "user is null for 1 frame" flash
function loadUser() {
  try {
    const s = localStorage.getItem('jp_user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)   // lazy initializer, runs once synchronously

  function loginUser(data) {
    localStorage.setItem('jp_user', JSON.stringify(data))
    setUser(data)
  }

  function updateUser(partial) {
    setUser(prev => {
      const next = { ...prev, ...partial }
      localStorage.setItem('jp_user', JSON.stringify(next))
      return next
    })
  }

  function logout() {
    localStorage.removeItem('jp_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)