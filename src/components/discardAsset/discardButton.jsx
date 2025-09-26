'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem, Alert, Badge } from '@mui/material'
import { FaFilter } from 'react-icons/fa'
import { Ban, Columns4, ArrowLeftRight } from 'lucide-react'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

const DiscardButton = ({
  onFilterApply,
  setData,
  productData,
  selectedRows,
  appliedFilters,
  onTransfer,
  onSticker
}) => {
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    model: appliedFilters?.model || '',
    category: appliedFilters?.category || '',
    location: appliedFilters?.location || '',
    status: appliedFilters?.status || '',
    brand: appliedFilters?.brand || ''
  })

  const [filterOptions, setFilterOptions] = useState({
    category: [],
    location: [],
    status: [],
    brand: [],
    model: []
  })

  const labelMap = {
    model: 'Model',
    category: 'Category',
    location: 'Location',
    status: 'Status',
    brand: 'Brand'
  }

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoryRes, locationRes, statusRes, brandRes, modelRes] = await Promise.all([
          axiosInstance.get('/category/all'),
          axiosInstance.get('/location/all'),
          axiosInstance.get('/status/all'),
          axiosInstance.get('/brand/all'),
          axiosInstance.get('/model/all')
        ])

        setFilterOptions({
          category: categoryRes.data?.data?.map(c => ({ id: c._id, name: c.category_name })) || [],
          location: locationRes.data?.data?.map(l => ({ id: l._id, name: l.location })) || [],
          status: statusRes.data?.data?.map(s => ({ id: s._id, name: s.status })) || [],
          brand: brandRes.data?.data?.map(b => ({ id: b._id, name: b.name })) || [],
          model: modelRes.data?.data?.map(m => ({ id: m._id, name: m.model_name })) || []
        })
      } catch (error) {
        console.error('Failed to fetch filter options:', error)
        setError('Failed to load filter options. Please try again.')
      }
    }

    fetchFilters()
  }, [])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleApplyFilter = async () => {
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))

      const response = await axiosInstance.post('/filter', activeFilters)
      if (response.data.status === 200) {
        onFilterApply(activeFilters)
        setIsFilterOpen(false)
        setError(null)
      } else {
        throw new Error(response.data.message || 'Failed to apply filters')
      }
    } catch (error) {
      console.error('Error applying filters:', error)
      setError('Failed to apply filters. Falling back to direct filtering.')
      onFilterApply(filters)
      setIsFilterOpen(false)
    }
  }

  const handleResetFilter = () => {
    setFilters({
      model: '',
      category: '',
      location: '',
      status: '',
      brand: ''
    })
    onFilterApply({})
    setIsFilterOpen(false)
    setError(null)
  }

  const handleDiscardOrSell = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to discard or sell.')
      return
    }
    const selectedIds = selectedRows.map(row => row.id).join(',')
    router.push(`/${router.query?.lang || 'en'}/asset-managements/asset-discard?ids=${selectedIds}`)
  }

  return (
    <>
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} justifyContent='space-between' alignItems='center'>
         <Grid item xs={12} sm="auto">
  <Button
    variant="contained"
    color="primary"
    startIcon={<Ban size={18} />}
    onClick={handleDiscardOrSell}
    className="max-sm:w-full"
  >
    Discard or Sell
  </Button>
</Grid>


          <Grid item>
            <Badge
              badgeContent={activeFilterCount}
              color='primary'
              invisible={activeFilterCount === 0}
              sx={{
                '& .MuiBadge-badge': {
                  top: -5,
                  right: -5,
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }
              }}
            >
              {/* <Button
                variant='outlined'
                startIcon={<FaFilter />}
                onClick={() => setIsFilterOpen(true)}
                sx={{
                  backgroundColor: activeFilterCount > 0 ? '#f0f0f0' : 'inherit'
                }}
              >
                Filter
              </Button> */}
            </Badge>
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
            Filter Assets
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(filterOptions).map(([key, options]) => (
              <Grid item xs={12} key={key}>
                <TextField
                  select
                  fullWidth
                  label={labelMap[key]}
                  name={key}
                  value={filters[key]}
                  onChange={handleFilterChange}
                >
                  <MenuItem value=''>All {labelMap[key]}</MenuItem>
                  {options.length > 0 ? (
                    options.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name || 'N/A'}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options available</MenuItem>
                  )}
                </TextField>
              </Grid>
            ))}
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

export default DiscardButton
