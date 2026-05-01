import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi, userApi } from "@/api/endpoints"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const data = await userApi.me()
      setUser(data)
    } catch {
      setUser(null)
      localStorage.removeItem("token")
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const { access_token } = await authApi.login(username, password)
    localStorage.setItem("token", access_token)
    await refreshUser()
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
