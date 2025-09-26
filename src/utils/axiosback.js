
import axios from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import { toast } from 'react-toastify'

 const Baseurl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://asset.cybermatrixsolutions.com/backend/api';
// const Baseurl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.4:5000/api/'

const axiosInstance = axios.create({
  baseURL: Baseurl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
      const token = getCookie('token');

     //const token =
      // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhwQHRlc3R1c2VyLmNvbSIsImlkIjoiNjg1OGQ3ZmM4ODcxZmE0NjcwZDE2NWE3IiwiaWF0IjoxNzUwNjUyOTc4LCJleHAiOjE3NTEyNTc3Nzh9.ANBsuf6sPLT55NZX9uYK2gLSADMvFZzg9WIuxW-8bDc'
 //const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// // Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const statusCode = error.response.status
      const errorData = error.response.data

      if (statusCode === 401) {
        toast.error(errorData?.message || 'Session expired! Please login again.')
        deleteCookie('token')
        deleteCookie('user')

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      } else if (statusCode === 403) {
        toast.error(errorData?.message || 'Access Denied!')
      } else if (statusCode === 404) {
        // toast.error(errorData?.message || 'Resource not found!')
      } else if (statusCode === 500) {
        toast.error(errorData?.message || 'Server error. Please try again later.')
      } else {
        toast.error(errorData?.message || 'An error occurred')
      }
    } else if (error.request) {
      toast.error('No response from server. Check your connection.')
    } else {
      toast.error(error.message || 'Request failed')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
