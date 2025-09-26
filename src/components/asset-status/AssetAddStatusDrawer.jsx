'use client'

import { useState, useEffect } from 'react'
import { Button, Drawer, Divider, IconButton, TextField, Typography, CircularProgress } from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AssetAddStatusDrawer = ({ open, handleClose, customerData, categoryId, fetchData }) => {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      categoryName: ''
    }
  })

  useEffect(() => {
    if (categoryId && customerData?.length) {
      const category = customerData.find(item => item.id === categoryId)
      if (category) {
        setValue('categoryName', category.categoryName)
      }
    } else {
      resetForm()
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.categoryName) {
      setApiError('Status name is required.')
      toast.error('Status name is required.')
      return
    }

    if (loading) return // Prevent multiple submissions

    setLoading(true)
    setApiError(null)

    try {
      const payload = {
        status: data.categoryName
      }

      console.log('Payload sent to API:', payload)
      let response
      if (categoryId) {
        response = await axiosInstance.put(`/status/${categoryId}`, payload)
      } else {
        response = await axiosInstance.post('/status', payload)
      }

      console.log('API Response:', response.data)

      if (response.data?.status === 200) {
        // Refresh the data by calling fetchData to ensure the latest data, including created_by, is fetched
        await fetchData()

        toast.success(categoryId ? 'Status updated successfully!' : 'Status added successfully!')
        resetForm()
        handleClose()
      } else {
        const errorMsg = response.data?.message || 'Status already exists'
        toast.error(errorMsg)
        setApiError(errorMsg)
      }
    } catch (error) {
      console.error('Error saving status:', error)
      const errorMsg = error.response?.data?.message || 'Status already exists'
      toast.error(errorMsg)
      setApiError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
    setApiError(null)
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
        <Typography variant='h5'>{categoryId ? 'Edit Status' : 'Add Status'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='categoryName'
              control={control}
              rules={{
                required: 'This field is required.',
                maxLength: {
                  value: 50,
                  message: 'Status name must be less than or equal to 50 characters.'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Status Name'
                  placeholder='Enter status name'
                  error={Boolean(errors.categoryName)}
                  helperText={errors.categoryName?.message}
                />
              )}
            />

            {apiError && (
              <Typography color='error' variant='body2'>
                {apiError}
              </Typography>
            )}

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

export default AssetAddStatusDrawer
