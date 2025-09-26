'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import axiosInstance from '@/utils/axiosinstance'
import { CloudUpload } from 'lucide-react'
import {
  Card,
  Grid,
  Divider,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete
} from '@mui/material'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);

const TransferAsset = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()

  const assetIds = useMemo(() => {
    const ids =
      searchParams
        .get('ids')
        ?.split(',')
        .filter(id => id) || []
    return ids
  }, [searchParams])

  const [assetsData, setAssetsData] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [userOptions, setUserOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    newLocation: '',
    transferStatus: '',
    remarks: '',
    file: null,
    transferAllotedTo: ''
  })

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axiosInstance.get('/status/all')
        if (response.data?.status === 200 && Array.isArray(response.data.data)) {
          const options = response.data.data.map(status => ({
            id: status._id,
            name: status.status
          }))
          setStatusOptions(options)
          const pendingStatus = options.find(status => status.name === 'transfer pending')
          if (pendingStatus) {
            setFormData(prev => ({ ...prev, transferStatus: pendingStatus.id }))
          }
        } else {
          toast.error('Failed to fetch status options.')
        }
      } catch (err) {
        toast.error(err.message || 'Error loading status options.')
      }
    }

    const fetchLocationOptions = async () => {
      try {
        const response = await axiosInstance.get('/location/all')
        if (response.data?.status === 200 && Array.isArray(response.data.data)) {
          setLocationOptions(
            response.data.data.map(loc => ({
              id: loc._id,
              name: loc.location
            }))
          )
        } else {
          toast.error('Failed to fetch location options.')
        }
      } catch (err) {
        toast.error(err.message || 'Error loading location options.')
      }
    }

    const fetchUserOptions = async () => {
      try {
        const response = await axiosInstance.get('/user/all')
        if (response.data?.status === 200 && Array.isArray(response.data.data)) {
          setUserOptions(
            response.data.data.map(user => ({
              id: user._id,
              name: user.user_name
            }))
          )
        } else {
          toast.error('Failed to fetch user options.')
        }
      } catch (err) {
        toast.error(err.message || 'Error loading user options.')
      }
    }

    fetchStatusOptions()
    fetchLocationOptions()
    fetchUserOptions()
  }, [])

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }
  const columnDefs = useMemo(
    () => [
    

      { headerName: 'Asset Code', field: 'assetcode', cellStyle: baseStyle },
      { headerName: 'Asset Name', field: 'assetname', cellStyle: baseStyle },
      {
        headerName: 'Location',
        field: 'location',
        valueGetter: params => params.data.location || 'N/A',
        cellStyle: baseStyle
      },
      {
        headerName: 'Category',
        field: 'category',
        valueGetter: params => params.data.category || 'N/A',
        cellStyle: baseStyle
      },
      {
        headerName: 'Status',
        field: 'status',
        cellRenderer: params => (
          <Chip
            label={params.value || 'N/A'}
            variant='tonal'
            color={params.value === 'active' ? 'success' : params.value === 'inactive' ? 'error' : 'warning'}
            size='small'
          />
        ),
        cellStyle: baseStyle
      },
      {
        headerName: 'Brand',
        field: 'brand',
        valueGetter: params => params.data.brand || 'N/A',
        cellStyle: baseStyle
      },
      {
        headerName: 'Model',
        field: 'model',
        valueGetter: params => params.data.model || 'N/A',
        cellStyle: baseStyle
      },
      {
        headerName: 'Allotted To',
        field: 'alloted_to',
        valueGetter: params => params.data.alloted_to || 'N/A',
        cellStyle: baseStyle
      },
      {
        headerName: 'Created Date',
        field: 'CreatedDate',
        valueGetter: params => params.data.CreatedDate || 'N/A',
        cellStyle: baseStyle
      }
    ],
    []
  )

  useEffect(() => {
    if (assetIds.length > 0) {
      const fetchAssetsData = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await axiosInstance.post('/asset/fetch', { ids: assetIds })
          if (response.data?.status === 200 && Array.isArray(response.data.data)) {
            const assets = response.data.data.map(assetData => ({
              id: assetData._id,
              image: assetData.file_attached ? `${assetData.file_attached}` : null,
              assetcode: assetData.asset_code || 'N/A',
              assetname: assetData.asset_name || 'N/A',
              location: assetData.location?.location || 'N/A',
              locationId: assetData.location?._id || null,
              category: assetData.category?.category_name || 'N/A',
              categoryId: assetData.category?._id || null,
              status: assetData.status?.status || 'N/A',
              statusId: assetData.status?._id || null,
              brand: assetData.brand?.name || 'N/A',
              brandId: assetData.brand?._id || null,
              model: assetData.model?.model_name || 'N/A',
              alloted_to: assetData.alloted_to?.user_name || 'N/A',
              modelId: assetData.model?._id || null,
              CreatedDate: new Date(assetData.created_date).toLocaleDateString()
            }))
            if (assets.length === 0) throw new Error('No valid assets found')
            setAssetsData(assets)
          } else {
            throw new Error(response.data?.message || 'Failed to fetch assets')
          }
        } catch (err) {
          setError(err.message || 'Error loading asset data')
          setAssetsData([])
        } finally {
          setLoading(false)
        }
      }
      fetchAssetsData()
    } else {
      setLoading(false)
    }
  }, [assetIds])

  const handleFileChange = e => {
    if (e.target.files?.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

const handleSubmit = async e => {
  e.preventDefault()

  try {
    const formPayload = new FormData()

    formPayload.append('new_location', formData.newLocation)
    formPayload.append('transfer_status', formData.transferStatus)
    formPayload.append('transfer_remark', formData.remarks)
    formPayload.append('new_allocated', formData.transferAllotedTo)

    if (formData.file) {
      formPayload.append('file', formData.file)
    }

    // ✅ Correct way: append each asset with same key
    assetIds.forEach(id => {
      formPayload.append('asset[]', id)   // 👈 important
    })

    const response = await axiosInstance.post('/transfer', formPayload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data?.status === 200) {
      toast.success('Assets transferred successfully')
      router.push(`/${locale}/asset-managements/asset-transfer`)
    } else {
      throw new Error(response.data?.message || 'Transfer failed')
    }
  } catch (err) {
    console.error('Transfer error:', err)
    setError(err.message || 'Error transferring assets')
  }
}



  if (loading) {
    return (
      <Card>
        <Typography variant='h6' className='p-4'>
          Loading asset data...
        </Typography>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Typography variant='h6' color='error' className='p-4'>
          {error}
        </Typography>
      </Card>
    )
  }

  if (assetIds.length === 0) {
    return (
      <Card>
        <Typography variant='h6' className='p-4'>
          Please select at least one asset to transfer
        </Typography>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex justify-between items-center px-6 pt-4'>
        <Typography variant='h5' fontWeight={600}>
          Transfer Assets
        </Typography>
      </div>
      <Divider />

      <CardContent>
        <Typography variant='body2' fontWeight={600} mb={3}>
          Selected Assets
        </Typography>
        <div className='px-6'>
          <AgGridWrapper rowData={assetsData} columnDefs={columnDefs} domLayout='autoHeight' />
        </div>
      </CardContent>

      <Divider />

      <form onSubmit={handleSubmit}>
        <CardContent>
          <Typography variant='body2' fontWeight={600} mb={3}>
            Transfer Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
             <FormControl fullWidth required>
  <Autocomplete
    options={locationOptions}
    getOptionLabel={(option) => option.name || ''}
    isOptionEqualToValue={(option, val) => option.id === val}
    value={locationOptions.find(loc => loc.id === formData.newLocation) || null}
    onChange={(_, newValue) => {
      setFormData(prev => ({
        ...prev,
        newLocation: newValue ? newValue.id : ''
      }))
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="New Location"
        placeholder="Select location"
        required
      />
    )}
    ListboxProps={{
      style: {
        maxHeight: 300,
        overflow: 'auto',
      }
    }}
    clearOnEscape
  />
</FormControl>

            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  value={formData.transferStatus}
                  onChange={e => setFormData({ ...formData, transferStatus: e.target.value })}
                  disabled
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
  <Autocomplete
    options={userOptions}
    getOptionLabel={(option) => option.name || ''}
    isOptionEqualToValue={(option, val) => option.id === val}
    value={userOptions.find(user => user.id === formData.transferAllotedTo) || null}
    onChange={(_, newValue) => {
      setFormData(prev => ({
        ...prev,
        transferAllotedTo: newValue ? newValue.id : ''
      }))
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Transfer Alloted To"
        placeholder="Select user"
        required
      />
    )}
    ListboxProps={{
      style: {
        maxHeight: 300,
        overflow: 'auto',
      }
    }}
    clearOnEscape
  />
</FormControl>

            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Remarks'
                value={formData.remarks}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </Grid>
           <Grid item xs={12} sm={4}>
  <Button
    variant="outlined"
    component="label"
    fullWidth
    startIcon={<CloudUpload />}
    sx={{ height: '56px' }}  // Match typical TextField height
  >
    Attach File
    <input type="file" hidden onChange={handleFileChange} />
  </Button>
  {formData.file && (
    <Typography variant="body2" mt={1}>
      Selected file: {formData.file.name}
    </Typography>
  )}
</Grid>

          </Grid>
        </CardContent>

        <Divider />
        <CardActions>
          <Button type='submit' variant='contained'>
            Transfer Assets
          </Button>
          <Button variant='outlined'  color='error' onClick={() => router.back()}>
            Cancel
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default TransferAsset
