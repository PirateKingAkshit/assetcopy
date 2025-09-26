'use client'

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
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const BrandEditDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
  const [loading, setLoading] = useState(false)
  const [originalData, setOriginalData] = useState(null)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      status: ''
    }
  })

  const formatDate = iso => {
    if (!iso || isNaN(new Date(iso).getTime())) return ''
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    if (categoryId && customerData?.length) {
      const brand = customerData.find(item => item.id === categoryId)
      if (brand) {
        const name = brand.categoryName || ''
        const status = brand.status === true || brand.status === 'true' ? 'true' : 'false' // ensure string 'true' or 'false'
        setValue('name', name)
        setValue('status', status)
        setOriginalData({ name, status })
      } else {
        resetForm()
        setOriginalData(null)
      }
    } else {
      resetForm()
      setOriginalData(null)
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.name || !data.status) {
      toast.error('Please fill all required fields')
      return
    }

    if (originalData && data.name.trim() === originalData.name.trim() && data.status === originalData.status) {
      toast.info('No fields to update')
      return
    }

    setLoading(true)

    const payload = {
      name: data.name.trim(),
      status: data.status === 'true' // convert to boolean
    }

    try {
      const response = await axiosInstance.put(`/brand/${categoryId}`, payload)
      const resData = response.data?.data

      if (response.status === 200 && resData) {
        const updatedBrand = {
          id: resData._id,
          categoryName: resData.name,
          status: resData.status.toString(),
          createdBy: resData.created_by?.user_name || 'Unknown',
          createdDate: resData.created_date ? formatDate(resData.created_date) : ''
        }

        setData(updatedBrand)
        toast.success(response.data.message)
        resetForm()
        setOriginalData(null)
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to update brand.')
      }
    } catch (error) {
      console.error('Error updating brand:', error)
      toast.error(error?.response?.data?.message || 'Something went wrong while updating.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
    setOriginalData(null)
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
        <Typography variant='h5'>Edit Brand</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='name'
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
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id='status-label'>Status</InputLabel>
                  <Select {...field} labelId='status-label' label='Status'>
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update'}
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

export default BrandEditDrawer
