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
import TicketAddDrawer from './addTicket'
import TicketEditDrawer from './editTicketDrawer'
import { useRouter, useParams } from 'next/navigation'

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])
  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const TicketListTable = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const userData = typeof window !== 'undefined' ? JSON.parse(getCookie('userData') || '{}') : {}
  const isAdmin = userData?.isAdmin || false
  const allocatedTicket = typeof window !== 'undefined' ? JSON.parse(getCookie('allocatedTickets') || '[]') : []
  const allocatedTicketIds = allocatedTicket.map(asset => asset._id)

  const [defaultPageSize, setDefaultPageSize] = useState(10)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPageSize = parseInt(getCookie('ticketPageSize')) || 10
      setDefaultPageSize(storedPageSize)
    }
  }, [])

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
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
      let response

      // Choose API endpoint based on isAdmin
      if (isAdmin) {
        response = await axiosInstance.get('/ticket/all', {
          params: { page, limit: pageSize }
        })
      } else {
        response = await axiosInstance.get('/ticket/allocatedTickets', {
          params: { page, limit: pageSize }
        })
      }

      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        let mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null

          return {
            id: item._id,
            ticketType: item.ticket_type,
            assetName: item.asset?.asset_name || 'N/A',
            ticketLocation: item.ticket_loc?.location || 'N/A',
            assetLocation: item.asset_loc?.location || 'N/A',
            ticketNo: item.ticket_no || 'N/A',
            assignedTo: item.assigned_to?.user_name || 'N/A',
            status: item.status?.status || 'N/A',
            priority: item.priority || 'N/A',
            createdBy: item.created_by?.user_name || 'N/A',
            createdDate: createdDate ? formatDate(createdDate) : ''
          }
        })

        // No need to filter for non-admin since /ticket/allocatedTickets already returns relevant tickets
        setData(mappedData)
        setFilteredData(mappedData)
        setPagination(response.data.pagination)
      } else {
        toast.error(response.data.message || 'Failed to fetch ticket data.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const defaultCellStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = useMemo(() => {
    const columns = [
      {
        headerName: 'Ticket No',
        field: 'ticketNo',
        width: 150,
        cellRenderer: params => (
          <button
            onClick={() => router.push(`/${locale}/ticket/ticket-summary?id=${params.data.id}`)}
            className='text-blue-600 hover:underline cursor-pointer'
          >
            {params.value}
          </button>
        ),
        cellStyle: defaultCellStyle
      },
      { headerName: 'Ticket Type', field: 'ticketType', width: 150, cellStyle: defaultCellStyle },
      { headerName: 'Asset Name', field: 'assetName', width: 150, cellStyle: defaultCellStyle },
      { headerName: 'Ticket Location', field: 'ticketLocation', width: 180, cellStyle: defaultCellStyle },
      { headerName: 'Asset Location', field: 'assetLocation', width: 180, cellStyle: defaultCellStyle },
      { headerName: 'Assigned To', field: 'assignedTo', width: 180, cellStyle: defaultCellStyle },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 180,
        cellStyle: defaultCellStyle
      },
      { headerName: 'Priority', field: 'priority', width: 130, cellStyle: defaultCellStyle },
      {
        headerName: 'Status',
        field: 'status',
        width: 150,
        cellRenderer: params => (
          <Chip
            label={params.value}
            variant='tonal'
            color={params.value === 'open' ? 'success' : 'default'}
            size='small'
          />
        ),
        cellStyle: defaultCellStyle
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
        cellStyle: defaultCellStyle
      }
    ]

    if (isAdmin) {
      columns.push({
        headerName: 'Actions',
        field: 'actions',
        width: 200,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
              className='hover:bg-red-50'
            >
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        ),
        cellStyle: defaultCellStyle
      })
    }

    return columns
  }, [router, isAdmin])

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`ticket/${selectedRow.id}`)

      if (response.data?.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'Ticket deleted successfully!')
      } else {
        toast.error(response.data.message || 'Failed to delete ticket.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting ticket.')
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
          item.ticketType.toLowerCase().includes(value.toLowerCase()) ||
          item.assetName.toLowerCase().includes(value.toLowerCase()) ||
          item.ticketLocation.toLowerCase().includes(value.toLowerCase()) ||
          item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
          item.assignedTo.toLowerCase().includes(value.toLowerCase()) ||
          item.status.toLowerCase().includes(value.toLowerCase())
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
        <CardHeader title='Tickets' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Tickets' />
          {isAdmin && (
            <div className='flex gap-4'>
             
              <Button
                            variant='contained'
                            className='max-sm:is-full'
                            color='primary'
                            startIcon={<i className='ri-add-line' />}
                            onClick={() => setAddOpen(true)}
                          >
                            Add Ticket
                          </Button>
            </div>
          )}
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
                setCookie('ticketPageSize', newSize)
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
        {isAdmin && (
          <>
            <TicketAddDrawer
              open={addOpen}
              handleClose={() => setAddOpen(false)}
              setData={setData}
              fetchData={() => fetchData(pagination.currentPage, pagination.pageSize)}
              setPagination={setPagination}
            />
            <TicketEditDrawer
              open={editOpen}
              handleClose={() => setEditOpen(false)}
              setData={setData}
              fetchData={fetchData}
              selectedRow={selectedRow}
            />
          </>
        )}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this ticket?</DialogContent>
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

export default TicketListTable
