import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('jatayu_token')
    const u = localStorage.getItem('jatayu_user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  const login = (tokenVal, userData) => {
    localStorage.setItem('jatayu_token', tokenVal)
    localStorage.setItem('jatayu_user', JSON.stringify(userData))
    setToken(tokenVal)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('jatayu_token')
    localStorage.removeItem('jatayu_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
