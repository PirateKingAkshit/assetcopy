'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CloudUpload } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

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

const TicketEditDrawer = ({ open, handleClose, setData, ticketId }) => {
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [statusOptions, setStatusOptions] = useState([])
  const [ticketLocationOptions, setTicketLocationOptions] = useState([])
  const [assignedToOptions, setAssignedToOptions] = useState([])
  const [assetOptions, setAssetOptions] = useState([])
  const [assetLocationName, setAssetLocationName] = useState('')
  const fileInputRef = useRef(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      asset_name: '',
      ticket_location: '',
      asset_location: '',
      ticket_type: '',
      assigned_to: '',
      priority: '',
      file_attached: null,
      status: ''
    }
  })

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
    if (!open || !ticketId) return

    const fetchTicketDetails = async () => {
      setIsFetching(true)
      try {
        const response = await axiosInstance.get(`ticket/${ticketId}`)
        if (response.data?.status === 200) {
          const ticket = response.data.data
          const formData = {
            ticket_type: ticket.ticket_type || '',
            ticket_location: ticket.ticket_loc?._id || '',
            asset_name: ticket.asset?._id || '',
            asset_location: ticket.asset_loc?._id || '',
            assigned_to: ticket.assigned_to?._id || '',
            priority: ticket.priority || '',
            status: ticket.status?._id || '',
            file_attached: ticket.file_attached || null
          }
          const selectedAsset = assetOptions.find(asset => asset.id === formData.asset_name)
          setAssetLocationName(selectedAsset?.locationName || ticket.asset_loc?.location || '')
          Object.keys(formData).forEach(key => setValue(key, formData[key]))
        } else {
          toast.error('Failed to load ticket details')
        }
      } catch (error) {
        toast.error('Failed to fetch ticket details')
      } finally {
        setIsFetching(false)
      }
    }

    fetchTicketDetails()
  }, [open, ticketId, setValue, assetOptions])

  useEffect(() => {
    if (!open) {
      reset()
      setAssetLocationName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, reset])

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or PDF.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setValue('file_attached', file)
  }

  const handleAssetChange = value => {
    const selectedAsset = assetOptions.find(asset => asset.id === value)
    setValue('asset_name', value)
    setValue('asset_location', selectedAsset?.locationId || '')
    setAssetLocationName(selectedAsset?.locationName || '')
  }

  const onSubmit = async data => {
    const requiredFields = [
      'ticket_type',
      'asset_name',
      'ticket_location',
      'asset_location',
      'assigned_to',
      'priority',
      'status'
    ]
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (loading) return

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('ticket_type', data.ticket_type)
      formDataToSend.append('ticket_loc', data.ticket_location)
      formDataToSend.append('asset', data.asset_name)
      formDataToSend.append('asset_loc', data.asset_location)
      formDataToSend.append('assigned_to', data.assigned_to)
      formDataToSend.append('priority', data.priority)
      formDataToSend.append('status', data.status)
      if (data.file_attached && data.file_attached instanceof File) {
        formDataToSend.append('file_attached', data.file_attached)
      }

      const response = await axiosInstance.put(`ticket/${ticketId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.status === 200) {
        const resData = response.data.data
        const updatedTicket = {
          id: resData._id,
          ticketType: resData.ticket_type,
          ticketLocation: resData.ticket_loc?.location || 'N/A',
          assetLocation: resData.asset_loc?.location || 'N/A',
          ticketNo: resData.ticket_no || 'N/A',
          assignedTo: resData.assigned_to?.user_name || 'N/A',
          status: resData.status?.status || 'N/A',
          priority: resData.priority || 'N/A',
          createdDate: resData.created_date || new Date().toISOString()
        }

        setData(prev => prev.map(item => (item.id === ticketId ? updatedTicket : item)))
        toast.success('Ticket updated successfully')
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to update ticket')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Edit Ticket</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {isFetching ? (
          <div className='flex justify-center items-center h-64'>
            <CircularProgress />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            {/* Ticket Type */}
            <FormControl fullWidth error={!!errors.ticket_type}>
              <InputLabel id='ticket-type-label'>Ticket Type</InputLabel>
              <Controller
                name='ticket_type'
                control={control}
                rules={{ required: 'Ticket type is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='ticket-type-label'
                    label='Ticket Type *'
                    onChange={e => field.onChange(e.target.value)}
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
                )}
              />
              {errors.ticket_type && (
                <Typography variant='caption' color='error'>
                  {errors.ticket_type.message}
                </Typography>
              )}
            </FormControl>

            {/* Asset Name */}
            <FormControl fullWidth error={!!errors.asset_name}>
              <InputLabel id='asset-name-label'>Asset Name</InputLabel>
              <Controller
                name='asset_name'
                control={control}
                rules={{ required: 'Asset name is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='asset-name-label'
                    label='Asset Name *'
                    disabled={isFetching}
                    onChange={e => {
                      field.onChange(e.target.value)
                      handleAssetChange(e.target.value)
                    }}
                  >
                    <MenuItem value='' disabled>
                      {isFetching ? 'Loading...' : 'Select Asset Name'}
                    </MenuItem>
                    {assetOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.asset_name && (
                <Typography variant='caption' color='error'>
                  {errors.asset_name.message}
                </Typography>
              )}
            </FormControl>

            {/* Ticket Location */}
            <FormControl fullWidth error={!!errors.ticket_location}>
              <InputLabel id='ticket-location-label'>Ticket Location</InputLabel>
              <Controller
                name='ticket_location'
                control={control}
                rules={{ required: 'Ticket location is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='ticket-location-label'
                    label='Ticket Location *'
                    disabled={isFetching}
                    onChange={e => field.onChange(e.target.value)}
                  >
                    <MenuItem value='' disabled>
                      {isFetching ? 'Loading...' : 'Select Ticket Location'}
                    </MenuItem>
                    {ticketLocationOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.ticket_location && (
                <Typography variant='caption' color='error'>
                  {errors.ticket_location.message}
                </Typography>
              )}
            </FormControl>

            {/* Asset Location (Read-only) */}
            <TextField label='Asset Location' value={assetLocationName} fullWidth InputProps={{ readOnly: true }} />

            {/* Assigned To */}
            <FormControl fullWidth error={!!errors.assigned_to}>
              <InputLabel id='assigned-to-label'>Assigned To</InputLabel>
              <Controller
                name='assigned_to'
                control={control}
                rules={{ required: 'Assigned to is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='assigned-to-label'
                    label='Assigned To *'
                    disabled={isFetching}
                    onChange={e => field.onChange(e.target.value)}
                  >
                    <MenuItem value='' disabled>
                      {isFetching ? 'Loading...' : 'Select Assigned To'}
                    </MenuItem>
                    {assignedToOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.assigned_to && (
                <Typography variant='caption' color='error'>
                  {errors.assigned_to.message}
                </Typography>
              )}
            </FormControl>

            {/* Priority */}
            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel id='priority-label'>Priority</InputLabel>
              <Controller
                name='priority'
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='priority-label'
                    label='Priority *'
                    onChange={e => field.onChange(e.target.value)}
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
                )}
              />
              {errors.priority && (
                <Typography variant='caption' color='error'>
                  {errors.priority.message}
                </Typography>
              )}
            </FormControl>

            {/* File Upload */}
            <div>
              <Button variant='outlined' component='label' fullWidth className='h-[56px] text-gray-500 border-gray-300'>
                <CloudUpload className='mr-2' />
                Upload File
                <input
                  type='file'
                  name='file_attached'
                  accept='image/jpeg,image/png,application/pdf'
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  hidden
                />
              </Button>
              {errors.file_attached && (
                <Typography variant='caption' color='error'>
                  {errors.file_attached.message}
                </Typography>
              )}
            </div>

            {/* Status */}
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel id='status-label'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId='status-label'
                    label='Status *'
                    disabled={isFetching}
                    onChange={e => field.onChange(e.target.value)}
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
                )}
              />
              {errors.status && (
                <Typography variant='caption' color='error'>
                  {errors.status.message}
                </Typography>
              )}
            </FormControl>

            {/* Submit Buttons */}
            <div className='flex items-center gap-2 mt-4'>
             
              <Button type='submit' variant='contained' color='primary' disabled={loading || isFetching}>
                {loading ? <CircularProgress size={24} /> : 'Update'}
              </Button>
               <Button onClick={handleClose} variant='outlined' color='error' disabled={loading || isFetching}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}

export default TicketEditDrawer
