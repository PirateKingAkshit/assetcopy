'use client'

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
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Reusable Chart Card Component
const ChartCard = ({ title, labels, values }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: values,
        backgroundColor: '#3f51b5',
        borderRadius: 6,
        barThickness: 40
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true }
    }
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Bar data={data} options={options} height={250} />
      </CardContent>
    </Card>
  )
}

// Main DashboardCharts Component
const DashboardCharts = () => {
  // Mock data
  const categoryData = {
    labels: ['Electronics', 'Furniture', 'Stationery', 'Appliances'],
    values: [12, 18, 9, 15]
  }

  const locationData = {
    labels: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'],
    values: [20, 14, 22, 10]
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <ChartCard title="Category" labels={categoryData.labels} values={categoryData.values} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartCard title="Location" labels={locationData.labels} values={locationData.values} />
      </Grid>
    </Grid>
  )
}

export default DashboardCharts
