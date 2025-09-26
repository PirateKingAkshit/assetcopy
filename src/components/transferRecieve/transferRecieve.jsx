'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  Button,
  Chip,
  TextField,
  Divider,
  CircularProgress,
  Pagination,
  MenuItem,
  IconButton,
  Typography
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import { getCookie, setCookie } from 'cookies-next'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import { useParams } from 'next/navigation'
import PaginationComponent from '../pagination/pagination'

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
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const TransferRecieve = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const defaultPageSize = parseInt(getCookie('categoryPageSize')) || 10

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })
  const [gridRef, setGridRef] = useState(null)

  const getStatusColor = status => {
    const s = status?.toLowerCase()
    if (s.includes('pending')) return 'warning'
    if (s.includes('approved')) return 'success'
    if (s.includes('rejected')) return 'error'
    if (s.includes('done')) return 'success'
    if (s.includes('active')) return 'info'
    return 'default'
  }

  // const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
  //   try {
  //     setLoading(true)
  //     const response = await axiosInstance.get('transfer/all', {
  //       params: { page, pageSize }
  //     })

  //     if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
  //       const mappedData = response.data.data.slice(0, pageSize).map(item => {
  //         const created = new Date(item.created_date)
  //         const approved = item.approved_date ? new Date(item.approved_date) : null

  //         return {
  //           id: item._id?.toString() || `temp-${Math.random()}`,
  //           assetCode: item.asset?.map(asset => asset.asset_code).join(', ') || 'None',
  //           assetName: item.asset?.map(asset => asset.asset_name).join(', ') || 'None',
  //           // oldLocation: item.asset?.map(asset => asset.location?.location).join(', ') || 'None',
  //           // oldAllotedTo: item.asset?.map(a => a.alloted_to?.user_name || 'None').join(', '),

  //           oldLocation: item.old_location?.map(loc => loc.location).join(', ') || 'None',
  //           oldAllotedTo: item.old_allocated?.map(user => user.user_name || 'None').join(', ') || 'None',

  //           //newAllotedTo: item.new_allocated?.user_name || 'None',
  //           //newLocation: item.new_location?.location || 'None',
  //           newAllotedTo: item.new_allocated?.user_name || 'None',
  //           newLocation: item.new_location?.location || 'None',

  //           remarks: item.remark || item.transfer_remark || 'None',
  //           status: item.transfer_status?.status?.toLowerCase() || 'pending',
  //           createdDate: formatDate(item.created_date),
  //           createdTime: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //           approvedBy: item.approved_by?.user_name || '—',
  //           approvedDate: approved ? approved.toLocaleDateString() : '—',

  //           receivedBy: item.received_by?.user_name || '—',

  //           receivedDate: formatDate(item.received_date),
  //           updatedDate: formatDate(item.updated_date)
  //         }
  //       })

  //       setData(mappedData)
  //       setFilteredData(mappedData)

  //       if (response.data.pagination) {
  //         setPagination(prev => ({
  //           ...prev,
  //           totalItems: response.data.pagination.totalItems || mappedData.length,
  //           totalPages: Math.ceil((response.data.pagination.totalItems || mappedData.length) / pageSize) || 1,
  //           currentPage: page,
  //           pageSize
  //         }))
  //       }
  //     } else {
  //       toast.error(response.data.message || 'Failed to fetch transfer data.')
  //       setData([])
  //       setFilteredData([])
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Error fetching transfer data.')
  //     setData([])
  //     setFilteredData([])
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
  try {
    setLoading(true)
    const response = await axiosInstance.get('transfer/all', {
      params: { page, pageSize }
    })

    if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
      const mappedData = response.data.data.map(item => {
        const created = new Date(item.created_date)
        const approved = item.approved_date ? new Date(item.approved_date) : null

        const asset = item.asset || {}
        const oldLoc = item.old_location
        const newLoc = item.new_location
        const oldAllocated = item.old_allocated
        const newAllocated = item.new_allocated

        return {
          id: item._id?.toString() || `temp-${Math.random()}`,
          assetCode: asset.asset_code || 'None',
          assetName: asset.asset_name || 'None',
  assetLocation: item.asset?.location?.location || 'None',
          oldLocation: oldLoc?.location || 'None',
          oldAllotedTo: oldAllocated?.user_name || 'None',

          newAllotedTo: newAllocated?.user_name || 'None',
          newLocation: newLoc?.location || 'None',

          remarks: item.remark || item.transfer_remark || 'None',
          status: item.transfer_status?.status?.toLowerCase() || 'pending',

          createdDate: formatDate(item.created_date),
          createdTime: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          approvedBy: item.approved_by?.user_name || '—',
          approvedDate: approved ? approved.toLocaleDateString() : '—',

          receivedBy: item.received_by?.user_name || '—',
          receivedDate: formatDate(item.received_date),
          updatedDate: formatDate(item.updated_date)
        }
      })

      setData(mappedData)
      setFilteredData(mappedData)

      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems || mappedData.length,
          totalPages: Math.ceil((response.data.pagination.totalItems || mappedData.length) / pageSize) || 1,
          currentPage: page,
          pageSize
        }))
      }
    } else {
      toast.error(response.data.message || 'Failed to fetch transfer data.')
      setData([])
      setFilteredData([])
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error fetching transfer data.')
    setData([])
    setFilteredData([])
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  useEffect(() => {
    const shouldReload = getCookie('reloadTransferList')
    if (shouldReload) {
      setCookie('reloadTransferList', '', { maxAge: -1 })
      fetchData(pagination.currentPage, pagination.pageSize)
    }
  }, [])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Asset Code',
        field: 'assetCode',
        width: 160,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Asset Name',
        field: 'assetName',
        width: 160,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Asset Location',
        field: 'assetLocation',
        width: 160,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'New Location',
        field: 'newLocation',
        width: 160,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Old Allotted To',
        field: 'oldAllotedTo',
        width: 160,
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
        headerName: 'New Allotted To',
        field: 'newAllotedTo',
        width: 160,
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
        headerName: ' Transfer Remarks',
        field: 'remarks',
        width: 160,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 160,
        filter: 'agTextColumnFilter',
        cellRenderer: params => (
          <Chip
            label={params.data.status || 'Pending'}
            variant='tonal'
            color={getStatusColor(params.data.status)}
            size='small'
          />
        ),
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Approved / Rejected By',
        field: 'approvedBy',
        width: 200,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },

      {
        headerName: 'Received Date',
        field: 'receivedDate',
        width: 160,
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
        headerName: 'Received By',
        field: 'receivedBy',
        width: 160,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Updated Date',
        field: 'updatedDate',
        width: 160,
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
        headerName: 'Created Date',
        field: 'createdDate',
        width: 160,
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
        headerName: 'Created Time',
        field: 'createdTime',
        width: 140,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Actions',
        field: 'actions',
        width: 160,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton
              size='small'
              onClick={() => {
                router.push(`/${locale}/asset-managements/view-transferRecieve/${params.data.id}`)
              }}
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }


    const handlePageSizeChange = useCallback(newSize => {
        setCookie('transferReceivePageSize', newSize.toString())
        setPagination(prev => ({
          ...prev,
          pageSize: newSize,
          currentPage: 1,
          totalPages: Math.ceil(prev.totalItems / newSize)
        }))
      }, [])
  const handleFilterChange = value => {
    setGlobalFilter(value)
    if (value) {
      const filtered = data.filter(
        item =>
          item.assetName?.toLowerCase().includes(value.toLowerCase()) ||
          item.oldLocation?.toLowerCase().includes(value.toLowerCase()) ||
          item.oldAllotedTo?.toLowerCase().includes(value.toLowerCase()) ||
          item.newAllotedTo?.toLowerCase().includes(value.toLowerCase()) ||
          item.newLocation?.toLowerCase().includes(value.toLowerCase()) ||
          item.remarks?.toLowerCase().includes(value.toLowerCase()) ||
          item.createdDate?.toLowerCase().includes(value.toLowerCase()) ||
          item.createdTime?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
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
         <CardHeader title='Transfer Receive' /> 
        {/* <CardHeader
          sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
          action={
            <Button variant='contained' color='primary' startIcon={<i className='ri-loop-left-line' />}>
              Transfer Receive
            </Button>
          }
        /> */}

        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Transfer Receive' />
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
                  storageKey='transferReceivePageSize'
                />
      </Card>
    </>
  )
}

export default TransferRecieve
