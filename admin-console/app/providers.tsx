'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => void
  signIn: (email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  signIn: async () => false,
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 檢查localStorage中的用戶信息
    const savedUser = localStorage.getItem('admin_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // 簡單的模擬認證
    if (email === 'admin@linya.com' && password === 'admin123') {
      const userData = {
        id: 'admin_001',
        email: 'admin@linya.com',
        name: '管理員'
      }
      setUser(userData)
      localStorage.setItem('admin_user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}
