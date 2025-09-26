'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
const Pie = dynamic(() =>
  import('react-chartjs-2').then((mod) => mod.Pie),
  { ssr: false } // disable SSR since Chart.js depends on the browser
);
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Card, CardContent, Typography } from '@mui/material'
import axiosInstance from '@/utils/axiosinstance'



ChartJS.register(ArcElement, Tooltip, Legend)

const TicketStatusPieChart = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/ticketStatus')
        const ticket = res?.data?.data?.chartData

        console.log('Pie chart data:', ticket)

        if (
          ticket?.labels?.length &&
          ticket?.datasets?.length &&
          ticket.datasets[0]?.data?.length
        ) {
          const safeColors = ticket.datasets[0].backgroundColor.map(color =>
            color.includes('317') ? 'rgba(100, 200, 100, 0.7)' : color
          )

          const transformedData = {
            labels: ticket.labels,
            datasets: [
              {
                label: ticket.datasets[0].label,
                data: ticket.datasets[0].data,
                backgroundColor: safeColors,
                hoverBackgroundColor: safeColors,
                borderColor: safeColors,
                borderWidth: 1
              }
            ]
          }

          setChartData(transformedData)
        } else {
          console.warn('Ticket status chart: data missing or malformed', ticket)
        }
      } catch (err) {
        console.error('Failed to fetch ticket status chart:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#444',
          font: {
            size: 14
          }
        }
      }
    }
  }

  return (
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Ticket Status
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
          ) : chartData ? (
            <Pie data={chartData} options={options} />
          ) : (
            <Typography variant="body1">No data available</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TicketStatusPieChart
