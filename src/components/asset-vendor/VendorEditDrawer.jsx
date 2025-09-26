'use client'

import { useEffect, useState, useRef } from 'react'
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
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const VendorEditDrawer = ({ open, handleClose, setData, vendorId, vendorData }) => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  const [gstFile, setGstFile] = useState(null)
  const fileInputRef = useRef(null)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      vendor_name: '',
      vendor_code: '',
      email: '',
      contact_person_name: '',
      contact_person_mobile: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      status: '',
      file_attached: ''
    }
  })

  const formatDate = iso => {
    if (!iso || isNaN(new Date(iso).getTime())) return ''
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    if (!open || !vendorId || !vendorData) return

    // const fetchVendorDetails = async () => {
    //   setFetching(true)
    //   try {
    //     const response = await axiosInstance.get(`vendor/${vendorId}`)
    //     if (response.data?.status === 200) {
    //       const vendor = response.data.data
    //       const formData = {
    //         vendor_name: vendor.vendor_name || '',
    //         vendor_code: vendor.vendor_code || '',
    //         email: vendor.email || '',
    //         contact_person_name: vendor.contact_person_name || '',
    //         contact_person_mobile: vendor.contact_person_mobile || '',
    //         address: vendor.address || '',
    //         city: vendor.city || '',
    //         state: vendor.state || '',
    //         pincode: vendor.pincode || '',
    //       country: vendor.country || '',
    //         file_attached: vendor.reg_certificate || '',
    //         status: vendor.status === true || vendor.status === 'true' ? 'true' : 'false'
    //       }
    //       setOriginalData(formData)
    //       reset(formData)
    //     }
    //   } catch (err) {
    //     console.error('Failed to fetch vendor data:', err)
    //     toast.error('Failed to load vendor details')
    //   } finally {
    //     setFetching(false)
    //   }
    // }
    const fetchVendorDetails = async () => {
  setFetching(true)
  try {
    const response = await axiosInstance.get(`vendor/${vendorId}`)
    if (response.data?.status === 200) {
      // ✅ Handle array response properly
      const vendorData = response.data.data
      const vendor = Array.isArray(vendorData) ? vendorData[0] : vendorData

      if (vendor) {
        const formData = {
          vendor_name: vendor.vendor_name || '',
          vendor_code: vendor.vendor_code || '',
          email: vendor.email || '',
          contact_person_name: vendor.contact_person_name || '',
          contact_person_mobile: vendor.contact_person_mobile || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          pincode: vendor.pincode || '',
          country: vendor.country || '',   // ✅ now fetched correctly
          file_attached: vendor.reg_certificate || '',
          status:
            vendor.status === true || vendor.status === 'true'
              ? 'true'
              : 'false'
        }

        setOriginalData(formData)
        reset(formData)
      }
    }
  } catch (err) {
    console.error('Failed to fetch vendor data:', err)
    toast.error('Failed to load vendor details')
  } finally {
    setFetching(false)
  }
}


    fetchVendorDetails()
  }, [open, vendorId, vendorData, reset])

  const isUnchanged = (data, original, newFile) => {
    return (
      data.vendor_name.trim() === original.vendor_name.trim() &&
      data.vendor_code.trim() === original.vendor_code.trim() &&
      data.email.trim() === original.email.trim() &&
      data.contact_person_name.trim() === original.contact_person_name.trim() &&
      data.contact_person_mobile.trim() === original.contact_person_mobile.trim() &&
      (data.address?.trim() || '') === (original.address?.trim() || '') &&
      data.city.trim() === original.city.trim() &&
      data.state.trim() === original.state.trim() &&
      String(data.pincode).trim() === String(original.pincode).trim() &&
      data.country.trim() === original.country.trim() &&
      data.status === original.status &&
      !newFile
    )
  }

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setGstFile(file)
    } else {
      toast.error('Please upload a valid JPEG, PNG, or PDF file')
      setGstFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const onSubmit = async data => {
    const requiredFields = [
      'vendor_name',
      'email',
      'contact_person_name',
      'contact_person_mobile',
     
      'status'
    ]
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (originalData && isUnchanged(data, originalData, gstFile)) {
      toast.info('No fields to update')
      return
    }

    if (loading) return // Prevent multiple submissions

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('vendor_name', data.vendor_name.trim())
      formDataToSend.append('vendor_code', data.vendor_code.trim())
      formDataToSend.append('email', data.email.trim())
      formDataToSend.append('contact_person_name', data.contact_person_name.trim())
      formDataToSend.append('contact_person_mobile', data.contact_person_mobile.trim())
      formDataToSend.append('address', data.address?.trim() || '')
      formDataToSend.append('city', data.city.trim())
      formDataToSend.append('state', data.state.trim())
      formDataToSend.append('pincode', String(data.pincode).trim())
      formDataToSend.append('country', data.country.trim())
      formDataToSend.append('status', data.status === 'true')

      if (gstFile) {
        formDataToSend.append('file_attached', gstFile, gstFile.name)
      }

      console.log('Payload sent to API:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `${value.name} (${value.size} bytes)` : value)
      }

      const response = await axiosInstance.put(`vendor/${vendorId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('API Response:', response.data)

      if (response.data?.status === 200) {
        const resData = response.data.data
        const updatedVendor = {
          id: resData._id,
          categoryName: resData.vendor_name,
          parentCategory: resData.vendor_code || 'None',
          email: resData.email,
          contact_person_name: resData.contact_person_name,
          contact_person_mobile: resData.contact_person_mobile,
          address: resData.address || '',
          city: resData.city,
          state: resData.state,
          pincode: resData.pincode,
          country: resData.country,
          reg_certificate: resData.reg_certificate,
          status: resData.status ? 'true' : 'false',

          createdBy: resData.created_by?.user_name || 'Unknown',
          createdDate: resData.created_date ? formatDate(resData.created_date) : '',
          updatedDate: resData.updated_date
        }

        setData(prev => {
          const newData = prev.map(item => (item.id === vendorId ? updatedVendor : item))
          console.log('Updated data:', newData)
          return newData
        })

        toast.success(response.data.message || 'Vendor updated successfully')
        reset()
        setGstFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to update vendor')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error(err.response?.data?.message || 'An error occurred while updating the vendor.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setOriginalData(null)
    setGstFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
          <Typography variant='h5'>Edit Vendor</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            {fetching ? (
              <div className='flex justify-center items-center h-64'>
                <CircularProgress />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <Controller
                  name='vendor_name'
                  control={control}
                  rules={{ required: 'Vendor name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vendor Name'
                      error={!!errors.vendor_name}
                      helperText={errors.vendor_name?.message}
                    />
                  )}
                />
                <Controller
                  name='vendor_code'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vendor Code (Optional)'
                      error={!!errors.vendor_code}
                      helperText={errors.vendor_code?.message}
                    />
                  )}
                />
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    maxLength: { value: 250, message: 'Max 250 chars' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Email'
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name='contact_person_name'
                  control={control}
                  rules={{ required: 'Contact person name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Contact Person Name'
                      error={!!errors.contact_person_name}
                      helperText={errors.contact_person_name?.message}
                    />
                  )}
                />
                <Controller
                  name='contact_person_mobile'
                  control={control}
                  rules={{
                    required: 'Mobile number is required',
                    pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Contact Number'
                      error={!!errors.contact_person_mobile}
                      helperText={errors.contact_person_mobile?.message}
                      inputProps={{ maxLength: 10, type: 'text', inputMode: 'numeric' }}
                    />
                  )}
                />
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label='Address (Optional)' multiline />}
                />
                <Controller
                  name='city'
                  control={control}
                  // rules={{ required: 'City is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='City (Optional)'
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
                <Controller
                  name='state'
                  control={control}
                  // rules={{ required: 'State is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='State (Optional)'
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    />
                  )}
                />
                <Controller
                  name='pincode'
                  control={control}
                  rules={{
                    // required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Pincode (Optional)'
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                      inputProps={{ maxLength: 6, type: 'text', inputMode: 'numeric' }}
                    />
                  )}
                />
             <Controller
  name='country'
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      fullWidth
      label='Country (Optional)'
      error={!!errors.country}
      helperText={errors.country?.message}
    />
  )}
/>

                <div>
                  <TextField
                    label='GST Certificate'
                    value={gstFile ? gstFile.name : originalData?.file_attached || ''}
                    onClick={handleFileClick}
                    fullWidth
                    error={!!errors.file_attached}
                    helperText={errors.file_attached?.message || 'Upload JPEG, PNG, or PDF (max 5MB)'}
                    InputProps={{ readOnly: true, style: { cursor: 'pointer' } }}
                    aria-label='GST Certificate'
                  />
                  <input
                    type='file'
                    name='file_attached'
                    accept='image/jpeg,image/png,application/pdf'
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    aria-hidden='true'
                  />
                </div>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel id='status-label'>Status</InputLabel>
                      <Select {...field} labelId='status-label' label='Status' value={field.value || ''}>
                        <MenuItem value=''>Select Status</MenuItem>
                        <MenuItem value='true'>Active</MenuItem>
                        <MenuItem value='false'>Inactive</MenuItem>
                      </Select>
                      {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                    </FormControl>
                  )}
                />

                <div className='flex items-center gap-4 mt-4'>
                  <Button variant='contained' type='submit' disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Update'}
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

export default VendorEditDrawer
