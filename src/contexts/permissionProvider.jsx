'use client'

import { createContext, useContext } from 'react'

const PermissionContext = createContext()

export const PermissionProvider = ({ children }) => {
  // Add your permission-related state and logic here
  return (
    <PermissionContext.Provider value={{}}>
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermission = () => useContext(PermissionContext)
