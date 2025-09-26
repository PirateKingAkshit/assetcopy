'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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

import StatusViewDrawer from './StatusViewDrawer'
import StatusEditDrawer from './StatusEditDrawer'
import AssetAddStatusDrawer from './AssetAddStatusDrawer'
import axiosInstance from '@/utils/axiosinstance'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'

ModuleRegistry.registerModules([AllCommunityModule])

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
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const StatusListTable = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  const defaultPageSize = parseInt(getCookie('statusPageSize') || '10')

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('status/all', {
          params: { page, limit: pageSize }
        })

        if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => {
            const createdDate = item.created_date || null
            return {
              id: item._id,
              categoryName: item.status,
              parentCategory: item.parent_category?.category_name || 'None',
              parentCategoryId: item.parent_category?._id || null,
              status: item.status.toString(),
              createdBy: item.created_by?.user_name || 'Unknown',
              createdDate: createdDate ? formatDate(createdDate) : ''
            }
          })
          setPagination(response.data.pagination)
          setData(mappedData)
          setFilteredData(mappedData)

          
        } else {
          toast.error(response.data?.message || 'Failed to fetch status data')
        }
      } catch (error) {
        console.error('Error fetching status data:', error)
        toast.error(error.response?.data?.message || 'Failed to fetch status data')
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage, pagination.pageSize])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Status',
        field: 'categoryName',
        width: 250,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 250,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
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
        suppressMenu: true,
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
            <IconButton
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
            >
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        ),
        cellStyle: { display: 'flex', alignItems: 'center', height: '100%' }
      }
    ],
    []
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`status/${selectedRow.id}`)

      if (response.data?.status === 200) {
        setData(prev => prev.filter(item => item.id !== selectedRow.id))
        setFilteredData(prev => prev.filter(item => item.id !== selectedRow.id))
        toast.success(response.data.message || 'Status deleted successfully')
      } else {
        toast.error(response.data?.message || 'Failed to delete status')
      }
    } catch (err) {
      console.error('Error deleting status:', err)
      toast.error(err.response?.data?.message || 'Failed to delete status')
    } finally {
      setDeleteLoading(false)
      setOpenConfirm(false)
      setSelectedRow(null)
    }
  }, [selectedRow])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(
          item =>
            item.categoryName?.toLowerCase().includes(value.toLowerCase()) ||
            item.createdBy?.toLowerCase().includes(value.toLowerCase()) ||
            item.formattedCreatedDate?.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
  )

  const handleCategoryUpdate = useCallback(updatedCategory => {
    const updatedItem = {
      id: updatedCategory._id,
      categoryName: updatedCategory.status,
      parentCategory: updatedCategory.parent_category?.category_name || 'None',
      parentCategoryId: updatedCategory.parent_category?._id || null,
      status: updatedCategory.status?.toString() || '',
      createdBy: updatedCategory.created_by?.user_name || 'Unknown',
      createdDate: updatedCategory.created_date,
      formattedCreatedDate: formatDateToDDMMYYYY(updatedCategory.created_date)
    }

    setData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
    setFilteredData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
    toast.success('Status updated successfully')
  }, [])

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(newSize => {
    setCookie('statusPageSize', newSize)
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
     
      <Card>
  <div className='flex flex-col'>
    <CardHeader title='Asset Status' />
    <Divider />
  </div>

  <div>
    <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
      <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Status' />
      <div className='flex gap-4'>
        {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
          Export
        </Button> */}
        <Button
          variant='contained'
          color='primary'
          className='max-sm:is-full'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setCustomerUserOpen(true)}
        >
          Add Status
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
      storageKey='statusPageSize'
    />
  </div>

  <AssetAddStatusDrawer
    open={customerUserOpen}
    handleClose={() => setCustomerUserOpen(false)}
    setData={setData}
    customerData={data}
    fetchData={fetchData} // Added fetchData prop
  />
  <StatusEditDrawer
    open={categoryEditOpen}
    handleClose={() => setCategoryEditOpen(false)}
    setData={handleCategoryUpdate}
    customerData={data}
    categoryId={selectedRow?.id}
  />
  <StatusViewDrawer
    open={categoryViewOpen}
    handleClose={() => setCategoryViewOpen(false)}
    categoryData={selectedRow}
  />

  <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
    <DialogTitle>Confirm</DialogTitle>
    <DialogContent>Are you sure you want to delete this status?</DialogContent>
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

export default StatusListTable
