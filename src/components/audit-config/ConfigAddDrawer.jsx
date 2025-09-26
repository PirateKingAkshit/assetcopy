'use client'
import { useState, useEffect } from 'react'

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
  ListItemText,
  Autocomplete
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import CloseIcon from '@mui/icons-material/Close'

import { toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const initialValues = {
  audit_name: '',
  audit_type: '',
  audit_field: [],
  audit_startdate: null,
  audit_enddate: null,
  as_on_date: null,

  category: '',
  dept: '',
  status: '',
  condition: '',
  location: '',
  assigned_to: []
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

const ConfigAddDrawer = ({ open, handleClose, setData, customerData, refreshData }) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
    const [availableAssets, setAvailableAssets] = useState(null) 
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [statuses, setStatuses] = useState([])
  const [conditions, setConditions] = useState([])
 
  const [locations, setLocations] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (open) {
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

      fetchDropdownData()
    } else {
      setFormData(initialValues)
      setErrors({})
    }
  }, [open])


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
          toast.error(res.data?.message || 'Failed to fetch asset count')
        }
      } catch (err) {
        console.error('Error fetching available assets:', err)
        setAvailableAssets(null)
        toast.error('Error fetching available assets')
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
      errs.as_on_date = 'as on date is required'

    return errs
  }

  const validate = () => {
    const errs = {}

    Object.keys(formData).forEach(key => {
      if (['audit_name', 'audit_type', 'audit_startdate', 'audit_enddate'].includes(key)) {
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
      const formDataToSend = {
        audit_name: formData.audit_name,
        audit_type: formData.audit_type,
        audit_field: formData.audit_field.length > 0 ? formData.audit_field : [],
        audit_startdate:
          formData.audit_startdate instanceof Date && !isNaN(formData.audit_startdate)
            ? formatDate(formData.audit_startdate)
            : null,
        audit_enddate:
          formData.audit_enddate instanceof Date && !isNaN(formData.audit_enddate)
            ? formatDate(formData.audit_enddate)
            : null,
            as_on_date:
  formData.as_on_date instanceof Date && !isNaN(formData.as_on_date)
    ? formatDate(formData.as_on_date)
    : null,

        category: formData.category,
        dept: formData.dept,
        status: formData.status,
        condition: formData.condition,
        location: formData.location,
        assigned_to: formData.assigned_to.length > 0 ? formData.assigned_to : []
      }

      for (const data in formDataToSend) {
        if (formDataToSend[data] === null || formDataToSend[data] === '') {
          delete formDataToSend[data]
        }
      }

      const response = await axiosInstance.post('/config', formDataToSend)

      if (response.data?.status === 200) {
        refreshData()
        toast.success(response.data.message || 'Audit added successfully')
        setFormData(initialValues)
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to add audit.')
      }
    } catch (error) {
      console.error('Error adding audit:', error)
      toast.error(error.response?.data?.message || error.message || 'An error occurred while adding the audit.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name, value) => {
    // Clear location if self selected
    if (name === 'audit_type' && value === 'self') {
      setFormData(prev => ({ ...prev, audit_type: value, location: '' }))

      return
    }

    let updatedValue = value

    if (name === 'audit_name' || name === 'audit_type') {
      updatedValue = String(value)
    } else if (typeof value === 'string' && (name === 'audit_field' || name === 'assigned_to')) {
      updatedValue = value.split(',')
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }))
    const newErrors = validateField(name, updatedValue)

    setErrors(prev => ({ ...prev, ...newErrors, [name]: newErrors[name] || '' }))
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Drawer anchor='right' open={open} onClose={handleClose}>
        <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
          <div className='flex justify-between items-center mb-2'>
            <Typography variant='h6'>Add Audit</Typography>
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
              label=' Audit Start Date'
              value={formData.audit_startdate}
              onChange={value => handleChange('audit_startdate', value)}
              format='dd-MM-yyyy'
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.audit_startdate,
                  helperText: errors.audit_startdate,
                  required: true,
                  placeholder: 'DD-MM-YYYY'
                }
              }}
            />

            <DatePicker
              label=' Audit End Date'
              value={formData.audit_enddate}
              onChange={value => handleChange('audit_enddate', value)}
              format='dd-MM-yyyy'
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.audit_enddate,
                  helperText: errors.audit_enddate,
                  required: true,
                  placeholder: 'DD-MM-YYYY'
                }
              }}
            />
<DatePicker
  label='As On Date'
  value={formData.as_on_date || null}
  onChange={value => handleChange('as_on_date', value)}
  format='dd-MM-yyyy'
  slotProps={{
    textField: {
      fullWidth: true,
      placeholder: 'DD-MM-YYYY',
      error: !!errors.as_on_date,
      helperText: errors.as_on_date,
      required: true,
    }
  }}
/>

{availableAssets !== null && (
  <Typography variant="body2" className="mt-1 text-gray-600">
    Available Assets as on Date: <strong>{availableAssets}</strong>
  </Typography>
)}

            <FormControl fullWidth>
              <Autocomplete
                options={categories}
                getOptionLabel={option => option.category_name || ''}
                isOptionEqualToValue={(option, val) => option._id === val}
                value={categories.find(cat => cat._id === formData.category) || null}
                onChange={(_, newValue) => {
                  handleChange('category', newValue ? newValue._id : '')
                }}
                renderInput={params => <TextField {...params} label='Category Name' placeholder='Select Category' />}
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
                clearOnEscape
              />
            </FormControl>

            <FormControl fullWidth>
              <Autocomplete
                options={departments}
                getOptionLabel={option => option.department || ''}
                isOptionEqualToValue={(option, val) => option._id === val}
                value={departments.find(dept => dept._id === formData.dept) || null}
                onChange={(_, newValue) => {
                  handleChange('dept', newValue ? newValue._id : '')
                }}
                renderInput={params => (
                  <TextField {...params} label='Department Name' placeholder='Select department' />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
                clearOnEscape
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                labelId='status-select'
                name='status'
                label='Status'
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                <MenuItem value='' disabled>
                  Select Status
                </MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status._id} value={status._id}>
                    {status.status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <Autocomplete
                options={conditions}
                getOptionLabel={option => option.condition || ''}
                isOptionEqualToValue={(option, val) => option._id === val}
                value={conditions.find(cond => cond._id === formData.condition) || null}
                onChange={(_, newValue) => {
                  handleChange('condition', newValue ? newValue._id : '')
                }}
                renderInput={params => <TextField {...params} label='Condition Name' placeholder='Select Condition' />}
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
                clearOnEscape
              />
            </FormControl>

            {formData.audit_type !== 'self' && (
              <FormControl fullWidth>
                <Autocomplete
                  options={locations}
                  getOptionLabel={option => option.location || ''}
                  isOptionEqualToValue={(option, val) => option._id === val}
                  value={locations.find(loc => loc._id === formData.location) || null}
                  onChange={(_, newValue) => {
                    handleChange('location', newValue ? newValue._id : '')
                  }}
                  renderInput={params => <TextField {...params} label='Location Name' placeholder='Select location' />}
                  ListboxProps={{
                    style: {
                      maxHeight: 300,
                      overflow: 'auto'
                    }
                  }}
                  clearOnEscape
                />
              </FormControl>
            )}

            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={option => option.user_name || ''}
                isOptionEqualToValue={(option, val) => option._id === val._id}
                value={users.filter(user => formData.assigned_to.includes(user._id))}
                onChange={(_, newValue) => {
                  handleChange(
                    'assigned_to',
                    newValue.map(user => user._id)
                  )
                }}
                renderInput={params => <TextField {...params} label='Assigned To' placeholder='Select Users' />}
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
                clearOnEscape
              />
            </FormControl>

            <div className='flex items-center gap-2 mt-4'>
              <Button type='submit' variant='contained' color='primary' aria-label='Submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Submit'}
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

export default ConfigAddDrawer
