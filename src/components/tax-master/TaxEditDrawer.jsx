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

const TaxEditDrawer = ({ open, handleClose, setData, customerData, taxId, refreshData }) => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      tax_code: '',
      tax_type: '',
      tax_percentage: '',
      gst_type: '',
      state_type: '',
      status: ''
    }
  })

  const gst_type = watch('gst_type')
  const tax_percentage = watch('tax_percentage')

  const validTaxPercentages = ['28', '18', '12', '5', '0', '14', '9', '6']

  useEffect(() => {
    const fetchTax = async () => {
      if (open && taxId) {
        try {
          setIsLoading(true)
          const response = await axiosInstance.get(`tax/${taxId}`)
          if (response.status === 200 && response.data?.data) {
            const tax = response.data.data
            setValue('tax_code', tax.tax_code || '')
            setValue('tax_type', 'GST')

            let taxPerc = ''
            if (tax.tax_perc != null) {
              if (typeof tax.tax_perc === 'object' && tax.tax_perc.$numberDecimal) {
                taxPerc = parseFloat(tax.tax_perc.$numberDecimal).toString()
              } else if (typeof tax.tax_perc === 'string') {
                taxPerc = parseFloat(tax.tax_perc).toString()
              } else {
                taxPerc = parseFloat(tax.tax_perc).toString()
              }
            }
            console.log('Raw tax_perc:', tax.tax_perc, 'Normalized taxPerc:', taxPerc)

            if (taxPerc && validTaxPercentages.includes(taxPerc)) {
              setValue('tax_percentage', taxPerc)
            } else {
              setValue('tax_percentage', '')
              if (taxPerc) {
                toast.warn(`Invalid tax percentage (${taxPerc}%) detected. Please select a valid option.`)
              }
            }

            setValue('gst_type', tax.gst_type || '')
            setValue('state_type', tax.state_type || '')
            setValue('status', tax.status ? 'Active' : 'Inactive')
          } else {
            toast.error('Failed to fetch tax details')
            reset()
          }
        } catch (error) {
          console.error('Error fetching tax:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch tax: ${errorMessage}`)
          }
          reset()
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchTax()
  }, [open, taxId, setValue, reset])

  useEffect(() => {
    if (gst_type && tax_percentage) {
      setValue('tax_code', `${gst_type}${tax_percentage}`)
    }
  }, [gst_type, tax_percentage, setValue])

  const onSubmit = async data => {
    setIsSubmitting(true)
    const payload = {
      tax_code: data.tax_code || '',
      tax_type: data.tax_type || '',
      tax_perc: data.tax_percentage ? parseFloat(data.tax_percentage) : 0,
      gst_type: data.gst_type || '',
      state_type: data.state_type || '',
      status: data.status === 'Active'
    }

    try {
      const response = await axiosInstance.put(`/tax/${taxId}`, payload)
      if (response.data.status === 200) {
        const updatedTax = response.data.data
        refreshData()
        toast.success(response.data.message)
        handleReset()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating tax:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 400 && errorMessage === 'tax already exists') {
        toast.error(response.data.message)
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to update tax: ${errorMessage}`)
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
        <Typography variant='h5'>Edit Tax</Typography>
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
                name='tax_code'
                control={control}
                rules={{ required: 'Tax code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Tax Code'
                    placeholder='e.g., CGST18'
                    error={Boolean(errors.tax_code)}
                    helperText={errors.tax_code?.message}
                    disabled={gst_type && tax_percentage}
                  />
                )}
              />
              <Controller
                name='tax_type'
                control={control}
                rules={{ required: 'Tax type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.tax_type)}>
                    <InputLabel id='tax-type-label'>Tax Type</InputLabel>
                    <Select {...field} labelId='tax-type-label' id='tax-type-select' label='Tax Type'>
                      <MenuItem value='GST'>GST</MenuItem>
                    </Select>
                    {errors.tax_type && <FormHelperText>{errors.tax_type.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Controller
                name='tax_percentage'
                control={control}
                rules={{ required: 'Tax percentage is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.tax_percentage)}>
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
                    {errors.tax_percentage && <FormHelperText>{errors.tax_percentage.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Controller
                name='gst_type'
                control={control}
                rules={{ required: 'GST type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.gst_type)}>
                    <InputLabel id='gst-type-label'>GST Type</InputLabel>
                    <Select {...field} labelId='gst-type-label' id='gst-type-select' label='GST Type'>
                      <MenuItem value=''>Select GST Type</MenuItem>
                      <MenuItem value='CGST'>CGST</MenuItem>
                      <MenuItem value='SGST'>SGST</MenuItem>
                      <MenuItem value='IGST'>IGST</MenuItem>
                    </Select>
                    {errors.gst_type && <FormHelperText>{errors.gst_type.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Controller
                name='state_type'
                control={control}
                rules={{ required: 'State type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.state_type)}>
                    <InputLabel id='state-type-label'>State Type</InputLabel>
                    <Select {...field} labelId='state-type-label' id='state-type-select' label='State Type'>
                      <MenuItem value=''>Select State Type</MenuItem>
                      <MenuItem value='Interstate'>Interstate</MenuItem>
                      <MenuItem value='Intrastate'>Intrastate</MenuItem>
                      <MenuItem value='Both'>Both</MenuItem>
                    </Select>
                    {errors.state_type && <FormHelperText>{errors.state_type.message}</FormHelperText>}
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
                      <MenuItem value=''>Select Status</MenuItem>
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
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

export default TaxEditDrawer
