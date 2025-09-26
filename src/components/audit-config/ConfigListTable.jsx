'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'

import { useParams, useRouter } from 'next/navigation'

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
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { getCookie, setCookie } from 'cookies-next'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'

import { toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'
import ConfigAddDrawer from './ConfigAddDrawer'
import ConfigEditDrawer from './ConfigEditDrawer'
import ConfigViewDrawer from './ConfigViewDrawer'

ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' },
  null: { title: 'N/A', color: 'default' }
}

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

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

const ConfigListTable = () => {
  const defaultPageSize = parseInt(getCookie('vendorPageSize')) || 10
  const { lang: locale } = useParams()
  const router = useRouter()

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  const isInitialFetch = useRef(true)

  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)

        const response = await axiosInstance.get('/config/all', {
          params: { page, limit: pageSize }
        })

        if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
       const mappedData = response.data.data.map(item => ({
  id: item._id,
  auditCode: item.audit_code,
  auditName: item.audit_name,
  auditType: item.audit_type,
  auditFields: Array.isArray(item.audit_field) ? item.audit_field.join(', ') : 'N/A',
  startDate: formatDate(item.audit_startdate),
  endDate: formatDate(item.audit_enddate),
  asOnDate: formatDate(item.as_on_date),  // ✅ add this
  categoryName: item.category?.category_name || 'N/A',
  departmentName: item.dept?.department || 'N/A',
  status: item?.status,
  totalAsset: item.total_asset || 0,
  totalAudit: item.total_audit || 0,
  pendingCount: item.pending_count || 0,
  condition: item.condition?.condition || 'N/A',
  location: item.location?.location || 'N/A',
  assignedTo: item.assigned_to?.map(user => user.user_name).join(', ') || 'N/A',
  createdDate: formatDate(item.created_date),
  updatedDate: formatDate(item.updated_date),
}));



          setPagination(response.data.pagination)
          setData(mappedData)
          setFilteredData(mappedData)
        } else {
          toast.error(response.data?.message || 'Failed to fetch audit data.')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(error.response?.data?.message || 'Error fetching audit data.')
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage])

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Audit Code',
        field: 'auditCode',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Audit Name',
        field: 'auditName',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Audit Type',
        field: 'auditType',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Total Asset',
        field: 'totalAsset',
        width: 200,
        cellRenderer: params => (
          <span
            onClick={() => router.push(`/${locale}/assetAudit/audit-info/${params.data.id}`)}
            style={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-block',
              width: '100%'
            }}
          >
            {params.value}
          </span>
        ),
        cellStyle: baseStyle
      },

      {
        headerName: 'Audited Asset',
        field: 'totalAudit',
        width: 200,
        cellRenderer: params => (
          <span
            onClick={() => router.push(`/${locale}/assetAudit/audit-asset/${params.data.id}`)}
            style={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-block',
              width: '100%'
            }}
          >
            {params.value}
          </span>
        ),
        cellStyle: baseStyle
      },
      {
  headerName: 'Pending/Missing',
  field: 'pendingCount',
  width: 200,
  cellRenderer: params => (
    <span
      style={{
        color: params.value ,
    
        display: 'inline-block',
        width: '100%',
        textAlign: 'center'
      }}
    >
      {params.value}
    </span>
  ),
  cellStyle: baseStyle
},

{
  headerName: 'As On Date',
  field: 'asOnDate',
  width: 180,
  filter: 'agDateColumnFilter',
  filterParams: {
    filterOptions: ['equals', 'lessThan', 'greaterThan'],
    suppressAndOrCondition: true,
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      if (!cellValue) return 0
      const [day, month, year] = cellValue.split('-')
      const cellDate = new Date(parseInt(year,10), parseInt(month,10)-1, parseInt(day,10))
      const normalizedCellDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
      const normalizedFilterDate = new Date(filterLocalDateAtMidnight.getFullYear(), filterLocalDateAtMidnight.getMonth(), filterLocalDateAtMidnight.getDate())
      if (normalizedCellDate < normalizedFilterDate) return -1
      if (normalizedCellDate > normalizedFilterDate) return 1
      return 0
    }
  },
  cellStyle: baseStyle
},

 {
        headerName: ' Audit Start Date',
        field: 'startDate',
        width: 180,
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
        headerName: 'Audit End Date',
        field: 'endDate',
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
        headerName: 'Audit Fields',
        field: 'auditFields',
        width: 200,
        cellStyle: baseStyle
      },
     
      {
        headerName: 'Category Name',
        field: 'categoryName',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Department Name',
        field: 'departmentName',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        cellRenderer: params => (
          <Chip
            label={params.data?.status?.status || 'N/A'}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color || 'default'}
            size='small'
          />
        ),
        cellStyle: baseStyle
      },
      {
        headerName: 'Condition Name',
        field: 'condition',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Location Name',
        field: 'location',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Assigned To',
        field: 'assignedTo',
        width: 200,
        cellStyle: baseStyle
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 200,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryEditOpen(true)
              }}
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryViewOpen(true)
              }}
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
            >

              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />

            </IconButton>

          </div>

        ),

        cellStyle: baseStyle

      }

    ],

    [router]

  )

 
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`config/${selectedRow.id}`)

      if (response.data?.status === 200) {
        setData(prev => prev.filter(item => item.id !== selectedRow.id))
        setFilteredData(prev => prev.filter(item => item.id !== selectedRow.id))
        toast.success(response.data.message || 'Audit deleted successfully.')
      } else {
        toast.error(response.data?.message || 'Failed to delete audit.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during deletion.')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }, [selectedRow])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      setFilteredData(
        value
          ? data.filter(
              item =>
                item.auditCode?.toLowerCase().includes(value.toLowerCase()) ||
                item.auditName?.toLowerCase().includes(value.toLowerCase())
            )
          : data
      )
    },
    [data]
  )

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(
    newSize => {
      setCookie('vendorPageSize', newSize)

      setPagination(prev => ({
        ...prev,
        pageSize: newSize,
        currentPage: 1,
        totalPages: Math.ceil(prev.totalItems / newSize)
      }))
      fetchData(1, newSize)
    },
    [fetchData]
  )

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Audit Configuration' />
      <Divider />
      <div className='flex justify-between flex-col sm:flex-row gap-y-4 p-5'>
        <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Audits' />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          {/* <Button variant='outlined' color='secondary' 
          className='max-sm:is-full'
          startIcon={<i className='ri-upload-2-line' />}>
            Export
          </Button> */}
          <Button
            variant='contained'
            className='max-sm:is-full'
            onClick={() => setCustomerUserOpen(true)}
            startIcon={<i className='ri-add-line' />}
          >
            Add Audit
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
        storageKey='vendorPageSize'
      />
      <ConfigAddDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(false)}
        setData={setData}
        customerData={data}
        refreshData={fetchData}
      />
      <ConfigEditDrawer
        open={categoryEditOpen}
        handleClose={() => setCategoryEditOpen(false)}
        setData={setData}
        vendorId={selectedRow?.id}
        vendorData={data}
        refreshData={fetchData}
      />
      <ConfigViewDrawer
        open={categoryViewOpen}
        handleClose={() => setCategoryViewOpen(false)}
        categoryData={selectedRow}
      />
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Are you sure you want to delete this audit?</DialogContent>
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
  )
}

export default ConfigListTable
