'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'
import { format } from 'date-fns'

const ClientUserAddDrawer = ({ open, handleClose, setData, refreshData }) => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
       password: '',
      email: '',
      mobile:'',
      contact_person: '',
      contact_email: '',
      contact_mobile: '',
      gst_no: '',
      financialYear: '',  //new
      method: '', //new
      subscription_startdate: null, 
      subscription_enddate: null,
     status: 'Published'
    },
    mode: 'onChange'
  })

  const formatDate = date => {
    if (!date || !(date instanceof Date) || isNaN(date)) return null
    return format(date, 'yyyy-MM-dd')
  }

  const onSubmit = async data => {
    setLoading(true)
    try {
     const payload = {
  user_name: data.name.trim(),
  email: data.email.trim(),
  password: data.password ? data.password.trim() : '',
  mobile:data.mobile.trim(),
  contact_person: data.contact_person.trim(),
  contact_email: data.contact_email.trim(),
  contact_mobile: data.contact_mobile.trim(),
  gst_no: data.gst_no.trim().toUpperCase(),
  subscription_startdate: formatDate(data.subscription_startdate),
  subscription_enddate: formatDate(data.subscription_enddate),
  financialYear: data.financialYear, //new
  method: data.method,  //new
  status: data.status === 'Published'
}


      // Remove null or empty fields
      for (const key in payload) {
        if (payload[key] === null || payload[key] === '') {
          delete payload[key]
        }
      }

      const response = await axiosInstance.post('/core/create-client', payload)

      if (response.data?.status === 200) {
        const newClient = response.data.data
        setData(prevData => [
          ...prevData,
          {
            id: newClient._id,
            user_name: newClient.name,
            email: newClient.email,
            mobile:newClient.mobile,
            contact_person: newClient.contact_person,
            contact_email: newClient.contact_email,
            contact_mobile: newClient.contact_mobile,
            gst_no: newClient.gst_no,
            subscription_startdate: newClient.subscription_startdate
              ? format(new Date(newClient.subscription_startdate), 'dd-MM-yyyy')
              : 'N/A',
            subscription_enddate: newClient.subscription_enddate
              ? format(new Date(newClient.subscription_enddate), 'dd-MM-yyyy')
              : 'N/A',
            status: newClient.status,
            createdBy: newClient.created_by?.name || 'Unknown',
            createdDate: newClient.created_date ? format(new Date(newClient.created_date), 'dd-MM-yyyy') : 'N/A'
          }
        ])
        toast.success(response.data.message || 'Client added successfully')
        resetForm()
        handleClose()
        refreshData()
      } else {
        toast.error(response.data?.message || 'Failed to add client. Please try again.')
      }
    } catch (error) {
      console.error('Error adding client:', error)
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`)
        })
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong while adding client.')
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleReset}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <div className='flex items-center justify-between p-5'>
          <Typography variant='h5'>Add Client</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-5'>
              <Controller
                name='name'
                control={control}
                rules={{
                  required: 'Client name is required.',
                  maxLength: { value: 50, message: 'Client name cannot exceed 50 characters.' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Client Name'
                    placeholder='Enter client name'
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    autoComplete='new-name'
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
                    autoComplete='new-email'
                  />
                )}
              />
              <Controller
  name='password'
  control={control}
  rules={{
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' }
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
                  required: 'Contact mobile is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Mobile number must be 10 digits'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Client Mobile'
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
                    autoComplete='new-contact-mobile'
                  />
                )}
              />
             
              <Controller
                name='contact_person'
                control={control}
                rules={{
                  required: 'Contact person is required.',
                  maxLength: { value: 50, message: 'Contact person name cannot exceed 50 characters.' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Contact Person Name'
                    placeholder='Enter contact person'
                    error={Boolean(errors.contact_person)}
                    helperText={errors.contact_person?.message}
                    autoComplete='new-contact-person'
                  />
                )}
              />
              <Controller
                name='contact_email'
                control={control}
                rules={{
                  required: 'Contact email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid contact email format'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Contact Email'
                    placeholder='Enter contact email'
                    error={Boolean(errors.contact_email)}
                    helperText={errors.contact_email?.message}
                    autoComplete='new-contact-email'
                  />
                )}
              />
            <Controller
  name='contact_mobile'
  control={control}
  rules={{
    required: 'Contact mobile is required',
    pattern: {
      value: /^\d{10}$/,
      message: 'Mobile number must be 10 digits'
    }
  }}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      label='Contact Mobile'
      placeholder='Enter contact mobile number'
      error={Boolean(errors.contact_mobile)}
      helperText={errors.contact_mobile?.message}
      inputProps={{
        maxLength: 10,
        type: 'text',
        inputMode: 'numeric',
        onChange: e => {
          const numeric = e.target.value.replace(/\D/g, '')
          if (numeric.length <= 10) field.onChange(numeric)
        }
      }}
      autoComplete='new-contact-mobile'
    />
  )}
/>


{/* financial year */}
<FormControl fullWidth error={Boolean(errors.financialYear)}>
  <InputLabel id='financial-year-select'>Financial Year</InputLabel>
  <Controller
    name='financialYear'
    control={control}
    rules={{ required: 'Financial year is required' }}
    render={({ field }) => (
      <Select {...field} labelId='financial-year-select' label='Financial Year'>
        <MenuItem value='' disabled>Select Financial Year</MenuItem>
       <MenuItem value='jan-dec'>jan – dec</MenuItem>
<MenuItem value='apr-mar'>apr – mar</MenuItem>
<MenuItem value='jul-jun'>jul – jun</MenuItem>

      </Select>
    )}
  />
  {errors.financialYear && <FormHelperText>{errors.financialYear.message}</FormHelperText>}
</FormControl>



{/* depreciation method */}
<FormControl fullWidth error={Boolean(errors.method)}>
  <InputLabel id='depreciation-method-select'>Depreciation Method</InputLabel>
  <Controller
    name='method'
    control={control}
    rules={{ required: 'Depreciation method is required' }}
    render={({ field }) => (
      <Select {...field} labelId='depreciation-method-select' label='Depreciation Method'>
        <MenuItem value='' disabled>Select Depreciation Method</MenuItem>
       <MenuItem value='SLM'>Straight Line Method</MenuItem>
<MenuItem value='WDV'>Written Down Value</MenuItem>

      </Select>
    )}
  />
  {errors.method && <FormHelperText>{errors.method.message}</FormHelperText>}
</FormControl>



              <Controller
                name='gst_no'
                control={control}
              
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='GST No'
                    placeholder='Enter GST number'
                    error={Boolean(errors.gst_no)}
                    helperText={errors.gst_no?.message}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                      maxLength: 15 // Enforce max 15 characters
                    }}
                    autoComplete='new-gst-no'
                  />
                )}
              />
              <Controller
                name='subscription_startdate'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label='Subscription Start Date'
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    format='dd-MM-yyyy'
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(errors.subscription_startdate),
                        helperText: errors.subscription_startdate?.message,
                        placeholder: 'DD-MM-YYYY'
                      }
                    }}
                  />
                )}
              />
              <Controller
                name='subscription_enddate'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label='Subscription End Date'
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    format='dd-MM-yyyy'
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(errors.subscription_enddate),
                        helperText: errors.subscription_enddate?.message,
                        placeholder: 'DD-MM-YYYY'
                      }
                    }}
                  />
                )}
              />
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
    </LocalizationProvider>
  )
}

export default ClientUserAddDrawer
