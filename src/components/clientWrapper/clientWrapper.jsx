'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { PermissionProvider } from '@/contexts/permissionProvider'


export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
      <PermissionProvider>{children}</PermissionProvider>
    </AuthProvider>
  )
}
