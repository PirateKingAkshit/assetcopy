// CategoryListTable.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardHeader,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Pagination,
  MenuItem
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import { getCookie, setCookie } from 'cookies-next'
import { toast, ToastContainer } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'
import AssetViewCustomerDrawer from './CategoryViewDrawer'
import AssetEditCustomerDrawer from './CategoryEditDrawer'
import AssetAddCustomerDrawer from './AddcategoryDrawer'
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

// Safer date formatter
const formatDate = (iso) => {
  if (!iso || isNaN(new Date(iso).getTime())) return '' // Return empty string for invalid dates
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

const CategoryListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('categoryPageSize')) || 10
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
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('category/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.slice(0, pageSize).map(item => ({
          id: item._id?.toString(),
          categoryName: item.category_name,
          parentCategory: item.parent_category?.category_name || 'None',
          parentCategoryId: item.parent_category?._id || null,
          status: item.status.toString(),
          createdBy: item.created_by?.user_name || 'Unknown',
          createdDate: item.created_date ? formatDate(item.created_date) : ''
        }))
        setPagination(response.data.pagination)
        setData(mappedData)
        setFilteredData(mappedData)
      } else {
        toast.error(response.data.message || 'Failed to fetch category data.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Category Name',
        field: 'categoryName',
        width: 200,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Parent Category',
        field: 'parentCategory',
        width: 200,
        filter: 'agTextColumnFilter',
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
            if (!cellValue || typeof cellValue !== 'string') return 0
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
        width: 210,
        sortable: false,
        filter: false,
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
        )
      }
    ],
    []
  )

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return
    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`category/${selectedRow.id}`)
      if (response.data?.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'Category deleted successfully!')
      } else {
        toast.error(response.data.message || 'Failed to delete category.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting category.')
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
      const filtered = data.filter(
        item =>
          item.categoryName.toLowerCase().includes(value.toLowerCase()) ||
          item.parentCategory.toLowerCase().includes(value.toLowerCase()) ||
          item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
          (item.createdDate && item.createdDate.toLowerCase().includes(value.toLowerCase()))
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }

  const handleCategoryUpdate = updatedCategory => {
    const updatedItem = {
      id: updatedCategory.id,
      categoryName: updatedCategory.categoryName,
      parentCategory: updatedCategory.parentCategory || 'None',
      parentCategoryId: updatedCategory.parentCategoryId || null,
      status: updatedCategory.status,
      createdBy: updatedCategory.createdBy || 'Unknown',
      createdDate: updatedCategory.createdDate || '' // Ensure createdDate is preserved
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
        <CardHeader title='Asset Category' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search category' />
          <div className='flex gap-4'>
            <Button
              variant='contained'
              className='max-sm:is-full'
              color='primary'
              startIcon={<i className='ri-add-line' />}
              onClick={() => setCustomerUserOpen(true)}
            >
              Add Category
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
                setCookie('categoryPageSize', newSize)
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
        <AssetAddCustomerDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          customerData={data}
          fetchData={fetchData}
        />
        <AssetEditCustomerDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          setData={handleCategoryUpdate}
          customerData={data}
          categoryId={selectedRow?.id}
        />
        <AssetViewCustomerDrawer
          open={categoryViewOpen}
          handleClose={() => setCategoryViewOpen(false)}
          categoryData={selectedRow}
        />
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this category?</DialogContent>
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

export default CategoryListTable
