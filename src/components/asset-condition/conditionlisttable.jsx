'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
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
import { format } from 'date-fns'

import axiosInstance from '@/utils/axiosinstance'
import ConditionViewDrawer from './conditionviewDrawer'
import ConditionEditDrawer from './conditionEditDrawer'
import ConditionAddDrawer from './conditionaddDrawer'
import ConditionTableFilters from './conditiontablefilters'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'
//import PaginationComponent from './PaginationComponent'; // Import the reusable PaginationComponent

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

const NoRowsOverlay = () => (
  <div className='flex justify-center items-center h-64'>
    <Typography color='#000000'>No conditions found</Typography>
  </div>
)

const ConditionListTable = () => {
  const defaultPageSize = parseInt(getCookie('conditionPageSize') || '10')

  const { lang: locale } = useParams()

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
    pageSize: defaultPageSize
  })

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('condition/all', {
        params: { page, limit: pageSize }
      })

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          const updatedDate = item.updated_date || null
          return {
            id: item._id || item.id || 'N/A',
            conditionName: item.condition || 'N/A',
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
        //   setPagination({
        //     totalItems: response.data.pagination.totalItems || 0,
        //     totalPages: response.data.pagination.totalPages || 1,
        //     currentPage: response.data.pagination.currentPage || 1,
        //     pageSize: response.data.pagination.pageSize || pageSize,
        //   });
        // }
      } else {
        toast.error('Invalid API response: Expected status 200 and array data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to fetch conditions: ${errorMessage}`)
      }
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
        headerName: 'Condition Name',
        field: 'conditionName',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.conditionName,
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
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px'
        }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 200,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
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
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryEditOpen(true)
              }}
              className='hover:bg-blue-50'
              aria-label='Edit condition'
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryViewOpen(true)
              }}
              className='hover:bg-yellow-50'
              aria-label='View condition'
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
              className='hover:bg-red-50'
              aria-label='Delete condition'
            >
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`condition/${selectedRow.id}`)

      if (response.data.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'Condition deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete condition')
      }
    } catch (error) {
      console.error('Error deleting condition:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to delete condition: ${errorMessage}`)
      }
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }, [selectedRow, pagination.currentPage, pagination.pageSize])

const handleFilterChange = useCallback(
  value => {
    setGlobalFilter(value)
    if (value) {
      const searchValue = value.toLowerCase()
      const filtered = data.filter(
        item =>
          (item.conditionName || '').toLowerCase().includes(searchValue) ||
          (item.createdBy || '').toLowerCase().includes(searchValue) ||
          (item.createdDate || '').toLowerCase().includes(searchValue) ||
          (item.updatedDate || '').toLowerCase().includes(searchValue)
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  },
  [data]
)


  const handleCategoryUpdate = useCallback(updatedCondition => {
    const updatedItem = {
      id: updatedCondition._id || updatedCondition.id,
      conditionName: updatedCondition.condition || 'N/A',
      status: updatedCondition.status === true || updatedCondition.status === 'true',
      createdBy: updatedCondition.created_by?.user_name || 'Unknown',
      createdDate: updatedCondition.created_date || new Date().toISOString(),
      updatedDate: updatedCondition.updated_date || updatedCondition.created_date || new Date().toISOString()
    }

    setData(prevData => {
      const exists = prevData.some(item => item.id === updatedItem.id)
      return exists
        ? prevData.map(item => (item.id === updatedItem.id ? updatedItem : item))
        : [...prevData, updatedItem]
    })
    setFilteredData(prevData => {
      const exists = prevData.some(item => item.id === updatedItem.id)
      return exists
        ? prevData.map(item => (item.id === updatedItem.id ? updatedItem : item))
        : [...prevData, updatedItem]
    })
  }, [])

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(newSize => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }))

    setCookie('conditionPageSize', newSize)
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
          <CardHeader title='Asset Conditions' />
          {/* <ConditionTableFilters setData={setFilteredData} productData={data} /> */}
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search Conditions'
              className='max-sm:is-full'
            />
            <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedRow(null)
                  setCategoryAddOpen(true)
                }}
              >
                Add Condition
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
            storageKey='conditionPageSize'
          />
        </div>

        <ConditionEditDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          setData={handleCategoryUpdate}
          customerData={data}
          categoryId={selectedRow?.id}
          refreshData={fetchData}
        />
        <ConditionViewDrawer
          open={categoryViewOpen}
          handleClose={() => setCategoryViewOpen(false)}
          categoryData={selectedRow}
        />
        <ConditionAddDrawer
          open={categoryAddOpen}
          handleClose={() => setCategoryAddOpen(false)}
          setData={handleCategoryUpdate}
          refreshData={fetchData}
        />
        <Dialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          aria-labelledby='confirm-dialog-title'
          aria-describedby='confirm-dialog-description'
        >
          <DialogTitle id='confirm-dialog-title'>Confirm</DialogTitle>
          <DialogContent id='confirm-dialog-description'>Are you sure you want to delete this condition?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color='inherit'>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color='error'
              variant='contained'
              disabled={deleteLoading}
              aria-label='Delete condition'
            >
              {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default ConditionListTable
