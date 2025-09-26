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
  CircularProgress
} from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Utility to format date as DD-MM-YYYY
const formatDate = dateStr => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB').split('/').join('-') // DD-MM-YYYY
}

const ClientUserViewDrawer = ({ open, handleClose, taxId }) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      contact_person: '',
      contact_email: '',
      contact_mobile: '',
      gst_no: '',
      subscription_startdate: '',
      subscription_enddate: '',
      status: '',
      financialYear: '',
      method: '',
      created_by: '',
      created_date: ''
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (open && taxId) {
        setIsLoading(true)
        try {
          const response = await axiosInstance.get(`core/client-list/${taxId}`)
          if (response.status === 200 && response.data?.data) {
            const client = response.data.data
            setValue('name', client.user_name || '')
            setValue('email', client.email || '')
            setValue('mobile', client.mobile || '')
            setValue('contact_person', client.contact_person || '')
            setValue('contact_email', client.contact_email || '')
            setValue('contact_mobile', client.contact_mobile || '')
            setValue('gst_no', client.gst_no || '')
            setValue('subscription_startdate', client.subscription_startdate || '')
            setValue('subscription_enddate', client.subscription_enddate || '')
            setValue('status', client.status ? 'Active' : 'Inactive')
            setValue('financialYear', client.financialYear || '')
            setValue('method', client.method || '')
            setValue('created_by', client.created_by?.user_name || 'Unknown')
            setValue('created_date', client.created_date || '')
          } else {
            toast.error('Failed to fetch client details')
            reset()
          }
        } catch (error) {
          console.error('Error fetching client:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch client: ${errorMessage}`)
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
        <Typography variant='h5'>View Client Details</Typography>
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
                name='name'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Client Name' disabled />}
              />
              <Controller
                name='email'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Email' disabled />}
              />
              <Controller
                name='mobile'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Client Mobile' disabled />}
              />
              <Controller
                name='contact_person'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Contact Person Name' disabled />}
              />
              <Controller
                name='contact_email'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Contact Email' disabled />}
              />
              <Controller
                name='contact_mobile'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Contact Mobile' disabled />}
              />
              <Controller
                name='gst_no'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='GST No' disabled />}
              />
              <Controller
                name='financialYear'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Financial Year' disabled />}
              />
              <Controller
                name='method'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Depreciation Method' disabled />}
              />
              <Controller
                name='subscription_startdate'
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label='Subscription Start Date' value={formatDate(field.value)} disabled />
                )}
              />
              <Controller
                name='subscription_enddate'
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label='Subscription End Date' value={formatDate(field.value)} disabled />
                )}
              />
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='status-label'>Status</InputLabel>
                    <Select {...field} labelId='status-label' label='Status' disabled>
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name='created_by'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Created By' disabled />}
              />
              <Controller
                name='created_date'
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label='Created Date' value={formatDate(field.value)} disabled />
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

export default ClientUserViewDrawer
