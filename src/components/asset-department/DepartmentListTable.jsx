

'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
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
import { Trash2 } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCookie, setCookie } from 'cookies-next'
import axiosInstance from '@/utils/axiosinstance'
import DepartmentEditDrawer from './DepartmentEditDrawer'
import DepartmentViewDrawer from './DepartmentViewDrawer'
import DepartmentAddDrawer from './DepartmentAddDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
}

const formatDate = iso => {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Invalid Date'
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

const DepartmentListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false)
  const [editDepartmentOpen, setEditDepartmentOpen] = useState(false)
  const [viewDepartmentOpen, setViewDepartmentOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  })

  useEffect(() => {
    const stored = parseInt(getCookie('departmentPageSize')) || 10
    setDefaultPageSize(stored)
    setPagination(prev => ({ ...prev, pageSize: stored }))
  }, [])

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('dept/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => ({
          id: item._id,
          departmentName: item.department || 'N/A',
          status: item.status.toString(),
          createdBy: item.created_by?.user_name || 'Unknown',
          createdDate: formatDate(item.created_date)
        }))
        setPagination(response.data.pagination)
        setData(mappedData)
        setFilteredData(mappedData)
      } else {
        toast.error(response.data.message || 'Failed to fetch departments.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error?.response?.data?.message || 'Failed to fetch departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return
    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`dept/${selectedRow.id}`)
      if (response.data?.status === 200) {
        await fetchData(pagination.currentPage, pagination.pageSize) // Refresh data after deletion
        toast.success(response.data.message || 'Department deleted successfully')
      } else {
        toast.error(response.data?.message || 'Failed to delete department.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting department.')
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
        const filtered = data.filter(
          item =>
            item.departmentName.toLowerCase().includes(value.toLowerCase()) ||
            item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
            item.createdDate.toLowerCase().includes(value.toLowerCase())
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
    setCookie('departmentPageSize', newSize)
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }))
  }, [])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Department Name',
        field: 'departmentName',
        width: 250,
        filter: 'agTextColumnFilter',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 250,
        filter: 'agSetColumnFilter',
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color}
            size='small'
          />
        ),
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 240,
        filter: 'agTextColumnFilter',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 240,
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
                setEditDepartmentOpen(true)
              }}
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setViewDepartmentOpen(true)
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
        <CardHeader title='Asset Department' />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter}
            onChange={handleFilterChange}
            placeholder='Search Department'
            className='max-sm:is-full'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => setAddDepartmentOpen(true)}
              startIcon={<i className='ri-add-line' />}
            >
              Add Department
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
          storageKey='departmentPageSize'
        />
      </Card>

      <DepartmentAddDrawer
        open={addDepartmentOpen}
        handleClose={() => setAddDepartmentOpen(false)}
        fetchData={fetchData}
      />
      <DepartmentEditDrawer
        open={editDepartmentOpen}
        handleClose={() => setEditDepartmentOpen(false)}
        setData={setData}
        departmentId={selectedRow?.id}
        fetchData={fetchData}
      />
      <DepartmentViewDrawer
        open={viewDepartmentOpen}
        handleClose={() => setViewDepartmentOpen(false)}
        departmentData={selectedRow}
      />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Are you sure you want to delete this department?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DepartmentListTable
