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

const initialData = {
  conditionName: '',
  status: ''
}

const ConditionEditDrawer = ({ open, handleClose, setData, customerData, categoryId, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: initialData
  })

  useEffect(() => {
    if (categoryId && customerData) {
      const conditionData = customerData.find(item => item.id === categoryId)
      if (conditionData) {
        setValue('conditionName', conditionData.conditionName || 'N/A')
        setValue('status', conditionData.status === true || conditionData.status === 'true' ? 'true' : 'false')
      } else {
        resetForm(initialData)
      }
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!categoryId) {
      toast.error('Invalid condition ID')
      return
    }

    const isDuplicate = customerData?.some(
      item => item.conditionName.toLowerCase() === data.conditionName.toLowerCase() && item.id !== categoryId
    )
    if (isDuplicate) {
      toast.error('Condition already exists')
      return
    }

    setIsSubmitting(true)
    try {
      const existingCondition = customerData.find(item => item.id === categoryId) || {}

      const payload = {}
      if (data.conditionName !== (existingCondition.conditionName || 'N/A')) {
        payload.condition = data.conditionName
      }
      if ((data.status === 'true') !== existingCondition.status) {
        payload.status = data.status === 'true'
      }

      if (Object.keys(payload).length === 0) {
        toast.success('Condition updated successfully')
        handleReset()
        return
      }

      const response = await axiosInstance.put(`/condition/${categoryId}`, payload)
      if (response.status === 200) {
        refreshData()
        toast.success(response.data.message)
        handleReset()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      toast.error(`Failed to update condition: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    resetForm(initialData)
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
        <Typography variant='h5'>Edit Condition</Typography>
        <IconButton size='small' onClick={handleReset} aria-label='Close drawer'>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='conditionName'
              control={control}
              rules={{ required: 'Condition name is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.conditionName)}>
                  <InputLabel id='conditionName-select'>Condition Name</InputLabel>
                  <Select
                    {...field}
                    id='select-conditionName'
                    label='Condition Name'
                    labelId='conditionName-select'
                    aria-describedby={errors.conditionName ? 'conditionName-error' : undefined}
                  >
                    <MenuItem value='good'>Good</MenuItem>
                    <MenuItem value='poor'>Poor</MenuItem>
                    <MenuItem value='new'>New</MenuItem>
                    <MenuItem value='damaged'>Damaged</MenuItem>
                  </Select>
                  {errors.conditionName && (
                    <FormHelperText id='conditionName-error'>{errors.conditionName.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.status)}>
                  <InputLabel id='status-select'>Status</InputLabel>
                  <Select
                    {...field}
                    id='select-status'
                    label='Status'
                    labelId='status-select'
                    aria-describedby={errors.status ? 'status-error' : undefined}
                    value={field.value || ''}
                  >
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText id='status-error'>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
              <Button variant='outlined' color='error' onClick={handleReset} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default ConditionEditDrawer
