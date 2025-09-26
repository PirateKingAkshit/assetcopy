'use client'

import { useState, useEffect } from 'react'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem } from '@mui/material'
import { FaFilter } from 'react-icons/fa'

const ConditionTableFilters = ({ setData, productData }) => {
  // States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    condition: '',
    status: ''
  })

  const filterOptions = {
    status: [
      { id: '1', name: 'Scheduled' },
      { id: '2', name: 'Published' },
      { id: '3', name: 'Inactive' }
    ]
  }

  const labelMap = {
    condition: 'Condition Name',
    status: 'Status'
  }

  // Handle filter changes
  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Apply filters
  const handleApplyFilter = () => {
    const filteredData = productData?.filter(product => {
      if (filters.condition && product.condition.toLowerCase().indexOf(filters.condition.toLowerCase()) === -1)
        return false
      if (filters.status && product.status !== filters.status) return false
      return true
    })
    setData(filteredData ?? [])
    setIsFilterOpen(false)
  }

  // Reset filters
  const handleResetFilter = () => {
    setFilters({
      condition: '',
      status: ''
    })
    setData(productData ?? [])
    setIsFilterOpen(false)
  }

  // Filter effect
  useEffect(() => {
    if (!isFilterOpen) {
      handleApplyFilter()
    }
  }, [filters, productData])

  return (
    <>
      <CardContent>
        <Grid container spacing={2} justifyContent='flex-end' alignItems='center'>
          <Grid item>
            <Button
              variant='outlined'
              startIcon={<FaFilter />}
              onClick={() => setIsFilterOpen(true)}
              sx={{
                backgroundColor: Object.values(filters).some(f => f !== '') ? '#f0f0f0' : 'inherit'
              }}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} aria-labelledby='filter-modal-title'>
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
            borderRadius: 2,
            outline: 'none'
          }}
        >
          <Typography variant='h6' gutterBottom>
            Filter Conditions
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={labelMap.condition}
                name='condition'
                value={filters.condition}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label={labelMap.status}
                name='status'
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value=''>All {labelMap.status}</MenuItem>
                {filterOptions.status.map(option => (
                  <MenuItem key={option.id} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={handleResetFilter}>Reset</Button>
            <Button color='primary' variant='contained' onClick={handleApplyFilter}>
              Apply
            </Button>
            <Button variant='outlined' color='secondary' onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default ConditionTableFilters
