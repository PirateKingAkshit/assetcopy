// AssetEditCustomerDrawer.jsx
'use client'

import { useState, useEffect } from 'react'
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

// Safer date formatter
const formatDate = (iso) => {
  if (!iso || isNaN(new Date(iso).getTime())) return '' // Return empty string for invalid dates
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const AssetEditCustomerDrawer = ({ open, handleClose, setData, customerData, categoryId }) => {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [originalData, setOriginalData] = useState(null)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      categoryName: '',
      parentCategory: '',
      status: ''
    }
  })

  useEffect(() => {
    if (open && categoryId && customerData?.length) {
      const category = customerData.find(item => item.id === categoryId)
      if (category) {
        const initialData = {
          categoryName: category.categoryName || '',
          parentCategory: category.parentCategoryId || '',
          status: category.status === true || category.status === 'true' ? 'true' : 'false',
          createdDate: category.createdDate || '' // Preserve the formatted createdDate
        }
        setValue('categoryName', initialData.categoryName)
        setValue('parentCategory', initialData.parentCategory)
        setValue('status', initialData.status)
        setOriginalData(initialData)
      }
    } else {
      resetForm()
      setOriginalData(null)
    }
  }, [open, categoryId, customerData, setValue, resetForm])

  const onSubmit = async data => {
    if (!data.categoryName || !data.status) {
      setApiError('Category name and status are required.')
      toast.error('Category name and status are required.')
      return
    }

    if (
      originalData &&
      data.categoryName === originalData.categoryName &&
      (data.parentCategory || '') === (originalData.parentCategory || '') &&
      data.status === originalData.status
    ) {
      toast.info('No fields to update')
      return
    }

    setLoading(true)
    setApiError(null)

    try {
      const payload = {
        category_name: data.categoryName,
        parent_category: data.parentCategory || null,
        status: data.status === 'true'
      }

      const response = await axiosInstance.put(`/category/${categoryId}`, payload)
      const resData = response.data?.data

      if (response.status === 200 && resData) {
        const updatedCategory = {
          id: resData._id?.toString(),
          categoryName: resData.category_name,
          parentCategory: resData.parent_category?.category_name || 'None',
          parentCategoryId: resData.parent_category?._id || null,
          status: resData.status.toString(),
          createdBy: resData.created_by?.user_name || originalData?.createdBy || 'Unknown',
          createdDate: resData.created_date
            ? formatDate(resData.created_date)
            : originalData?.createdDate || '' // Preserve original createdDate if API doesn't return it
        }

        setData(updatedCategory)
        toast.success('Category updated successfully!')
        resetForm()
        handleClose()
      } else {
        const errMsg = response.data?.message || 'Failed to save category.'
        setApiError(errMsg)
        toast.error(errMsg)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while saving the category.'
      setApiError(errorMsg)
      toast.error(errorMsg)
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
        <Typography variant='h5'>{categoryId ? 'Edit Category' : 'Add Category'}</Typography>
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
              rules={{ required: 'Category name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Category Name'
                  placeholder='Enter category name'
                  error={Boolean(errors.categoryName)}
                  helperText={errors.categoryName?.message}
                />
              )}
            />
            <FormControl fullWidth error={Boolean(errors.parentCategory)}>
              <InputLabel id='parent-category-label'>Parent Category</InputLabel>
              <Controller
                name='parentCategory'
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId='parent-category-label' label='Parent Category' value={field.value || ''}>
                    <MenuItem value=''>None</MenuItem>
                    {customerData
                      ?.filter(item => item.status === true || item.status === 'true')
                      .filter(item => item.id !== categoryId)
                      .map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id='status-label'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} labelId='status-label' label='Status' value={field.value || ''}>
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>
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

export default AssetEditCustomerDrawer
