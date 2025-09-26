'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback } from 'react'
import { getCookie, setCookie } from 'cookies-next'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'

import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Component Imports
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);

import ClientUserAddDrawer from './clientAddDrawer'
import ClientUserEditDrawer from './clientEditDrawer'
import ClientUserViewDrawer from './clientViewDrawer'

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
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

const ClientUserListTable = () => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const getInitialPageSize = () => {
    const saved = getCookie('userPageSize')
    return saved ? parseInt(saved) : 10
  }

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
    pageSize: getInitialPageSize()
  })

  const fetchTaxes = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('core/client-list', {
          params: { page, limit: pageSize }
        })
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => ({
            id: item._id,
            user_name: item.user_name || 'N/A',
            email: item.email || 'N/A',
            contact_person: item.contact_person || 'N/A',
            contact_email: item.contact_email || 'N/A',
            gst_no: item.gst_no || 'N/A',
            method:item.method || 'N/A',
            financialYear:item.financialYear || 'N/A',
            contact_mobile: item.contact_mobile || 'N/A',
            status: item.status,
            createdBy: item.created_by?.user_name || 'Unknown',
            subscription_startdate: item.subscription_startdate ? formatDate(item.subscription_startdate) : 'N/A',
            subscription_enddate: item.subscription_enddate ? formatDate(item.subscription_enddate) : 'N/A',
            createdDate: item.created_date ? formatDate(item.created_date) : 'N/A'
          }))
          setData(mappedData)
          setFilteredData(mappedData)
          setPagination(response.data.pagination)
        } else {
          toast.error('Invalid API response')
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(`Failed to fetch clients: ${errorMessage}`)
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

  const handlePermissionClick = useCallback(
    (userId, roleId) => {
      router.push(`/${locale}/role-permissions?user=${userId}&role=${roleId}`)
    },
    [router, locale]
  )

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
      const response = await axiosInstance.delete(`core/client-list/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        toast.success(response.data.message || 'Client deleted successfully')
        fetchTaxes(pagination.currentPage, pagination.pageSize)
      } else {
        toast.error(response.data.message || 'Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to delete client: ${errorMessage}`)
      }
    } finally {
      setOpenConfirm(false)
      setSelectedRowId(null)
      setDeleteLoading(false)
    }
  }, [selectedRowId, pagination.currentPage, pagination.pageSize, fetchTaxes])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(
          item =>
            item.user_name.toLowerCase().includes(value.toLowerCase()) ||
            item.email.toLowerCase().includes(value.toLowerCase()) ||
            item.contact_person.toLowerCase().includes(value.toLowerCase()) ||
            item.contact_email.toLowerCase().includes(value.toLowerCase()) ||
            item.gst_no.toLowerCase().includes(value.toLowerCase()) ||
            item.contact_mobile.toLowerCase().includes(value.toLowerCase()) ||
            item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
            item.status.toString().toLowerCase().includes(value.toLowerCase()) ||
            item.subscription_startdate.toLowerCase().includes(value.toLowerCase()) ||
            item.subscription_enddate.toLowerCase().includes(value.toLowerCase()) ||
            item.createdDate.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
  )

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Client Name',
        field: 'user_name',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.user_name,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.email,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Contact Person',
        field: 'contact_person',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.contact_person,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Contact Email',
        field: 'contact_email',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.contact_email,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
       {
        headerName: 'Contact Mobile',
        field: 'contact_mobile',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.contact_mobile,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'GST No',
        field: 'gst_no',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.gst_no,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
     


       {
        headerName: 'Financial year',
        field: 'financialYear',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.financialYear,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
       {
        headerName: 'Method',
        field: 'method',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.method,
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
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px' }
      },
     
      {
        headerName: 'Subscription Start Date',
        field: 'subscription_startdate',
        width: 200,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue || cellValue === 'N/A') return 0
            const dateParts = cellValue.split('-')
            if (dateParts.length !== 3) return 0
            const cellDate = new Date(
              parseInt(dateParts[2], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[0], 10)
            )
            if (isNaN(cellDate.getTime())) return 0
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
            if (normalizedCellDate.getTime() < normalizedFilterDate.getTime()) return -1
            if (normalizedCellDate.getTime() > normalizedFilterDate.getTime()) return 1
            return 0
          }
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Subscription End Date',
        field: 'subscription_enddate',
        width: 200,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue || cellValue === 'N/A') return 0
            const dateParts = cellValue.split('-')
            if (dateParts.length !== 3) return 0
            const cellDate = new Date(
              parseInt(dateParts[2], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[0], 10)
            )
            if (isNaN(cellDate.getTime())) return 0
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
            if (normalizedCellDate.getTime() < normalizedFilterDate.getTime()) return -1
            if (normalizedCellDate.getTime() > normalizedFilterDate.getTime()) return 1
            return 0
          }
        },
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
            if (!cellValue || cellValue === 'N/A') return 0
            const dateParts = cellValue.split('-')
            if (dateParts.length !== 3) return 0
            const cellDate = new Date(
              parseInt(dateParts[2], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[0], 10)
            )
            if (isNaN(cellDate.getTime())) return 0
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
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px' }
      }
    ],
    [handleEditClick, handleViewClick, handleDeleteClick]
  )

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
          <CardHeader title=' Client  List' />
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search Client '
              className='max-sm:is-full'
            />
            <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => setCustomerUserOpen(true)}
              >
                Add Client
              </Button>
            </div>
          </div>

          <div className='px-6'>
            <AgGridWrapper rowData={filteredData} columnDefs={columnDefs} domLayout='autoHeight' />
          </div>

          <div className='flex justify-between items-center px-6 py-4 flex-wrap gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Rows per page:</span>
              <TextField
                select
                size='small'
                value={pagination.pageSize}
                onChange={e => {
                  const newSize = parseInt(e.target.value)
                  setCookie('userPageSize', newSize)
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
              onChange={(e, page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            />
          </div>
        </div>

        <ClientUserAddDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          setFilteredData={setFilteredData}
          customerData={data}
          refreshData={fetchTaxes}
        />
        <ClientUserEditDrawer
          open={categoryEditUserOpen}
          handleClose={() => setCategoryEditUserOpen(false)}
          setData={setData}
          customerData={data}
          taxId={selectedRowId}
          refreshData={fetchTaxes}
        />
        <ClientUserViewDrawer
          open={categoryViewUserOpen}
          handleClose={() => setCategoryViewUserOpen(false)}
          customerData={data}
          taxId={selectedRowId}
        />
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this User?</DialogContent>
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

export default ClientUserListTable
