'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
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
  Typography,
  CircularProgress,
  FormHelperText
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateField } from '@mui/x-date-pickers/DateField'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'
import dayjs from 'dayjs'

const UserViewDrawer = ({ open, handleClose, taxId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [reportedToOptions, setReportedToOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])

  const {
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      user_name: '',
      email: '',
      mobile: '',
      reported_to: '',
      role: '',
      department: '',
      status: '',
      created_by: '',
      created_date: ''
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (open && taxId) {
        setIsLoading(true)
        try {
          const [userResponse, usersResponse, rolesResponse] = await Promise.all([
            axiosInstance.get(`user/${taxId}`),
            axiosInstance.get('user/all'),
            axiosInstance.get('role/all')
          ])

          if (userResponse.status === 200 && userResponse.data?.data) {
            const user = userResponse.data.data
            setValue('user_name', user.user_name || '')
            setValue('email', user.email || '')
            setValue('mobile', user.mobile || '')
            // setValue('reported_to', user.reported_to || '')
            setValue('reported_to', user.reported_to?._id || '')

            setValue('role', user.role?._id || '')
            setValue('department', user.department?._id || '')
            setValue('status', user.status ? 'Active' : 'Inactive')
            setValue('created_by', user.created_by?.user_name || 'Unknown')
            setValue('created_date', user.created_date || '')
          } else {
            toast.error('Failed to fetch user details')
            reset()
          }

          if (usersResponse.status === 200 && Array.isArray(usersResponse.data?.data)) {
            setReportedToOptions(
              usersResponse.data.data.map(user => ({
                id: user._id,
                user_name: user.user_name
              }))
            )

            const departments = usersResponse.data.data
              .filter(user => user.department && user.department._id && user.department.department)
              .map(user => ({
                id: user.department._id,
                department: user.department.department
              }))

            const uniqueDepartments = Array.from(new Map(departments.map(dept => [dept.id, dept])).values())
            setDepartmentOptions(uniqueDepartments)
          }

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
        <Typography variant='h5'>View User Details</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <CircularProgress />
            </div>
          ) : (
            <form className='flex flex-col gap-5'>
              <Controller
                name='user_name'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='User Name' disabled />}
              />

              <Controller
                name='email'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Email' disabled />}
              />

              <Controller
                name='mobile'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Mobile' disabled />}
              />

              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='role-label'>Role</InputLabel>
                    <Select {...field} labelId='role-label' label='Role' disabled>
                      <MenuItem value=''>Select Role</MenuItem>
                      {roleOptions.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.role_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name='department'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='department-label'>Department</InputLabel>
                    <Select {...field} labelId='department-label' label='Department' disabled>
                      <MenuItem value=''>Select Department</MenuItem>
                      {departmentOptions.map(dept => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name='reported_to'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='reported-to-label'>Reported To</InputLabel>
                    <Select {...field} labelId='reported-to-label' label='Reported To' disabled>
                      <MenuItem value=''>None</MenuItem>
                      {reportedToOptions.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.user_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name='created_date'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Created Date'
                    disabled
                    value={field.value && dayjs(field.value).isValid() ? dayjs(field.value).format('DD-MM-YYYY') : ''}
                  />
                )}
              />

              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='status-label'>Status</InputLabel>
                    <Select {...field} labelId='status-label' label='Status' disabled>
                      <MenuItem value=''>Select Status</MenuItem>
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <div className='flex justify-end'>
                <Button variant='contained' onClick={handleReset}>
                  Close
                </Button>
              </div>
            </form>
          )}
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default UserViewDrawer
