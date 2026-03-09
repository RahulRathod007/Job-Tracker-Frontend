import { createContext, useState, useEffect, useContext, useCallback } from 'react'

const AuthContext = createContext()
const USER_KEY    = 'jp_user'

const loadUser    = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } }
const persistUser = (u) => { if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY) }
const toInfo = (r) => ({ userId: r.userId, name: r.name, email: r.email, role: r.role, profilePicture: r.profilePicture, cvFilename: r.cvFilename })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  useEffect(() => {
    const onExpired   = () => { ['jp_at','jp_rt',USER_KEY].forEach(k => localStorage.removeItem(k)); setUser(null) }
    const onRefreshed = (e) => {
      localStorage.setItem('jp_at', e.detail.accessToken)
      localStorage.setItem('jp_rt', e.detail.refreshToken)
      const info = { ...loadUser(), ...toInfo(e.detail) }
      setUser(info); persistUser(info)
    }
    window.addEventListener('jp:session-expired',  onExpired)
    window.addEventListener('jp:tokens-refreshed', onRefreshed)
    return () => {
      window.removeEventListener('jp:session-expired',  onExpired)
      window.removeEventListener('jp:tokens-refreshed', onRefreshed)
    }
  }, [])

  // ← THIS is the key fix: saves tokens to localStorage on every login/register/google
  const loginUser = useCallback((authResponse) => {
    localStorage.setItem('jp_at', authResponse.accessToken)
    localStorage.setItem('jp_rt', authResponse.refreshToken)
    const info = toInfo(authResponse)
    setUser(info)
    persistUser(info)
  }, [])

  const updateUser = useCallback((partial) => {
    setUser(prev => { const next = { ...prev, ...partial }; persistUser(next); return next })
  }, [])

  const logout = useCallback(() => {
    ['jp_at','jp_rt',USER_KEY].forEach(k => localStorage.removeItem(k))
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)