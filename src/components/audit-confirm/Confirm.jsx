'use client'

import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'
import { useRouter } from 'next/navigation'

const initialValues = {
  asset_code: '',
  asset_name: '',
  brand: '',
  model: '',
  serial_no: '',
  remark: '',
  condition: ''
}

const initialChecks = {
  asset_code: true,
  asset_name: true,
  brand: true,
  model: true,
  serial_no: true
}

const Confirm = () => {
  const [formData, setFormData] = useState(initialValues)
  const [checks, setChecks] = useState(initialChecks)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [conditions, setConditions] = useState([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang: locale } = useParams()

  
  // Fetch asset data based on qr_code
  useEffect(() => {
    const qrCode = searchParams.get('qr_code')
    if (qrCode) {
      const qrParts = qrCode.split('-')
      if (qrParts.length < 2) {
        toast.error('Invalid QR code format.')
        return
      }

      const assetCode = qrParts[1] // Extract ASSET00000040

      const fetchAssetData = async () => {
        try {
          const response = await axiosInstance.get(`/asset/code/${assetCode}`)
          const assetData = response.data?.data
          if (assetData) {
            setFormData(prev => ({
              ...prev,
              asset_code: assetData.asset_code || '',
              asset_name: assetData.asset_name || '',
              brand: assetData.brand?.name || '',
              model: assetData.model?.model_name || '',
              serial_no: assetData.serial_no || ''
            }))
          } else {
            toast.error(response.data?.message || 'No asset data found.')
          }
        } catch (error) {
          console.error('Error fetching asset data:', error)
          toast.error(error.response?.data?.message || 'Failed to fetch asset data.')
        }
      }

      fetchAssetData()
    } else {
      toast.error('No QR code provided.')
    }
  }, [searchParams])

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const response = await axiosInstance.get('/condition/all')
        if (response.data?.status === 200) {
          const fetchedConditions = response.data.data || []
          setConditions(fetchedConditions)

          //  Set default condition to "good" if not already set
          const goodCondition = fetchedConditions.find(cond => cond.condition === 'good')
          if (goodCondition && !formData.condition) {
            setFormData(prev => ({ ...prev, condition: goodCondition._id }))
          }
        } else {
          toast.error(response.data?.message || 'Failed to fetch conditions.')
        }
      } catch (error) {
        console.error('Error fetching conditions:', error)
        toast.error(error.response?.data?.message || 'Failed to fetch conditions.')
      }
    }

    fetchConditions()
  }, [])

  const validateField = (name, value) => {
  // Skip validation for remark, condition, brand, model (optional fields)
  if (['remark', 'condition', 'brand', 'model', 'serial_no'].includes(name)) return ''
  
  if (!String(value).trim()) {
    return `${name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} is required`
  }
  return ''
}


  const validate = () => {
    const errs = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) errs[key] = error
    })
    return errs
  }

  const allChecked = () => {
    return Object.values(checks).every(check => check)
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleCheck = (name, checked) => {
    setChecks(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fill all required fields')
      return
    }

    if (!allChecked()) {
      toast.error('Please confirm all required fields by toggling all switches')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      // Get geolocation before submitting
      // const location = await getLocation()

      const qrCode = searchParams.get('qr_code')
      const payload = {
        qr_code: qrCode || '',
        remark: formData.remark || '',
        condition: formData.condition || ''
        // geo_loc: location.latitude && location.longitude ? [location.longitude, location.latitude] : null
      }

      const response = await axiosInstance.post('/audit', payload)
      if (response.data?.status === 200) {
        toast.success(response.data.message)
        setFormData(initialValues)
        setChecks(initialChecks)
        setErrors({})

        router.push(`/${locale}/assetAudit/audit-config`)
      } else {
        toast.error(response.data?.message || 'Failed to submit audit')
      }
    } catch (error) {
      console.error('Error submitting audit:', error)
      toast.error(error.response?.data?.message || 'An error occurred while submitting the audit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        body {
          padding: 30px;
        }
        .can-toggle {
          position: relative;
        }
        .can-toggle *,
        .can-toggle *:before,
        .can-toggle *:after {
          box-sizing: border-box;
        }
        .can-toggle input[type='checkbox'] {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
        }
        .can-toggle input[type='checkbox'][disabled] ~ label {
          pointer-events: none;
        }
        .can-toggle input[type='checkbox'][disabled] ~ label .can-toggle__switch {
          opacity: 0.4;
        }
        .can-toggle input[type='checkbox']:checked ~ label .can-toggle__switch:before {
          content: attr(data-unchecked);
          left: 0;
        }
        .can-toggle input[type='checkbox']:checked ~ label .can-toggle__switch:after {
          content: attr(data-checked);
        }
        .can-toggle input[type='checkbox']:focus ~ label .can-toggle__switch,
        .can-toggle input[type='checkbox']:hover ~ label .can-toggle__switch {
          background-color: #d81b60;
        }
        .can-toggle input[type='checkbox']:focus ~ label .can-toggle__switch:after,
        .can-toggle input[type='checkbox']:hover ~ label .can-toggle__switch:after {
          color: #b71c1c;
        }
        .can-toggle input[type='checkbox']:hover ~ label {
          color: #c2185b;
        }
        .can-toggle input[type='checkbox']:checked ~ label:hover {
          color: #4caf50;
        }
        .can-toggle input[type='checkbox']:checked ~ label .can-toggle__switch {
          background-color: #66bb6a;
        }
        .can-toggle input[type='checkbox']:checked ~ label .can-toggle__switch:after {
          color: #4caf50;
        }
        .can-toggle input[type='checkbox']:checked:focus ~ label .can-toggle__switch,
        .can-toggle input[type='checkbox']:checked:hover ~ label .can-toggle__switch {
          background-color: #4caf50;
        }
        .can-toggle input[type='checkbox']:checked:focus ~ label .can-toggle__switch:after,
        .can-toggle input[type='checkbox']:checked:hover ~ label .can-toggle__switch:after {
          color: #388e3c;
        }
        .can-toggle label {
          user-select: none;
          position: relative;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        .can-toggle label .can-toggle__label-text {
          flex: 1;
          padding-left: 32px;
        }
        .can-toggle label .can-toggle__switch {
          position: relative;
          transition: background-color 0.3s cubic-bezier(0, 1, 0.5, 1);
          background: #e91e63;
          height: 36px;
          flex: 0 0 134px;
          border-radius: 8px;
        }
        .can-toggle label .can-toggle__switch:before {
          content: attr(data-checked);
          position: absolute;
          top: 0;
          text-transform: uppercase;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          left: 67px;
          font-size: 12px;
          line-height: 36px;
          width: 67px;
          padding: 0 12px;
        }
        .can-toggle label .can-toggle__switch:after {
          content: attr(data-unchecked);
          position: absolute;
          z-index: 5;
          text-transform: uppercase;
          text-align: center;
          background: white;
          transform: translate3d(0, 0, 0);
          color: #e91e63;
          transition: transform 0.3s cubic-bezier(0, 1, 0.5, 1);
          top: 2px;
          left: 2px;
          border-radius: 6px;
          width: 65px;
          line-height: 32px;
          font-size: 12px;
        }
        .can-toggle label .can-toggle__switch:hover:after {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .can-toggle input[type='checkbox']:focus ~ label .can-toggle__switch:after,
        .can-toggle input[type='checkbox']:hover ~ label .can-toggle__switch:after {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .can-toggle input[type='checkbox']:checked ~ label .can-toggle__switch:after {
          transform: translate3d(67px, 0, 0);
        }
        .can-toggle input[type='checkbox']:checked:focus ~ label .can-toggle__switch:after,
        .can-toggle input[type='checkbox']:checked:hover ~ label .can-toggle__switch:after {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .can-toggle input[type='checkbox'][disabled] ~ label {
          color: rgba(233, 30, 99, 0.5);
        }
        .can-toggle.can-toggle--size-small {
          input[type='checkbox']:focus ~ label .can-toggle__switch:after,
          input[type='checkbox']:hover ~ label .can-toggle__switch:after {
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
          }
          input[type='checkbox']:checked ~ label .can-toggle__switch:after {
            transform: translate3d(44px, 0, 0);
          }
          input[type='checkbox']:checked:focus ~ label .can-toggle__switch:after,
          input[type='checkbox']:checked:hover ~ label .can-toggle__switch:after {
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
          }
          label {
            font-size: 13px;
          }
          label .can-toggle__switch {
            height: 28px;
            flex: 0 0 90px;
            border-radius: 6px;
          }
          label .can-toggle__switch:before {
            left: 45px;
            font-size: 10px;
            line-height: 28px;
            width: 45px;
            padding: 0 12px;
          }
          label .can-toggle__switch:after {
            top: 1px;
            left: 1px;
            border-radius: 4px;
            width: 44px;
            line-height: 26px;
            font-size: 10px;
          }
          label .can-toggle__switch:hover:after {
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
      <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, boxShadow: 3, borderRadius: 2, bgcolor: '#fafafa', marginTop: 4 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            background: '#000',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Audit Confirmation Form
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography
                variant='subtitle1'
                sx={{ textAlign: 'right', pr: 10, fontWeight: 'medium', color: '#424242' }}
              >
                Confirm
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'medium', color: '#424242' }}>Asset Code *</Typography>
                <TextField
                  name='asset_code'
                  value={formData.asset_code}
                  onChange={e => handleChange('asset_code', e.target.value)}
                  fullWidth
                  error={!!errors.asset_code}
                  helperText={errors.asset_code}
                  required
                  disabled={true}
                  variant='outlined'
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    height: '36px',
                    '& .MuiInputBase-root': {
                      height: '36px',
                      padding: '0 14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '0',
                      lineHeight: '36px'
                    }
                  }}
                />
                <div className='can-toggle can-toggle--size-small'>
                  <input
                    id='asset_code_toggle'
                    type='checkbox'
                    checked={checks.asset_code}
                    onChange={e => handleCheck('asset_code', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor='asset_code_toggle'>
                    <div className='can-toggle__switch' data-checked='Yes' data-unchecked='No'></div>
                  </label>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'medium', color: '#424242' }}>Asset Name *</Typography>
                <TextField
                  name='asset_name'
                  value={formData.asset_name}
                  onChange={e => handleChange('asset_name', e.target.value)}
                  fullWidth
                  error={!!errors.asset_name}
                  helperText={errors.asset_name}
                  required
                  disabled={true}
                  variant='outlined'
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    height: '36px',
                    '& .MuiInputBase-root': {
                      height: '36px',
                      padding: '0 14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '0',
                      lineHeight: '36px'
                    }
                  }}
                />
                <div className='can-toggle can-toggle--size-small'>
                  <input
                    id='asset_name_toggle'
                    type='checkbox'
                    checked={checks.asset_name}
                    onChange={e => handleCheck('asset_name', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor='asset_name_toggle'>
                    <div className='can-toggle__switch' data-checked='Yes' data-unchecked='No'></div>
                  </label>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'medium', color: '#424242' }}>Brand </Typography>
                <TextField
                  name='brand'
                  value={formData.brand}
                  onChange={e => handleChange('brand', e.target.value)}
                  fullWidth
                  error={!!errors.brand}
                  helperText={errors.brand}
                
                  disabled={true}
                  variant='outlined'
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    height: '36px',
                    '& .MuiInputBase-root': {
                      height: '36px',
                      padding: '0 14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '0',
                      lineHeight: '36px'
                    }
                  }}
                />
                <div className='can-toggle can-toggle--size-small'>
                  <input
                    id='brand_toggle'
                    type='checkbox'
                    checked={checks.brand}
                    onChange={e => handleCheck('brand', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor='brand_toggle'>
                    <div className='can-toggle__switch' data-checked='Yes' data-unchecked='No'></div>
                  </label>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'medium', color: '#424242' }}>Model </Typography>
                <TextField
                  name='model'
                  value={formData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  fullWidth
                  error={!!errors.model}
                  helperText={errors.model}
                
                  disabled={true}
                  variant='outlined'
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    height: '36px',
                    '& .MuiInputBase-root': {
                      height: '36px',
                      padding: '0 14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '0',
                      lineHeight: '36px'
                    }
                  }}
                />
                <div className='can-toggle can-toggle--size-small'>
                  <input
                    id='model_toggle'
                    type='checkbox'
                    checked={checks.model}
                    onChange={e => handleCheck('model', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor='model_toggle'>
                    <div className='can-toggle__switch' data-checked='Yes' data-unchecked='No'></div>
                  </label>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 'medium', color: '#424242' }}>Serial Number </Typography>
                <TextField
                  name='serial_no'
                  value={formData.serial_no}
                  onChange={e => handleChange('serial_no', e.target.value)}
                  fullWidth
                
                 
                  disabled={true}
                  variant='outlined'
                  sx={{
                    flex: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    height: '36px',
                    '& .MuiInputBase-root': {
                      height: '36px',
                      padding: '0 14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '0',
                      lineHeight: '36px'
                    }
                  }}
                />
                <div className='can-toggle can-toggle--size-small'>
                  <input
                    id='serial_no_toggle'
                    type='checkbox'
                    checked={checks.serial_no}
                    onChange={e => handleCheck('serial_no', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor='serial_no_toggle'>
                    <div className='can-toggle__switch' data-checked='Yes' data-unchecked='No'></div>
                  </label>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <FormControl fullWidth variant='outlined' sx={{ bgcolor: 'white', borderRadius: 1 }}>
                  <InputLabel id='condition-label'>Condition</InputLabel>
                  <Select
                    labelId='condition-label'
                    name='condition'
                    value={formData.condition}
                    onChange={e => handleChange('condition', e.target.value)}
                    label='Condition'
                    disabled={loading || conditions.length === 0}
                  >
                    <MenuItem value=''>
                      <em>Select Condition</em>
                    </MenuItem>
                    {conditions.map(condition => (
                      <MenuItem key={condition._id} value={condition._id}>
                        {condition.condition}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <TextField
                  name='remark'
                  label='Remark'
                  value={formData.remark}
                  onChange={e => handleChange('remark', e.target.value)}
                  fullWidth
                  error={!!errors.remark}
                  helperText={errors.remark}
                  disabled={loading}
                  variant='outlined'
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                type='submit'
                variant='contained'
                disabled={loading || !allChecked()}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: '#6E6FE2',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: 1,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    background: '#6E6FE2',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  },
                  '&:disabled': {
                    background: '#bdbdbd',
                    color: '#757575'
                  }
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        </form>
      </Card>
    </>
  )
}

export default Confirm
