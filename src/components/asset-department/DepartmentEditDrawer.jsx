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

const formatDate = dateString => {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Invalid Date'
  }
}

const DepartmentEditDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
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
      departmentName: '',
      status: ''
    }
  })

  useEffect(() => {
    if (categoryId && customerData?.length) {
      const department = customerData.find(item => item.id === categoryId)
      if (department) {
        const normalizedStatus = department.status === true || department.status === 'true' ? 'true' : 'false'
        setOriginalData({
          departmentName: department.departmentName,
          status: normalizedStatus
        })
        setValue('departmentName', department.departmentName)
        setValue('status', normalizedStatus)
      }
    } else {
      resetForm()
      setOriginalData(null)
    }
  }, [categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.departmentName || !data.status) {
      toast.error('Department name and status are required.')
      return
    }

    if (
      originalData &&
      data.departmentName.trim() === originalData.departmentName.trim() &&
      data.status === originalData.status
    ) {
      toast.info('No fields to update')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const payload = {
        department: data.departmentName.trim(),
        status: data.status === 'true'
      }

      const response = await axiosInstance.put(`/dept/${categoryId}`, payload)

      if (response.data?.status === 200) {
        const resData = response.data.data
        const updatedDepartment = {
          id: resData._id,
          departmentName: resData.department,
          status: resData.status.toString(),
          createdBy: resData.created_by?.user_name || 'Unknown',
          createdDate: resData.created_date ? formatDate(resData.created_date) : '',
          updatedDate: resData.updated_date,
          formattedCreatedDate: formatDate(resData.created_date)
        }

        setData(prev => {
          const newData = prev.map(item => (item.id === updatedDepartment.id ? updatedDepartment : item))
          return newData
        })

        toast.success(response.data.message)
        resetForm()
        handleClose()
      } else {
        toast.error(response.data.message || 'Failed to update department')
      }
    } catch (error) {
      console.error('Error updating department:', error)
      toast.error(error.response?.data?.message || 'An error occurred while updating the department.')
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
        <Typography variant='h5'>Edit Department</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='departmentName'
              control={control}
              rules={{
                required: 'This field is required.',
                maxLength: { value: 50, message: 'Cannot exceed 50 characters.' }
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

            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id='status-label'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required.' }}
                render={({ field }) => (
                  <Select {...field} labelId='status-label' label='Status' value={field.value || ''}>
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>{errors.status?.message}</FormHelperText>}
            </FormControl>

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

export default DepartmentEditDrawer
