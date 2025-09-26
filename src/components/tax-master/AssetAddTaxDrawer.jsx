'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Vars
const initialData = {
  taxCode: '',
  taxType: 'GST',
  gstType: '',
  taxPercentage: '',
  description: '',
  stateType: '',
   status: 'Active'
}

const AssetAddTaxDrawer = ({ open, handleClose, setData, customerData, fetchTaxes }) => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

   useEffect(() => {
    if (open) {
      reset(initialData) // ✅ drawer open hone par reset ho jayega
    }
  }, [open, reset])

  const gstType = watch('gstType')
  const taxPercentage = watch('taxPercentage')

  useEffect(() => {
    if (gstType && taxPercentage) {
      setValue('taxCode', `${gstType}${taxPercentage}`)
    } else {
      setValue('taxCode', '')
    }
  }, [gstType, taxPercentage, setValue])

  const onSubmit = async data => {
    setIsSubmitting(true)
    const payload = {
      tax_code: data.taxCode,
      tax_type: data.taxType,
      gst_type: data.gstType,
      tax_perc: parseFloat(data.taxPercentage),
      description: data.description || 'No description',
      state_type: data.stateType,
      status: data.status === 'Active'
    }

    try {
      const response = await axiosInstance.post('/tax', payload)
      if (response.data.status === 200) {
        const responseData = response.data.data || response.data

        const newTax = {
          id: responseData._id,
          tax_code: responseData.tax_code || data.taxCode,
          tax_type: responseData.tax_type || data.taxType,
          tax_percentage: responseData.tax_perc?.$numberDecimal
            ? parseFloat(responseData.tax_perc.$numberDecimal)
            : parseFloat(data.taxPercentage),
          description: responseData.description || 'No description',
          gst_type: responseData.gst_type || data.gstType,
          state_type: responseData.state_type || data.stateType,
          status: responseData.status != null ? responseData.status : data.status === 'Active',
          createdBy: responseData.created_by?.user_name || 'Unknown',
          createdDate: responseData.created_date || new Date().toISOString()
        }

        // Update parent component's data
        setData(prevData => [...prevData, newTax])
        toast.success(response.data.message)
        fetchTaxes() // Refresh table data
        handleReset()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error creating tax:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to create tax: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset(initialData)
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
        <Typography variant='h5'>Add Tax</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='taxCode'
              control={control}
              rules={{ required: 'Tax code is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Tax Code'
                  placeholder='e.g., CGST28'
                  disabled
                  error={Boolean(errors.taxCode)}
                  helperText={errors.taxCode?.message}
                />
              )}
            />
            <Controller
              name='taxType'
              control={control}
              rules={{ required: 'Tax type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.taxType)}>
                  <InputLabel id='tax-type-label'>Tax Type</InputLabel>
                  <Select {...field} labelId='tax-type-label' id='tax-type-select' label='Tax Type' disabled>
                    <MenuItem value='GST'>GST</MenuItem>
                  </Select>
                  {errors.taxType && <FormHelperText>{errors.taxType.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name='gstType'
              control={control}
              rules={{ required: 'GST type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.gstType)}>
                  <InputLabel id='gst-type-label'>GST Type</InputLabel>
                  <Select {...field} labelId='gst-type-label' id='gst-type-select' label='GST Type'>
                    <MenuItem value=''>Select GST Type</MenuItem>
                    <MenuItem value='CGST'>CGST</MenuItem>
                    <MenuItem value='SGST'>SGST</MenuItem>
                    <MenuItem value='IGST'>IGST</MenuItem>
                  </Select>
                  {errors.gstType && <FormHelperText>{errors.gstType.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name='taxPercentage'
              control={control}
              rules={{ required: 'Tax percentage is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.taxPercentage)}>
                  <InputLabel id='tax-percentage-label'>Tax Percentage</InputLabel>
                  <Select {...field} labelId='tax-percentage-label' id='tax-percentage-select' label='Tax Percentage'>
                    <MenuItem value=''>Select Tax Percentage</MenuItem>
                    <MenuItem value='28'>28%</MenuItem>
                    <MenuItem value='18'>18%</MenuItem>
                    <MenuItem value='12'>12%</MenuItem>
                    <MenuItem value='5'>5%</MenuItem>
                    <MenuItem value='0'>0%</MenuItem>
                    <MenuItem value='14'>14%</MenuItem>
                    <MenuItem value='9'>9%</MenuItem>
                    <MenuItem value='6'>6%</MenuItem>
                  </Select>
                  {errors.taxPercentage && <FormHelperText>{errors.taxPercentage.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Description'
                  placeholder='e.g., Central GST at 28%'
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name='stateType'
              control={control}
              rules={{ required: 'State type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.stateType)}>
                  <InputLabel id='state-type-label'>State Type</InputLabel>
                  <Select {...field} labelId='state-type-label' id='state-type-select' label='State Type'>
                    <MenuItem value=''>Select State Type</MenuItem>
                    <MenuItem value='Interstate'>Interstate</MenuItem>
                    <MenuItem value='Intrastate'>Intrastate</MenuItem>
                    <MenuItem value='Both'>Both</MenuItem>
                  </Select>
                  {errors.stateType && <FormHelperText>{errors.stateType.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.status)}>
                  <InputLabel id='status-label'>Status</InputLabel>
                  <Select {...field} labelId='status-label' id='status-select' label='Status'>
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
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

export default AssetAddTaxDrawer
