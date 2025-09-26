
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem, Alert, Badge } from '@mui/material'
import { FaFilter } from 'react-icons/fa'
import { Ban, Columns4, ArrowLeftRight } from 'lucide-react'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

const AssetFilter = ({
  onFilterApply,
  setData,
  productData,
  selectedRows,
  appliedFilters,
  onTransfer,
  onSticker,
  activeButtons = []
}) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    model: appliedFilters?.model || '',
    category: appliedFilters?.category || '',
    location: appliedFilters?.location || '',
    status: appliedFilters?.status || '',
    brand: appliedFilters?.brand || '',
    vendor: appliedFilters?.vendor || '',
    department: appliedFilters?.department || '',
    alloted_to: appliedFilters?.alloted_to || ''
  })

  const [filterOptions, setFilterOptions] = useState({
    category: [],
    location: [],
    status: [],
    brand: [],
    model: [],
    vendor: [],
    department: [],
    alloted_to: []
  })

  const labelMap = {
    model: 'Model',
    category: 'Category',
    location: 'Location',
    status: 'Status',
    brand: 'Brand',
    vendor: 'Vendor',
    department: 'Department',
    alloted_to: 'Allotted To'
  }

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length

  // Filter activeButtons to only include those with isButton: true
  const enabledButtons = activeButtons.filter(btn => btn.isButton === true).map(btn => btn.name)

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoryRes, locationRes, statusRes, brandRes, modelRes, vendorRes, departmentRes, userRes] = await Promise.all([
          axiosInstance.get('/category/all'),
          axiosInstance.get('/location/all'),
          axiosInstance.get('/status/all'),
          axiosInstance.get('/brand/all'),
          axiosInstance.get('/model/all'),
          axiosInstance.get('/vendor/all'),
          axiosInstance.get('/dept/all'),
          axiosInstance.get('/user/all')
        ])

        setFilterOptions({
          category: categoryRes.data?.data?.map(c => ({ id: c._id, name: c.category_name })) || [],
          location: locationRes.data?.data?.map(l => ({ id: l._id, name: l.location })) || [],
          status: statusRes.data?.data?.map(s => ({ id: s._id, name: s.status })) || [],
          brand: brandRes.data?.data?.map(b => ({ id: b._id, name: b.name })) || [],
          model: modelRes.data?.data?.map(m => ({ id: m._id, name: m.model_name })) || [],
          vendor: vendorRes.data?.data?.map(v => ({ id: v._id, name: v.vendor_name })) || [],
          department: departmentRes.data?.data?.map(d => ({ id: d._id, name: d.department })) || [],
          alloted_to: userRes.data?.data?.map(u => ({ id: u._id, name: u.user_name })) || []
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
      brand: '',
      vendor: '',
      department: '',
      alloted_to: ''
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
    router.push(`/${locale}/asset-managements/asset-discard?ids=${selectedIds}`)
  }

  const handleTransfer = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to transfer.')
      return
    }
    const selectedIds = selectedRows.map(row => row.id).join(',')
    router.push(`/${locale}/asset-managements/asset-transferData?ids=${selectedIds}`)
  }

  const handleGenerateSticker = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to generate stickers.')
      return
    }
    if (typeof onSticker === 'function') {
      onSticker(selectedRows)
    }
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
          {/* LEFT SIDE BUTTONS */}
          <Grid item>
            <Grid container spacing={1}>
              {enabledButtons.includes('Add Asset') && (
                <Grid item xs={12} sm='auto'>
                <Button
  variant="contained"
  color="primary"
  className="max-sm:w-full"
  startIcon={
  <img src="/images/add-asset.png" alt="Add" width={20} height={20} style={{ objectFit: 'contain' }} />
}

  onClick={() => router.push(`/${locale}/asset-managements/add-asset`)}
>
  Add Asset
</Button>

                </Grid>
              )}
              {enabledButtons.includes('Generate Sticker') && (
                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    className='max-sm:w-full'
                    // startIcon={<Columns4 size={18} />}
                      startIcon={
    <img
      src="/images/qr_code_2.png"
      alt="QR"
      style={{ width: 20, height: 20 }}
    />
  }
                    onClick={handleGenerateSticker}
                  >
                    Generate Sticker
                  </Button>
                </Grid>
              )}
              {enabledButtons.includes('Asset Transfer') && (
                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    className='max-sm:w-full'
                    // startIcon={<ArrowLeftRight size={18} />}
                      startIcon={
  <img src="/images/transfer.png" alt="Transfer" width={20} height={20} style={{ objectFit: 'contain' }} />
}
                    onClick={handleTransfer}
                  >
                    Asset Transfer
                  </Button>
                </Grid>
              )}
              {enabledButtons.includes('Discard or Sell') && (
                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    className='max-sm:w-full'
                    // startIcon={<Ban size={18} />}
                      startIcon={
  <img src="/images/discard.png" alt="Discard" width={20} height={20} style={{ objectFit: 'contain' }} />
}
                    onClick={handleDiscardOrSell}
                  >
                    Discard or Sell
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* RIGHT SIDE FILTER BUTTON */}
          <Grid item xs={12} sm='auto'>
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

     
<Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} aria-labelledby='filter-modal-title'>
  <Box
    sx={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%', // ✅ responsive width (instead of fixed 400px)
      maxWidth: 400, // ✅ limit max size for larger screens
      maxHeight: '80vh',
      backgroundColor: 'background.paper',
      boxShadow: 24,
      padding: 3,
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {/* Inner scrollable content */}
    <Box sx={{ overflowY: 'auto', maxHeight: 'calc(80vh - 100px)', pr: 1 }}>
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
    </Box>

    {/* Buttons */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2, flexWrap: 'wrap' }}>
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

export default AssetFilter
