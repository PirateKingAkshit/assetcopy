// 'use client'

// import { createContext, useContext, useState, useEffect } from 'react'
// import axiosInstance from '@/utils/axiosinstance' // Your axios instance

// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)

//   // Example: Fetch user data on mount (e.g., from a token or session)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         // Replace with your actual API to fetch user data
//         const response = await axiosInstance.get('/user/profile', {
//           headers: { pass: 'pass' }, // Adjust headers as needed
//         })
//         if (response?.data?.data) {
//           setUser({
//             id: response.data.data.id,
//             roleId: response.data.data.role_id, // Assuming role_id is in the response
//             // Other user data...
//           })
//         }
//       } catch (error) {
//         console.error('Error fetching user:', error)
//         setUser(null)
//       }
//     }

//     fetchUser()
//   }, [])

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)
