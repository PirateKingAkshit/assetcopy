


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
  CircularProgress,
  Autocomplete
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const AssetAddCustomerDrawer = ({ open, handleClose, setData, customerData, fetchData }) => {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

 const {
  control,
  reset: resetForm,
  handleSubmit,
  formState: { errors }
} = useForm({
  defaultValues: {
    categoryName: '',
    parentCategory: '',
    status: 'Published' // default to Active
  }
})


  const onSubmit = async data => {
    if (!data.categoryName || !data.status) {
      toast.error('Category name and status are required.')
      return
    }

    if (loading) return // Prevent multiple submissions

    setLoading(true)
    setApiError(null)

    try {
      const payload = {
        category_name: data.categoryName,
        parent_category: data.parentCategory || null,
        status: data.status === 'Published'
      }

      const response = await axiosInstance.post(`/category`, payload)

      if (response.data?.status === 200) {
        // Refresh the data by calling fetchData to ensure the latest data, including created_by, is fetched
        await fetchData()

        toast.success(response.data.message)
        resetForm()
        handleClose()
      } else {
        const errorMsg = response.data.message || 'Category name already exists'
        toast.error(errorMsg)
        setApiError(errorMsg)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      const errorMsg = error.response?.data?.message || 'An error occurred while adding the category.'
      toast.error(errorMsg)
      setApiError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm()
    setApiError(null)
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
        <Typography variant='h5'>Add Category</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            {/* Category Name */}
            <Controller
              name='categoryName'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Category Name'
                  placeholder='Enter category name'
                  error={Boolean(errors.categoryName)}
                  helperText={errors.categoryName ? 'This field is required.' : ''}
                />
              )}
            />

            {/* Parent Category */}
            <FormControl fullWidth error={Boolean(errors.parentCategory)}>
              <Controller
                name='parentCategory'
                control={control}
                render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                  <Autocomplete
                    options={customerData.filter(item => item.status === 'true')}
                    getOptionLabel={option => option.categoryName || ''}
                    isOptionEqualToValue={(option, val) => option.id === val?.id}
                    value={customerData.find(cat => cat.id === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue ? newValue.id : '')
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label='Parent Category'
                        placeholder='Select Parent Category'
                        inputRef={ref}
                        error={!!error}
                        helperText={error ? error.message : null}
                      />
                    )}
                    ListboxProps={{
                      style: {
                        maxHeight: 300,
                        overflow: 'auto'
                      }
                    }}
                  />
                )}
              />
            </FormControl>

            {/* Status */}
            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id='status-select'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select {...field} labelId='status-select' label='Status' value={field.value || ''}>
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='Published'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>Status cannot be empty</FormHelperText>}
            </FormControl>

            {apiError && (
              <Typography color='error' variant='body2'>
                {apiError}
              </Typography>
            )}

            {/* Submit Button */}
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

export default AssetAddCustomerDrawer
