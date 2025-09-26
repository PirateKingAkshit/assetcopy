'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

const UserEditDrawer = ({ open, handleClose, setData, taxId, refreshData }) => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reportedToOptions, setReportedToOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [originalEmail, setOriginalEmail] = useState('')

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    setValue,

    formState: { errors }
  } = useForm({
    defaultValues: {
      user_name: '',
      email: '',
      mobile: '',
      password: '',
      reported_to: '',
      role: '',
      department: '',
      status: ''
    },
    mode: 'onChange'
  })

  // Fetch user, roles, and departments data
  useEffect(() => {
    const fetchData = async () => {
      if (open && taxId) {
        try {
          setIsLoading(true)

          // Fetch user data
          const userResponse = await axiosInstance.get(`user/${taxId}`)
          if (userResponse.status === 200 && userResponse.data?.data) {
            const user = userResponse.data.data
            setValue('user_name', user.user_name || '')
            setOriginalEmail(user.email || '')

            setValue('email', user.email || '')
            setValue('mobile', user.mobile || '')
            setValue('password', '') // Password not fetched for security
            // setValue('reported_to', user.reported_to || '')
            setValue('reported_to', user.reported_to?._id || '')

            setValue('role', user.role?._id || '')
            setValue('department', user.department?._id || '')
            setValue('status', user.status ? 'Published' : 'Inactive')
          } else {
            toast.error('Failed to fetch user details')
            reset()
          }

          // Fetch reported_to and department options from user/all
          const usersResponse = await axiosInstance.get('user/all')
          if (usersResponse.status === 200 && Array.isArray(usersResponse.data?.data)) {
            // Set reported_to options
            setReportedToOptions(
              usersResponse.data.data.map(user => ({
                id: user._id,
                user_name: user.user_name
              }))
            )

            // Extract unique departments
            const departments = usersResponse.data.data
              .filter(user => user.department && user.department._id && user.department.department)
              .map(user => ({
                id: user.department._id,
                department: user.department.department
              }))
            // Remove duplicates by id
            const uniqueDepartments = Array.from(new Map(departments.map(dept => [dept.id, dept])).values())
            setDepartmentOptions(uniqueDepartments)
          }

          // Fetch role options
          const rolesResponse = await axiosInstance.get('role/all')
          if (rolesResponse.status === 200 && Array.isArray(rolesResponse.data?.data)) {
            setRoleOptions(
              rolesResponse.data.data.map(role => ({
                id: role._id,
                role_name: role.role_name
              }))
            )
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch data: ${errorMessage}`)
          }
          reset()
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchData()
  }, [open, taxId, setValue, reset])

const onSubmit = async data => {
  setIsSubmitting(true)

  const payload = {
    user_name: data.user_name.trim(),
    mobile: data.mobile.trim(),
    password: data.password ? data.password.trim() : undefined,
    reported_to: data.reported_to,
    role: data.role,
    department: data.department,
    status: data.status === 'Published'
  }

  // send email only if changed
  if (data.email.trim() !== originalEmail) {
    payload.email = data.email.trim()
  }

  // 🔥 remove empty / null / undefined fields
  Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === '' || payload[key] === undefined) {
      delete payload[key]
    }
  })

  try {
    const response = await axiosInstance.put(`/user/${taxId}`, payload)

    if (response.status === 200 && response.data?.data) {
      const updatedUser = response.data.data
      setData(prevData =>
        prevData.map(item =>
          item.id === taxId
            ? {
                id: updatedUser._id,
                user_name: updatedUser.user_name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                reported_to: updatedUser.reported_to || 'N/A',
                role_name: roleOptions.find(role => role.id === updatedUser.role?._id)?.role_name || 'N/A',
                department:
                  departmentOptions.find(dept => dept.id === updatedUser.department?._id)?.department || 'N/A',
                status: updatedUser.status,
                createdBy: updatedUser.created_by?.user_name || 'Unknown',
                createdDate: updatedUser.created_date
              }
            : item
        )
      )
      toast.success('User updated successfully')
      refreshData()
      handleReset()
    } else {
      toast.error('Failed to update user')
    }
  } catch (error) {
    console.error('Error updating user:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    if (error.response?.status === 400 && errorMessage.includes('already exists')) {
      toast.error('User with this email or username already exists')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
    } else if (error.response?.data?.errors) {
      // show backend validation errors
      error.response.data.errors.forEach(err => {
        toast.error(`${err.path}: ${err.msg}`)
      })
    } else {
      toast.error(`Failed to update user: ${errorMessage}`)
    }
  } finally {
    setIsSubmitting(false)
  }
}


  const handleReset = () => {
    reset()
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
        <Typography variant='h5'>Edit User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <Typography>Loading...</Typography>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='user_name'
                control={control}
                rules={{ required: 'User name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='User Name'
                    placeholder='e.g., John Doe'
                    error={Boolean(errors.user_name)}
                    helperText={errors.user_name?.message}
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
                    placeholder='e.g., john.doe@example.com'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
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
                    placeholder='e.g., 1234567890'
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
                name='role'
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.role)}>
                    <InputLabel id='role-label'>Role</InputLabel>
                    <Select {...field} labelId='role-label' id='role-select' label='Role'>
                      <MenuItem value=''>Select Role</MenuItem>
                      {roleOptions.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.role_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name='department'
                control={control}
                rules={{ required: 'Department is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.department)}>
                    <InputLabel id='department-label'>Department</InputLabel>
                    <Select {...field} labelId='department-label' id='department-select' label='Department'>
                      <MenuItem value=''>Select Department</MenuItem>
                      {departmentOptions.map(dept => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.department}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.department && <FormHelperText>{errors.department.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name='reported_to'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.reported_to)}>
                    <InputLabel id='reported-to-label'>Reported To</InputLabel>
                    <Select {...field} labelId='reported-to-label' id='reported-to-select' label='Reported To'>
                      <MenuItem value=''>None</MenuItem>
                      {reportedToOptions.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.user_name}
                        </MenuItem>
                      ))}
                    </Select>

                    {errors.reported_to && <FormHelperText>{errors.reported_to.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <FormControl fullWidth error={Boolean(errors.status)}>
                <InputLabel id='status-select'>Status</InputLabel>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: 'Status cannot be empty' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId='status-select'
                      id='status-select'
                      label='Status'
                      value={field.value || ''}
                    >
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
                <Button variant='contained' type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update'}
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
  )
}

export default UserEditDrawer
