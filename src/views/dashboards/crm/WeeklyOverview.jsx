




// 'use client'

// import { Bar } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend
// } from 'chart.js'
// import { Card, CardContent, Typography } from '@mui/material'

// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// const WeeklyOverview = () => {
//   const data = {
//     labels: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Others'],
//     datasets: [
//       {
//         label: 'Audit Status Count',
//         data: [3000, 2500, 7000, 1000, 1500],
//         backgroundColor: [
//           '#FFECB3', // Light Yellow
//           '#B3E5FC', // Light Cyan
//           '#DCEDC8', // Light Lime
//           '#F8BBD0', // Light Pink
//           '#D1C4E9'  // Light Violet
//         ],
//         borderColor: [
//           '#FBC02D',
//           '#29B6F6',
//           '#8BC34A',
//           '#EC407A',
//           '#7E57C2'
//         ],
//         borderWidth: 1,
//         hoverBackgroundColor: [
//           '#FFF176',
//           '#81D4FA',
//           '#AED581',
//           '#F48FB1',
//           '#B39DDB'
//         ]
//       }
//     ]
//   }

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: { mode: 'index', intersect: false }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: { stepSize: 1000 }
//       }
//     }
//   }

//   return (
//     <Card sx={{ height: 350, boxShadow: 3, borderRadius: 2 }}>
//       <CardContent>
//         <Typography variant="h6" align="center" gutterBottom sx={{ color: '#444' }}>
//           Audit Status Count
//         </Typography>
//         <div style={{ width: '100%', height: 260 }}>
//           <Bar data={data} options={options} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default WeeklyOverview




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

import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box
} from '@mui/material'
import axiosInstance from '@/utils/axiosinstance'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const WeeklyOverview = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/auditBar')

        if (response.status === 200) {
          const apiData = response.data.data

          // Normalize datasets in case backgroundColor is string instead of array
          const datasets = apiData.datasets.map(ds => {
            const backgroundColor = Array.isArray(ds.backgroundColor)
              ? ds.backgroundColor
              : [ds.backgroundColor]
            return {
              ...ds,
              backgroundColor,
              borderColor: backgroundColor.map(c => c.replace('0.7', '1')),
              hoverBackgroundColor: backgroundColor.map(c => c.replace('0.7', '0.9')),
              borderWidth: 1
            }
          })

          setChartData({
            labels: apiData.labels,
            datasets
          })
        }
      } catch (error) {
        console.error('Error fetching audit chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  }

  return (
    // <Card sx={{ height: 350, boxShadow: 3, borderRadius: 2 ,ml: -2}}>
     <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2,  ml: -2  }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#444' }}>
          Audit Status Count
        </Typography>
        <Box sx={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : chartData ? (
            <Bar data={chartData} options={options} />
          ) : (
            <Typography variant="body2" color="error">No data available</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default WeeklyOverview

