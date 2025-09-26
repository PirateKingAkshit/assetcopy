'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormHelperText,
  Typography,
  CircularProgress
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const BrandAddDrawer = ({ open, handleClose, fetchData }) => {
  const [loading, setLoading] = useState(false)

const {
  control,
  reset,
  handleSubmit,
  formState: { errors }
} = useForm({
  defaultValues: {
    brandName: '',
    status: 'Active' // ✅ default Active
  }
})

// ✅ useEffect hamesha useForm ke baad likho
useEffect(() => {
  if (open) {
    reset({
      brandName: '',
      status: 'Active'
    })
  }
}, [open, reset])



  const onSubmit = async data => {
    if (!data.brandName || !data.status) {
      toast.error('Brand name and status are required.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: data.brandName,
        status: data.status === 'Active'
      }

      const response = await axiosInstance.post('/brand', payload)

      if (response.data?.status === 200) {
        // Refresh the data by calling fetchData to ensure the latest data, including created_by, is fetched
        await fetchData()

        toast.success(response.data.message || 'Brand added successfully!')
        reset()
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to add brand.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Something went wrong.')
      console.error('Error adding brand:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
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
        <Typography variant='h5'>Add Brand</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='brandName'
              control={control}
              rules={{
                required: 'Brand name is required',
                maxLength: {
                  value: 50,
                  message: 'Brand name must not exceed 50 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Brand Name'
                  placeholder='Enter brand name'
                  error={Boolean(errors.brandName)}
                  helperText={errors.brandName?.message}
                />
              )}
            />

            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id='status-select'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} labelId='status-select' label='Status' value={field.value || ''}>
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>

            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Submit'}
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

export default BrandAddDrawer
