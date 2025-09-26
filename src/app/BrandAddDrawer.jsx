

'use client'

import { useState } from 'react'
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
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const BrandAddDrawer = ({ open, handleClose, setData, setFilteredData }) => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      brandName: '',
      status: ''
    }
  })

  const onSubmit = async data => {
    if (!data.brandName || !data.status) return

    setLoading(true)

    try {
      const payload = {
        name: data.brandName,
        status: data.status === 'Active'
      }

      const response = await axiosInstance.post('/brand', payload)

      if (response.data?.status === 200) {
        const resData = response.data.data

        const newBrand = {
          id: resData._id,
          categoryName: resData.name,
          status: resData.status ? 'true' : 'false',
          createdBy: resData.created_by?.user_name || 'Unknown',
          // createdDate: resData.created_date
          createdDate: resData?.created_date ? formatDate(resData.created_date) : 'null'
        }

        // setData(prev => [...prev, newBrand])
         setData(prev => [newBrand,...(prev ?? [])])
        setFilteredData(prev => [...prev, newBrand])
        reset()
        handleClose()
        toast.success(response.data.message)
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
                <Button variant='outlined' color='secondary' onClick={handleReset}>
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

export default BrandAddDrawer
