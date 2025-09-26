
'use client'

import { useEffect, useState } from 'react'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem } from '@mui/material'
import { FaFilter } from 'react-icons/fa'
import axiosInstance from '@/utils/axiosinstance'

const SummaryStatusFilter = ({ onFilterApply, appliedFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    status: appliedFilters?.status || '',
    location: appliedFilters?.location || '',
    category: appliedFilters?.category || ''
  })

  const [statusOptions, setStatusOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])

  // fetch all dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, locationRes, categoryRes] = await Promise.all([
          axiosInstance.get('/status/all'),
          axiosInstance.get('/location/all'),
          axiosInstance.get('/category/all')
        ])

        if (statusRes.data.status === 200) setStatusOptions(statusRes.data.data)
        if (locationRes.data.status === 200) setLocationOptions(locationRes.data.data)
        if (categoryRes.data.status === 200) setCategoryOptions(categoryRes.data.data)
      } catch (err) {
        console.error('Failed to fetch filter options:', err)
        setError('Failed to load filter options. Please try again.')
      }
    }

    fetchData()
  }, [])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleApplyFilter = () => {
    try {
      const activeFilters = {}
      if (filters.status) activeFilters.status = filters.status
      if (filters.location) activeFilters.location = filters.location
      if (filters.category) activeFilters.category = filters.category

      onFilterApply(activeFilters)
      setIsFilterOpen(false)
    } catch (err) {
      console.error('Apply filter error:', err)
      setError('Failed to apply filters.')
    }
  }

  const handleResetFilter = () => {
    setFilters({ status: '', location: '', category: '' })
    onFilterApply({})
    setIsFilterOpen(false)
    setError(null)
  }

  const activeFilterCount = (filters.status ? 1 : 0) + (filters.location ? 1 : 0) + (filters.category ? 1 : 0)

  return (
    <>
      <CardContent>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Typography variant='h5' sx={{ fontWeight: 'small', color: '#333333' }}>
              Summary Report Table
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant='outlined'
              onClick={() => setIsFilterOpen(true)}
              sx={{
                position: 'relative',
                backgroundColor: activeFilterCount > 0 ? '#f0f0f0' : 'inherit',
                px: 2,
                minWidth: 100
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', mr: 3 }}>
                <FaFilter size={18} />
                {activeFilterCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -9,
                      right: -6,
                      backgroundColor: '#7367F0',
                      color: 'white',
                      width: 14,
                      height: 14,
                      fontSize: '10px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}
                  >
                    {activeFilterCount}
                  </Box>
                )}
              </Box>
              Filter
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant='h6' gutterBottom>
            Filters
          </Typography>

         

       
          {/* Category */}
          
          <TextField
            select
            fullWidth
            label='Category'
            name='category'
            value={filters.category}
            onChange={handleFilterChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value=''>All Categories</MenuItem>
            {categoryOptions.map(option => (
              <MenuItem key={option._id} value={option._id}>
                {option.category_name}
              </MenuItem>
            ))}
          </TextField>

          {/* Location */}
          <TextField
            select
            fullWidth
            label='Location'
            name='location'
            value={filters.location}
            onChange={handleFilterChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value=''>All Locations</MenuItem>
            {locationOptions.map(option => (
              <MenuItem key={option._id} value={option._id}>
                {option.location}
              </MenuItem>
            ))}
          </TextField>

 {/* Status */}
          <TextField
            select
            fullWidth
            label='Status'
            name='status'
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value=''>All Status</MenuItem>
            {statusOptions.map(option => (
              <MenuItem key={option._id} value={option._id}>
                {option.status}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={handleResetFilter}>Reset</Button>
            <Button color='primary' variant='contained' onClick={handleApplyFilter}>
              Apply
            </Button>
            <Button variant='outlined' color='error' onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default SummaryStatusFilter
