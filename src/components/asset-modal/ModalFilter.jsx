'use client'

import { useState, useEffect } from 'react'

import {
  Button,
  CardContent,
  Grid,
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { FaFilter } from 'react-icons/fa'

const ModalFilter = ({ setData, productData }) => {
  // States
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    modal: '',
    brand: '',
    status: ''
  })

  const [tempFilters, setTempFilters] = useState(filters) // Temporary filters for modal

  const filterOptions = {
    brand: [
      { id: '1', name: 'Brand A' },
      { id: '2', name: 'Brand B' },
      { id: '3', name: 'Brand C' }
    ],
    status: [
      { id: '1', name: 'Scheduled' },
      { id: '2', name: 'Published' },
      { id: '3', name: 'Inactive' }
    ]
  }

  const labelMap = {
    modal: 'Modal Name',
    brand: 'Brand',
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
      if (tempFilters.modal && !product.modal?.toLowerCase().includes(tempFilters.modal.toLowerCase())) {
        return false
      }

      if (tempFilters.brand && product.brand !== tempFilters.brand) {
        return false
      }

      if (tempFilters.status && product.status !== tempFilters.status) {
        return false
      }

      return true
    })

    setData(filteredData ?? [])
    setIsFilterOpen(false)
  }

  // Reset filters
  const handleResetFilter = () => {
    setTempFilters({
      modal: '',
      brand: '',
      status: ''
    })
    setFilters({
      modal: '',
      brand: '',
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
      if (filters.modal && !product.modal?.toLowerCase().includes(filters.modal.toLowerCase())) {
        return false
      }

      if (filters.brand && product.brand !== filters.brand) {
        return false
      }

      if (filters.status && product.status !== filters.status) {
        return false
      }

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
            Filter Modals
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={labelMap.modal}
                name='modal'
                value={tempFilters.modal}
                onChange={handleFilterChange}
                variant='outlined'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{labelMap.brand}</InputLabel>
                <TextField select fullWidth name='brand' value={tempFilters.brand} onChange={handleFilterChange}>
                  <MenuItem value=''>All {labelMap.brand}</MenuItem>
                  {filterOptions.brand.map(option => (
                    <MenuItem key={option.id} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{labelMap.status}</InputLabel>
                <TextField select fullWidth name='status' value={tempFilters.status} onChange={handleFilterChange}>
                  <MenuItem value=''>All {labelMap.status}</MenuItem>
                  {filterOptions.status.map(option => (
                    <MenuItem key={option.id} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>
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

export default ModalFilter
