'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  Accordion,
  AccordionSummary,
  Card,
  Grid,
  Button,
  Divider,
  TextField,
  Typography,
  CardContent,
  CardActions,
  FormControl,
  Box,
  Alert,
  Autocomplete
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { CloudUpload } from 'lucide-react'
import axiosInstance from '@/utils/axiosinstance'

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const AssetSellForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedIndex, setExpandedIndex] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const initialFormData = {
    id: '',
    assetCode: '',
    assetName: '',
    soldValue: '',
    purchasePrice: '',
    priceDifference: '',
    discardDate: null,
    vendorName: '',
    remarks2: '',
    file: null,
    location: '',
    rate: ''
  }

  const [formList, setFormList] = useState([initialFormData])
  const [vendorOptions, setVendorOptions] = useState([])
  const [errors, setErrors] = useState({})

  const [locationOptions, setLocationOptions] = useState([])

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axiosInstance.get('/vendor/all')
        if (res.data.status === 200) {
          setVendorOptions(res.data.data.map(v => ({ id: v._id, name: v.vendor_name })))
        }
      } catch {
        setError('Failed to load vendors.')
      }
    }

    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get('/location/all')
        if (res.data.status === 200) {
          setLocationOptions(res.data.data.map(loc => ({ id: loc._id, name: loc.location })))
        }
      } catch {
        setError('Failed to load locations.')
      }
    }

    const fetchAssets = async () => {
      const rawIds = searchParams.get('ids')
      const ids = rawIds?.split(',').filter(id => id.trim()) || []

      if (!ids.length) {
        setError('No asset IDs provided.')
        setFormList([initialFormData])
        setLoading(false)
        return
      }

      let response = null
      try {
        response = await axiosInstance.post('/asset/fetch', { ids })
      } catch (err) {
        setError('Failed to fetch asset data.')
        setFormList([initialFormData])
        setLoading(false)
        return
      }

      if (response?.data?.status !== 200) {
        setError('Failed to fetch asset data.')
        setFormList([initialFormData])
        setLoading(false)
        return
      }

      const assets = response.data.data.map(asset => ({
        id: asset._id,
        assetCode: asset.asset_code || '',
        assetName: asset.asset_name || '',
        purchasePrice: asset.purchase_price || '',
        priceDifference: '',
        discardDate: null,
        remarks2: '',
        file: null,
        location: '',
        rate: '',
        soldValue: ''
      }))

      setFormList(assets.length ? assets : [initialFormData])
      setExpandedIndex(0)
      setLoading(false)
    }

    fetchVendors()
    fetchLocations()
    fetchAssets()
  }, [searchParams])

  // 🔹 fetchRate function
  const fetchRate = async (formData, idx) => {
    if (formData.discardDate && formData.soldValue && formData.id) {
      try {
        const payload = {
          asset: formData.id,
         discard_date: formData.discardDate ? dayjs(formData.discardDate).format('YYYY-MM-DD') : '',

          sold_value: parseFloat(formData.soldValue) || 0,
          purchase_value: formData.id // ✅ asset id bhejna h as per backend requirement
        }
        const res = await axiosInstance.post('/sell/get-values', payload)
        if (res.data.status === 200) {
          setFormList(prev => {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              rate: res.data.data?.depreciatedValue || '',
              priceDifference: res.data.data?.price_diff || ''
            }
            return updated
          })
        } else {
          toast.error('Failed to fetch rate.')
        }
      } catch (err) {
        console.error('Fetch Rate Error:', err)
        toast.error('Failed to fetch rate.')
      }
    }
  }

  // 🔹 Handle field change
  
  // 🔹 Handle field change
// const handleChange = (idx, field, value) => {
//   setFormList(prev => {
//     const updated = [...prev]
//     let newValue = value

//     if (field === 'soldValue') {
//       const purchase = parseFloat(updated[idx].purchasePrice) || 0
//       const sold = parseFloat(value) || 0

//       if (sold > purchase) {
//         toast.error('Sold Value cannot be greater than Purchase Price')
//         newValue = purchase.toString() // 🔹 force set max as purchase price
//       }
//     }

//     updated[idx] = { ...updated[idx], [field]: newValue }

//     // trigger fetchRate only when discardDate or soldValue changes
//     if (field === 'soldValue' || field === 'discardDate') {
//       fetchRate(updated[idx], idx)
//     }

//     if (['soldValue', 'purchasePrice'].includes(field)) {
//       const sold = parseFloat(updated[idx].soldValue) || 0
//       const purchase = parseFloat(updated[idx].purchasePrice) || 0
//       updated[idx].priceDifference = (sold - purchase).toFixed(2)
//     }

//     return updated
//   })
// }
const handleChange = (idx, field, value) => {
  setFormList(prev => {
    const updated = [...prev]
    let newValue = value
    let errorMsg = ''

    if (field === 'soldValue') {
      const purchase = parseFloat(updated[idx].purchasePrice) || 0
      const sold = parseFloat(value) || 0

      if (sold > purchase) {
        errorMsg = 'Sold Value cannot be greater than Purchase Price'
      }
    }

    updated[idx] = { ...updated[idx], [field]: newValue }

    // 🔹 update errors state
    setErrors(prevErrs => ({
      ...prevErrs,
      [idx]: {
        ...prevErrs[idx],
        [field]: errorMsg
      }
    }))

    // trigger fetchRate only when discardDate or soldValue changes
    if (field === 'soldValue' || field === 'discardDate') {
      fetchRate(updated[idx], idx)
    }

    if (['soldValue', 'purchasePrice'].includes(field)) {
      const sold = parseFloat(updated[idx].soldValue) || 0
      const purchase = parseFloat(updated[idx].purchasePrice) || 0
      updated[idx].priceDifference = (sold - purchase).toFixed(2)
    }

    return updated
  })
}



  const handleFileChange = (e, idx) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('File size exceeds 5 MB limit, Please choose a smaller file')
        return
      }
      setFormList(prev => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], file }
        return updated
      })
    }
  }

  
  const handleSubmit = async (e, idx) => {
  e.preventDefault()
  try {
    const data = formList[idx]

    const purchase = parseFloat(data.purchasePrice) || 0
    const sold = parseFloat(data.soldValue) || 0

    // ✅ Validation: Sold Value must be <= Purchase Price
    if (sold > purchase) {
      setErrors(prevErrs => ({
        ...prevErrs,
        [idx]: {
          ...prevErrs[idx],
          soldValue: 'Sold Value cannot be greater than Purchase Price'
        }
      }))
      return // stop submit
    }

    const fd = new FormData()
    fd.append('asset', data.id)
    fd.append('sold_value', data.soldValue || '')
    fd.append('purchase_value', data.id) // ✅ backend expects asset id
    fd.append('reason', data.remarks2 || '')
    fd.append('location', data.location || '')
    fd.append('rate', data.rate || '')
 fd.append('discard_date', data?.discardDate ? dayjs(data?.discardDate).format('YYYY-MM-DD') : '')


    const selectedVendor = vendorOptions.find(v => v.name === data.vendorName)
    if (selectedVendor) {
      fd.append('vendor', selectedVendor.id)
    }

    if (data.file && data.file instanceof File) {
      fd.append('file_attached', data.file)
    }

    const res = await axiosInstance.post('/sell', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.data.status === 200) {
      toast.success(res.data.message || 'Asset submitted successfully')

      setFormList(prevList => {
        const updatedList = prevList.filter((_, i) => i !== idx)

        if (updatedList.length > 0) {
          setExpandedIndex(prev => {
            if (prev === idx) {
              return idx < updatedList.length ? idx : updatedList.length - 1
            }
            return prev >= idx ? prev - 1 : prev
          })
        } else {
          router.back()
        }

        return updatedList
      })
    } else {
      throw new Error(res.data.message || 'Submission failed')
    }
  } catch (err) {
    console.error('Submit Error:', err)
    toast.error(err.message || 'Failed to submit asset. Please check form values.')
  }
}


  if (loading) {
    return (
      <Card className='flex items-center justify-center p-10'>
        <Typography variant='body1'>Loading asset data...</Typography>
      </Card>
    )
  }

  return (
    <div>
      <ToastContainer />
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {formList.length === 0 ? (
        <Card className='flex items-center justify-center p-10'>
          <Typography variant='body1'>All assets have been submitted. Redirecting...</Typography>
        </Card>
      ) : (
        formList.map((formData, idx) => (
          <Box key={formData.id} mb={3}>
            <Accordion
              expanded={expandedIndex === idx}
              onChange={() => setExpandedIndex(prev => (prev === idx ? null : idx))}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>{formData.assetCode || 'No Code'}</Typography>
              </AccordionSummary>
            </Accordion>

            {expandedIndex === idx && (
              <Card>
                <form onSubmit={e => handleSubmit(e, idx)}>
                  <Typography variant='h6' className='m-4'>
                    Discard OR Sell
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <CardContent sx={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    <Grid container spacing={5}>
                      <Grid item xs={12}>
                        <Typography fontWeight={600}>Asset Info</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label='Asset Code' value={formData.assetCode} disabled />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label='Asset Name' value={formData.assetName} disabled />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Purchase Price'
                          type='number'
                          value={formData.purchasePrice}
                          disabled
                        />
                      </Grid>
                     
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography fontWeight={600}>Discard Info</Typography>
                      </Grid>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label='Discard Date'
                            value={formData.discardDate}
                            onChange={value => handleChange(idx, 'discardDate', value)}
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: 'DD-MM-YYYY'
                              }
                            }}
                          />
                        </Grid>
                      </LocalizationProvider>
                      <Grid item xs={12} sm={4}>
                       <TextField
  fullWidth
  label="Sold Value"
  type="number"
  value={formData.soldValue}
  onChange={e => handleChange(idx, 'soldValue', e.target.value)}
  error={Boolean(errors[idx]?.soldValue)}
  helperText={errors[idx]?.soldValue || ''}
/>

                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label='Depreciated price' value={formData.rate} disabled />
                      </Grid>

                       <Grid item xs={12} sm={4}>
                        <TextField fullWidth label='Price Difference' value={formData.priceDifference} disabled />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <Autocomplete
                            options={vendorOptions}
                            getOptionLabel={option => option.name || ''}
                            isOptionEqualToValue={(option, val) => option.name === val}
                            value={vendorOptions.find(v => v.name === formData.vendorName) || null}
                            onChange={(_, newValue) => {
                              handleChange(idx, 'vendorName', newValue ? newValue.name : '')
                            }}
                            renderInput={params => (
                              <TextField {...params} label='Vendor Name' placeholder='Select Vendor' />
                            )}
                            ListboxProps={{ style: { maxHeight: 300, overflow: 'auto' } }}
                            clearOnEscape
                          />
                        </FormControl>
                      </Grid>
                        <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <Autocomplete
                            options={locationOptions}
                            getOptionLabel={option => option.name || ''}
                            isOptionEqualToValue={(option, val) => option.id === val}
                            value={locationOptions.find(loc => loc.id === formData.location) || null}
                            onChange={(_, newValue) => {
                              handleChange(idx, 'location', newValue ? newValue.id : '')
                            }}
                            renderInput={params => (
                              <TextField {...params} label='Location' placeholder='Select location' />
                            )}
                            ListboxProps={{ style: { maxHeight: 300, overflow: 'auto' } }}
                            clearOnEscape
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Reason'
                          value={formData.remarks2}
                          onChange={e => handleChange(idx, 'remarks2', e.target.value)}
                        />
                      </Grid>
                    
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant='outlined'
                          component='label'
                          fullWidth
                          sx={{ height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <CloudUpload className='text-gray-500' /> Attach File
                          <input type='file' hidden onChange={e => handleFileChange(e, idx)} />
                        </Button>
                        {formData.file && (
                          <Typography variant='body2' mt={1}>
                            {formData.file.name}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ p: 2 }}>
                    <Button type='submit' variant='contained'>
                      Submit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </CardActions>
                </form>
              </Card>
            )}
          </Box>
        ))
      )}
    </div>
  )
}

export default AssetSellForm




