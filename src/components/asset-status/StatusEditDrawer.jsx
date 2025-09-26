'use client'

import { useState, useEffect } from 'react'
import { Button, Drawer, Divider, IconButton, TextField, Typography, CircularProgress } from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import axiosInstance from '@/utils/axiosinstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const StatusEditDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [originalStatus, setOriginalStatus] = useState('')

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      status: ''
    }
  })

  const formatDate = iso => {
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    if (categoryId && customerData?.length) {
      const item = customerData.find(entry => entry.id === categoryId)
      if (item) {
        setValue('status', item.categoryName || '')
        setOriginalStatus(item.categoryName || '')
      }
    } else {
      resetForm()
      setOriginalStatus('')
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.status) {
      setApiError('Status cannot be empty.')
      return
    }

    // Check if no changes
    if (data.status.trim() === originalStatus.trim()) {
      toast.info('No fields to update')
      return
    }

    setLoading(true)
    setApiError(null)

    try {
      const payload = { status: data.status.trim() }

      const response = await axiosInstance.put(`/status/${categoryId}`, payload)
      const resData = response.data?.data

      if (response.status === 200 && resData) {
        const updatedItem = {
          _id: resData._id,
          status: resData.status,
          parent_category: resData.parent_category || null,
          created_by: resData.created_by || { user_name: 'Unknown' },
          createdDate: resData.created_date ? formatDate(resData.created_date) : ''
        }

        setData(updatedItem)
        toast.success(response.data.message)
        resetForm()
        setOriginalStatus(resData.status)
        handleClose()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error.response?.data?.message || 'Something went wrong while updating.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
    setApiError(null)
    setOriginalStatus('')
    handleClose()
  }

  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleReset}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <div className='flex items-center justify-between p-5'>
          <Typography variant='h5'>Edit Status</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='status'
                control={control}
                rules={{
                  required: 'Status cannot be empty.',
                  maxLength: {
                    value: 50,
                    message: 'Status must not exceed 50 characters.'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Status'
                    placeholder='Enter status (e.g. Active, Inactive)'
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
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
    </>
  )
}

export default StatusEditDrawer
