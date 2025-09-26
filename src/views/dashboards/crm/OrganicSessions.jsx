


// 'use client'

// import { Pie } from 'react-chartjs-2'
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
// import { useState } from 'react'
// import { Card, CardContent, Typography } from '@mui/material'

// ChartJS.register(ArcElement, Tooltip, Legend)

// const OrganicSessions = () => {
//   const [chartData] = useState({
//     labels: ['IT Assets', 'Plant & Machinery'],
//     datasets: [
//       {
//         label: 'Location wise Assets',
//         data: [60, 40],
//         backgroundColor: ['#B2EBF2', '#C5E1A5'],
//         hoverBackgroundColor: ['#E0F7FA', '#E6EE9C'],
//         borderColor: ['#0097A7', '#7CB342'],
//         borderWidth: 1
//       }
//     ]
//   })

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           color: '#444',
//           font: {
//             size: 14
//           }
//         }
//       }
//     }
//   }

//   return (
//    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>

//       <CardContent>
//         <Typography variant="h6" align="center" gutterBottom sx={{ color: '#333' }}>
//           Location wise Assets
//         </Typography>
//       <div style={{ height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

//           <Pie data={chartData} options={options} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default OrganicSessions



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

const OrganicSessions = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocationChart = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/pie')
        const location = res?.data?.data?.locationChart

        const transformedData = {
          labels: location.labels,
          datasets: [
            {
              label: location.datasets[0].label,
              data: location.datasets[0].data,
              backgroundColor: location.datasets[0].backgroundColor,
              hoverBackgroundColor: location.datasets[0].backgroundColor,
              borderColor: location.datasets[0].backgroundColor,
              borderWidth: 1
            }
          ]
        }

        setChartData(transformedData)
      } catch (err) {
        console.error('Failed to load location chart:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationChart()
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
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2,  ml:-3 }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#333' }}>
          Location wise Assets
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

export default OrganicSessions
