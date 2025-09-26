'use client'

import {
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  FormHelperText
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import { CloudUpload } from 'lucide-react'

const MenuEditDrawer = ({ open, handleClose, fetchData, menuId }) => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [menuOptions, setMenuOptions] = useState([])
  const [existingIcon, setExistingIcon] = useState(null)
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      menu_name: '',
      menu_order: '',
      parent_menu: '',
      route: '',
      status: ''
    }
  })

  useEffect(() => {
    if (!open || !menuId) return

    const fetchMenuDetails = async () => {
      setFetching(true)
      try {
        const response = await axiosInstance.get(`/menu/${menuId}`)
        if (response.data?.status === 200) {
          const menu = response.data.data
          reset({
            menu_name: menu.menu_name || '',
            menu_order: String(menu.menu_order) || '',
            parent_menu: menu.parent_menu?._id || '',
            route: menu.route || '',
            status: menu.status ? 'true' : 'false'
          })
          setExistingIcon(menu.icon || null)
        } else {
          toast.error(response.data?.message || 'Failed to fetch menu details')
        }
      } catch (err) {
        toast.error('Failed to load menu details')
      } finally {
        setFetching(false)
      }
    }

    const fetchMenuOptions = async () => {
      try {
        const response = await axiosInstance.get('/menu/all')
        const options =
          response.data?.data
            ?.filter(item => item._id !== menuId)
            .map(item => ({ id: item._id, name: item.menu_name })) || []
        setMenuOptions(options)
      } catch (err) {
        toast.error('Failed to fetch parent menu options')
      }
    }

    fetchMenuDetails()
    fetchMenuOptions()
  }, [open, menuId, reset])

  useEffect(() => {
    if (!open) {
      reset()
      setFile(null)
      setExistingIcon(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, reset])

  const onSubmit = async data => {
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('menu_name', data.menu_name)
      payload.append('menu_order', Number(data.menu_order))
      payload.append('parent_menu', data.parent_menu || '')
      // payload.append('route', data.route)
      payload.append('status', data.status === 'true')
      if (file) payload.append('icon', file)

      const response = await axiosInstance.put(`/menu/${menuId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.status === 200) {
        toast.success('Menu updated successfully')
        fetchData()
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to update menu')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Edit Menu</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {fetching ? (
          <div className='flex justify-center items-center h-64'>
            <CircularProgress />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            {/* Menu Name */}
            <Controller
              name='menu_name'
              control={control}
              rules={{ required: 'Menu name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Menu Name'
                  fullWidth
                  error={!!errors.menu_name}
                  helperText={errors.menu_name?.message}
                />
              )}
            />

            {/* Menu Order */}
            <Controller
              name='menu_order'
              control={control}
              rules={{ required: 'Menu order is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Menu Order'
                  fullWidth
                  error={!!errors.menu_order}
                  helperText={errors.menu_order?.message}
                />
              )}
            />

            {/* Parent Menu */}
            <Controller
              name='parent_menu'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id='parent-menu-label'>Parent Menu</InputLabel>
                  <Select {...field} labelId='parent-menu-label' label='Parent Menu'>
                    <MenuItem value=''>None</MenuItem>
                    {menuOptions.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* ✅ Route Field */}
            <Controller
              name='route'
              control={control}
              rules={{
                // required: 'Route is required',
                pattern: {
                  value: /^\/[a-zA-Z0-9/_-]*$/,
                  message: 'Route must start with / and contain only letters, numbers, -, _ or /'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Route'
                  placeholder='/dashboard'
                  error={!!errors.route}
                  helperText={errors.route?.message}
                />
              )}
            />

            {/* Status */}
            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id='status-select'>Status</InputLabel>
                  <Select {...field} labelId='status-select' label='Status'>
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Upload Icon */}
            <div>
              <Button variant='outlined' component='label' fullWidth className='h-[56px] text-gray-500 border-gray-300'>
                <CloudUpload className='text-gray-500 mr-2' />
                Upload Icon
                <input
                  type='file'
                  accept='image/jpeg,image/png,application/pdf'
                  hidden
                  onChange={e => {
                    const selectedFile = e.target.files[0]
                    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
                      setFile(selectedFile)
                      setExistingIcon(null)
                    } else {
                      toast.error('Invalid file or size > 5MB')
                    }
                  }}
                  ref={fileInputRef}
                />
              </Button>
              {existingIcon && !file && (
                <Typography variant='body2' mt={1}>
                  Current Icon:{' '}
                  <a href={existingIcon} target='_blank' rel='noopener noreferrer'>
                    View Icon
                  </a>
                </Typography>
              )}
              {file && (
                <Typography variant='body2' mt={1}>
                  New Icon: {file.name}
                </Typography>
              )}
            </div>

            {/* Submit / Cancel */}
            <div className='flex items-center gap-2'>
              
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update'}
              </Button>
              <Button variant='outlined' color='error' onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}

export default MenuEditDrawer
