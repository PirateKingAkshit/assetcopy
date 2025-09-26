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

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Vars
const initialData = {
  modelName: '',
  brandId: '',
  status: ''
}

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const AssetEditModalDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brands, setBrands] = useState([])

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

  useEffect(() => {
    const fetchData = async () => {
      if (open && categoryId) {
        try {
          const modelResponse = await axiosInstance.get(`model/${categoryId}`)
          if (modelResponse.status === 200 && modelResponse.data?.data) {
            const model = modelResponse.data.data
            setValue('modelName', model.model_name || '')
            setValue('brandId', model.brand?._id || '')
            setValue('status', model.status === true || model.status === 'true' ? 'true' : 'false')
          } else {
            toast.error('Failed to fetch model details')
            reset(initialData)
          }

          const brandResponse = await axiosInstance.get('brand/all')
          if (brandResponse.status === 200 && Array.isArray(brandResponse.data?.data)) {
            setBrands(brandResponse.data.data)
          } else {
            toast.error('Failed to fetch brands')
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch data: ${errorMessage}`)
          }
          reset(initialData)
        }
      }
    }
    fetchData()
  }, [open, categoryId, setValue, reset])

  const onSubmit = async data => {
    setIsSubmitting(true)
    const payload = {
      model_name: data.modelName,
      brand: data.brandId,
      status: data.status === 'true'
    }

    try {
      const response = await axiosInstance.put(`/model/${categoryId}`, payload)
      if (response.data.status === 200) {
        const responseData = response.data.data || response.data
        const brandObj = brands.find(b => b._id === data.brandId) || responseData.brand

        const updatedModel = {
          id: responseData._id || categoryId,
          modelName: responseData.model_name || data.modelName,
          brandName: brandObj?.name || responseData.brand?.name || 'N/A',

          //  status: responseData.status === true || responseData.status === 'true' ? 'true' : 'false',
          status: responseData.status != null ? responseData.status : data.status === 'Active',

          createdBy: responseData.created_by?.user_name || 'Unknown',
          createdDate: responseData.created_date ? formatDate(responseData.created_date) : ''
        }

        setData(prevData => prevData.map(item => (item.id === categoryId ? updatedModel : item)))

        toast.success(response.data.message)
        handleReset()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating model:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to update model: ${errorMessage}`)
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
        <Typography variant='h5'>Edit Model</Typography>
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
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.brandId)}>
                  <InputLabel id='brand-label'>Brand</InputLabel>
                  <Select {...field} labelId='brand-label' id='brand-select' label='Brand'>
                    <MenuItem value=''>Select Brand</MenuItem>
                    {brands.map(brand => (
                      <MenuItem key={brand._id} value={brand._id}>
                        {brand.name || 'N/A'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.brandId && <FormHelperText>{errors.brandId.message}</FormHelperText>}
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
                  <Select {...field} labelId='status-label' id='status-select' label='Status'>
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
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

export default AssetEditModalDrawer
