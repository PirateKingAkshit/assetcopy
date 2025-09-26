'use client'

import { useEffect, useMemo, useState } from 'react'
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
  Pagination,
  MenuItem
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { getCookie, setCookie } from 'cookies-next'

import axiosInstance from '@/utils/axiosinstance'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
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

const QueryListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('menuPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  // const fetchData = async (page = 1, pageSize = defaultPageSize) => {
  //   try {
  //     setLoading(true)

  //     const response = await axiosInstance.get('core/query', {
  //       params: { page, limit: pageSize }
  //     })

  //     if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
  //       const mappedData = response.data.data.map(item => ({
  //         id: item._id?.toString(),
  //         menuName: item.menu_name,
  //         menuOrder: item.menu_order,
  //         icon: item.icon,
  //         parentMenu: item.parent_menu ? item.parent_menu.menu_name : 'None',
  //         status: item.status.toString(),
  //         createdBy: item.created_by?.user_name || 'Unknown',
  //         createdDate: item.created_date || new Date().toISOString()
  //       }))

  //       setData(mappedData)
  //       setFilteredData(mappedData)

  //       const paginationData = response.data.pagination || {}
  //       setPagination(prev => ({
  //         ...prev,
  //         currentPage: page,
  //         pageSize,
  //         totalItems: paginationData.totalItems || mappedData.length,
  //         totalPages: Math.ceil((paginationData.totalItems || mappedData.length) / pageSize)
  //       }))
  //     } else {
  //       toast.error(response.data.message || 'Failed to fetch menu data.')
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Error fetching menus.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchData = async (page = 1, pageSize = defaultPageSize) => {
  try {
    setLoading(true)

    const response = await axiosInstance.get('core/queries', {
      params: { page, limit: pageSize }
    })

    if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
      const mappedData = response.data.data.map(item => ({
        id: item._id?.toString(),
        name: item.name,
        email: item.email,
        message: item.message,
        createdDate: item.created_date || new Date().toISOString()
      }))

      setData(mappedData)
      setFilteredData(mappedData)

      const paginationData = response.data.pagination || {}
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        pageSize,
        totalItems: paginationData.totalItems || mappedData.length,
        totalPages: Math.ceil((paginationData.totalItems || mappedData.length) / pageSize)
      }))
    } else {
      toast.error(response.data.message || 'Failed to fetch query data.')
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error fetching queries.')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    if (pagination.currentPage && pagination.pageSize) {
      fetchData(pagination.currentPage, pagination.pageSize)
    }
  }, [pagination.currentPage, pagination.pageSize])

  const columnDefs = useMemo(
  () => [
    {
      headerName: 'Name',
      field: 'name',
      width: 200,
      filter: 'agTextColumnFilter',
      cellStyle: cellStyleDefault
    },
    {
      headerName: 'Email',
      field: 'email',
      width: 250,
      filter: 'agTextColumnFilter',
      cellStyle: cellStyleDefault
    },
    {
      headerName: 'Message',
      field: 'message',
      width: 300,
      filter: 'agTextColumnFilter',
      cellStyle: cellStyleDefault
    },
    {
      headerName: 'Created Date',
      field: 'createdDate',
      width: 200,
      valueFormatter: params => {
        const date = new Date(params.value)
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
      },
      cellStyle: cellStyleDefault
    },
   
  ],
  []
)


  // const handleDeleteConfirm = async () => {
  //   if (!selectedRow) return

  //   try {
  //     setDeleteLoading(true)
  //     const response = await axiosInstance.delete(`menu/${selectedRow.id}`)

  //     if (response.data?.status === 200) {
  //       fetchData(pagination.currentPage, pagination.pageSize)
  //       toast.success(response.data.message || 'Menu deleted successfully!')
  //     } else {
  //       toast.error(response.data.message || 'Failed to delete menu.')
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Error deleting menu.')
  //   } finally {
  //     setOpenConfirm(false)
  //     setSelectedRow(null)
  //     setDeleteLoading(false)
  //   }
  // }
  const handleDeleteConfirm = async () => {
  if (!selectedRow) return

  try {
    setDeleteLoading(true)
    const response = await axiosInstance.delete(`core/queries/${selectedRow.id}`)

    if (response.data?.status === 200) {
      fetchData(pagination.currentPage, pagination.pageSize)
      toast.success(response.data.message || 'Query deleted successfully!')
    } else {
      toast.error(response.data.message || 'Failed to delete query.')
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error deleting query.')
  } finally {
    setOpenConfirm(false)
    setSelectedRow(null)
    setDeleteLoading(false)
  }
}


  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleFilterChange = value => {
  setGlobalFilter(value)

  if (value) {
    const lowerValue = value.toLowerCase()
    const filtered = data.filter(
      item =>
        (item.name && item.name.toLowerCase().includes(lowerValue)) ||
        (item.email && item.email.toLowerCase().includes(lowerValue)) ||
        (item.message && item.message.toLowerCase().includes(lowerValue)) ||
        new Date(item.createdDate).toLocaleDateString().toLowerCase().includes(lowerValue)
    )
    setFilteredData(filtered)
  } else {
    setFilteredData(data)
  }
}


  const handleCategoryUpdate = updated => {
    const updatedItem = {
      id: updated.id,
      menuName: updated.menu_name,
      menuOrder: updated.menu_order,
      icon: updated.icon,
      parentMenu: updated.parent_menu || 'None',
      status: updated.status.toString(),
      createdBy: updated.created_by?.user_name || 'Unknown',
      createdDate: updated.updated_date || new Date().toISOString()
    }

    setData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
    setFilteredData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
  }

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
        <CardHeader title='Queries' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Queries' />
          <div className='flex items-center max-sm:flex-col gap-4'>
            
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
                if (typeof window !== 'undefined') {
                  setCookie('menuPageSize', newSize)
                }
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

       
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this query?</DialogContent>
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

const cellStyleDefault = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  fontSize: '0.875rem',
  color: '#000000'
}

export default QueryListTable
