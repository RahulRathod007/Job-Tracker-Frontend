import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

function loadUser() {
  try {
    const s = localStorage.getItem('jp_user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)   

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