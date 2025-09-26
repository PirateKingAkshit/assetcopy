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
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'

import 'ag-grid-community/styles/ag-theme-material.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

import { toast } from 'react-toastify'

import { getCookie, setCookie } from 'cookies-next'

import dayjs from 'dayjs'

import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import axiosInstance from '@/utils/axiosinstance'


ModuleRegistry.registerModules([AllCommunityModule])

const SummaryReportTable = () => {
  const defaultPageSize = typeof window !== 'undefined' ? parseInt(getCookie('assetPageSize')) || 10 : 10
  //const userData = getCookie('userData') ? JSON.parse(getCookie('userData')) : null
  // const { clientMethod, financialYear } = userData
  const [dynamicColumnDefs, setDynamicColumnDefs] = useState([])
  const [rowData, setRowData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [reportData, setReportData] = useState([])
  const [generateLoading, setGenerateLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [status, setStatus] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    category: [], // multiple selection
    location: [], // multiple selection
    status: [],
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

  // 1️⃣ Cell style ko useMemo ke bahar define karo
  const cellStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const staticColumnDefs = useMemo(
    () => [
      {
        headerName: 'Asset Code',
        field: 'asset_code',
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: cellStyle
      },
      {
        headerName: 'Asset Name',
        field: 'asset_name',
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: cellStyle
      },
      { headerName: 'Category', field: 'category', cellStyle: cellStyle },
      { headerName: 'Location', field: 'location', cellStyle: cellStyle },

      { headerName: ' description', field: 'description', cellStyle: cellStyle },
      { headerName: 'Capitalization Date', field: 'capitalization_date', cellStyle: cellStyle },
      { headerName: 'Invoice Date', field: 'invoice_date', cellStyle: cellStyle },
      { headerName: 'AMC Start Date', field: 'amc_startdate', cellStyle: cellStyle },
      { headerName: 'AMC End Date', field: 'amc_enddate', cellStyle: cellStyle },
      { headerName: 'Warranty Start Date', field: 'warranty_startdate', cellStyle: cellStyle },
      { headerName: 'Warranty End Date', field: 'warranty_enddate', cellStyle: cellStyle },
      { headerName: 'Insurance Start Date', field: 'insurance_startdate', cellStyle: cellStyle },
      { headerName: 'po_number', field: 'po_number', cellStyle: cellStyle },
      { headerName: 'purchase_price', field: 'purchase_price', cellStyle: cellStyle },

      { headerName: 'Invoice no', field: 'invoice_no', cellStyle: cellStyle },

      { headerName: 'Lifetime (Months)', field: 'lifetime_months', cellStyle: cellStyle },
      { headerName: 'Capitalization Price', field: 'capitalization_price', cellStyle: cellStyle },
      { headerName: 'Scrap Value', field: 'scrap_value', cellStyle: cellStyle },
      { headerName: 'Vendor', field: 'vendor', cellStyle: cellStyle },
      { headerName: 'Shift', field: 'shift', cellStyle: cellStyle },
      { headerName: 'Department', field: 'dept', cellStyle: cellStyle },
      { headerName: 'Income Tax Depreciation %', field: 'incometaxdepreciation_per', cellStyle: cellStyle },
      { headerName: 'AMC Vendor', field: 'amc_vendor', cellStyle: cellStyle },
      { headerName: 'Warranty', field: 'warranty', cellStyle: cellStyle },
      { headerName: 'Status', field: 'status', cellStyle: cellStyle },
      { headerName: 'Brand', field: 'brand', cellStyle: cellStyle },
      { headerName: 'Condition', field: 'condition', cellStyle: cellStyle }
    ],
    []
  )

  // Fetch Category and Location lists status
  const fetchFilters = async () => {
    try {
      const [catRes, locRes, statusRes] = await Promise.all([
        axiosInstance.get('category/all'),
        axiosInstance.get('location/all'),
        axiosInstance.get('status/all')
      ])

      if (catRes.data.status === 200) {
        setCategories(catRes.data.data || [])
      }

      if (locRes.data.status === 200) {
        setLocations(locRes.data.data || [])
      }

      if (statusRes.data.status === 200) {
        setStatus(statusRes.data.data || [])
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
  }, [pagination.currentPage, pagination.pageSize])

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
      {
        headerName: 'Category',
        field: 'category_name'
      },
      {
        headerName: 'Location',
        field: 'location_name'
      }
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
    setFilters({ category: '', location: '', dateRange: 'all', startDate: '', endDate: '' })
    setReportData([])
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

  const generateReport = async () => {
    try {
      setGenerateLoading(true)

      if (!filters.startDate || !filters.endDate) {
        toast.error('Please select a date range')

        return
      }

      const response = await axiosInstance.post('/assetReport/generate-summary', {
        reporting_period_start_date: filters.startDate,
        reporting_period_end_date: filters.endDate,
        category: filters.category,
        location: filters.location,
        status: filters.status
      })

      if (response.data.status === 200) {
        const apiData = response.data.data // <-- the array you showed

        // ✅ create columnDefs from keys of first object
        const dynamicCols = Object.keys(apiData[0] || {}).map(key => ({
          headerName: key.replace(/_/g, ' ').toUpperCase(),
          field: key,
          sortable: true,
          filter: true,
          resizable: true
        }))

        setReportData(apiData) // feed rows to AgGrid
        setRowData(apiData)
        setDynamicColumnDefs(dynamicCols) // see next step

        toast.success('Report generated successfully')
      } else {
        toast.error(response.data.message || 'Failed to generate report.')
      }
    } catch (err) {
      reportData([])
      console.error('Error generating report:', err)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setGenerateLoading(false)
    }
  }

 const handleExport = async () => {
  const fileName = `Summary_Report_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;

  try {
    setExportLoading(true);

    const payload = {
      reporting_period_start_date: filters.startDate,
      reporting_period_end_date: filters.endDate,
      location: filters.location,
      category: filters.category,
      status: filters.status
    };

    const response = await axiosInstance.post(
      'assetReport/export-summary',
      payload,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Error exporting data. Please try again.');
  } finally {
    setExportLoading(false);
  }
};




  return (
    <Card className='flex flex-col'>
      <CardHeader title='Summary Report Table' />
      {error && (
        <Alert severity='error' sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <Divider />

      <div className='flex flex-col p-5 gap-4'>
        {/* Filters */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
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

          {/* Category Multi-Select */}
          <FormControl fullWidth size='small'>
            <Autocomplete
              fullWidth
              size='small'
              multiple
              options={categories}
              getOptionLabel={option => option?.category_name || ''}
              value={categories.filter(cat => filters.category.includes(cat._id))}
              onChange={(event, values) => {
                setFilters(prev => ({
                  ...prev,
                  category: values.map(v => v._id) // store array of _id
                }))
              }}
              renderInput={params => <TextField {...params} label='Category' placeholder='Select Categories' />}
              ListboxProps={{
                style: {
                  maxHeight: 300,
                  overflow: 'auto'
                }
              }}
            />
          </FormControl>

          {/* Location Multi-Select */}
          <FormControl fullWidth size='small'>
            <Autocomplete
              fullWidth
              size='small'
              multiple
              options={locations}
              getOptionLabel={option => option?.location || ''}
              value={locations.filter(l => filters.location.includes(l._id))}
              onChange={(event, values) => {
                setFilters(prev => ({
                  ...prev,
                  location: values.map(v => v._id)
                }))
              }}
              renderInput={params => <TextField {...params} label='Location' placeholder='Select Locations' />}
              ListboxProps={{
                style: {
                  maxHeight: 300,
                  overflow: 'auto'
                }
              }}
            />
          </FormControl>

          {/* Status Multi-Select */}
          <FormControl fullWidth size='small'>
            <Autocomplete
              fullWidth
              size='small'
              multiple
              options={status}
              getOptionLabel={option => option?.status || 'Unnamed Status'}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.status || 'Unnamed Status'}
                </li>
              )}
              value={status.filter(s => (filters.status || []).includes(s._id))}
              onChange={(event, values) => {
                setFilters(prev => ({
                  ...prev,
                  status: values.map(v => v._id)
                }))
              }}
              renderInput={params => <TextField {...params} label='Status' placeholder='Select Status' />}
              ListboxProps={{
                style: { maxHeight: 300, overflow: 'auto' }
              }}
            />
          </FormControl>
        </div>
        <div className='flex gap-4 mt-4 justify-between items-center'>
          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={loading}
              onClick={() => {
                generateReport()
              }}
            >
              {generateLoading ? 'Generating' : 'Generate'}
            </Button>
            <Button variant='outlined' color='error' disabled={generateLoading} onClick={handleClear}>
              Reset
            </Button>
          </div>

          {/* Export Button */}
          {reportData.length > 0 && (
            <Button
              variant='outlined'
              startIcon={<i className='ri-upload-2-line' />}
              onClick={handleExport}
              disabled={exportLoading || reportData.length === 0 || generateLoading}
            >
              {exportLoading ? 'Exporting' : 'Export'}
            </Button>
          )}
        </div>
        {/* Table */}
        {reportData.length > 0 && (
          <div>
            <AgGridWrapper
              rowData={reportData}
              columnDefs={staticColumnDefs}
              gridRef={gridRef}
              rowSelection='multiple'
              domLayout='autoHeight'
              defaultColDef={defaultColDef}
            />
          </div>
        )}
           {/* <div className='flex justify-between items-center py-4 flex-wrap gap-4'>
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
                </div> */}
      </div>
    </Card>
  )
}

export default SummaryReportTable
