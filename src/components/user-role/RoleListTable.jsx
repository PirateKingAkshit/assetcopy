'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { getCookie, setCookie } from 'cookies-next'
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
  Divider,
  IconButton,
  CircularProgress,
  Typography,
  MenuItem,
  Pagination
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import RoleAddDrawer from './assetAddRoleDrawer'
import RoleEditDrawer from './roleEditDrawer'
import RoleViewDrawer from './roleViewDrawer'

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
  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])
  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const RoleListTable = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const getInitialPageSize = () => {
    const saved = getCookie('rolePageSize')
    return saved ? parseInt(saved) : 10
  }

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [categoryAddOpen, setCategoryAddOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: getInitialPageSize()
  })

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('role/all', {
        params: { page, limit: pageSize }
      })

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          const updatedDate = item.updated_date || null
          return {
            id: item._id || item.id || 'N/A',
            roleName: item.role_name || 'N/A',
            role_id: item._id || item.id,
            status: item.status === true || item.status === 'true',
            createdBy: item.created_by?.user_name || 'Unknown',
            createdDate: createdDate ? formatDate(createdDate) : '',
            updatedDate: updatedDate ? formatDate(updatedDate) : ''
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
        toast.error('Invalid response format')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return
    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`role/${selectedRow.id}`)
      if (response.data.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }

  const handlePermissionClick = useCallback(
    roleId => {
      router.push(`/${locale}/role-permissions?role=${roleId}`)
    },
    [router]
  )

const handleFilterChange = value => {
  setGlobalFilter(value)
  if (value) {
    const searchValue = value.toLowerCase()
    const filtered = data.filter(
      item =>
        (item.roleName || '').toLowerCase().includes(searchValue) ||
        (item.createdBy || '').toLowerCase().includes(searchValue) ||
        (item.createdDate || '').toLowerCase().includes(searchValue) ||   // ✅ fixed
        (item.updatedDate || '').toLowerCase().includes(searchValue)      // ✅ fixed
    )
    setFilteredData(filtered)
  } else {
    setFilteredData(data)
  }
}


  const handleCategoryUpdate = updated => {
    const updatedItem = {
      id: updated._id || updated.id,
      roleName: updated.role_name || updated.roleName,
      status: updated.status === true || updated.status === 'true',
      createdBy: updated.created_by?.user_name || 'Unknown',
      createdDate: updated.created_date || new Date().toISOString(),
      updatedDate: updated.updated_date || updated.created_date || new Date().toISOString()
    }

    setData(prev => {
      const exists = prev.some(item => item.id === updatedItem.id)
      return exists ? prev.map(item => (item.id === updatedItem.id ? updatedItem : item)) : [...prev, updatedItem]
    })
    setFilteredData(prev => {
      const exists = prev.some(item => item.id === updatedItem.id)
      return exists ? prev.map(item => (item.id === updatedItem.id ? updatedItem : item)) : [...prev, updatedItem]
    })
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Role Name',
        field: 'roleName',
        width: 200,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color}
            size='small'
          />
        ),
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 200,
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
        headerName: 'Updated Date',
        field: 'updatedDate',
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
            <IconButton
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryEditOpen(true)
              }}
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryViewOpen(true)
              }}
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handlePermissionClick(params.data.role_id)}>
              <i className='ri-shield-user-line text-lg text-purple-500 hover:text-purple-600' />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
            >
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        )
      }
    ],
    [handlePermissionClick]
  )

  if (loading)
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Asset Role' />
      <Divider />
      <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
        <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Role' />
        <Button
          variant='contained'
          color='primary'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setCategoryAddOpen(true)}
        >
          Add Role
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
              setCookie('rolePageSize', newSize)
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

      <RoleAddDrawer
        open={categoryAddOpen}
        handleClose={() => setCategoryAddOpen(false)}
        setData={handleCategoryUpdate}
        refreshData={fetchData}
      />
      <RoleEditDrawer
        open={categoryEditOpen}
        handleClose={() => setCategoryEditOpen(false)}
        setData={handleCategoryUpdate}
        customerData={data}
        categoryId={selectedRow?.id}
        refreshData={fetchData}
      />
      <RoleViewDrawer open={categoryViewOpen} handleClose={() => setCategoryViewOpen(false)} roleId={selectedRow?.id} />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Are you sure you want to delete this Role?</DialogContent>
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

export default RoleListTable
