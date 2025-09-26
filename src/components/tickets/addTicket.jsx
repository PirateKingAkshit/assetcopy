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
  CircularProgress,
  Autocomplete
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CloudUpload } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const initialValues = {
  asset_name: '',
  ticket_location: '',
  asset_location: '',
  ticket_type: '',
  assigned_to: '',
  priority: '',
  file_attached: null,
  status: ''
}

const priorityOptions = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' }
]

const assetTypeOptions = [
  { id: 'incident ticket', name: 'Incident Ticket' },
  { id: 'service request ticket', name: 'Service Request Ticket' },
  { id: 'problem ticket', name: 'Problem Ticket' }
]

const TicketAddDrawer = ({ open, handleClose, setData, fetchData, setPagination }) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [statusOptions, setStatusOptions] = useState([])
  const [ticketLocationOptions, setTicketLocationOptions] = useState([])
  const [assignedToOptions, setAssignedToOptions] = useState([])
  const [assetOptions, setAssetOptions] = useState([])
  const [assetLocationName, setAssetLocationName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsFetching(true)
      try {
        const [statusRes, locationRes, assignedToRes, assetRes] = await Promise.all([
          axiosInstance.get('status/all'),
          axiosInstance.get('location/all'),
          axiosInstance.get('user/all'),
          axiosInstance.get('asset/all')
        ])

        setStatusOptions(statusRes.data?.data?.map(item => ({ id: item._id, name: item.status })) || [])
        setTicketLocationOptions(locationRes.data?.data?.map(item => ({ id: item._id, name: item.location })) || [])
        setAssignedToOptions(assignedToRes.data?.data?.map(item => ({ id: item._id, name: item.user_name })) || [])
        setAssetOptions(
          assetRes.data?.data?.map(item => ({
            id: item._id,
            name: item.asset_name,
            locationId: item.location?._id,
            locationName: item.location?.location
          })) || []
        )
      } catch (error) {
        toast.error('Failed to fetch dropdown data')
      } finally {
        setIsFetching(false)
      }
    }

    if (open) fetchDropdownData()
  }, [open])

  useEffect(() => {
    if (!open) {
      setFormData(initialValues)
      setErrors({})
      setAssetLocationName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open])

  const validateField = (name, value) => {
    const errs = {}
    if (name === 'ticket_type' && !value) errs.ticket_type = 'Ticket type is required'
    if (name === 'asset_name' && !value) errs.asset_name = 'Asset name is required'
    if (name === 'ticket_location' && !value) errs.ticket_location = 'Ticket location is required'
    if (name === 'asset_location' && !value) errs.asset_location = 'Asset location is required'
    if (name === 'assigned_to' && !value) errs.assigned_to = 'Assigned to is required'
    if (name === 'priority' && !value) errs.priority = 'Priority is required'
    // if (name === 'file_attached' && !value) errs.file_attached = 'File is required'
    if (name === 'status' && !value) errs.status = 'Status is required'
    return errs
  }

  const validate = () => {
    const errs = {}
    Object.keys(formData).forEach(key => {
      Object.assign(errs, validateField(key, formData[key]))
    })
    return errs
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setErrors(prev => ({ ...prev, file_attached: 'Invalid file type' }))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file_attached: 'File size must be < 5MB' }))
      return
    }

    setFormData(prev => ({ ...prev, file_attached: file }))
    setErrors(prev => ({ ...prev, file_attached: '' }))
  }

  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'asset_name') {
      const selectedAsset = assetOptions.find(asset => asset.id === value)
      setFormData(prev => ({
        ...prev,
        asset_name: value,
        asset_location: selectedAsset?.locationId || ''
      }))
      setAssetLocationName(selectedAsset?.locationName || '')
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value)[name] || '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      console.log('Validation errors:', validationErrors)
      toast.error('Please correct the errors')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('ticket_type', formData.ticket_type)
      formDataToSend.append('ticket_loc', formData.ticket_location)
      formDataToSend.append('asset', formData.asset_name)
      formDataToSend.append('asset_loc', formData.asset_location)
      formDataToSend.append('assigned_to', formData.assigned_to)
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('status', formData.status)
      if (formData.file_attached) {
        formDataToSend.append('file_attached', formData.file_attached)
      }

      const res = await axiosInstance.post('/ticket', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data?.status === 200) {
        toast.success('Ticket added successfully')
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        await fetchData?.()
        handleClose()
      } else {
        toast.error(res.data?.message || 'Submission failed')
      }
    } catch (err) {
      toast.error('Error submitting ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'> Add Ticket</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Ticket Type */}
          <FormControl fullWidth error={!!errors.ticket_type}>
            <InputLabel id='ticket-type-label'>Ticket Type</InputLabel>
            <Select
              name='ticket_type'
              labelId='ticket-type-label'
              value={formData.ticket_type}
              onChange={handleChange}
              label='Ticket Type *'
            >
              <MenuItem value='' disabled>
                Select Ticket Type
              </MenuItem>
              {assetTypeOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
            {errors.ticket_type && (
              <Typography variant='caption' color='error'>
                {errors.ticket_type}
              </Typography>
            )}
          </FormControl>

          {/* Asset Name */}
          <FormControl fullWidth error={!!errors.asset_name}>
  <Autocomplete
    options={assetOptions}
    getOptionLabel={(option) => option.name || ''}
    isOptionEqualToValue={(option, val) => option.id === val}
    value={assetOptions.find(opt => opt.id === formData.asset_name) || null}
    onChange={(_, newValue) => {
      handleChange({
        target: {
          name: 'asset_name',
          value: newValue ? newValue.id : ''
        }
      });
    }}
    disabled={isFetching}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Asset Name *"
        placeholder={isFetching ? 'Loading...' : 'Select Asset Name'}
        error={!!errors.asset_name}
      />
    )}
    ListboxProps={{
      style: {
        maxHeight: 300,
        overflow: 'auto',
      }
    }}
    clearOnEscape
  />
  {errors.asset_name && (
    <Typography variant='caption' color='error'>
      {errors.asset_name}
    </Typography>
  )}
</FormControl>


          {/* Ticket Location */}
         <FormControl fullWidth error={!!errors.ticket_location}>
  <Autocomplete
    options={ticketLocationOptions}
    getOptionLabel={(option) => option.name || ''}
    isOptionEqualToValue={(option, val) => option.id === val}
    value={ticketLocationOptions.find(opt => opt.id === formData.ticket_location) || null}
    onChange={(_, newValue) => {
      handleChange({
        target: {
          name: 'ticket_location',
          value: newValue ? newValue.id : ''
        }
      })
    }}
    disabled={isFetching}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Ticket Location *"
        placeholder={isFetching ? 'Loading...' : 'Select Ticket Location'}
        error={!!errors.ticket_location}
      />
    )}
    ListboxProps={{
      style: {
        maxHeight: 300,
        overflow: 'auto',
      }
    }}
    clearOnEscape
  />
  {errors.ticket_location && (
    <Typography variant="caption" color="error">
      {errors.ticket_location}
    </Typography>
  )}
</FormControl>


          {/* Asset Location (Read-only) */}
          <TextField label='Asset Location' value={assetLocationName} fullWidth InputProps={{ readOnly: true }} />

          {/* Assigned To */}
         <FormControl fullWidth error={!!errors.assigned_to}>
  <Autocomplete
    options={assignedToOptions}
    getOptionLabel={(option) => option.name || ''}
    isOptionEqualToValue={(option, val) => option.id === val}
    value={assignedToOptions.find(opt => opt.id === formData.assigned_to) || null}
    onChange={(_, newValue) => {
      handleChange({
        target: {
          name: 'assigned_to',
          value: newValue ? newValue.id : ''
        }
      })
    }}
    disabled={isFetching}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Assigned To *"
        placeholder={isFetching ? 'Loading...' : 'Select Assigned To'}
        error={!!errors.assigned_to}
      />
    )}
    ListboxProps={{
      style: {
        maxHeight: 300,
        overflow: 'auto',
      }
    }}
    clearOnEscape
  />
  {errors.assigned_to && (
    <Typography variant="caption" color="error">
      {errors.assigned_to}
    </Typography>
  )}
</FormControl>


          {/* Priority */}
          <FormControl fullWidth error={!!errors.priority}>
            <InputLabel id='priority-label'>Priority</InputLabel>
            <Select
              name='priority'
              labelId='priority-label'
              value={formData.priority}
              onChange={handleChange}
              label='Priority *'
            >
              <MenuItem value='' disabled>
                Select Priority
              </MenuItem>
              {priorityOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
            {errors.priority && (
              <Typography variant='caption' color='error'>
                {errors.priority}
              </Typography>
            )}
          </FormControl>

          {/* File Upload */}
          <div>
            <Button variant='outlined' component='label' fullWidth className='h-[56px] text-gray-500 border-gray-300'>
              <CloudUpload className='mr-2' />
              Upload File *
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
            {errors.file_attached && (
              <Typography variant='caption' color='error'>
                {errors.file_attached}
              </Typography>
            )}
          </div>

          {/* Status */}
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id='status-label'>Status</InputLabel>
            <Select
              name='status'
              labelId='status-label'
              value={formData.status}
              onChange={handleChange}
              disabled={isFetching}
              label='Status *'
            >
              <MenuItem value='' disabled>
                {isFetching ? 'Loading...' : 'Select Status'}
              </MenuItem>
              {statusOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <Typography variant='caption' color='error'>
                {errors.status}
              </Typography>
            )}
          </FormControl>

          {/* Submit Buttons */}
          <div className='flex items-center gap-2 mt-4'>
            
            <Button type='submit' variant='contained' color='primary' disabled={loading || isFetching}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button onClick={handleClose} variant='outlined' color='error' disabled={loading || isFetching}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default TicketAddDrawer
