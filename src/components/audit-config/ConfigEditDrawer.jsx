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
  Box,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const initialValues = {
  audit_name: '',
  audit_type: '',
  audit_field: [],
  audit_startdate: null,
  audit_enddate: null,
  category: '',
  dept: '',
  status: '',
  condition: '',
  location: '',
  assigned_to: [],
  as_on_date: null   // ✅ new field
}


const auditFieldOptions = ['asset code', 'asset name', 'brand', 'model', 'serial no']

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

const formatDate = date => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ConfigEditDrawer = ({ open, handleClose, setData, vendorId, refreshData }) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [availableAssets, setAvailableAssets] = useState(null)

  const [statuses, setStatuses] = useState([])
  const [conditions, setConditions] = useState([])
  const [locations, setLocations] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (open && vendorId) {
      const fetchDropdownData = async () => {
        try {
          const [categoryRes, deptRes, statusRes, conditionRes, locationRes, userRes] = await Promise.all([
            axiosInstance.get('/category/all'),
            axiosInstance.get('/dept/all'),
            axiosInstance.get('/status/all'),
            axiosInstance.get('/condition/all'),
            axiosInstance.get('/location/all'),
            axiosInstance.get('/user/all')
          ])

          setCategories(categoryRes.data?.data || [])
          setDepartments(deptRes.data?.data || [])
          setStatuses(statusRes.data?.data || [])
          setConditions(conditionRes.data?.data || [])
          setLocations(locationRes.data?.data || [])
          setUsers(userRes.data?.data || [])
        } catch (error) {
          console.error('Error fetching dropdown data:', error)
          toast.error('Failed to load dropdown options')
        }
      }

      const fetchAuditData = async () => {
        try {
          const response = await axiosInstance.get(`/config/${vendorId}`)
          if (response.data?.status === 200) {
            const audit = response.data.data
         const initialFormData = {
  audit_name: audit.audit_name || '',
  audit_type: audit.audit_type || '',
  audit_field: audit.audit_field || [],
  audit_startdate: audit.audit_startdate ? new Date(audit.audit_startdate) : null,
  audit_enddate: audit.audit_enddate ? new Date(audit.audit_enddate) : null,
  as_on_date: audit.as_on_date ? new Date(audit.as_on_date) : null,

  category: audit.category?._id || '',
  dept: audit.dept?._id || '',
  status: audit.status?._id || '',
  condition: audit.condition?._id || '',
  location: audit.location?._id || '',
  assigned_to: audit.assigned_to?.map(user => user._id) || [],
  as_on_date: audit.as_on_date ? new Date(audit.as_on_date) : null   // ✅ new field
}

            setFormData(initialFormData)
            setErrors({})
          }
        } catch (error) {
          console.error('Error fetching audit data:', error)
          toast.error('Failed to load audit details')
        }
      }

      fetchDropdownData()
      fetchAuditData()
    } else {
      setFormData(initialValues)
      setErrors({})
    }
  }, [open, vendorId])


  useEffect(() => {
  const fetchAvailableAssets = async () => {
    if (formData.as_on_date) {
      try {
        const formattedDate = formatDate(formData.as_on_date)

        const res = await axiosInstance.post(`/config/asset-count`, {
          as_on_date: formattedDate,
          category: formData.category || undefined,
          dept: formData.dept || undefined,
          status: formData.status || undefined,
          condition: formData.condition || undefined,
          location: formData.location || undefined,
        })

        if (res.data?.status === 200) {
          setAvailableAssets(res.data?.data?.assetCount ?? 0)
        } else {
          setAvailableAssets(null)
        }
      } catch (err) {
        console.error('Error fetching available assets:', err)
        setAvailableAssets(null)
      }
    } else {
      setAvailableAssets(null)
    }
  }

  fetchAvailableAssets()
}, [
  formData.as_on_date,
  formData.category,
  formData.dept,
  formData.status,
  formData.condition,
  formData.location
])


  const validateField = (name, value) => {
    const errs = {}
    if (name === 'audit_name' && !String(value).trim()) errs.audit_name = 'Audit name is required'
    if (name === 'audit_type' && !value) errs.audit_type = 'Audit type is required'
    if (name === 'audit_startdate' && (!value || !(value instanceof Date) || isNaN(value)))
      errs.audit_startdate = 'Start date is required'
    if (name === 'audit_enddate' && (!value || !(value instanceof Date) || isNaN(value)))
      errs.audit_enddate = 'End date is required'
    if (name === 'as_on_date' && (!value || !(value instanceof Date) || isNaN(value)))
  errs.as_on_date = 'As On Date is required'

    return errs
  }

  const validate = () => {
    const errs = {}
    Object.keys(formData).forEach(key => {
      if (['audit_name', 'audit_type', 'audit_startdate', 'audit_enddate','as_on_date'].includes(key)) {
        Object.assign(errs, validateField(key, formData[key]))
      }
    })
    return errs
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
      // Create base payload
   const payload = {
  audit_name: formData.audit_name,
  audit_type: formData.audit_type,
  audit_field: formData.audit_field,
  audit_startdate: formatDate(formData.audit_startdate),
  audit_enddate: formatDate(formData.audit_enddate),
  as_on_date: formatDate(formData.as_on_date),   // ✅ added
  assigned_to: formData.assigned_to,
  category: formData.category || null,
  dept: formData.dept || null,
  status: formData.status || null,
  condition: formData.condition || null,
  location: formData.location || null
}


      // Remove null or empty fields
      for (const key in payload) {
        if (payload[key] === null || payload[key] === '') {
          delete payload[key]
        }
      }

      console.log('Submitting payload:', payload)

      const response = await axiosInstance.put(`/config/${vendorId}`, payload)

      if (response.data?.status === 200) {
        refreshData()
        toast.success(response.data.message || 'Audit updated successfully')
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to update audit.')
      }
    } catch (error) {
      console.error('Error updating audit:', error)
      if (error.response?.data?.errors) {
        // Handle specific field errors
        const fieldErrors = {}
        error.response.data.errors.forEach(err => {
          fieldErrors[err.path] = err.msg
        })
        setErrors(fieldErrors)
        toast.error('Validation errors occurred')
      } else {
        toast.error(error.response?.data?.message || error.message || 'An error occurred while updating the audit.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name, value) => {
    let updatedValue = value

    // Convert empty string to null for optional select fields
    if (['category', 'dept', 'status', 'condition', 'location'].includes(name) && value === '') {
      updatedValue = null
    }

    if (name === 'audit_name' || name === 'audit_type') {
      updatedValue = String(value)
    } else if (typeof value === 'string' && (name === 'audit_field' || name === 'assigned_to')) {
      updatedValue = value.split(',')
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }))

    const newErrors = validateField(name, updatedValue)
    setErrors(prev => ({ ...prev, ...newErrors, [name]: newErrors[name] || '' }))
  }

  // Helper function to get display value for select fields
  const getDisplayValue = (id, options, key) => {
    if (!id) return 'n/a'
    const item = options.find(option => option._id === id)
    return item ? item[key] : 'n/a'
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Drawer anchor='right' open={open} onClose={handleClose}>
        <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
          <div className='flex justify-between items-center mb-2'>
            <Typography variant='h6'>Edit Audit</Typography>
            <IconButton onClick={handleClose} aria-label='Close'>
              <CloseIcon />
            </IconButton>
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              name='audit_name'
              label='Audit Name'
              value={formData.audit_name}
              onChange={e => handleChange('audit_name', e.target.value)}
              fullWidth
              error={!!errors.audit_name}
              helperText={errors.audit_name}
              required
            />

            <FormControl fullWidth error={!!errors.audit_type}>
              <InputLabel id='audit-type-select'>Audit Type</InputLabel>
              <Select
                labelId='audit-type-select'
                name='audit_type'
                label='Audit Type'
                value={formData.audit_type}
                onChange={e => handleChange('audit_type', e.target.value)}
              >
                <MenuItem value='' disabled>
                  Select Audit Type
                </MenuItem>
                <MenuItem value='self'>Self</MenuItem>
                <MenuItem value='aided'>Aided</MenuItem>
              </Select>
              {errors.audit_type && (
                <Typography variant='caption' color='error'>
                  {errors.audit_type}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id='audit-field-select'>Audit Fields</InputLabel>
              <Select
                labelId='audit-field-select'
                name='audit_field'
                label='Audit Fields'
                multiple
                value={formData.audit_field}
                onChange={e => handleChange('audit_field', e.target.value)}
                input={<OutlinedInput label='Audit Fields' />}
                renderValue={selected => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {auditFieldOptions.map(field => (
                  <MenuItem key={field} value={field}>
                    <Checkbox checked={formData.audit_field.includes(field)} />
                    <ListItemText primary={field} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label='Start Date'
              value={formData.audit_startdate}
              onChange={value => handleChange('audit_startdate', value)}
              format='dd/MM/yyyy'
              renderInput={params => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!errors.audit_startdate}
                  helperText={errors.audit_startdate}
                  required
                />
              )}
            />

            <DatePicker
              label='End Date'
              value={formData.audit_enddate}
              onChange={value => handleChange('audit_enddate', value)}
              format='dd/MM/yyyy'
              renderInput={params => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!errors.audit_enddate}
                  helperText={errors.audit_enddate}
                  required
                />
              )}
            />

<DatePicker
  label='As On Date'
  value={formData.as_on_date}
  onChange={value => handleChange('as_on_date', value)}
  format='dd/MM/yyyy'
  renderInput={params => (
    <TextField
      {...params}
      fullWidth
      error={!!errors.as_on_date}
      helperText={errors.as_on_date}
      required
    />
  )}
/>

{availableAssets !== null && (
  <Typography variant="body2" className="mt-1 text-gray-600">
    Available Assets as on Date: <strong>{availableAssets}</strong>
  </Typography>
)}


            <FormControl fullWidth error={!!errors.category}>
              <InputLabel id='category-select'>Category Name</InputLabel>
              <Select
                labelId='category-select'
                name='category'
                label='Category Name'
                value={formData.category || ''}
                onChange={e => handleChange('category', e.target.value)}
              >
                <MenuItem value=''>None</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant='caption' color='error'>
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.dept}>
              <InputLabel id='dept-select'>Department Name</InputLabel>
              <Select
                labelId='dept-select'
                name='dept'
                label='Department Name'
                value={formData.dept || ''}
                onChange={e => handleChange('dept', e.target.value)}
              >
                <MenuItem value=''>None</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.department}
                  </MenuItem>
                ))}
              </Select>
              {errors.dept && (
                <Typography variant='caption' color='error'>
                  {errors.dept}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.status}>
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                labelId='status-select'
                name='status'
                label='Status'
                value={formData.status || ''}
                onChange={e => handleChange('status', e.target.value)}
              >
                <MenuItem value=''>None</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status._id} value={status._id}>
                    {status.status}
                  </MenuItem>
                ))}
              </Select>
              {errors.status && (
                <Typography variant='caption' color='error'>
                  {errors.status}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.condition}>
              <InputLabel id='condition-select'>Condition Name</InputLabel>
              <Select
                labelId='condition-select'
                name='condition'
                label='Condition Name'
                value={formData.condition || ''}
                onChange={e => handleChange('condition', e.target.value)}
              >
                <MenuItem value=''>None</MenuItem>
                {conditions.map(condition => (
                  <MenuItem key={condition._id} value={condition._id}>
                    {condition.condition}
                  </MenuItem>
                ))}
              </Select>
              {errors.condition && (
                <Typography variant='caption' color='error'>
                  {errors.condition}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.location}>
              <InputLabel id='location-select'>Location Name</InputLabel>
              <Select
                labelId='location-select'
                name='location'
                label='Location Name'
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
              >
                <MenuItem value=''>None</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location._id} value={location._id}>
                    {location.location}
                  </MenuItem>
                ))}
              </Select>
              {errors.location && (
                <Typography variant='caption' color='error'>
                  {errors.location}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.assigned_to}>
              <InputLabel id='assigned-to-select'>Assigned To</InputLabel>
              <Select
                labelId='assigned-to-select'
                name='assigned_to'
                label='Assigned To'
                multiple
                value={formData.assigned_to}
                onChange={e => handleChange('assigned_to', e.target.value)}
                input={<OutlinedInput label='Assigned To' />}
                renderValue={selected =>
                  selected
                    .map(value => {
                      const user = users.find(u => u._id === value)

                      return user?.user_name || value
                    })
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    <Checkbox checked={formData.assigned_to.includes(user._id)} />
                    <ListItemText primary={user.user_name} />
                  </MenuItem>
                ))}
              </Select>
              {errors.assigned_to && (
                <Typography variant='caption' color='error'>
                  {errors.assigned_to}
                </Typography>
              )}
            </FormControl>

            <div className='flex items-center gap-2 mt-4'>
              <Button type='submit' variant='contained' color='primary' aria-label='Submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update'}
              </Button>
              <Button onClick={handleClose} variant='outlined' color='error' aria-label='Cancel' disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </LocalizationProvider>
  )
}

export default ConfigEditDrawer
