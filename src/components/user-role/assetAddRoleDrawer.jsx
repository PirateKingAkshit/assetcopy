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
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const RoleAddDrawer = ({ open, handleClose, setData, refreshData }) => {
  const [loading, setLoading] = useState(false)

  const {
  control,
  reset: resetForm,
  handleSubmit,
  formState: { errors }
} = useForm({
  defaultValues: {
    roleName: '',
    status: 'Active' 
  }
})

useEffect(() => {
  if (open) {
    resetForm({
      roleName: '',
      status: 'Active'
    })
  }
}, [open, resetForm])


  const onSubmit = async data => {
    setLoading(true)

    try {
      const payload = {
        role_name: data.roleName.trim(),
        status: data.status.trim().toLowerCase() === 'active'
      }

      const response = await axiosInstance.post(`/role`, payload)

      if (response.data?.status === 200) {
        refreshData()

        toast.success(response.data.message)
        resetForm()
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to add role. Please try again.')
      }
    } catch (error) {
      console.error('Error adding role:', error)
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`)
        })
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong while adding role.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
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
          <Typography variant='h5'>Add Role</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='roleName'
                control={control}
                rules={{
                  required: 'Role name is required.',
                  maxLength: {
                    value: 50,
                    message: 'Role name cannot exceed 50 characters.'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Role Name'
                    placeholder='Enter role name'
                    error={Boolean(errors.roleName)}
                    helperText={errors.roleName?.message}
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
    </>
  )
}

export default RoleAddDrawer
