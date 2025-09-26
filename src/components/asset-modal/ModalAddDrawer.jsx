'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import { Autocomplete, CircularProgress } from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

// Vars
const initialData = {
  modelName: '',
  brandId: '',
  status: 'Published'  
}


const AssetAddModalDrawer = ({ open, handleClose, fetchData }) => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brands, setBrands] = useState([])

  // Hooks
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
      status: 'Published'
    })
  }
}, [open, reset])

  // Fetch brands for dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axiosInstance.get('brand/all')
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setBrands(response.data.data)
        } else {
          toast.error('Failed to fetch brands')
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(`Failed to fetch brands: ${errorMessage}`)
        }
      }
    }

    if (open) {
      fetchBrands()
    }
  }, [open])

  const onSubmit = async data => {
    if (!data.modelName || !data.brandId || !data.status) {
      toast.error('Model name, brand, and status are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        model_name: data.modelName,
        brand: data.brandId,
        status: data.status === 'Published'
      }

      const response = await axiosInstance.post('/model', payload)
      if (response.data.status === 200) {
        // Refresh the data by calling fetchData to ensure the latest data, including created_by, is fetched
        await fetchData()

        toast.success(response.data.message || 'Model added successfully!')
        handleReset()
      } else {
        toast.error(response.data.message || 'Failed to add model.')
      }
    } catch (error) {
      console.error('Error creating model:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 400 && errorMessage === 'Model name already exists') {
        toast.error('Model name already exists')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to create model: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset(initialData)
    setBrands([])
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
        <Typography variant='h5'>Add Model</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='modelName'
              control={control}
              rules={{ required: 'Model name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Model Name'
                  placeholder='e.g., odiai13'
                  error={Boolean(errors.modelName)}
                  helperText={errors.modelName?.message}
                />
              )}
            />
            <Controller
              name='brandId'
              control={control}
              rules={{ required: 'Brand is required' }}
              render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                <Autocomplete
                  options={brands}
                  getOptionLabel={option => option.name || 'N/A'}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={brands.find(brand => brand._id === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue._id : '')
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Brand'
                      placeholder='Select Brand'
                      inputRef={ref}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                  ListboxProps={{
                    style: {
                      maxHeight: 300,
                      overflow: 'auto'
                    }
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
                  <Select {...field} labelId='status-label' id='status-select' label='Status'>
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='Published'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
              <Button variant='outlined' color='error' onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AssetAddModalDrawer
