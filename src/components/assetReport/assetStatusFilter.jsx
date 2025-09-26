'use client'

import { useEffect, useState } from 'react'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem, Alert, Badge } from '@mui/material'
import { FaFilter } from 'react-icons/fa'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

const AssetStatusFilter = ({ onFilterApply, appliedFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    status: appliedFilters?.status || ''
  })

  const [statusOptions, setStatusOptions] = useState([])

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const res = await axiosInstance.get('/status/all')
        if (res.data.status === 200) {
          setStatusOptions(res.data.data)
        } else {
          throw new Error(res.data.message || 'Failed to fetch statuses.')
        }
      } catch (err) {
        console.error('Failed to fetch status options:', err)
        setError('Failed to load status options. Please try again.')
      }
    }

    fetchStatusOptions()
  }, [])

  const handleFilterChange = e => {
    setFilters({ status: e.target.value })
    setError(null)
  }

  const handleApplyFilter = async () => {
    try {
      const activeFilters = filters.status ? { status: filters.status } : {}
      onFilterApply(activeFilters)
      setIsFilterOpen(false)
    } catch (err) {
      console.error('Apply filter error:', err)
      setError('Failed to apply filters.')
    }
  }

  const handleResetFilter = () => {
    setFilters({ status: '' })
    onFilterApply({})
    setIsFilterOpen(false)
    setError(null)
  }

  const activeFilterCount = filters.status ? 1 : 0

  return (
    <>
      



      <CardContent>
  <Grid container justifyContent="space-between" alignItems="center">
    <Grid item>
      <Typography variant="h5" sx={{ fontWeight: 'small', color: '#333333' }}>
        Assets Report Table
      </Typography>
    </Grid>
    <Grid item>
      
  {/* <Button
  variant="outlined"
  className="max-sm:w-full"
  onClick={() => setIsFilterOpen(true)}
  sx={{
    position: 'relative',
    backgroundColor: activeFilterCount > 0 ? '#f0f0f0' : 'inherit',
    px: 2, // horizontal padding
    py: 1.5, // vertical padding bada diya
    minWidth: 90,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.2,
    height: 38
  }}
>
  <Box
    sx={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }}
  >
    <FaFilter size={16} />
    {activeFilterCount > 0 && (
      <Box
        sx={{
          position: 'absolute',
          top: -7,
          right: -7,
          backgroundColor: '#7367F0',
          color: 'white',
          width: 14,
          height: 14,
          fontSize: '9px',
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
</Button> */}


  <Button
              variant='outlined'
              className='max-sm:w-full'
              onClick={() => setIsFilterOpen(true)}
              sx={{
                position: 'relative',
                backgroundColor: activeFilterCount > 0 ? '#f0f0f0' : 'inherit',
                paddingLeft: 2,
                paddingRight: 2,
                minWidth: 100
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: 3
                }}
              >
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
            Filter by Status
          </Typography>

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

export default AssetStatusFilter
