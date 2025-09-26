'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Card, CardHeader, Button, TextField, Divider, CircularProgress } from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import { getCookie, setCookie } from 'cookies-next'

import PaginationComponent from '../pagination/pagination'

import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);


ModuleRegistry.registerModules([AllCommunityModule])

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const formatTime = iso => {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

const DiscardListTable = () => {
  const defaultPageSize = parseInt(getCookie('discardAssetPageSize')) || 10

  const gridRef = useRef(null)

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

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('sell/all', { params: { page, limit: pageSize } })
      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          const discardDate = item.discard_date || null // Convert to DD-MM-YYYY
          return {
            id: item._id,
            assetCode: item.asset?.asset_code || 'N/A',
            assetName: item.asset?.asset_name || 'N/A',
            purchaseValue: item.purchase_value?.purchase_price || 0,
            soldValue: parseFloat(item.sold_value?.$numberDecimal || 0), // Convert to number
            difference: item.price_diff || 0,
            reason: item.reason || '',
            location: item.location?.location || '',
            depreciatedValue: item.depreciated_value || 0,
            vendorName: item.vendor?.vendor_name || '',
            discardDate: discardDate ? formatDate(discardDate) : '',
            createdDate: createdDate ? formatDate(createdDate) : '',
            createdTime: createdDate ? formatTime(createdDate) : '',
            createdBy: item.created_by?.user_name || 'N/A'
          }
        })

        setData(mappedData)
        setFilteredData(mappedData)

        if (response.data.pagination) {
          setPagination({
            totalItems: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 1,
            currentPage: response.data.pagination.currentPage || 1,
            pageSize: response.data.pagination.pageSize || pageSize
          })
        }
      } else {
        toast.error(response.data.message || 'Failed to fetch data.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching data.')
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
        headerName: 'Asset Code',
        field: 'assetCode',
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Asset Name',
        field: 'assetName',
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Purchase Value',
        field: 'purchaseValue',
        width: 150,
        filter: 'agNumberColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Sold Value',
        field: 'soldValue',
        width: 150,
        filter: 'agNumberColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Price Difference',
        field: 'difference',
        width: 150,
        filter: 'agNumberColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Depreciated Value',
        field: 'depreciatedValue',
        width: 180,
        filter: 'agNumberColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true
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
        headerName: 'Location',
        field: 'location',
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Vendor Name',
        field: 'vendorName',
        width: 180,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 150,
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
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterOption, value, filterText) => {
            if (!value || !filterText) return 0
            const parseTime = time => {
              const [hours, minutes] = time.split(':').map(Number)
              return hours * 60 + minutes
            }
            const valueMinutes = parseTime(value)
            const filterMinutes = parseTime(filterText)
            if (filterOption === 'equals') return valueMinutes === filterMinutes ? 0 : -1
            if (filterOption === 'lessThan') return valueMinutes < filterMinutes ? 0 : -1
            if (filterOption === 'greaterThan') return valueMinutes > filterMinutes ? 0 : -1
            return 0
          }
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Discard Date',
        field: 'discardDate',
        width: 150,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            // Handle null, undefined, or non-string cell values
            if (!cellValue || typeof cellValue !== 'string') return 0

            let cellDate
            // Try parsing DD-MM-YYYY format
            if (cellValue.includes('-')) {
              const dateParts = cellValue.split('-')
              if (dateParts.length === 3) {
                cellDate = new Date(
                  parseInt(dateParts[2], 10), // Year
                  parseInt(dateParts[1], 10) - 1, // Month (0-based)
                  parseInt(dateParts[0], 10) // Day
                )
              }
            }
            // Fallback to ISO date (YYYY-MM-DD) if DD-MM-YYYY parsing fails
            if (!cellDate || isNaN(cellDate.getTime())) {
              cellDate = new Date(cellValue)
            }

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
        // valueFormatter: params => formatDate(params.value),
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Reason',
        field: 'reason',
        width: 180,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      }
    ],
    []
  )

 
const handleExport = async () => {
  try {
    setLoading(true);

    const response = await axiosInstance.get('/discardReportRoute/download', {
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

    // ✅ Dynamic filename with dayjs
    const fileName = `Discard_Sell_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting discard report:', error);
    toast.error(error?.response?.data?.message || 'Error exporting data');
  } finally {
    setLoading(false);
  }
};



  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(item =>
          Object.values(item).some(val => String(val).toLowerCase().includes(value.toLowerCase()))
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
    setCookie('discardAssetPageSize', newSize.toString())
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
        <CardHeader title='Discarded Assets' />
        <Divider />
        <div className='p-5 flex justify-between items-center flex-wrap gap-4'>
          <DebouncedInput
            value={globalFilter}
            className='max-sm:w-full'
            onChange={handleFilterChange}
            placeholder='Search Discarded Reports'
          />
          <Button
            variant='outlined'
            className='max-sm:w-full'
            startIcon={<i className='ri-upload-2-line' />}
            onClick={handleExport}
          >
            Export
          </Button>
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
          storageKey='discardAssetPageSize'
        />
      </Card>
    </>
  )
}

export default DiscardListTable
