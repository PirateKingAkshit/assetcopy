'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
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
  CircularProgress,
  MenuItem,
  Pagination
} from '@mui/material'

import { Trash2 } from 'lucide-react'
import { getCookie, setCookie } from 'cookies-next'

import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import TransferAddDrawer from './transferAddUser'

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

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const getInitialPageSize = () => {
  const saved = getCookie('userPageSize')
  return saved ? parseInt(saved) : 10
}

const UserListTable = () => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
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
    async (page = pagination.currentPage, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('transferApproval/all', {
          params: { page, limit: pageSize }
        })

        if (response.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => {
            const createdDate = item.created_date || null
            return {
              id: item._id,
              user_name: item.assign_to?.user_name || 'N/A',
              email: item.assign_to?.email || 'N/A',
              createdBy: item.created_by?.user_name || 'Unknown',
              createdDate: createdDate ? formatDate(createdDate) : ''
            }
          })
          setPagination(response.data.pagination)
          setData(mappedData)
          setFilteredData(mappedData)

          // if (response.data.pagination) {
          //   setPagination(prev => ({
          //     ...prev,
          //     totalItems: response.data.pagination.totalItems,
          //     totalPages: Math.ceil(response.data.pagination.totalItems / pageSize),
          //     currentPage: page,
          //     pageSize
          //   }))
          // }
        } else {
          toast.error('Invalid API response')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching users')
      } finally {
        setLoading(false)
      }
    },
    [pagination.currentPage, pagination.pageSize]
  )

  useEffect(() => {
    fetchTaxes(pagination.currentPage, pagination.pageSize)
  }, [fetchTaxes, pagination.currentPage, pagination.pageSize])

  const handleDeleteClick = id => {
    setSelectedRowId(id)
    setOpenConfirm(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRowId) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`transferApproval/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        fetchTaxes(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'User deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    } finally {
      setOpenConfirm(false)
      setSelectedRowId(null)
      setDeleteLoading(false)
    }
  }, [selectedRowId, pagination, fetchTaxes])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'User Name',
        field: 'user_name',
        width: 250,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.user_name,
        cellStyle: { padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 250,
        cellStyle: { padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 250,
        cellStyle: { padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 250,
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
        width: 250,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton size='small' onClick={() => handleDeleteClick(params.data.id)}>
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        )
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
            item.user_name.toLowerCase().includes(value.toLowerCase()) ||
            item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
            new Date(item.createdDate).toLocaleDateString().toLowerCase().includes(value.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
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
        <CardHeader title='Approval User List' />
        <Divider />

        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter}
            className='max-sm:w-full'
            onChange={handleFilterChange}
            placeholder='Search Approval User'
          />
          <Button
            variant='contained'
            color='primary'
            className='max-sm:w-full'
            startIcon={<i className='ri-add-line' />}
            onClick={() => setCustomerUserOpen(true)}
          >
            Add User
          </Button>
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

        <TransferAddDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          setFilteredData={setFilteredData}
          customerData={data}
          refreshData={fetchTaxes}
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

export default UserListTable
