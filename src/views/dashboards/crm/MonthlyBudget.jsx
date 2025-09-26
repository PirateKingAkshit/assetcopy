'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
const Bar = dynamic(() =>
  import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false } // disable SSR since Chart.js depends on the browser
);
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'
import { Card, CardContent, Typography } from '@mui/material'
import axiosInstance from '@/utils/axiosinstance'


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const TicketAssignmentBarChart = () => {
  const [barData, setBarData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignChartData = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/ticketStatus')
        const assignData = res?.data?.data?.assignChartData

        console.log('Bar chart data:', assignData)

        if (assignData?.labels?.length && assignData?.datasets?.length) {
          const formattedData = {
            labels: assignData.labels,
            datasets: assignData.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColor,
              borderWidth: 1
            }))
          }

          setBarData(formattedData)
        } else {
          console.warn('Assignment data missing or malformed')
        }
      } catch (err) {
        console.error('Failed to fetch ticket assignment chart:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignChartData()
  }, [])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2,ml: -2 }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Ticket Assign Status
        </Typography>

        <div
          style={{
            height: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {loading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : barData ? (
            <Bar data={barData} options={options} />
          ) : (
            <Typography variant="body1">No data available</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TicketAssignmentBarChart
