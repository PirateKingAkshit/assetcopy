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

const ClientUserEditDrawer = ({ open, handleClose, setData, taxId, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      client_mobile: '',
      contact_person: '',
      contact_email: '',
      contact_mobile: '',
      gst_no: '',
      financialYear: '', // new
    method: '' , // 
      subscription_startdate: '',
      subscription_enddate: '',
      status: ''
    },
    mode: 'onChange'
  })

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      if (open && taxId) {
        try {
          setIsLoading(true)
          const response = await axiosInstance.get(`/core/client-list/${taxId}`)
          if (response.status === 200 && response.data?.data) {
            const client = response.data.data
        setValue('name', client.user_name || '')


            setValue('email', client.email || '')
            setValue('client_mobile', client.mobile || '')
            setValue('contact_person', client.contact_person || '')
            setValue('financialYear', client.financialYear || '')
setValue('method', client.method || '')

            setValue('contact_email', client.contact_email || '')
            setValue('contact_mobile', client.contact_mobile || '')
            setValue('gst_no', client.gst_no || '')
            setValue(
              'subscription_startdate',
              client.subscription_startdate ? formatDate(client.subscription_startdate) : ''
            )
            setValue('subscription_enddate', client.subscription_enddate ? formatDate(client.subscription_enddate) : '')
            setValue('status', client.status ? 'Published' : 'Inactive')
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

 const onSubmit = async data => {
  setIsSubmitting(true)

  const payload = {
    user_name: data.name.trim(),          // backend expects user_name
    email: data.email.trim(),
    mobile: data.client_mobile.trim(),    // backend expects mobile
    contact_person: data.contact_person.trim(),
    contact_email: data.contact_email.trim(),
    contact_mobile: data.contact_mobile.trim(),
    gst_no: data.gst_no.trim().toUpperCase(),
    financialYear: data.financialYear,
    method: data.method,
    subscription_startdate: data.subscription_startdate || null,
    subscription_enddate: data.subscription_enddate || null,
    status: data.status === 'Published'
  }

  try {
    const response = await axiosInstance.put(`/core/update-client/${taxId}`, payload)
    if (response.status === 200 && response.data?.data) {
      const updatedClient = response.data.data.client

      setData(prevData =>
        prevData.map(item =>
          item.id === taxId
            ? {
                id: updatedClient._id,
                user_name: updatedClient.user_name,
                email: updatedClient.email,
                client_mobile: updatedClient.mobile,
                contact_person: updatedClient.contact_person,
                contact_email: updatedClient.contact_email,
                contact_mobile: updatedClient.contact_mobile,
                gst_no: updatedClient.gst_no,
                financialYear: updatedClient.financialYear,
                method: updatedClient.method,
                subscription_startdate: updatedClient.subscription_startdate
                  ? formatDate(updatedClient.subscription_startdate)
                  : 'N/A',
                subscription_enddate: updatedClient.subscription_enddate
                  ? formatDate(updatedClient.subscription_enddate)
                  : 'N/A',
                status: updatedClient.status,
                createdBy: updatedClient.created_by?.user_name || 'Unknown',
                createdDate: updatedClient.created_date ? formatDate(updatedClient.created_date) : 'N/A'
              }
            : item
        )
      )

      toast.success('Client updated successfully')
      refreshData()
      handleReset()
    } else {
      toast.error('Failed to update client')
    }
  } catch (error) {
    console.error('Error updating client:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    if (error.response?.status === 400 && errorMessage.includes('already exists')) {
      toast.error('Client with this email or name already exists')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
    } else {
      toast.error(`Failed to update client: ${errorMessage}`)
    }
  } finally {
    setIsSubmitting(false)
  }
}


  const formatDate = iso => {
    if (!iso) return ''
    const d = new Date(iso)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
        <Typography variant='h5'>Edit Client</Typography>
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
              {/* Client Name */}
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Client name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Client Name'
                    placeholder='e.g., Mahindra'
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />

              {/* Email */}
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
                    placeholder='e.g., info@mahindra.com'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />

              {/* Client Mobile */}
              <Controller
                name='client_mobile'
                control={control}
                rules={{
                  required: 'Client mobile is required',
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
                    placeholder='Enter client mobile number'
                    error={Boolean(errors.client_mobile)}
                    helperText={errors.client_mobile?.message}
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

              {/* Contact Person */}
              <Controller
                name='contact_person'
                control={control}
                rules={{ required: 'Contact person is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Contact Person Name'
                    placeholder='e.g., Raj'
                    error={Boolean(errors.contact_person)}
                    helperText={errors.contact_person?.message}
                  />
                )}
              />

              {/* Contact Email */}
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
                    placeholder='e.g., raj@yahoo.com'
                    error={Boolean(errors.contact_email)}
                    helperText={errors.contact_email?.message}
                  />
                )}
              />

              {/* Contact Mobile */}
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
                        if (numeric.length <= 10) {
                          field.onChange(numeric)
                        }
                      }
                    }}
                  />
                )}
              />

              {/* GST No */}
              <Controller
                name='gst_no'
                control={control}
                rules={{
                  required: 'GST number is required',
                  pattern: {
                    value: /^[A-Z0-9]{8,15}$/,
                    message: 'GST number must be 8 to 15 alphanumeric characters'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='GST No'
                    placeholder='e.g., ASDF1234'
                    error={Boolean(errors.gst_no)}
                    helperText={errors.gst_no?.message}
                    inputProps={{ maxLength: 15 }}
                    onChange={e => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      field.onChange(value)
                      setValue('gst_no', value, { shouldValidate: true })
                      console.log('GST No:', value, 'Errors:', errors.gst_no)
                    }}
                  />
                )}
              />


{/* Financial Year */}
<FormControl fullWidth error={Boolean(errors.financialYear)}>
  <InputLabel id='financial-year-select'>Financial Year</InputLabel>
  <Controller
    name='financialYear'
    control={control}
    rules={{ required: 'Financial year is required' }}
    render={({ field }) => (
      <Select {...field} labelId='financial-year-select' label='Financial Year'>
        <MenuItem value='' disabled>Select Financial Year</MenuItem>
        <MenuItem value='jan-dec'>Jan – Dec</MenuItem>
        <MenuItem value='apr-mar'>Apr – Mar</MenuItem>
        <MenuItem value='jul-jun'>Jul – Jun</MenuItem>
      </Select>
    )}
  />
  {errors.financialYear && <FormHelperText>{errors.financialYear.message}</FormHelperText>}
</FormControl>

{/* Depreciation Method */}
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

              {/* Subscription Start Date */}
              <Controller
                name='subscription_startdate'
                control={control}
                rules={{
                  validate: value => !value || !isNaN(new Date(value)) || 'Invalid start date'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='date'
                    label='Subscription Start Date'
                    error={Boolean(errors.subscription_startdate)}
                    helperText={errors.subscription_startdate?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />

              {/* Subscription End Date */}
              <Controller
                name='subscription_enddate'
                control={control}
                rules={{
                  validate: value => !value || !isNaN(new Date(value)) || 'Invalid end date'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='date'
                    label='Subscription End Date'
                    error={Boolean(errors.subscription_enddate)}
                    helperText={errors.subscription_enddate?.message}
                    InputLabelProps={{ shrink: true }}
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
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>

              {/* Buttons */}
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

export default ClientUserEditDrawer
