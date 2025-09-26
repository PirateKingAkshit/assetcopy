'use client'

import { useState, useEffect } from 'react'
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
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import axiosInstance from '@/utils/axiosinstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const UserAddDrawer = ({ open, handleClose, setData, userData, refreshData }) => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [dropdownLoading, setDropdownLoading] = useState(false)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      userName: '',
      reportedTo: '',
      roleId: '',
      departmentId: '',
      email: '',
      mobile: '',
      password: '',

       status: 'Published'   
    },
    mode: 'onChange'
  })

  // Fetch roles, departments, and users for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setDropdownLoading(true)

        // Fetch roles
        const rolesResponse = await axiosInstance.get('/role/all')
        if (rolesResponse.data?.status === 200) {
          setRoles(rolesResponse.data.data || [])
        } else {
          toast.error(rolesResponse.data?.message || 'Failed to fetch roles')
        }

        // Fetch departments
        const departmentsResponse = await axiosInstance.get('/dept/all')
        if (departmentsResponse.data?.status === 200) {
          setDepartments(departmentsResponse.data.data || [])
        } else {
          toast.error(departmentsResponse.data?.message || 'Failed to fetch departments')
        }

        // Fetch users for reported_to
        const usersResponse = await axiosInstance.get('/user/all')
        if (usersResponse.data?.status === 200) {
          setUsers(usersResponse.data.data || [])
        } else {
          toast.error(usersResponse.data?.message || 'Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        toast.error(error.response?.data?.message || 'Failed to load dropdown data.')
      } finally {
        setDropdownLoading(false)
      }
    }

    if (open) {
      fetchDropdownData()
    }
  }, [open])

  const onSubmit = async data => {
    setLoading(true)

    try {
      const payload = {
        user_name: data.userName.trim(),
        reported_to: data.reportedTo || null,
        role: data.roleId,
        department: data.departmentId,
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        password: data.password.trim(),

        status: data.status === 'Published'
      }
      for (const data in payload) {
        if (payload[data] === null || payload[data] === '') {
          delete payload[data]
        }
      }

      const response = await axiosInstance.post('/user', payload)

      if (response.data?.status === 200) {
        const roleObj = roles.find(r => r._id === data.roleId) || { role_name: 'Unknown' }
        const deptObj = departments.find(d => d._id === data.departmentId) || { department: 'Unknown' }
        const reportedToUser = data.reportedTo ? users.find(u => u._id === data.reportedTo) : null

        refreshData()
        toast.success(response.data.message)
        resetForm()
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to add user. Please try again.')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`)
        })
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong while adding user.')
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
          <Typography variant='h5'>Add User</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            {dropdownLoading ? (
              <div className='flex justify-center items-center h-64'>
                <CircularProgress />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-5'>
                <Controller
                  name='userName'
                  control={control}
                  rules={{
                    required: 'User name is required.',
                    maxLength: { value: 50, message: 'User name cannot exceed 50 characters.' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='User Name'
                      placeholder='Enter user name'
                      error={Boolean(errors.userName)}
                      helperText={errors.userName?.message}
                      autoComplete='new-username'
                    />
                  )}
                />

                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Email'
                      placeholder='Enter email'
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  name='password'
                  control={control}
                  rules={{
                    required: 'Password is required.',
                    minLength: { value: 6, message: 'Password must be at least 6 characters.' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='password'
                      label='Password'
                      placeholder='Enter password'
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      autoComplete='new-password'
                    />
                  )}
                />

                <Controller
                  name='mobile'
                  control={control}
                  rules={{
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Mobile number must be 10 digits'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Mobile'
                      placeholder='Enter mobile number'
                      error={Boolean(errors.mobile)}
                      helperText={errors.mobile?.message}
                      inputProps={{
                        maxLength: 10,
                        type: 'text',
                        inputMode: 'numeric',
                        onChange: e => {
                          const numeric = e.target.value.replace(/\D/g, '')
                          if (numeric.length <= 10) {
                            field.onChange(numeric)
                          }
                        }
                      }}
                    />
                  )}
                />

                <Controller
                  name='roleId'
                  control={control}
                  rules={{ required: 'Role is required.' }}
                  render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                    <Autocomplete
                      options={roles}
                      getOptionLabel={option => option.role_name || ''}
                      isOptionEqualToValue={(option, val) => option._id === val?._id}
                      value={roles.find(role => role._id === value) || null}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue._id : '')
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Role'
                          placeholder='Select Role'
                          inputRef={ref}
                          error={!!error}
                          helperText={error ? error.message : null}
                          required
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                          overflow: 'auto'
                        }
                      }}
                      clearOnEscape
                    />
                  )}
                />

                <Controller
                  name='departmentId'
                  control={control}
                  rules={{ required: 'Department is required.' }}
                  render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                    <Autocomplete
                      options={departments}
                      getOptionLabel={option => option.department || ''}
                      isOptionEqualToValue={(option, val) => option._id === val?._id}
                      value={departments.find(dept => dept._id === value) || null}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue._id : '')
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Department'
                          placeholder='Select Department'
                          inputRef={ref}
                          error={!!error}
                          helperText={error ? error.message : null}
                          required
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                          overflow: 'auto'
                        }
                      }}
                      clearOnEscape
                    />
                  )}
                />

                <Controller
                  name='reportedTo'
                  control={control}
                  render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                    <Autocomplete
                      options={users}
                      getOptionLabel={option => option.user_name || ''}
                      isOptionEqualToValue={(option, val) => option._id === val?._id}
                      value={users.find(user => user._id === value) || null}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue._id : '')
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Reported To'
                          placeholder='Select Reported To'
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
                      clearOnEscape
                    />
                  )}
                />

                {/* Status */}
                <FormControl fullWidth error={Boolean(errors.status)}>
                  <InputLabel id='status-select'>Status</InputLabel>
                  <Controller
                    name='status'
                    control={control}
                    rules={{ required: 'Status cannot be empty' }}
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

                <div className='flex items-center gap-4'>
                  <Button variant='contained' type='submit' disabled={loading || dropdownLoading}>
                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                  </Button>
                  <Button variant='outlined' color='error' onClick={handleReset}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </PerfectScrollbar>
      </Drawer>
      
    </>
  )
}

export default UserAddDrawer
