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
  Typography
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);

import { getCookie, setCookie } from 'cookies-next'
import PaginationComponent from '../pagination/pagination'

import dayjs from 'dayjs'

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

const TransferReportListTable = () => {
  const router = useRouter()
  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10 // Initial default value
  })

  const [gridRef, setGridRef] = useState(null)

  useEffect(() => {
    const storedPageSize = getCookie('categoryPageSize')
    const pageSize = storedPageSize ? parseInt(storedPageSize) : 10

    setDefaultPageSize(pageSize)

    setPagination(prev => ({
      ...prev,
      pageSize
    }))
  }, [])

  const getStatusColor = status => {
    const s = status?.toLowerCase()

    if (s.includes('pending')) return 'warning'
    if (s.includes('approved')) return 'success'
    if (s.includes('rejected')) return 'error'
    if (s.includes('done')) return 'success'
    if (s.includes('active')) return 'info'
    return 'default'
  }







const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
  try {
    setLoading(true);
    const response = await axiosInstance.get('transfer/all', {
      params: { page, limit: pageSize }
    });

    if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
      const mappedData = response.data.data.slice(0, pageSize).map(item => {
        const created = new Date(item.created_date);
        return {
          id: item._id?.toString() || `temp-${Math.random()}`,
          assetCode: item.asset?.asset_code || 'None',
          assetName: item.asset?.asset_name || 'None',
        oldLocation: item.old_location?.location || 'None',   
          newLocation: item.new_location?.location || 'None',
          remarks: item.remark || item.transfer_remark || 'None',
          status: item.transfer_status?.status?.toLowerCase() || 'pending',
          createdBy: item.created_by?.user_name || 'N/A',
          approvedBy: item.approved_by?.user_name || 'N/A',
          receivedBy: item.received_by?.user_name || 'N/A',
          newAllocated: item.new_allocated?.user_name || 'N/A',
          oldAllocated: item.old_allocated?.user_name || 'N/A',
          createdDate: new Date(item.created_date),
          approvedDate: item.approved_date ? new Date(item.approved_date) : null,
          receivedDate: item.received_date ? new Date(item.received_date) : null,
          createdTime: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setData(mappedData);
      setFilteredData(mappedData);

      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems || mappedData.length,
          totalPages: Math.ceil(response.data.pagination.totalItems / pageSize) || 1,
          currentPage: page,
          pageSize
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          totalItems: mappedData.length,
          totalPages: 1,
          currentPage: page,
          pageSize
        }));
      }
    } else {
      toast.error(response.data.message || 'Failed to fetch transfer data.');
      setData([]);
      setFilteredData([]);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error fetching transfer data.');
    setData([]);
    setFilteredData([]);
  } finally {
    setLoading(false);
  }
};

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
        width: 200,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Asset Name',
        field: 'assetName',
        width: 250,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Old Location',
        field: 'oldLocation',
        width: 250,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'New Location',
        field: 'newLocation',
        width: 250,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Remarks',
        field: 'remarks',
        width: 250,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' },
        cellRenderer: params => (
          <Chip
            label={params.data.status || 'Pending'}
            variant='tonal'
            color={getStatusColor(params.data.status)}
            size='small'
          />
        )
      },
      {
        headerName: 'New Allotted',
        field: 'newAllocated',
        width: 150,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Old Allotted',
        field: 'oldAllocated',
        width: 150,
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
        width: 150,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 150,
        filter: 'agDateColumnFilter',
        filterParams: {
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
          },
          browserDatePicker: true,
          suppressAndOrCondition: true
        },
        valueFormatter: params => {
          if (!params.value) return ''
          const date = new Date(params.value)
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
        },
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Created Time',
        field: 'createdTime',
        width: 150,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Received By',
        field: 'receivedBy',
        width: 150,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Received Date',
        field: 'receivedDate',
        width: 150,
        filter: 'agDateColumnFilter',
        filterParams: {
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
          },
          browserDatePicker: true,
          suppressAndOrCondition: true
        },
        valueFormatter: params => {
          if (!params.value) return ''
          const date = new Date(params.value)
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
        },
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Approved By',
        field: 'approvedBy',
        width: 150,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Approved Date',
        field: 'approvedDate',
        width: 150,
        filter: 'agDateColumnFilter',
        filterParams: {
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
          },
          browserDatePicker: true,
          suppressAndOrCondition: true
        },
        valueFormatter: params => {
          if (!params.value) return ''
          const date = new Date(params.value)
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
        },
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      }
    ],
    []
  )

 
const handleExport = async () => {
  try {
    setLoading(true);

    const response = await axiosInstance.get('/transferReport/download', {
      params: {
        search: globalFilter || "", // ✅ query param
        // ✅ add other filters here if needed
      },
      responseType: 'blob' 
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

   
    const fileName = `Transfer_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting transfer report:', error);
    toast.error(error?.response?.data?.message || 'Error exporting data');
  } finally {
    setLoading(false);
  }
};




  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

    const handlePageSizeChange = useCallback(newSize => {
      setCookie('transferAssetPageSize', newSize.toString())
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
          item.newLocation?.toLowerCase().includes(value.toLowerCase()) ||
          item.remarks?.toLowerCase().includes(value.toLowerCase()) ||
          item.createdDate?.toLocaleDateString('en-GB')?.toLowerCase().includes(value.toLowerCase()) ||
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
        <CardHeader title='Transfer Reports' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Transfer Reports' />
          <Button variant='outlined' startIcon={<i className='ri-upload-2-line' />} onClick={handleExport}>
            Export
          </Button>
        </div>
        {/* <div className='px-6'>
          {filteredData.length === 0 ? (
            <Typography variant='body1' align='center' sx={{ padding: '20px' }}>
              No rows to show. Please check the data source or try again.
            </Typography>
          ) : (
            <AgGridWrapper
              gridRef={gridRef}
              rowData={filteredData}
              columnDefs={columnDefs}
              pageSize={pagination.pageSize}
              domLayout='autoHeight'
            />
          )}
        </div> */}
        <div className='px-6'>
                  <AgGridWrapper rowData={filteredData} columnDefs={columnDefs} domLayout='autoHeight' />
                </div>
        {/* <div className='flex justify-between items-center px-6 py-4 flex-wrap gap-4'>
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
        </div> */}
        <PaginationComponent
                  totalItems={pagination.totalItems}
                  totalPages={pagination.totalPages}
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  storageKey='transferAssetPageSize'
                />
      </Card>
    </>
  )
}

export default TransferReportListTable
