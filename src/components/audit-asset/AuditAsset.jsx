'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardHeader,
  Divider,
  Button,
  CircularProgress,
  Box,
  Pagination,
  TextField,
  MenuItem
} from '@mui/material'
import { toast } from 'react-toastify'
import { getCookie, setCookie } from 'cookies-next'

import * as XLSX from 'xlsx';

import axiosInstance from '@/utils/axiosinstance'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('@/components/agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses window/document
);


// DebouncedInput component for search
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
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,        // 24-hour format
    timeZone: 'Asia/Kolkata' // ensures IST
  })
}





const AuditAssetPage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [allAssets, setAllAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([]) // State for filtered data
  const [assets, setAssets] = useState([]) // Paginated filtered data
  const [globalFilter, setGlobalFilter] = useState('') // State for search input
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: parseInt(getCookie('auditAssetPageSize')) || 10
  })

  const fetchAssets = async () => {
    try {
      setLoading(true)

      const res = await axiosInstance.get(`/config/${id}/audits`)
      if (res?.data?.status === 200) {
        
        const formatted = res.data.data.map(item => ({
          id: item._id,
          assetName: item.asset?.asset_name || 'N/A',
          assetCode: item.asset?.asset_code || 'N/A',
          auditCode: item.audit?.audit_code || 'N/A',
          auditType: item.audit?.audit_type || 'N/A',
          auditName: item.audit?.audit_name || 'N/A',
          auditStartDate: formatDate(item.audit?.audit_startdate),
          auditEndDate: formatDate(item.audit?.audit_enddate),
          assetLocation: item.asset?.location?.location || 'N/A',
          auditLocation: item.audit_loc || 'N/A',
          condition: item.condition?.condition || 'N/A',
          remark: item.remark || 'N/A',
          asondate: formatDate(item.audit?.as_on_date),
           createdDate: formatDate(item.scanned_date),
 createdTime: formatTime(item.scanned_date) // Corrected
        }))

        setAllAssets(formatted)
        setFilteredAssets(formatted) // Initialize filtered data
        setPagination(prev => ({
          ...prev,
          totalItems: formatted.length,
          totalPages: Math.ceil(formatted.length / prev.pageSize)
        }))
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Error loading asset data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchAssets()
  }, [id])

  // Update filtered assets and pagination when search term changes
  useEffect(() => {
    const filtered = globalFilter
      ? allAssets.filter(item =>
          Object.values(item).some(val => val && val.toString().toLowerCase().includes(globalFilter.toLowerCase()))
        )
      : allAssets

    setFilteredAssets(filtered)
    setPagination(prev => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.pageSize),
      currentPage: 1 // Reset to first page on filter change
    }))
  }, [globalFilter, allAssets, pagination.pageSize])

  // Update paginated assets when filtered data or pagination changes
  useEffect(() => {
    const startIdx = (pagination.currentPage - 1) * pagination.pageSize
    const endIdx = startIdx + pagination.pageSize
    setAssets(filteredAssets.slice(startIdx, endIdx))
  }, [filteredAssets, pagination.currentPage, pagination.pageSize])

  const handleFilterChange = value => {
    setGlobalFilter(value)
  }

 

const handleExport = async () => {
  try {
    if (!filteredAssets || !filteredAssets.length) {
      toast.warn('No data to export!');
      return;
    }

    // Map data to worksheet-friendly format
    const data = filteredAssets.map(asset => ({
      'Asset Code': asset.assetCode,
      'Asset Name': asset.assetName,
      'Audit Code': asset.auditCode,
      'Audit Type': asset.auditType,
      'Audit Name': asset.auditName,
      'Start Date': asset.auditStartDate,
      'as on Date': asset.asondate,
      'End Date': asset.auditEndDate,
      'Asset Location': asset.assetLocation,
      'Audit Location': asset.auditLocation,
      'Condition': asset.condition,
      'Remark': asset.remark,
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Assets');

    // Generate  file
    const fileName = `audit_assets_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Error exporting data. Please try again.');
  }
};


  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = [
    { headerName: 'Asset Code', field: 'assetCode', width: 180, cellStyle: baseStyle },
    { headerName: 'Asset Name', field: 'assetName', width: 200, cellStyle: baseStyle },
    { headerName: 'Audit Code', field: 'auditCode', width: 180, cellStyle: baseStyle },
    { headerName: 'Audit Type', field: 'auditType', width: 150, cellStyle: baseStyle },
    { headerName: 'Audit Name', field: 'auditName', width: 200, cellStyle: baseStyle },
      { headerName: ' As on Date', field: 'asondate', width: 160, cellStyle: baseStyle },
    { headerName: ' Audit Start Date', field: 'auditStartDate', width: 160, cellStyle: baseStyle },
    { headerName: ' Audit End Date', field: 'auditEndDate', width: 160, cellStyle: baseStyle },
    { headerName: 'Asset Location', field: 'assetLocation', width: 160, cellStyle: baseStyle },
    { headerName: 'Audit Location', field: 'auditLocation', width: 160, cellStyle: baseStyle },
    { headerName: 'Condition', field: 'condition', width: 140, cellStyle: baseStyle },
    { headerName: 'Remark', field: 'remark', width: 180, cellStyle: baseStyle },
     { headerName: 'Audit Date', field: 'createdDate', width: 160, cellStyle: baseStyle },
  { headerName: 'Audit Time', field: 'createdTime', width: 160, cellStyle: baseStyle }
  ]

  return (
    <Card>
      <CardHeader
        title='Audited Asset'
        action={
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => router.back()}
              startIcon={<i className='ri-arrow-left-line' />}
            >
              Back
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='ri-upload-2-line' />}
              onClick={handleExport}
              disabled={loading || filteredAssets.length === 0}
            >
              Export
            </Button>
          </Box>
        }
      />
      <Divider />
      <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
        <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search ' />
      </div>
      <div className='p-4'>
        {loading ? (
          <div className='flex justify-center items-center h-40'>
            <CircularProgress />
          </div>
        ) : (
          <>
            <AgGridWrapper rowData={assets} columnDefs={columnDefs} domLayout='autoHeight' />

            <div className='flex justify-between items-center mt-4 flex-wrap gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Rows per page:</span>
                <TextField
                  select
                  size='small'
                  value={pagination.pageSize}
                  onChange={e => {
                    const newSize = parseInt(e.target.value)
                    setCookie('auditAssetPageSize', newSize)
                    setPagination(prev => ({
                      ...prev,
                      pageSize: newSize,
                      currentPage: 1,
                      totalPages: Math.ceil(filteredAssets.length / newSize)
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
                onChange={(e, newPage) => {
                  setPagination(prev => ({ ...prev, currentPage: newPage }))
                }}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

export default AuditAssetPage
