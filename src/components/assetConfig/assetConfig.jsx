'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardHeader,
  Button,
  Divider,
  CircularProgress,
  Pagination,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Grid
} from '@mui/material'
import { toast } from 'react-toastify'
import { getCookie, setCookie } from 'cookies-next'
import axiosInstance from '@/utils/axiosinstance'
import 'react-toastify/dist/ReactToastify.css'
import AgGridWrapper from '../agGrid/AgGridWrapper'

const AssetConfigListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const [filteredData, setFilteredData] = useState([])
  const [configData, setConfigData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })

  // Radio + form states
  const [mode, setMode] = useState('manual')
  const [formData, setFormData] = useState({
    serialNo: '',
    assetCode: '',
    assetName: '',
    description: ''
  })
  const [errors, setErrors] = useState({})

  // Load default page size from cookies
  useEffect(() => {
    const storedPageSize = parseInt(getCookie('menuPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  // Fetch config data
 const fetchConfigData = async () => {
  try {
    setLoading(true)
    const response = await axiosInstance.get('/assetCodeConfig')
    if (response.data?.status === 200 && response.data?.data) {
      const config = response.data.data

      setMode(config.codeType?.toLowerCase() || 'auto')

      // ✅ Sirf table ke liye configData set karo
      setConfigData({
        id: config._id?.toString(),
        codeType: config.codeType || 'AUTO',
        prefix: config.prefix || '',
        digit: config.digit || '',
        created_date: config.created_date || new Date().toISOString()
      })

      // ✅ Form blank rakho (prefill na ho)
      setFormData({
        assetCode: '',
        serialNo: '',
        assetName: '',
        description: ''
      })
    }
  } catch (error) {
    console.error('Error fetching config:', error)
    toast.error(error.response?.data?.message || 'Error fetching configuration')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchConfigData()
  }, [])

  const columnDefs = useMemo(
    () => [
      { headerName: 'Type', field: 'codeType', width: 240, cellStyle: cellStyleDefault },
      { headerName: 'Prefix', field: 'prefix', width: 246, cellStyle: cellStyleDefault },
      { headerName: 'Serial no', field: 'digit', width: 240, cellStyle: cellStyleDefault },
      {
        headerName: 'Created Date',
        field: 'created_date',
        width: 240,
        valueFormatter: params => (params.value ? new Date(params.value).toLocaleDateString() : '-'),
        cellStyle: cellStyleDefault
      }
    ],
    []
  )

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const validateForm = () => {
    let newErrors = {}
    if (!formData.serialNo) newErrors.serialNo = 'Serial No is required'
    if (!formData.assetCode) newErrors.assetCode = 'Prefix is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (mode === 'auto' && !validateForm()) return

    try {
      const payload = {
        codeType: mode.toUpperCase(), // 👈 AUTO / MANUAL based on radio selection
        prefix: mode === 'auto' ? formData.assetCode : '',
        digit: mode === 'auto' ? Number(formData.serialNo) : null
      }

      const postRes = await axiosInstance.post('/assetCodeConfig', payload)
      if (postRes.data?.status === 200) {
        toast.success('Saved Successfully!')

        // Refresh table data
        const getRes = await axiosInstance.get('/assetCodeConfig')
        if (getRes.data?.status === 200 && getRes.data?.data) {
          const config = getRes.data.data

          // Keep form empty so no pre-fill happens
          setFormData({
            assetCode: '',
            serialNo: '',
            assetName: '',
            description: ''
          })

          setConfigData({
            id: config._id?.toString(),
            codeType: config.codeType || 'AUTO',
            prefix: config.prefix || '',
            digit: config.digit || '',
            created_date: config.created_date || new Date().toISOString()
          })
        }

        setErrors({})
      } else {
        toast.error(postRes.data?.message || 'Failed to save config')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving config')
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Asset Serial No' />
      <Divider />

      {/* Radio Buttons */}
      <div className='p-5'>
        <Typography variant='subtitle1' gutterBottom>
          Select Mode:
        </Typography>
        <RadioGroup row value={mode} onChange={e => setMode(e.target.value)}>
          <FormControlLabel value='auto' control={<Radio />} label='Auto' />
          <FormControlLabel value='manual' control={<Radio />} label='Manual' />
        </RadioGroup>
      </div>

      {/* Auto Mode Form + Save */}
      {mode === 'auto' && (
        <div className='px-6 pb-6'>
          <Grid container spacing={2} alignItems='center'>
            {/* Prefix field */}
            <Grid item xs={12} sm={4}>
              <TextField
                size='small'
                fullWidth
                label='Prefix'
                placeholder='Enter Prefix'
                value={formData.assetCode}
                onChange={e => setFormData({ ...formData, assetCode: e.target.value })}
                error={!!errors.assetCode}
                helperText={errors.assetCode}
              />
            </Grid>

            {/* Serial No field */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size='small'
                label='Serial No'
                value={formData.serialNo || ''}
                onChange={e => setFormData({ ...formData, serialNo: e.target.value })}
                error={!!errors.serialNo}
                helperText={errors.serialNo}
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Save Button */}
            <Grid item>
              <Button variant='contained' color='primary' className='max-sm:w-full' onClick={handleSave}>
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
      )}

      {/* Manual Mode - Show Save button only */}
      {mode === 'manual' && (
        <div className='px-6 pb-6'>
          <Button variant='contained' color='primary' className='max-sm:w-full' onClick={handleSave}>
            Save
          </Button>
        </div>
      )}

      {/* Table */}
      <div className='px-6'>
        <AgGridWrapper
          rowData={configData ? [configData, ...filteredData] : filteredData}
          columnDefs={columnDefs}
          domLayout='autoHeight'
        />
      </div>

      {/* Pagination */}
      <div className='flex justify-between items-center px-6 py-4 flex-wrap gap-4'></div>
    </Card>
  )
}

const cellStyleDefault = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  fontSize: '0.875rem',
  color: '#000000'
}

export default AssetConfigListTable
