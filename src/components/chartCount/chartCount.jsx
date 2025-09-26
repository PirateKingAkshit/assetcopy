'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
const Bar = dynamic(() =>
  import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false } // disable SSR since Chart.js depends on the browser
);
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import axiosInstance from '@/utils/axiosInstance' // adjust the path as needed

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const ChartCounts = () => {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/counts')
        setCounts(res.data.data)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      }
    }

    fetchCounts()
  }, [])

  if (!counts) return <p>Loading...</p>

  const chartData = {
    labels: ['Assets', 'Tickets', 'Audits', 'Discards'],
    datasets: [
      {
        label: 'Count',
        data: [
          counts.total_asset,
          counts.total_tickets,
          counts.total_audit,
          counts.total_discard
        ],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350']
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  }

  return <Bar data={chartData} options={chartOptions} />
}

export default ChartCounts
