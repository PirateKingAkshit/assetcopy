'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCookie, setCookie } from 'cookies-next'

import * as XLSX from 'xlsx';

import axiosInstance from '@/utils/axiosinstance'

import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'

ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' },
  null: { title: 'N/A', color: 'default' }
}

const formatDate = iso => {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const formatTime = iso => {
  if (!iso) return 'N/A'
  const d = new Date(iso)

  // ⏱ 4 hours (in ms) add
  d.setHours(d.getHours() + 4)

  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
   
  })
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

const AuditReportTable = () => {
  const defaultPageSize = parseInt(getCookie('vendorPageSize')) || 10
  const { lang: locale } = useParams()
  const router = useRouter()

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
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
  const isInitialFetch = useRef(true)

  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('/config/all', {
          params: { page, limit: pageSize }
        })

        if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => ({
            id: item._id,
            auditCode: item.audit_code,
            auditName: item.audit_name,
            auditType: item.audit_type,
            auditFields: Array.isArray(item.audit_field) ? item.audit_field.join(', ') : 'N/A',
            startDate: formatDate(item.audit_startdate),
            endDate: formatDate(item.audit_enddate),
            categoryName: item.category?.category_name || 'N/A',
            departmentName: item.dept?.department || 'N/A',
            status: item?.status,
            totalAsset: item.total_asset || 0,
            totalAudit: item.total_audit || 0,
            condition: item.condition?.condition || 'N/A',
            location: item.location?.location || 'N/A',
            assignedTo: item.assigned_to?.map(user => user.user_name).join(', ') || 'N/A',
            createdDate: formatDate(item.created_date),
            updatedDate: formatDate(item.updated_date)
          }))
          setPagination(response.data.pagination)
          setData(mappedData)
          setFilteredData(mappedData)

          // if (response.data.pagination && isInitialFetch.current) {
          //   setPagination(prev => ({
          //     ...prev,
          //     totalItems: response.data.pagination.totalItems || 0,
          //     totalPages: response.data.pagination.totalPages || 1,
          //     currentPage: response.data.pagination.currentPage || 1,
          //     pageSize: response.data.pagination.pageSize || pageSize
          //   }))
          //   isInitialFetch.current = false
          // }
        } else {
          toast.error(response.data?.message || 'Failed to fetch audit data.')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching audit data.')
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage])

 


const handleExport = () => {
  try {
    if (!filteredData || !filteredData.length) {
      toast.warn('No data to export!');
      return;
    }

    // Map your data for XLSX
    const data = filteredData.map(item => ({
      'Audit Code': item.auditCode,
      'Audit Name': item.auditName,
      'Audit Type': item.auditType,
      'Total Assets': item.totalAsset,
      'Audit Fields': item.auditFields,
      'Start Date': item.startDate,
      'End Date': item.endDate,
      'Category': item.categoryName,
      'Department': item.departmentName,
      'Status': item.status?.status || 'N/A',
      'Condition': item.condition,
      'Location': item.location,
      'Assigned To': item.assignedTo,
      'Created Date': item.createdDate,
      'Updated Date': item.updatedDate
    }));

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Optional: Bold headers (xlsx doesn't do full styling without xlsx-style)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell_address]) continue;
      worksheet[cell_address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D3D3D3' } } // light gray
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Report');

    // Trigger download
    const fileName = `audit_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Audit report exported successfully!');
  } catch (error) {
    console.error('Error exporting audit report:', error);
    toast.error('Failed to export audit report. Please try again.');
  }
};


  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = useMemo(
    () => [
      { headerName: 'Audit Code', field: 'auditCode', width: 200, cellStyle: baseStyle },
      { headerName: 'Audit Name', field: 'auditName', width: 200, cellStyle: baseStyle },
      { headerName: 'Audit Type', field: 'auditType', width: 200, cellStyle: baseStyle },
      {
        headerName: 'Total Asset',
        field: 'totalAsset',
        width: 200,
        cellRenderer: params => (
          <span
            onClick={() => router.push(`/${locale}/assetAudit/audit-info/${params.data.id}`)}
            style={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-block',
              width: '100%'
            }}
          >
            {params.value}
          </span>
        ),
        cellStyle: baseStyle
      },
      {
        headerName: 'Audited Asset',
        field: 'totalAudit',
        width: 200,
        cellRenderer: params => (
          <span
            onClick={() => router.push(`/${locale}/assetAudit/audit-asset/${params.data.id}`)}
            style={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-block',
              width: '100%'
            }}
          >
            {params.value}
          </span>
        ),
        cellStyle: baseStyle
      },
      { headerName: 'Audit Fields', field: 'auditFields', width: 200, cellStyle: baseStyle },
      {
        headerName: 'Start Date',
        field: 'startDate',
        width: 180,
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
        cellStyle: baseStyle
      },
      {
        headerName: 'End Date',
        field: 'endDate',
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
        cellStyle: baseStyle
      },
      { headerName: 'Category Name', field: 'categoryName', width: 200, cellStyle: baseStyle },
      { headerName: 'Department Name', field: 'departmentName', width: 200, cellStyle: baseStyle },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        cellRenderer: params => (
          <Chip
            label={params.data?.status?.status || 'N/A'}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color || 'default'}
            size='small'
          />
        ),
        cellStyle: baseStyle
      },
      { headerName: 'Condition', field: 'condition', width: 200, cellStyle: baseStyle },
      { headerName: 'Location', field: 'location', width: 200, cellStyle: baseStyle },
      { headerName: 'Assigned To', field: 'assignedTo', width: 200, cellStyle: baseStyle }
    ],
    [router]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return
    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`config/${selectedRow.id}`)
      if (response.data?.status === 200) {
        setData(prev => prev.filter(item => item.id !== selectedRow.id))
        setFilteredData(prev => prev.filter(item => item.id !== selectedRow.id))
        toast.success(response.data.message || 'Audit deleted successfully.')
      } else {
        toast.error(response.data?.message || 'Failed to delete audit.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during deletion.')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }, [selectedRow])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      setFilteredData(
        value
          ? data.filter(
              item =>
                item.auditCode?.toLowerCase().includes(value.toLowerCase()) ||
                item.auditName?.toLowerCase().includes(value.toLowerCase())
            )
          : data
      )
    },
    [data]
  )

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(
    newSize => {
      setCookie('vendorPageSize', newSize)
      setPagination(prev => ({
        ...prev,
        pageSize: newSize,
        currentPage: 1,
        totalPages: Math.ceil(prev.totalItems / newSize)
      }))

      fetchData(1, newSize)
    },
    [fetchData]
  )

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader title='Audit Configuration Report' />
      <Divider />
      <div className='flex justify-between flex-col sm:flex-row gap-y-4 p-5'>
        <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Audits' />
        <div className='flex gap-4'>
          <Button
            variant='outlined'
            className='max-sm:is-full'
            startIcon={<i className='ri-upload-2-line' />}
            onClick={handleExport}
            disabled={filteredData.length === 0}
          >
            Export
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
        storageKey='vendorPageSize'
      />
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Are you sure you want to delete this audit?</DialogContent>
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
  )
}

export default AuditReportTable
