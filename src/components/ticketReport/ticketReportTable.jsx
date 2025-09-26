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
import { getCookie, setCookie } from 'cookies-next'

import { toast, ToastContainer } from 'react-toastify'
import * as XLSX from 'xlsx';

import axiosInstance from '@/utils/axiosinstance'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import { useRouter } from 'next/navigation'

import AssetStatusFilter from '../assetReport/assetStatusFilter'
import TicketStatusFilter from './ticketstatusfilter'

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])
  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const TicketReportTable = () => {
  const router = useRouter()
  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedRows, setSelectedRows] = useState([])

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('ticketPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/ticket/all', {
        params: { page, limit: pageSize }
      })
      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        // inside fetchData mapping
const mappedData = response.data.data.slice(0, pageSize).map(item => ({
  id: item._id,
  ticketType: item.ticket_type,
  assetName: item.asset?.asset_name || 'N/A',
  ticketLocation: item.ticket_loc?.location || 'N/A',
  assetLocation: item.asset_loc?.location || 'N/A',
  ticketNo: item.ticket_no || 'N/A',
  assignedTo: item.assigned_to?.user_name || 'N/A',
  status: item.status?.status || 'N/A',   // 👈 status text
  priority: item.priority || 'N/A',
  createdDate: item.created_date ? new Date(item.created_date) : new Date()
}))


        let filteredTickets = mappedData
     if (Object.keys(filters).length > 0) {
  filteredTickets = mappedData.filter(ticket => {
    return (
      (!filters.ticketType || ticket.ticketType === filters.ticketType) &&
      (!filters.status || ticket.status === filters.status) &&   // 👈 compare by status name
      (!filters.priority || ticket.priority === filters.priority)
    )
  })
}

        setPagination(response.data.pagination)
        setData(filteredTickets)
        setFilteredData(filteredTickets)
        // setPagination(prev => ({
        //   ...prev,
        //   totalItems: response.data.pagination?.totalItems || filteredTickets.length,
        //   totalPages: Math.ceil((response.data.pagination?.totalItems || filteredTickets.length) / pageSize),
        //   currentPage: page,
        //   pageSize
        // }))
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
  }, [pagination.currentPage, pagination.pageSize, filters])


  

const handleExport = () => {
  try {
    if (!filteredData || !filteredData.length) {
      toast.warn('No data to export!');
      return;
    }

    // Map data for XLSX
    const data = filteredData.map(ticket => ({
      'Ticket No': ticket.ticketNo,
      'Ticket Type': ticket.ticketType,
      'Asset Name': ticket.assetName,
      'Ticket Location': ticket.ticketLocation,
      'Asset Location': ticket.assetLocation,
      'Assigned To': ticket.assignedTo,
      'Status': ticket.status,
      'Priority': ticket.priority,
      'Created Date': new Date(ticket.createdDate).toLocaleDateString(),
    }));

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Optional: Bold headers
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell_address]) continue;
      worksheet[cell_address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D3D3D3' } }, // light gray background
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

    // Trigger download
    XLSX.writeFile(workbook, 'tickets_export.xlsx');

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Error exporting data. Please try again.');
  }
};


  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || []
    const selectedData = selectedNodes.map(node => node.data)
    setSelectedRows(selectedData)
  }

  const handleFilterApply = activeFilters => {
    setFilters(activeFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const defaultCellStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = useMemo(
    () => [
      
      {
        headerName: 'Ticket No',
        field: 'ticketNo',
        width: 150,
        cellStyle: defaultCellStyle
      },
      { headerName: 'Ticket Type', field: 'ticketType', width: 150, cellStyle: defaultCellStyle },
      { headerName: 'Asset Name', field: 'assetName', width: 150, cellStyle: defaultCellStyle },
      { headerName: 'Ticket Location', field: 'ticketLocation', width: 180, cellStyle: defaultCellStyle },
      { headerName: 'Asset Location', field: 'assetLocation', width: 180, cellStyle: defaultCellStyle },
      { headerName: 'Assigned To', field: 'assignedTo', width: 180, cellStyle: defaultCellStyle },
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
      { headerName: 'Priority', field: 'priority', width: 130, cellStyle: defaultCellStyle },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 160,
        filter: 'agDateColumnFilter',
        valueFormatter: params => {
          const date = new Date(params.value)
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
        },
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue) return 0
            const cellDate = new Date(cellValue)
            const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
            const filterDateOnly = new Date(
              filterLocalDateAtMidnight.getFullYear(),
              filterLocalDateAtMidnight.getMonth(),
              filterLocalDateAtMidnight.getDate()
            )

            if (cellDateOnly < filterDateOnly) return -1
            if (cellDateOnly > filterDateOnly) return 1
            return 0
          }
        },
        cellStyle: defaultCellStyle
      }

      // {
      //   headerName: 'Actions',
      //   field: 'actions',
      //   width: 100,
      //   cellRenderer: params => (
      //     <IconButton
      //       onClick={() => {
      //         setSelectedRow(params.data)
      //         setOpenConfirm(true)
      //       }}
      //     >
      //       <Trash2 size={20} />
      //     </IconButton>
      //   ),
      //   cellStyle: defaultCellStyle,
      //   sortable: false,
      //   filter: false
      // }
    ],
    [router]
  )

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMenu: false,
      cellStyle: { display: 'flex', alignItems: 'center' }
    }),
    []
  )

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
        

        <div className='flex flex-col'>
          <TicketStatusFilter
            setData={setFilteredData}
            productData={data}
            onFilterApply={handleFilterApply}
            appliedFilters={filters}
            selectedRows={selectedRows}
            ticketFilter={true} // Add prop to indicate ticket-specific filters
          />
          <Divider />
        </div>
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Tickets' />
          <div
            className='flex items-center max-sm:flex-col gap-4 max-sm:w-full
 '
          >
            <Button
              variant='outlined'
              className='max-sm:w-full'
              startIcon={<i className='ri-upload-2-line' />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        <div className='px-6'>
          <AgGridWrapper
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection='multiple'
            onSelectionChanged={onSelectionChanged}
            domLayout='autoHeight'
          />
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

export default TicketReportTable
