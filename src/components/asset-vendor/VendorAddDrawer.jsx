

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
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CloudUpload } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import FormHelperText from '@mui/material/FormHelperText'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const initialValues = {
  vendor_name: '',
  email: '',
  contact_person_name: '',
  contact_person_mobile: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  file_attached: null,
status: 'Active'
}

const AssetAddVendorDrawer = ({ open, handleClose, fetchData }) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setFormData(initialValues)
      setErrors({})
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open])

  const validateField = (name, value) => {
    const errs = {}

    if (name === 'vendor_name' && !value.trim()) errs.vendor_name = 'Vendor name is required'

    if (name === 'email') {
      if (!value.trim()) errs.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errs.email = 'Invalid email format'
    }

    if (name === 'contact_person_name' && !value.trim()) errs.contact_person_name = 'Contact person name is required'

    if (name === 'contact_person_mobile' && !/^\d{10}$/.test(value)) {
      errs.contact_person_mobile = 'Mobile number must be 10 digits'
    }

    if (name === 'file_attached' && !value) errs.file_attached = 'Registration certificate is required'
    if (name === 'status' && !value) errs.status = 'Status is required'
    return errs
  }

  const validate = () => {
    const errs = {}
    Object.keys(formData).forEach(key => {
      if (!['address', 'city', 'state', 'pincode', 'country'].includes(key)) {
        Object.assign(errs, validateField(key, formData[key]))
      }
    })
    return errs
  }

  const handleFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, file_attached: 'File size must be less than 5MB' }))
          return
        }
        setFormData(prev => ({ ...prev, file_attached: file }))
        setErrors(prev => ({ ...prev, file_attached: '' }))
      } else {
        setFormData(prev => ({ ...prev, file_attached: null }))
        setErrors(prev => ({
          ...prev,
          file_attached: 'Please upload a valid JPEG, PNG, or PDF file'
        }))
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async e => {
  e.preventDefault()
  const validationErrors = validate()
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    toast.error('Please fill all required fields correctly')
    return
  }

  if (loading) return
  setLoading(true)

  try {
    const formDataToSend = new FormData()

    // ✅ Required fields
    formDataToSend.append('vendor_name', formData.vendor_name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('contact_person_name', formData.contact_person_name)
    formDataToSend.append('contact_person_mobile', formData.contact_person_mobile)

    // ✅ Optional fields (only append if value exists)
    if (formData.address) formDataToSend.append('address', formData.address)
    if (formData.city) formDataToSend.append('city', formData.city)
    if (formData.state) formDataToSend.append('state', formData.state)

    // ✅ Enhanced pincode validation
    if (formData.pincode) {
      if (!/^\d{6}$/.test(formData.pincode)) {
        setErrors(prev => ({ ...prev, pincode: 'Pincode must be exactly 6 digits' }))
        toast.error('Pincode must be exactly 6 digits')
        setLoading(false)
        return
      }
      formDataToSend.append('pincode', Number(formData.pincode))
    }

    if (formData.country) formDataToSend.append('country', formData.country)

    // ✅ File (only if selected)
    if (formData.file_attached) {
      formDataToSend.append('reg_certificate', formData.file_attached)
    }

    // ✅ Status (boolean true/false)
    formDataToSend.append('status', formData.status === 'Active')

    const response = await axiosInstance.post('/vendor', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data?.status === 200) {
      await fetchData()
      toast.success(response.data.message || 'Vendor added successfully')
      setFormData(initialValues)
      if (fileInputRef.current) fileInputRef.current.value = ''
      handleClose()
    } else {
      toast.error(response.data?.message || 'Failed to add vendor.')
    }
  } catch (error) {
    if (error.response?.data) {
      if (error.response.data.message) {
        toast.error(error.response.data.message)
      } else if (error.response.data.errors && error.response.data.errors.length > 0) {
        const firstError = error.response.data.errors[0]
        toast.error(firstError.msg || 'Validation error')
        if (firstError.path) {
          setErrors(prev => ({ ...prev, [firstError.path]: firstError.msg }))
        }
      }
    } else {
      toast.error(
        error.code === 'ERR_NETWORK' 
          ? 'Network error: Please check your connection.' 
          : 'Failed to add vendor.'
      )
    }
  } finally {
    setLoading(false)
  }
}


  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'contact_person_mobile') {
      const numeric = value.replace(/\D/g, '')
      if (numeric.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numeric }))
        setErrors(prev => ({ ...prev, [name]: validateField(name, numeric)[name] || '' }))
      }
      return
    }

    // Simplified pincode handling - just take whatever input is given
    if (name === 'pincode') {
      setFormData(prev => ({ ...prev, [name]: value }))
      return
    }

    if (name === 'status') {
      setFormData(prev => ({ ...prev, status: value }))
      setErrors(prev => ({ ...prev, status: validateField('status', value).status || '' }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value)[name] || '' }))
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Add Vendor</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {[
            { name: 'vendor_name', label: 'Vendor Name', required: true },
            { name: 'email', label: 'Email', required: true },
            { name: 'contact_person_name', label: 'Contact Person Name', required: true },
            { name: 'contact_person_mobile', label: 'Mobile No.', required: true },
            { name: 'address', label: 'Address (Optional)' },
            { name: 'city', label: 'City (Optional)' },
            { name: 'state', label: 'State (Optional)' },
            { name: 'pincode', label: 'Pincode (Optional)' },
            { name: 'country', label: 'Country (Optional)' }
          ].map(({ name, label, required }) => (
            <TextField
              key={name}
              name={name}
              label={label}
              value={formData[name]}
              onChange={handleChange}
              fullWidth
              error={!!errors[name]}
              helperText={errors[name]}
              required={required}
              inputProps={{
                ...(name === 'contact_person_mobile' ? { maxLength: 10, inputMode: 'numeric' } : {})
              }}
            />
          ))}

       <div>
  <Button
    variant='outlined'
    component='label'
    fullWidth
    className='h-[56px] text-gray-500 border-gray-300'
  >
    <CloudUpload className='text-gray-500 mr-2' />
    Registration Certificate *
    <input
      type='file'
      name='file_attached'
      accept='image/jpeg,image/png,application/pdf'
      onChange={handleFileChange}
      ref={fileInputRef}
      hidden
    />
  </Button>

  {formData.file_attached && (
    <Typography variant='body2' mt={1}>
      {formData.file_attached.name}
    </Typography>
  )}

  {/* ✅ Use FormHelperText instead of Typography */}
  {errors.file_attached && (
    <FormHelperText error>{errors.file_attached}</FormHelperText>
  )}
</div>


          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id='vendor-status-label'>Status</InputLabel>
            <Select
              name='status'
              labelId='vendor-status-label'
              label='Status *'
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value='' disabled>
                Select Status
              </MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
            </Select>
            {errors.status && (
              <Typography variant='caption' color='error'>
                {errors.status}
              </Typography>
            )}
          </FormControl>

          <div className='flex items-center gap-2 mt-4'>
            <Button type='submit' variant='contained' color='primary' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button onClick={handleClose} variant='outlined' color='error' disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AssetAddVendorDrawer
