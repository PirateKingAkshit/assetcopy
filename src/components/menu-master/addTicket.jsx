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
// import { CloudUpload } from 'lucide-react'

const MenuAddDrawer = ({ open, handleClose, fetchData }) => {
  const [loading, setLoading] = useState(false)
  const [menuOptions, setMenuOptions] = useState([])
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)

  const {
    control,
    handleSubmit,
    reset,
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
    if (open) {
      axiosInstance
        .get('/menu/all')
        .then(res => {
          const options = res.data?.data?.map(item => ({ id: item._id, name: item.menu_name })) || []
          setMenuOptions(options)
        })
        .catch(() => toast.error('Failed to fetch parent menu options'))
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      reset()
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, reset])

  //   const onSubmit = async (data) => {
  //     if (!data.status) {
  //       toast.error('Please select status')
  //       return
  //     }

  //     setLoading(true)
  //     try {
  //       const payload = new FormData()
  //       payload.append('menu_name', data.menu_name)
  //       payload.append('menu_order', Number(data.menu_order))
  //       payload.append('parent_menu', data.parent_menu || '')
  //       payload.append('route', data.route)
  //       payload.append('status', data.status === 'Published')
  //       // payload.append('icon', file)

  // for (const [key, value] of payload.entries()) {
  //   if (value === null || value === '') {
  //     payload.set(key, '') // Ensure it gets sent as an empty string
  //   }
  // }

  //       const response = await axiosInstance.post('/menu', payload, {
  //         headers: { 'Content-Type': 'multipart/form-data' }
  //       })

  //       if (response.data?.status === 200) {
  //         toast.success('Menu added successfully')
  //         fetchData()
  //         handleClose()
  //       } else {
  //         toast.error(response.data.message || 'Failed to add menu')
  //       }
  //     } catch (error) {
  //       toast.error(error.response?.data?.message || 'Error adding menu')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  const onSubmit = async data => {
    if (!data.status) {
      toast.error('Please select status')
      return
    }

    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('menu_name', data.menu_name)
      payload.append('menu_order', Number(data.menu_order))
      payload.append('status', data.status === 'Published')

      // ✅ Only append if filled
      if (data.route && data.route.trim() !== '') {
        payload.append('route', data.route.trim())
      }

      if (data.parent_menu && data.parent_menu.trim() !== '') {
        payload.append('parent_menu', data.parent_menu.trim())
      }

      const response = await axiosInstance.post('/menu', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.status === 200) {
        toast.success('Menu added successfully')
        fetchData()
        handleClose()
      } else {
        toast.error(response.data.message || 'Failed to add menu')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Add Menu</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Menu Name */}
          <Controller
            name='menu_name'
            control={control}
            rules={{ required: 'Menu name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Menu Name'
                error={Boolean(errors.menu_name)}
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
                fullWidth
                label='Menu Order'
                error={Boolean(errors.menu_order)}
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

          {/* ✅ Route Field (Added before status) */}
          {/* <Controller
            name='route'
            control={control}
            rules={{
               required: 'Route is required',
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
                error={Boolean(errors.route)}
                helperText={errors.route?.message}
              />
            )}
          /> */}
          <Controller
            name='route'
            control={control}
            rules={{
              validate: value => {
                if (!value) return true // optional, so allow empty
                const pattern = /^\/[a-zA-Z0-9/_-]*$/
                return pattern.test(value) || 'Route must start with / and contain only letters, numbers, -, _ or /'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Route (optional)'
                placeholder='/dashboard'
                error={Boolean(errors.route)}
                helperText={errors.route?.message}
              />
            )}
          />

          {/* Status */}
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
                  <MenuItem value='Published'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>Status cannot be empty</FormHelperText>}
          </FormControl>

          {/* Submit / Cancel */}
          <div className='flex items-center gap-2'>
           
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
             <Button variant='outlined' color='error' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default MenuAddDrawer
