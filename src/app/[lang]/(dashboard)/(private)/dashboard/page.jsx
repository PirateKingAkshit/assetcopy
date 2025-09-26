'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import StackedBarChart from '@views/dashboards/crm/StackedBarChart'
import OrganicSessions from '@views/dashboards/crm/OrganicSessions'
import ProjectTimeline from '@views/dashboards/crm/ProjectTimeline'
import WeeklyOverview from '@views/dashboards/crm/WeeklyOverview'
import DashboardCards from '@views/dashboards/crm/userDashboard'
import TicketStatusPieChart from '@/views/dashboards/crm/TicketStatusPieChart'
import TicketAssignmentBarChart from '@views/dashboards/crm/MonthlyBudget'
import ChartSelection from '@/components/select/ChartSelection'
import axiosInstance from '@/utils/axiosinstance'

const DashboardCRM = () => {
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(true)
  const [chartName, setChartName] = useState([])

  const selectedCharts =
    chartName.length > 0
      ? chartName
      : [
          'Category wise assets',
          'Location wise assets',
          'Asset status count',
          'Audit status count',
          'Ticket status',
          'Ticket Assign Status'
        ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/counts')
        setUserData(res.data?.data ?? {})
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Dashboard Cards Section */}
      <Grid item xs={12}>
        <DashboardCards data={userData} />
      </Grid>

      {/* Chart Selection Dropdown */}
      <Grid item xs={12}>
        <ChartSelection chartName={chartName} setChartName={setChartName} />
      </Grid>

      {/* Conditionally render charts */}
      {selectedCharts.includes('Category wise assets') && (
        <Grid item xs={12} sm={6} md={6}>
          <StackedBarChart />
        </Grid>
      )}

      {selectedCharts.includes('Location wise assets') && (
        <Grid item xs={12} sm={6} md={6}>
          <OrganicSessions />
        </Grid>
      )}

      {selectedCharts.includes('Asset status count') && (
        <Grid item xs={12} md={6}>
          <ProjectTimeline />
        </Grid>
      )}

      {selectedCharts.includes('Audit status count') && (
        <Grid item xs={12} md={6}>
          <WeeklyOverview />
        </Grid>
      )}

      {selectedCharts.includes('Ticket status') && (
        <Grid item xs={12} sm={6} md={6}>
          <TicketStatusPieChart />
        </Grid>
      )}

      {selectedCharts.includes('Ticket Assign Status') && (
        <Grid item xs={12} sm={6} md={6}>
          <TicketAssignmentBarChart />
        </Grid>
      )}
    </Grid>
  )
}

export default DashboardCRM
