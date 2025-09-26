'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Button,
  MenuItem,
  Typography,
  Alert,
  Pagination,
  CardHeader,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import { Autocomplete } from '@mui/material'
import 'ag-grid-community/styles/ag-theme-material.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

import { getCookie, setCookie } from 'cookies-next'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import dayjs from 'dayjs'

ModuleRegistry.registerModules([AllCommunityModule])

const FarReports = () => {
  const defaultPageSize = typeof window !== 'undefined' ? parseInt(getCookie('assetPageSize')) || 10 : 10

  const [rowData, setRowData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: [], // multiple selection
    location: [], // multiple selection
    dateRange: 'all',
    startDate: '',
    endDate: ''
  })

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  const router = useRouter()
  const { lang: locale } = useParams()
  const gridRef = useRef(null)

  // Fetch Category and Location lists
  const fetchFilters = async () => {
    try {
      const [catRes, locRes] = await Promise.all([axiosInstance.get('category/all'), axiosInstance.get('location/all')])

      if (catRes.data.status === 200) {
        setCategories(catRes.data.data || [])
      }
      if (locRes.data.status === 200) {
        setLocations(locRes.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching filters:', err)
      toast.error('Failed to load category/location filters')
    }
  }

  const calculateDateRange = type => {
    const today = dayjs()
    let start, end

    switch (type) {
      case 'last_month':
        start = today.subtract(1, 'month').startOf('month')
        end = today.subtract(1, 'month').endOf('month')
        break

      case 'this_month':
        start = today.startOf('month')
        end = today.endOf('month')
        break

      case 'this_year_to_last_month':
        start = today.startOf('year')
        end = today.subtract(1, 'month').endOf('month')
        break

      case 'this_financial_year':
        // Jan 1st se Dec 31st tak (poora current year)
        start = today.startOf('year')
        end = today.endOf('year')
        break

      case 'last_financial_year':
        // Pichle saal ka Jan 1st se Dec 31st tak
        start = today.subtract(1, 'year').startOf('year')
        end = today.subtract(1, 'year').endOf('year')
        break

      case 'this_quarter': {
        // Custom FY quarters (Apr–Jun, Jul–Sep, Oct–Dec, Jan–Mar)
        const month = today.month() // 0=Jan
        if (month >= 3 && month <= 5) {
          start = today.month(3).startOf('month')
          end = today.month(5).endOf('month')
        } else if (month >= 6 && month <= 8) {
          start = today.month(6).startOf('month')
          end = today.month(8).endOf('month')
        } else if (month >= 9 && month <= 11) {
          start = today.month(9).startOf('month')
          end = today.month(11).endOf('month')
        } else {
          start = today.month(0).startOf('month')
          end = today.month(2).endOf('month')
        }
        break
      }

      case 'last_quarter': {
        const month = today.month()
        if (month >= 3 && month <= 5) {
          start = today.subtract(1, 'year').month(0).startOf('month') // Jan–Mar prev year
          end = today.subtract(1, 'year').month(2).endOf('month')
        } else if (month >= 6 && month <= 8) {
          start = today.month(3).startOf('month') // Apr–Jun
          end = today.month(5).endOf('month')
        } else if (month >= 9 && month <= 11) {
          start = today.month(6).startOf('month') // Jul–Sep
          end = today.month(8).endOf('month')
        } else {
          start = today.month(9).startOf('month') // Oct–Dec
          end = today.month(11).endOf('month')
        }
        break
      }

      default:
        start = ''
        end = ''
    }

    setFilters(prev => ({
      ...prev,
      startDate: start ? start.format('YYYY-MM-DD') : '',
      endDate: end ? end.format('YYYY-MM-DD') : ''
    }))
  }

  // Fetch Assets
  const fetchAssets = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('asset/all', {
        params: {
          page,
          limit: pageSize,
          category: filters.category.join(',') || '',
          location: filters.location.join(',') || ''
        }
      })

      if (response.data && response.data.status === 200) {
        const assets = response.data.data.assets || []
        setPagination(response.data.pagination)
        setRowData(assets)
        setFilteredData(assets)
      } else {
        throw new Error(response.data.message || 'Failed to fetch assets')
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setError(err.message || 'Error loading assets. Please try again.')
      setRowData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchAssets(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize, filters])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Asset Code',
        field: 'asset_code',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Asset Name',
        field: 'asset_name',
        sortable: true,
        filter: 'agTextColumnFilter'
      },
     
    ],
    [locale, router]
  )

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMenu: false,
      cellStyle: { display: 'flex', alignItems: 'center' }
    }),
    []
  )

 

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleClear = () => {
    setFilters({ category: '', location: '' })
  }

  if (loading) {
    return (
      <Card className='flex flex-col'>
        <div className='flex items-center justify-center p-10'>
          <Typography variant='body1'>Loading assets...</Typography>
        </div>
      </Card>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Far Report Table' />
      {error && (
        <Alert severity='error' sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <Divider />

      <div className='flex flex-col p-5 gap-4'>
        {/* Filters */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Depreciation Method - Disabled */}
          <FormControl fullWidth size='small' disabled>
            <InputLabel>Depreciation Method</InputLabel>
            <Select value=''>
              <MenuItem value=''>Select an option</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size='small' disabled>
            <InputLabel>Financial start month</InputLabel>
            <Select value=''>
              <MenuItem value=''>Select an option</MenuItem>
            </Select>
          </FormControl>

        

          {/* Financial Start Month - Disabled */}

          <FormControl fullWidth size='small'>
            <InputLabel>Report Period</InputLabel>
            <Select
              value={filters.dateRange}
              label='Date Range'
              onChange={e => {
                const value = e.target.value
                setFilters(prev => ({ ...prev, dateRange: value }))

                if (value !== 'custom' && value !== 'all') {
                  calculateDateRange(value) // predefined ranges
                } else if (value === 'all') {
                  setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))
                } else if (value === 'custom') {
                  // ✅ reset dates for custom
                  setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))
                }
              }}
            >
              <MenuItem value='all'>All Dates</MenuItem>
              <MenuItem value='custom'>Custom</MenuItem>
              <MenuItem value='this_month'>This Month</MenuItem>
              <MenuItem value='this_quarter'>This Quarter</MenuItem>
              <MenuItem value='this_year_to_last_month'>This Year to Last Month</MenuItem>
              <MenuItem value='this_financial_year'>This Financial Year</MenuItem>
              <MenuItem value='last_month'>Last Month</MenuItem>
              <MenuItem value='last_quarter'>Last Quarter</MenuItem>
              <MenuItem value='last_financial_year'>Last Financial Year</MenuItem>
            </Select>
          </FormControl>

          {/* From & To Date (visible only if Custom) */}
          <TextField
            type='date'
            size='small'
            label='From'
            value={filters.startDate || ''}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                startDate: e.target.value,
                dateRange: 'custom' // force switch to custom
              }))
            }
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type='date'
            size='small'
            label='To'
            value={filters.endDate || ''}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                endDate: e.target.value,
                dateRange: 'custom' // force switch to custom
              }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 mt-4'>
          <Button type='submit' variant='contained' color='primary' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
          <Button variant='outlined' color='error' disabled={loading}>
            Reset
          </Button>
        </div>

        {/* Table */}
        <div>
          <AgGridWrapper
            rowData={filteredData}
            columnDefs={columnDefs}
            gridRef={gridRef}
            rowSelection='multiple'
            domLayout='autoHeight'
            defaultColDef={defaultColDef}
          />
        </div>

        {/* Pagination */}
        <div className='flex justify-between items-center py-4 flex-wrap gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Rows per page:</span>
            <TextField
              select
              size='small'
              value={pagination.pageSize}
              onChange={e => {
                const newSize = parseInt(e.target.value)
                setCookie('assetPageSize', newSize)
                setPagination(prev => ({
                  ...prev,
                  pageSize: newSize,
                  currentPage: 1,
                  totalPages: Math.ceil(prev.totalItems / newSize)
                }))
              }}
            >
              {[10, 15, 20].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <Pagination
            color='primary'
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </Card>
  )
}

export default FarReports
