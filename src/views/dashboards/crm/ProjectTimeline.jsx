



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

// const ProjectTimeline = () => {
//   const data = {
//     labels: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Others'],
//     datasets: [
//       {
//         label: 'Tickets Count',
//         data: [3000, 2500, 7000, 1000, 1500],
//         backgroundColor: [
//           '#FFE0B2', // light orange for Pending
//           '#BBDEFB', // light blue for In Progress
//           '#C8E6C9', // light green for Resolved
//           '#FFCDD2', // light red for Rejected
//           '#E1BEE7'  // light purple for Others
//         ],
//         borderColor: [
//           '#FB8C00',
//           '#1976D2',
//           '#388E3C',
//           '#E53935',
//           '#8E24AA'
//         ],
//         borderWidth: 1,
//         hoverBackgroundColor: [
//           '#FFD180',
//           '#90CAF9',
//           '#A5D6A7',
//           '#EF9A9A',
//           '#CE93D8'
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
//         <Typography variant="h6" align="center" gutterBottom sx={{ color: '#333' }}>
//           Asset Status Count
//         </Typography>
//         <div style={{ width: '100%', height: 260 }}>
//           <Bar data={data} options={options} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default ProjectTimeline



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

import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material'
import axiosInstance from '@/utils/axiosinstance'
// import axiosInstance from '@/utils/axiosback'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const ProjectTimeline = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/assetBar')
        if (response.status === 200) {
          const apiData = response.data.data

          const formattedData = {
            labels: apiData.labels,
            datasets: apiData.datasets.map(ds => ({
              ...ds,
              borderColor: ds.backgroundColor.map(color => color.replace('0.7', '1')),
              borderWidth: 1,
              hoverBackgroundColor: ds.backgroundColor.map(color => color.replace('0.7', '0.9'))
            }))
          }

          setChartData(formattedData)
        }
      } catch (error) {
        console.error('Error fetching bar chart data:', error)
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
      legend: { display: false },
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
    // <Card sx={{ height: 350, boxShadow: 3, borderRadius: 2 }}>
     <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2  }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#333' }}>
          Asset Status Count
        </Typography>
        <Box sx={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : chartData ? (
            <Bar data={chartData} options={options} />
          ) : (
            <Typography variant="body2" color="error">
              No data available
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProjectTimeline
