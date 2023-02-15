import React, { useState, useEffect, createContext } from 'react'
import { auth, onAuthStateChanged } from '../config/firebase'
import { User as FirebaseUser } from 'firebase/auth'

export const AuthContext = createContext<FirebaseUser | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * @name AuthProvider
 * @description This component is used to monitor the auth state and set the
 * user in the context to be used by children components.
 * @param {AuthProviderProps}
 */
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  useEffect(() => {
    // Monitor the auth state with onAuthStateChanged
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      }
    })
    return () => {}
  }, [])
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export default AuthProvider
