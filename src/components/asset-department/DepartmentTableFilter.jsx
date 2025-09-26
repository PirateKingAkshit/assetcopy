'use client'

import { useState, useEffect } from 'react'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem } from '@mui/material'
import { FaFilter } from 'react-icons/fa'

const DepartmentTableFilter = ({ setData, productData }) => {
  // States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    department: '',
    status: ''
  })
  const [tempFilters, setTempFilters] = useState(filters) // Temporary filters for modal

  const filterOptions = {
    status: [
      { id: '1', name: 'Scheduled' },
      { id: '2', name: 'Published' },
      { id: '3', name: 'Inactive' }
    ]
  }

  const labelMap = {
    department: 'Department Name',
    status: 'Status'
  }

  // Sync tempFilters when modal opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(filters)
    }
  }, [isFilterOpen])

  // Handle filter changes in modal
  const handleFilterChange = e => {
    const { name, value } = e.target
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Apply filters
  const handleApplyFilter = () => {
    setFilters(tempFilters) // Commit temporary filters
    const filteredData = productData?.filter(product => {
      if (tempFilters.department && product.department !== tempFilters.department) return false
      if (tempFilters.status && product.status !== tempFilters.status) return false
      return true
    })
    setData(filteredData ?? [])
    setIsFilterOpen(false)
  }

  // Reset filters
  const handleResetFilter = () => {
    setTempFilters({
      department: '',
      status: ''
    })
    setFilters({
      department: '',
      status: ''
    })
    setData(productData ?? [])
    setIsFilterOpen(false)
  }

  // Cancel filter changes
  const handleCancel = () => {
    setTempFilters(filters) // Revert to last applied filters
    setIsFilterOpen(false)
  }

  // Apply filters when productData changes
  useEffect(() => {
    const filteredData = productData?.filter(product => {
      if (filters.department && product.department !== filters.department) return false
      if (filters.status && product.status !== filters.status) return false
      return true
    })
    setData(filteredData ?? [])
  }, [productData, filters, setData])

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

      <Modal open={isFilterOpen} onClose={handleCancel} aria-labelledby='filter-modal-title'>
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
            Filter Departments
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={labelMap.department}
                name='department'
                value={tempFilters.department}
                onChange={handleFilterChange}
              />
            </Grid>
            {Object.entries(filterOptions).map(([key, options]) => (
              <Grid item xs={12} key={key}>
                <TextField
                  select
                  fullWidth
                  label={labelMap[key]}
                  name={key}
                  value={tempFilters[key]}
                  onChange={handleFilterChange}
                >
                  <MenuItem value=''>All {labelMap[key]}</MenuItem>
                  {options.map(option => (
                    <MenuItem key={option.id} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={handleResetFilter}>Reset</Button>
            <Button color='primary' variant='contained' onClick={handleApplyFilter}>
              Apply
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default DepartmentTableFilter
