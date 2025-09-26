'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Button,
  Drawer,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormHelperText,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Initial form data
const initialData = {
  locationName: '',
  parentLocationId: '',
  status: '',
  location_lat: '',
  location_lng: ''
}

const formatDate = iso => {
  if (!iso || isNaN(new Date(iso).getTime())) return ''
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const LocationEditDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [parentLocations, setParentLocations] = useState([])

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

  // Fetch parent locations
  useEffect(() => {
    const fetchParentLocations = async () => {
      setIsFetching(true)
      try {
        const response = await axiosInstance.get('location/all')
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setParentLocations(response.data.data)
        } else {
          toast.error('Failed to fetch parent locations')
        }
      } catch (error) {
        toast.error('Error fetching parent locations')
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      fetchParentLocations()
    }
  }, [open])

  // Fetch current location data
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return

      setIsFetching(true)

      try {
        const response = await axiosInstance.get(`location/${categoryId}`)
        if (response.status === 200 && response.data?.data) {
          const location = response.data.data
          setValue('locationName', location.location || '')
          setValue('parentLocationId', location.parent_location?._id || '')
          setValue('status', location.status ? 'Active' : 'Inactive')
          setValue(
            'location_lat',
            location.location_lat != null && !isNaN(location.location_lat) ? location.location_lat.toString() : ''
          )
          setValue(
            'location_lng',
            location.location_lng != null && !isNaN(location.location_lng) ? location.location_lng.toString() : ''
          )
        } else {
          toast.error('Failed to fetch location details')
          reset(initialData)
        }
      } catch (error) {
        console.error('Error fetching location:', error)
        toast.error('Error fetching location')
        reset(initialData)
      } finally {
        setIsFetching(false)
      }
    }

    if (categoryId) {
      fetchData()
    }
  }, [open, categoryId, setValue, reset])

  const onSubmit = async data => {
    if (!categoryId) {
      toast.error('Invalid location ID')
      return
    }

    const isDuplicate = customerData?.some(
      loc => loc.locationName.toLowerCase() === data.locationName.toLowerCase() && loc.id !== categoryId
    )
    if (isDuplicate) {
      toast.error('Location already exists')
      return
    }

    setIsSubmitting(true)

    const parentLocationObj = data.parentLocationId
      ? parentLocations.find(item => item._id === data.parentLocationId)
      : null

    const payload = {
      location: data.locationName,
      parentLocation: parentLocationObj?.location || 'None',
      parentLocationId: data.parentLocationId || null,
      status: data.status === 'Active',
      location_lat: parseFloat(data.location_lat) || 0,
      location_lng: parseFloat(data.location_lng) || 0
    }

    try {
      const response = await axiosInstance.put(`location/${categoryId}`, payload)
      if (response.status === 200) {
        const resData = response.data.data

        const updatedLocation = {
          id: categoryId,
          locationName: resData.location || data.locationName,
          parentLocation: parentLocationObj?.location || resData.parent_location?.location || 'None',
          parentLocationId: data.parentLocationId || resData.parent_location?._id || null,
          status: resData.status != null ? (resData.status ? 'Active' : 'Inactive') : data.status,
          createdBy: resData.created_by?.user_name || 'Unknown',
          createdDate: resData.created_date ? formatDate(resData.created_date) : '',
          location_lat: Number(resData.location_lat) || 0,
          location_lng: Number(resData.location_lng) || 0
        }

        setData(prev => prev.map(item => (item.id === categoryId ? updatedLocation : item)))
        toast.success(response.data.message)
        handleReset()
      } else {
        toast.error(response.data.message || 'Update failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset(initialData)
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h6'>Edit Location</Typography>
        <IconButton onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        {isFetching ? (
          <div className='flex justify-center items-center h-64'>
            <CircularProgress />
          </div>
        ) : (
          <div className='p-5'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <Controller
                name='locationName'
                control={control}
                rules={{ required: 'Location name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Location Name'
                    placeholder='e.g., Delhi'
                    error={Boolean(errors.locationName)}
                    helperText={errors.locationName?.message}
                  />
                )}
              />
              <Controller
                name='parentLocationId'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.parentLocationId)}>
                    <InputLabel id='parent-location-label'>Parent Location</InputLabel>
                    <Select {...field} labelId='parent-location-label' label='Parent Location'>
                      <MenuItem value=''>None</MenuItem>
                      {parentLocations.map(loc => (
                        <MenuItem key={loc._id} value={loc._id}>
                          {loc.location || 'N/A'}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.parentLocationId && <FormHelperText>{errors.parentLocationId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel id='status-label'>Status</InputLabel>
                    <Select {...field} labelId='status-label' label='Status' value={field.value || ''}>
                      <MenuItem value=''>Select Status</MenuItem>
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
           <Controller
  name='location_lat'
  control={control}
  rules={{
    required: 'Latitude is required',
    pattern: {
      value: /^-?\d*\.?\d+$/,
      message: 'Enter a valid number'
    },
    validate: value =>
      (parseFloat(value) >= -90 && parseFloat(value) <= 90) || 'Latitude must be between -90 and 90'
  }}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      type="number"
      label='Latitude'
      placeholder='e.g., 28.7041'
      error={Boolean(errors.location_lat)}
      helperText={errors.location_lat?.message}
    />
  )}
/>

<Controller
  name='location_lng'
  control={control}
  rules={{
    required: 'Longitude is required',
    pattern: {
      value: /^-?\d*\.?\d+$/,
      message: 'Enter a valid number'
    },
    validate: value =>
      (parseFloat(value) >= -180 && parseFloat(value) <= 180) || 'Longitude must be between -180 and 180'
  }}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      type="number"
      label='Longitude'
      placeholder='e.g., 77.1025'
      error={Boolean(errors.location_lng)}
      helperText={errors.location_lng?.message}
    />
  )}
/>

              <div className='flex items-center gap-4'>
                <Button variant='contained' type='submit' disabled={isSubmitting || isFetching}>
                  {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
                <Button variant='outlined' color='error' onClick={handleReset} disabled={isSubmitting || isFetching}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </PerfectScrollbar>
    </Drawer>
  )
}

export default LocationEditDrawer
