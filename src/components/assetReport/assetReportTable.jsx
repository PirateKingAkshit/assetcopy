'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Card,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Alert,
  Pagination,
  MenuItem,
  CardHeader
} from '@mui/material'
import classnames from 'classnames'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

import axiosInstance from '@/utils/axiosinstance'
import tableStyles from '@core/styles/table.module.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import { toast } from 'react-toastify'

import AssetStatusFilter from './assetStatusFilter'
import { getCookie, setCookie } from 'cookies-next'

import dayjs from 'dayjs'

ModuleRegistry.registerModules([AllCommunityModule])

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
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const formatDate = iso => {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'N/A'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const AssetReportTable = () => {
  const defaultPageSize = typeof window !== 'undefined' ? parseInt(getCookie('assetPageSize')) || 10 : 10

  const [rowData, setRowData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })
  const [openImportModal, setOpenImportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [openErrorDialog, setOpenErrorDialog] = useState(false)
  const [importErrors, setImportErrors] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()
  const { lang: locale } = useParams()
  const gridRef = useRef(null)
  const fileInputRef = useRef(null)

  const fetchAssets = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('asset/all', {
        params: { page, limit: pageSize }
      })
      console.log('Raw Asset Data:', response.data)

      if (response.data && response.data.status === 200) {
        const assets = response.data.data.assets
        if (!Array.isArray(assets)) {
          throw new Error('Expected an array of assets, but received a non-array value')
        }

        const allAssets = assets.map(asset => ({
          id: asset._id,
          assetcode: asset.asset_code || 'N/A',
          assetname: asset.asset_name || 'N/A',
          location: asset.location?.location || 'N/A',
          locationId: asset.location?._id || null,
          category: asset.category?.category_name || 'N/A',
          categoryId: asset.category?._id || null,
          status: asset.status?.status || 'N/A',
          statusId: asset.status?._id || null,
          brand: asset.brand?.name || 'N/A',
          brandId: asset.brand?._id || null,
          model: asset.model?.model_name || 'N/A',
          assetlife: asset.lifetime_months || 'N/A',
          modelId: asset.model?._id || null,
          vendor_name: asset.vendor?.vendor_name || 'N/A',
          vendorId: asset.vendor?._id || null,
          department_name: asset.dept?.department || 'N/A',
          departmentId: asset.dept?._id || null,
          alloted_username: asset.alloted_to?.user_name || 'N/A',
          allotedId: asset.alloted_to?._id || null,
          shift_name: asset.shift || 'N/A', // ✅ direct string assign
          image: asset.file_attached ? `${asset.file_attached}` : null,
          Createdby: asset.created_by?.user_name || 'N/A',
          CreatedDate: formatDate(asset.created_date),

          capitalizationDate: formatDate(asset.capitalization_date),
          capitalizationPrice: asset.capitalization_price || 'N/A'
        }))

        let filteredAssets = allAssets
        if (Object.keys(filters).length > 0) {
          filteredAssets = allAssets.filter(asset => {
            return (
              (!filters.category || asset.categoryId === filters.category) &&
              (!filters.location || asset.locationId === filters.location) &&
              (!filters.status || asset.statusId === filters.status) &&
              (!filters.brand || asset.brandId === filters.brand) &&
              (!filters.model || asset.modelId === filters.model) &&
              (!filters.vendor || asset.vendorId === filters.vendor) &&
              (!filters.department || asset.departmentId === filters.department) &&
              (!filters.alloted_to || asset.allotedId === filters.alloted_to)
            )
          })
        }

        if (filteredAssets.length === 0 && Object.keys(filters).length > 0) {
          setError('No assets found for the selected filters.')
        } else {
          setError(null)
        }
        setPagination(response.data.pagination)
        setRowData(filteredAssets)
        setFilteredData(filteredAssets)
      } else {
        throw new Error(response.data.message || 'Failed to fetch assets')
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setError(err.message || 'Error loading assets. Please try again.')
      setRowData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.post('/asset/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.status === 200) {
        const { successMessage, errorMessage, errors } = response.data.data || {}

        toast.success(response.data.message)

        if (successMessage) {
          setSuccessMessage(successMessage)
        }

        if (errorMessage && errors && errors.length > 0) {
          setErrorMessage(errorMessage)
          setImportErrors(errors)
          setOpenErrorDialog(true)
        } else {
          setOpenImportModal(false)
          setSelectedFile(null)
        }

        await fetchAssets(pagination.currentPage, pagination.pageSize)
      } else {
        throw new Error(response.data.message || 'Failed to import assets')
      }
    } catch (err) {
      console.error('Error importing assets:', err)
      setError(err.message || 'Error importing assets. Please try again.')
      toast.error(err.message || 'Error importing assets. Please try again.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/sample.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'sample.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Sample file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading sample file:', err)
      toast.error('Error downloading sample file. Please try again.')
    }
  }

  const handleImportClick = () => {
    setOpenImportModal(true)
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    setSelectedFile(file)
  }

  useEffect(() => {
    fetchAssets(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize, filters])

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || []
    const selectedData = selectedNodes.map(node => node.data)
    setSelectedRows(selectedData)
  }, [])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Asset Code',
        field: 'assetcode',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: params => (
          <Typography
            sx={{
              fontSize: '0.875rem'
            }}
          >
            {params.value || 'N/A'}
          </Typography>
        ),
        filter: 'agTextColumnFilter'
      },

      {
        headerName: 'Asset Name',
        field: 'assetname',
        cellRenderer: params => params.value,
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
        valueGetter: params => params.data.location || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Category',
        field: 'category',
        valueGetter: params => params.data.category || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Capitalization Date',
        field: 'capitalizationDate',
        filter: 'agDateColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Capitalization Price',
        field: 'capitalizationPrice',
        filter: 'agNumberColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Shift',
        field: 'shift_name',
        filter: true,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Lifetime (Months)',
        field: 'assetlife',
        valueGetter: params => params.data.assetlife || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' },
        cellRenderer: params => (
          <Chip
            label={params.value || 'N/A'}
            variant='tonal'
            color={params.value === 'active' ? 'success' : params.value === 'inactive' ? 'error' : 'warning'}
            size='small'
          />
        ),
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Brand',
        field: 'brand',
        valueGetter: params => params.data.brand || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Model',
        field: 'model',
        valueGetter: params => params.data.model || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Vendor',
        field: 'vendor_name',
        valueGetter: params => params.data.vendor_name || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Department',
        field: 'department_name',
        valueGetter: params => params.data.department_name || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Allotted To',
        field: 'alloted_username',
        valueGetter: params => params.data.alloted_username || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Created by',
        field: 'Createdby',
        valueGetter: params => params.data.Createdby || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'CreatedDate',
        valueGetter: params => params.data.CreatedDate || 'N/A',
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue || typeof cellValue !== 'string' || cellValue === 'N/A') return 0
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
      }
    ],
    [locale, router]
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

  const handleExport = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.post(
        '/assetReport/download',
        {
          filters, // ✅ pass filters in body
          search: globalFilter
        },
        {
          responseType: 'blob'
        }
      )

      // Create blob and URL
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // ✅ Dynamic filename like GET version
      const fileName = `Asset_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      link.setAttribute('download', fileName)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Export successful!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error(error?.response?.data?.message || 'Error exporting data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterApply = useCallback(activeFilters => {
    setFilters(activeFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)

      if (value) {
        const lower = value.toLowerCase()
        const filtered = rowData.filter(
          item =>
            (item.assetname && item.assetname.toLowerCase().includes(lower)) ||
            (item.assetcode && item.assetcode.toLowerCase().includes(lower)) ||
            (item.location && item.location.toLowerCase().includes(lower)) ||
            (item.category && item.category.toLowerCase().includes(lower)) ||
            (item.status && item.status.toLowerCase().includes(lower)) ||
            (item.brand && item.brand.toLowerCase().includes(lower)) ||
            (item.model && item.model.toLowerCase().includes(lower)) ||
            (item.vendor_name && item.vendor_name.toLowerCase().includes(lower)) ||
            (item.department_name && item.department_name.toLowerCase().includes(lower)) ||
            (item.alloted_username && item.alloted_username.toLowerCase().includes(lower)) ||
            (item.shift_name && item.shift_name.toLowerCase().includes(lower)) || // ✅ add shift
            (item.assetlife && String(item.assetlife).toLowerCase().includes(lower)) || // ✅ add asset life
            (item.capitalizationDate && item.capitalizationDate.toLowerCase().includes(lower)) || // ✅ add capitalization date
            (item.capitalizationPrice && String(item.capitalizationPrice).toLowerCase().includes(lower)) || // ✅ add capitalization price
            (item.Createdby && item.Createdby.toLowerCase().includes(lower)) || // ✅ add created by
            (item.CreatedDate && item.CreatedDate.toLowerCase().includes(lower))
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(rowData)
      }
    },
    [rowData]
  )

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`asset/${selectedAsset.id}`)
      setRowData(prevData => prevData.filter(asset => asset.id !== selectedAsset.id))
      setFilteredData(prevData => prevData.filter(asset => asset.id !== selectedAsset.id))
      setOpenConfirm(false)
      toast.success('Asset deleted successfully!')
    } catch (err) {
      console.error('Error deleting asset:', err)
      setError('Error deleting asset. Please try again.')
      toast.error('Error deleting asset. Please try again.')
    }
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  if (loading) {
    return (
      <Card className='flex flex-col'>
        <div className='flex items-center justify-center p-10'>
          <Typography variant='body1'>Loading assets...</Typography>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className='flex flex-col'>
        {/* <CardHeader title='Assets Report Table' /> */}
        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        <div className='flex flex-col'>
          <AssetStatusFilter
            setData={setFilteredData}
            productData={rowData}
            onFilterApply={handleFilterApply}
            appliedFilters={filters}
            selectedRows={selectedRows}
          />
          <Divider />
        </div>
        <div className='flex flex-col p-5 gap-4'>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search Asset'
              className='max-sm:w-full'
            />
            <div className='flex items-center max-sm:flex-col gap-4 max-sm:w-full'>
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
          <div>
            <AgGridWrapper
              rowData={filteredData}
              columnDefs={columnDefs}
              onSelectionChanged={onSelectionChanged}
              gridRef={gridRef}
              rowSelection='multiple'
              domLayout='autoHeight'
            />
          </div>

          <div className='flex justify-between items-center py-4 flex-wrap gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Rows per page:</span>
              <TextField
                select
                size='small'
                value={pagination.pageSize}
                onChange={e => {
                  const newSize = parseInt(e.target.value)
                  setCookie('assetPageSize', newSize)
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
        </div>

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this asset?</DialogContent>
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
    </>
  )
}

export default AssetReportTable
