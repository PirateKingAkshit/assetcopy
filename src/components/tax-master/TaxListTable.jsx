'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import {
  Card,
  CardHeader,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material'

// Third-party Imports
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { getCookie, setCookie } from 'cookies-next'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import TaxFilter from './TaxFilter'
import TaxViewDrawer from './TaxViewDrawer'
import TaxEditDrawer from './TaxEditDrawer'
import AssetAddTaxDrawer from './AssetAddTaxDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'
//import PaginationComponent from './PaginationComponent'; // Import the reusable PaginationComponent

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule])

const taxTypeObj = {
  GST: { icon: 'ri-percent-line', color: 'info' },
  VAT: { icon: 'ri-percent-line', color: 'warning' }
}

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
}

const formatDate = isoString => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const TaxListTable = () => {
  const defaultPageSize = parseInt(getCookie('taxPageSize')) || 10

  const { lang: locale } = useParams()

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [categoryEditUserOpen, setCategoryEditUserOpen] = useState(false)
  const [categoryViewUserOpen, setCategoryViewUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  const fetchTaxes = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('tax/all', {
          params: { page, limit: pageSize }
        })

        if (response.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => {
            const createdDate = item.created_date || null
            return {
              id: item._id,
              tax_code: item.tax_code || 'N/A',
              tax_type: item.tax_type || 'GST',
              tax_percentage: item.tax_perc?.$numberDecimal ? parseFloat(item.tax_perc.$numberDecimal) : null,
              description: item.description || 'No description',
              gst_type: item.gst_type || 'N/A',
              state_type: item.state_type || 'N/A',
              status: item.status,
              createdBy: item.created_by?.user_name || 'Unknown',
              createdDate: createdDate ? formatDate(createdDate) : ''
            }
          })
          setPagination(response.data.pagination)
          setData(mappedData)
          setFilteredData(mappedData)

          // if (response.data.pagination) {
          //   setPagination({
          //     totalItems: response.data.pagination.totalItems || 0,
          //     totalPages: response.data.pagination.totalPages || 1,
          //     currentPage: response.data.pagination.currentPage || 1,
          //     pageSize: response.data.pagination.pageSize || pageSize,
          //   });
          // }
        } else {
          toast.error(response.data?.message || 'Invalid API response')
        }
      } catch (error) {
        console.error('Error fetching taxes:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(`Failed to fetch taxes: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchTaxes(pagination.currentPage, pagination.pageSize)
  }, [fetchTaxes, pagination.currentPage, pagination.pageSize])

  const handleEditClick = useCallback(id => {
    setSelectedRowId(id)
    setCategoryEditUserOpen(true)
  }, [])

  const handleViewClick = useCallback(id => {
    setSelectedRowId(id)
    setCategoryViewUserOpen(true)
  }, [])

  const handleDeleteClick = useCallback(id => {
    setSelectedRowId(id)
    setOpenConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRowId) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`tax/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        toast.success(response.data.message, 'Tax deleted successfully')
      } else {
        toast.error(response.data?.message || 'Failed to delete tax')
      }
    } catch (error) {
      console.error('Error deleting tax:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to delete tax: ${errorMessage}`)
      }
    } finally {
      setOpenConfirm(false)
      setSelectedRowId(null)
      setDeleteLoading(false)
    }
  }, [selectedRowId])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Tax Code',
        field: 'tax_code',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.tax_code,

        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Tax Type',
        field: 'tax_type',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: Object.keys(taxTypeObj),
          suppressSelectAll: true
        },
        cellRenderer: params => params.data.tax_type,

        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Tax Percentage',
        field: 'tax_percentage',
        width: 200,
        filter: 'agNumberColumnFilter',
        cellRenderer: params => params.data.tax_percentage,

        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Description',
        field: 'description',
        width: 250,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.description,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'GST Type',
        field: 'gst_type',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.gst_type,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'State Type',
        field: 'state_type',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.state_type,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['true', 'false'],
          suppressSelectAll: true
        },
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title || params.data.status}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color || 'default'}
            size='small'
          />
        ),
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 200,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 200,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            // Handle null or undefined cell values
            if (!cellValue || typeof cellValue !== 'string') return 0

            // Parse cellValue (assuming DD-MM-YYYY format)
            const dateParts = cellValue.split('-')
            if (dateParts.length !== 3) return 0 // Invalid date format
            const cellDate = new Date(
              parseInt(dateParts[2], 10), // Year
              parseInt(dateParts[1], 10) - 1, // Month (0-based)
              parseInt(dateParts[0], 10) // Day
            )

            // Validate parsed date
            if (isNaN(cellDate.getTime())) return 0

            // Normalize both dates to midnight for exact comparison
            const normalizedCellDate = new Date(
              cellDate.getFullYear(),
              cellDate.getMonth(),
              cellDate.getDate(),
              0,
              0,
              0,
              0
            )
            const normalizedFilterDate = new Date(
              filterLocalDateAtMidnight.getFullYear(),
              filterLocalDateAtMidnight.getMonth(),
              filterLocalDateAtMidnight.getDate(),
              0,
              0,
              0,
              0
            )

            // Compare using timestamps for precise equality
            if (normalizedCellDate.getTime() < normalizedFilterDate.getTime()) return -1
            if (normalizedCellDate.getTime() > normalizedFilterDate.getTime()) return 1
            return 0
          }
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Actions',
        field: 'actions',
        width: 200,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton size='small' onClick={() => handleEditClick(params.data.id)} className='hover:bg-blue-50'>
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleViewClick(params.data.id)} className='hover:bg-yellow-50'>
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteClick(params.data.id)} className='hover:bg-red-50'>
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        ),
        headerClass: 'header-spacing',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px'
        }
      }
    ],
    []
  )

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(
          item =>
            item.tax_code.toLowerCase().includes(value.toLowerCase()) ||
            item.tax_type.toLowerCase().includes(value.toLowerCase()) ||
            (item.tax_percentage?.toString() || '').toLowerCase().includes(value.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(value.toLowerCase()) ||
            (item.gst_type || '').toLowerCase().includes(value.toLowerCase()) ||
            (item.state_type || '').toLowerCase().includes(value.toLowerCase()) ||
            item.status.toString().toLowerCase().includes(value.toLowerCase()) ||
            new Date(item.createdDate).toLocaleDateString().toLowerCase().includes(value.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
  )

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(newSize => {
    setCookie('taxPageSize', newSize)
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }))
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
     
      <Card className='flex flex-col'>
        <div className='flex flex-col'>
          <CardHeader title='Asset Tax' />
          {/* <TaxFilter setData={setFilteredData} productData={data} /> */}
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search Tax'
              className='max-sm:is-full'
            />
            <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
              {/* <Button
                color='secondary'
                variant='outlined'
                className='max-sm:is-full is-auto'
                startIcon={<i className='ri-upload-2-line' />}
              >
                Export
              </Button> */}
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => setCustomerUserOpen(true)}
              >
                Add Tax
              </Button>
            </div>
          </div>

          <div className='px-6'>
            <AgGridWrapper rowData={filteredData} columnDefs={columnDefs} domLayout='autoHeight' />
          </div>

          <PaginationComponent
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            storageKey='taxPageSize'
          />
        </div>

        <AssetAddTaxDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          customerData={data}
          fetchTaxes={fetchTaxes}
        />
        <TaxEditDrawer
          open={categoryEditUserOpen}
          handleClose={() => setCategoryEditUserOpen(false)}
          setData={setData}
          customerData={data}
          taxId={selectedRowId}
          refreshData={fetchTaxes}
        />
        <TaxViewDrawer
          open={categoryViewUserOpen}
          handleClose={() => setCategoryViewUserOpen(false)}
          customerData={data}
          taxId={selectedRowId}
        />
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this tax?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color='inherit'>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default TaxListTable
