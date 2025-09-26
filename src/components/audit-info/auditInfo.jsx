'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, Divider, Button, CircularProgress, TextField, MenuItem, Pagination } from '@mui/material'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx';
import axiosInstance from '@/utils/axiosinstance'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('@/components/agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses window/document
);

import { getCookie, setCookie } from 'cookies-next'

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

const AuditAssetListPage = () => {
  const { id } = useParams()
  const router = useRouter()

  const defaultPageSize = parseInt(getCookie('auditPageSize')) || 10
  const [assets, setAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([]) // State for filtered data
  const [globalFilter, setGlobalFilter] = useState('') // State for search input
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  const fetchAssets = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)

    try {
      const res = await axiosInstance.get(`/config/${id}/assets`, {
        params: { page, limit: pageSize }
      })

      if (res?.data?.status === 200) {
      const formatted = res.data.data.map(item => ({
  id: item._id,
  assetName: item.asset_name,
  category: item.category?.category_name || 'N/A',
  location: item.location?.location || 'N/A',
  status: item.status?.status || 'N/A',
  model: item.model?.model_name || 'N/A',
  brand: item.brand?.name || 'N/A',
  serialNo: item.serial_no,
  vendor: item.vendor?.vendor_name || 'N/A',
  condition: item.condition?.condition || 'N/A',
  assetCode: item.asset_code,
  department: item.dept?.department || 'N/A',
  allotedTo: item.alloted_to?.user_name || 'N/A',

  // 🔹 Fix lifetimeMonths handling
 lifetimeMonths: (() => {
  const val = item.lifetime_months

  if (val === null || val === undefined) return 'N/A'
  
  // Handle number-like objects (like {"$numberDecimal":"0"})
  if (typeof val === 'object' && '$numberDecimal' in val) return Number(val.$numberDecimal)

  const num = Number(val)

  return !isNaN(num) ? num : 'N/A'
})(),



  shift: item.shift || 'N/A',
  capitalizationPrice: item.capitalization_price ?? 'N/A',
  capitalizationDate: item.capitalization_date
    ? new Date(item.capitalization_date).toLocaleDateString('en-GB')
    : 'N/A',
  endOfLife: item.end_of_life
    ? new Date(item.end_of_life).toLocaleDateString('en-GB')
    : 'N/A'
}))


        setAssets(formatted)
        setFilteredAssets(formatted) // Initialize filtered data
        setPagination({
          totalItems: res.data.pagination?.totalItems || formatted.length,
          totalPages: res.data.pagination?.totalPages || Math.ceil(formatted.length / pageSize),
          currentPage: res.data.pagination?.currentPage || page,
          pageSize: res.data.pagination?.pageSize || pageSize
        })
      } else {
        toast.error(res.data.message || 'Failed to fetch assets.')
      }
    } catch (err) {
      toast.error('Error loading asset data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchAssets(pagination.currentPage, pagination.pageSize)
  }, [id, pagination.currentPage, pagination.pageSize])

  // Handle search filter changes
  const handleFilterChange = value => {
    setGlobalFilter(value)

    if (value) {
      const filtered = assets.filter(item =>
        Object.values(item).some(val => val && val.toString().toLowerCase().includes(value.toLowerCase()))
      )
      setFilteredAssets(filtered)
    } else {
      setFilteredAssets(assets)
    }
  }

 

const handleExport = () => {
  try {
    if (!filteredAssets || !filteredAssets.length) {
      toast.warn('No data to export!');
      return;
    }

    // Map your data for XLSX
    const data = filteredAssets.map(asset => ({
      'Asset Code': asset.assetCode,
      'Asset Name': asset.assetName,
      'Audit Code': asset.auditCode,
      'Audit Type': asset.auditType,
      'Audit Name': asset.auditName,
      'Start Date': asset.auditStartDate,
      'End Date': asset.auditEndDate,
      'Asset Location': asset.assetLocation,
      'Audit Location': asset.auditLocation,
      'Condition': asset.condition,
      'Remark': asset.remark,
    }));

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Optional: make headers bold
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell_address]) continue;
      worksheet[cell_address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D3D3D3' } }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Assets');

    // Trigger download
    const fileName = `audit_assets_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Error exporting data. Please try again.');
  }
};


  const handlePageSizeChange = e => {
    const newSize = parseInt(e.target.value)
    setCookie('auditPageSize', newSize)
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }))
  }

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
    { headerName: 'Category', field: 'category', width: 180, cellStyle: baseStyle },
    { headerName: 'Location', field: 'location', width: 160, cellStyle: baseStyle },
    { headerName: 'Capitalization Price', field: 'capitalizationPrice', width: 180, cellStyle: baseStyle },
    { headerName: 'Capitalization Date', field: 'capitalizationDate', width: 180, cellStyle: baseStyle },
    { headerName: 'Shift', field: 'shift', width: 140, cellStyle: baseStyle },
    // { headerName: 'Lifetime (Months)', field: 'lifetimeMonths', width: 150, cellStyle: baseStyle },
    {
  headerName: 'Lifetime (Months)',
  field: 'lifetimeMonths',
  width: 150,
  cellStyle: baseStyle,
  valueFormatter: params => params.value ?? 'N/A'
},

    { headerName: 'Status', field: 'status', width: 140, cellStyle: baseStyle },
    { headerName: 'Brand', field: 'brand', width: 160, cellStyle: baseStyle },
    { headerName: 'Model', field: 'model', width: 160, cellStyle: baseStyle },

    { headerName: 'Vendor', field: 'vendor', width: 160, cellStyle: baseStyle },
    { headerName: 'Department', field: 'department', width: 180, cellStyle: baseStyle },
      { headerName: 'Alloted To', field: 'allotedTo', width: 180, cellStyle: baseStyle }, 
    { headerName: 'Condition', field: 'condition', width: 140, cellStyle: baseStyle }
  ]

  return (
    <Card>
      <CardHeader
        title='Assets Under Audit'
        action={
          <div className='flex gap-4'>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={() => router.back()}
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
          </div>
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
          <AgGridWrapper rowData={filteredAssets} columnDefs={columnDefs} domLayout='autoHeight' />
        )}
      </div>

      <div className='flex justify-between items-center px-6 py-4 flex-wrap gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Rows per page:</span>
          <TextField select size='small' value={pagination.pageSize} onChange={handlePageSizeChange}>
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
          onChange={(e, newPage) => setPagination(prev => ({ ...prev, currentPage: newPage }))}
        />
      </div>
    </Card>
  )
}

export default AuditAssetListPage
