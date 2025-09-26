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

const RoleEditDrawer = ({ open, handleClose, setData, customerData, categoryId, refreshData }) => {
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
      roleName: '',
      status: ''
    }
  })

  useEffect(() => {
    if (categoryId && customerData?.length) {
      const role = customerData.find(item => item.id === categoryId)
      if (role) {
        const normalizedStatus = role.status === true || role.status === 'true' ? 'true' : 'false'

        setOriginalData({
          roleName: role.roleName,
          status: normalizedStatus
        })

        setValue('roleName', role.roleName)
        setValue('status', normalizedStatus)
      }
    } else {
      resetForm()
      setOriginalData(null)
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.roleName || !data.status) {
      toast.error('Role name and status are required.')
      return
    }

    if (originalData && data.roleName.trim() === originalData.roleName.trim() && data.status === originalData.status) {
      toast.info('No fields to update')
      return
    }

    setLoading(true)

    try {
      const payload = {
        role_name: data.roleName.trim(),
        status: data.status === 'true' // converts string to boolean
      }

      const response = await axiosInstance.put(`/role/${categoryId}`, payload)

      if (response.data?.status === 200) {
        const updatedRole = {
          id: response.data.data._id,
          roleName: response.data.data.role_name,
          status: response.data.data.status === true ? 'true' : 'false',
          createdBy: response.data.data.created_by?.user_name || 'Unknown',
          createdDate: response.data.data.created_date,
          updatedDate: response.data.data.updated_date
        }

        setData(updatedRole)
        toast.success(response.data.message)
        resetForm()
        handleClose()
        refreshData()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error.response?.data?.message || 'An error occurred while updating the role.')
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
          <Typography variant='h5'>Edit Role</Typography>
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
                  required: 'This field is required.',
                  maxLength: { value: 50, message: 'Cannot exceed 50 characters.' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Role Name'
                    placeholder='Enter Role name'
                    error={Boolean(errors.roleName)}
                    helperText={errors.roleName?.message}
                  />
                )}
              />

              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required.' }}
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

export default RoleEditDrawer
