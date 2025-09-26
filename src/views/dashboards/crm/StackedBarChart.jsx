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
// make sure this path is correct

ChartJS.register(ArcElement, Tooltip, Legend)

const StackedBarChart = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryChart = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/pie')
        const category = res?.data?.data?.categoryChart

        const transformedData = {
          labels: category.labels,
          datasets: [
            {
              label: category.datasets[0].label,
              data: category.datasets[0].data,
              backgroundColor: category.datasets[0].backgroundColor,
              hoverBackgroundColor: category.datasets[0].backgroundColor,
              borderColor: category.datasets[0].backgroundColor,
              borderWidth: 1
            }
          ]
        }

        setChartData(transformedData)
      } catch (err) {
        console.error('Failed to load chart:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryChart()
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
        <Typography variant='h6' align='center' gutterBottom sx={{ color: '#333' }}>
          Category wise Assets
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
            <Typography variant='body1'>Loading...</Typography>
          ) : chartData ? (
            <Pie data={chartData} options={options} />
          ) : (
            <Typography variant='body1'>No data available</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StackedBarChart
