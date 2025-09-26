

'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  Divider,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const formatDateToDDMMYYYY = dateString => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const DepartmentAddDrawer = ({ open, handleClose, fetchData }) => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      departmentName: '',
      status: 'Active'
    }
  })

  useEffect(() => {
  if (open) {
    resetForm({
      departmentName: '',
      status: 'Active'   
    })
  }
}, [open, resetForm])


  const onSubmit = async data => {
    setLoading(true)

    try {
      const payload = {
        department: data.departmentName.trim(),
        status: data.status.trim().toLowerCase() === 'active'
      }

      const response = await axiosInstance.post(`/dept`, payload)

      if (response.data?.status === 200) {
        await fetchData() // Refresh data from server
        toast.success(response.data.message)
        resetForm()
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to add department. Please try again.')
      }
    } catch (error) {
      console.error('Error adding department:', error)
      toast.error(error.response?.data?.message || 'Something went wrong while adding department.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
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
        <Typography variant='h5'>Add Department</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            {/* Department Name */}
            <Controller
              name='departmentName'
              control={control}
              rules={{
                required: 'Department name is required.',
                maxLength: {
                  value: 50,
                  message: 'Department name cannot exceed 50 characters.'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Department Name'
                  placeholder='Enter department name'
                  error={Boolean(errors.departmentName)}
                  helperText={errors.departmentName?.message}
                />
              )}
            />

            {/* Status */}
            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.status)}>
                  <InputLabel id='status-label'>Status</InputLabel>
                  <Select
                    {...field}
                    labelId='status-label'
                    id='status-select'
                    label='Status'
                    aria-describedby={errors.status ? 'status-error' : undefined}
                  >
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText id='status-error'>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Buttons */}
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

export default DepartmentAddDrawer
