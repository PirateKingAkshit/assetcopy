'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Other Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'
import { Autocomplete } from '@mui/material'

const initialData = {
  location: '',
  parentLocationId: '',
  status: 'Active', 
  location_lat: '',
  location_lng: ''
}

const AssetAddLocationDrawer = ({ open, handleClose, setData, customerData, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [parentLocations, setParentLocations] = useState([])

  const {
  control,
  reset,
  handleSubmit,
  formState: { errors }
} = useForm({
  defaultValues: initialData
})

useEffect(() => {
  if (open) {
    reset({
      ...initialData,
      status: 'Active'
    })
  }
}, [open, reset])


  useEffect(() => {
    const fetchParentLocations = async () => {
      setIsFetching(true)
      try {
        const response = await axiosInstance.get('location/all')
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          // ✅ Only include Active locations
          const activeLocations = response.data.data.filter(loc => loc.status === true)
          setParentLocations(activeLocations)
        } else {
          toast.error('Failed to fetch parent locations')
        }
      } catch (error) {
        console.error('Error fetching parent locations:', {
          message: error.response?.data?.message || error.message || 'Unknown error',
          status: error.response?.status,
          response: error.response?.data
        })
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(
            `Failed to fetch parent locations: ${error.response?.data?.message || error.message || 'Unknown error'}`
          )
        }
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      fetchParentLocations()
    }
  }, [open])

  const onSubmit = async data => {
    const isDuplicate = customerData?.some(loc => loc.locationName.toLowerCase() === data.location.toLowerCase())
    if (isDuplicate) {
      toast.error('Location Already Exists')
      return
    }

    setIsSubmitting(true)
    const payload = {
      location: data.location,
      parent_location: data.parentLocationId || null,
      status: data.status === 'Active',
      location_lat: parseFloat(data.location_lat) ,
      location_lng: parseFloat(data.location_lng) ,
    }

      Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === '' || Number.isNaN(payload[key])) {
      delete payload[key]
    }
  })

    try {
      const response = await axiosInstance.post('location', payload)
      if (response.data.status === 200) {
        refreshData()

        setParentLocations(prev => [
          ...prev,
          {
            _id: response.data.data._id,
            location: response.data.data.location,
            parent_location: response.data.data.parent_location,
            status: response.data.data.status,
            location_lat: response.data.data.location_lat,
            location_lng: response.data.data.location_lng,
            created_by: response.data.data.created_by,
            created_date: response.data.data.created_date,
            updated_date: response.data.data.updated_date
          }
        ])

        toast.success(response.data.message)
        handleReset()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      console.error('Error creating location:', errorMessage)
      toast.error(`Failed to create location: ${errorMessage}`)
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
        <Typography variant='h6'>Add Location</Typography>
        <IconButton onClick={handleReset} aria-label='Close drawer'>
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
                name='location'
                control={control}
                rules={{ required: 'Location name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Location Name'
                    placeholder='e.g., Rajasthan'
                    error={Boolean(errors.location)}
                    helperText={errors.location?.message}
                  />
                )}
              />

             <Controller
  name="parentLocationId"
  control={control}
  render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
    <Autocomplete
      options={parentLocations}
      getOptionLabel={(option) => option.location || 'N/A'}
      isOptionEqualToValue={(option, val) => option._id === val?._id}
      value={parentLocations.find(loc => loc._id === value) || null}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue._id : '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Parent Location"
          placeholder="Select Parent Location"
          inputRef={ref}
          error={!!error}
          helperText={error ? error.message : null}
        />
      )}
      ListboxProps={{
        style: {
          maxHeight: 300,
          overflow: 'auto',
        },
      }}
      clearOnEscape
    />
  )}
/>


              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel id='status-label'>Status</InputLabel>
                    <Select {...field} labelId='status-label' label='Status'>
                      <MenuItem value='' disabled>
                        Select Status
                      </MenuItem>
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
      value >= -90 && value <= 90 || 'Latitude must be between -90 and 90'
  }}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      type="number"
      label='Latitude'
      placeholder='e.g., 26.9124'
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
      value >= -180 && value <= 180 || 'Longitude must be between -180 and 180'
  }}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      type="number"
      label='Longitude'
      placeholder='e.g., 75.7873'
      error={Boolean(errors.location_lng)}
      helperText={errors.location_lng?.message}
    />
  )}
/>


              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained' disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button variant='outlined' color='error' onClick={handleReset} disabled={isSubmitting}>
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

export default AssetAddLocationDrawer
