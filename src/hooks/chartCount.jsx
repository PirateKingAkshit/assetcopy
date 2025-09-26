'use client'

import { useEffect, useState } from 'react'
import axiosInstance from '@/utils/axiosInstance'

const useDashboardCounts = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosInstance.get('dashboard/counts')
        setData(response.data.data)
      } catch (error) {
        console.error('Failed to fetch dashboard counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  return { data, loading }
}

export default useDashboardCounts
