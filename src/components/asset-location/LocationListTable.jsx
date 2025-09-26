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
  Typography,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import LocationViewDrawer from './LocationViewDrawer'
import LocationEditDrawer from './LocationEditDrawer'
import AssetAddLocationDrawer from './AssetAddLocationDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import axiosInstance from '@/utils/axiosinstance'
import PaginationComponent from '../pagination/pagination'
import { getCookie, setCookie } from 'cookies-next'

ModuleRegistry.registerModules([AllCommunityModule])

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const productStatusObj = {
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
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
    <Typography color='#000000'>No locations found</Typography>
  </div>
)

const LocationListTable = () => {
  // const defaultPageSize = parseInt(getCookie.getItem('locationPageSize')) || 10
  const defaultPageSize = parseInt(getCookie('locationPageSize')) || 10
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [editLocationOpen, setEditLocationOpen] = useState(false)
  const [viewLocationOpen, setViewLocationOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('location/all', {
        params: { page, limit: pageSize }
      })

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          return {
            id: item._id,
            locationName: item.location || 'N/A',
            parentLocation: item.parent_location?.location || 'None',
            parentLocationId: item.parent_location?._id || null,
            status: item.status ? 'Active' : 'Inactive',
            createdBy: item.created_by?.user_name || 'Unknown',
            createdDate: createdDate ? formatDate(createdDate) : '',
            location_lat: Number(item.location_lat) || 0,
            location_lng: Number(item.location_lng) || 0
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
        //     pageSize: response.data.pagination.pageSize || pageSize
        //   })
        // }
      } else {
        toast.error('Failed to fetch locations')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching locations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await axiosInstance.delete(`location/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        toast.success(response.data.message || 'Location deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete location')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting location')
    }
    setOpenConfirm(false)
    setSelectedRowId(null)
  }, [selectedRowId])

  const handleEditClick = useCallback(id => {
    setSelectedRowId(id)
    setEditLocationOpen(true)
  }, [])

  const handleViewClick = useCallback(id => {
    setSelectedRowId(id)
    setViewLocationOpen(true)
  }, [])

  const handleDeleteClick = useCallback(id => {
    setSelectedRowId(id)
    setOpenConfirm(true)
  }, [])

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(newSize => {
    setCookie('locationPageSize', newSize)
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }))
  }, [])

const handleFilterChange = useCallback(
  value => {
    setGlobalFilter(value)
    if (value) {
      const searchValue = value.toLowerCase()
      const filtered = data.filter(
        item =>
          item.locationName.toLowerCase().includes(searchValue) ||
          item.parentLocation.toLowerCase().includes(searchValue) ||
          item.status.toLowerCase().includes(searchValue) ||
          (item.createdDate && item.createdDate.toLowerCase().includes(searchValue))
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
        headerName: 'Location Name',
        field: 'locationName',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.locationName,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Parent Location',
        field: 'parentLocation',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.parentLocation,
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
        cellStyle: { display: 'flex', alignItems: 'center' }
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
        width: 210,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton size='small' onClick={() => handleEditClick(params.data.id)}>
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleViewClick(params.data.id)}>
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteClick(params.data.id)}>
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Asset Locations' />
      <Divider />
      <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
        <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Locations' />
        <div className='flex gap-4'>
          {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
            Export
          </Button> */}
          <Button
            variant='contained'
            color='primary'
            className='max-sm:is-full'
            startIcon={<i className='ri-add-line' />}
            onClick={() => setAddLocationOpen(true)}
          >
            Add Location
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
        storageKey='locationPageSize'
      />

      <AssetAddLocationDrawer
        open={addLocationOpen}
        handleClose={() => setAddLocationOpen(false)}
        setData={setData}
        customerData={data}
        refreshData={fetchData}
      />
      <LocationEditDrawer
        open={editLocationOpen}
        handleClose={() => setEditLocationOpen(false)}
        setData={setData}
        customerData={data}
        categoryId={selectedRowId}
      />
      <LocationViewDrawer
        open={viewLocationOpen}
        handleClose={() => setViewLocationOpen(false)}
        customerData={data}
        categoryId={selectedRowId}
      />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Are you sure you want to delete this location?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default LocationListTable
