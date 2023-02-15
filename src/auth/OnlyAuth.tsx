import React, { useContext } from 'react'
import { AuthContext } from './AuthProvider'

// TODO: There are more interesting ways to do this, but this is the simplest
// for the current version of the Dashboard.

interface OnlyAuthProps {
  children: React.ReactNode
}

const OnlyAuth = ({ children }: OnlyAuthProps) => {
  const user = useContext(AuthContext)
  return <>{user !== null ? children : <div>Loading...</div>}</>
}

export default OnlyAuth
