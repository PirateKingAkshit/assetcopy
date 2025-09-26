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
  MenuItem
} from '@mui/material'
import classnames from 'classnames'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import { setCookie, getCookie } from 'cookies-next'

import 'ag-grid-community/styles/ag-theme-material.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import axiosInstance from '@/utils/axiosinstance'

import tableStyles from '@core/styles/table.module.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import { toast } from 'react-toastify'

import AssetTransferButton from './transferButton'




ModuleRegistry.registerModules([AllCommunityModule])

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
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
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const TransferListTable = () => {

  
  const defaultPageSize =
  typeof window !== 'undefined'
    ? parseInt(getCookie('assetPageSize')) || 10
    : 10

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
        const allAssets = response.data.data.map(asset => {
          const createdDate = asset.created_date || null
          return { 
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
          modelId: asset.model?._id || null,
          image: asset.file_attached ? `${asset.file_attached}` : null,
          createdDate: createdDate ? formatDate(createdDate) : '',
          }
        })

        let filteredAssets = allAssets
        if (Object.keys(filters).length > 0) {
          filteredAssets = allAssets.filter(asset => {
            return (
              (!filters.category || asset.categoryId === filters.category) &&
              (!filters.location || asset.locationId === filters.location) &&
              (!filters.status || asset.statusId === filters.status) &&
              (!filters.brand || asset.brandId === filters.brand) &&
              (!filters.model || asset.modelId === filters.model)
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

        // if (response.data.pagination) {
        //   setPagination(prev => ({
        //     ...prev,
        //     totalItems: response.data.pagination.totalItems,
        //     totalPages: Math.ceil(response.data.pagination.totalItems / pageSize),
        //     currentPage: page,
        //     pageSize
        //   }))
        // }
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


  const handleFileUpload = async event => {
    const file = event.target.files[0]
    if (!file) {
      toast.error('Please select a file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.post('/asset/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.status === 200) {
  const { successMessage, errorMessage } = response.data.data || {}


  toast.success(response.data.message || 'Assets imported successfully!')


  if (successMessage) {
    toast.success(successMessage)
  }


  if (errorMessage) {
    toast.error(errorMessage)
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


  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
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
        headerName: '',
        field: 'select',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        maxWidth: 60,
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center' }
      },
      // {
      //   headerName: 'Asset Photo',
      //   field: 'assetphoto',
      //   cellRenderer: params =>
      //     params.data.image ? (
      //       <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      //         <img
      //           src={params.data.image}
      //           alt='Asset'
      //           style={{
      //             height: '40px',
      //             width: '50px',
      //             objectFit: 'cover',
      //             borderRadius: '4px'
      //           }}
      //           onError={e => {
      //             e.target.onerror = null
      //             e.target.src = '/images/placeholder.png'
      //             e.target.style.objectFit = 'contain'
      //             e.target.style.padding = '8px'
      //           }}
      //         />
      //       </div>
      //     ) : (
      //       <Typography variant='caption' color='text.secondary'>
      //         No Photo
      //       </Typography>
      //     ),
      //   width: 100,
      //   filter: false,
      //   sortable: false
      // },
      {
        headerName: 'Asset Code',
        field: 'assetcode',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: params => (
          <Typography
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': { color: 'primary.dark' }
            }}
            onClick={() => router.push(`/${locale}/asset-managements/view-asset/${params.data.id}`)}
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
      headerName: 'Created Date', 
      field: 'createdDate', 
      // valueGetter: params => params.data.CreatedDate || 'N/A',
      filter: 'agDateColumnFilter',
      filterParams: {
        filterOptions: ['equals', 'lessThan', 'greaterThan'],
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          // Handle null or undefined cell values
          if (!cellValue || typeof cellValue !== 'string') return 0;

          // Parse cellValue (assuming DD-MM-YYYY format)
          const dateParts = cellValue.split('-');
          if (dateParts.length !== 3) return 0; // Invalid date format
          const cellDate = new Date(
            parseInt(dateParts[2], 10), // Year
            parseInt(dateParts[1], 10) - 1, // Month (0-based)
            parseInt(dateParts[0], 10) // Day
          );

          // Validate parsed date
          if (isNaN(cellDate.getTime())) return 0;

          // Normalize both dates to midnight for exact comparison
          const normalizedCellDate = new Date(
            cellDate.getFullYear(),
            cellDate.getMonth(),
            cellDate.getDate(),
            0, 0, 0, 0
          );
          const normalizedFilterDate = new Date(
            filterLocalDateAtMidnight.getFullYear(),
            filterLocalDateAtMidnight.getMonth(),
            filterLocalDateAtMidnight.getDate(),
            0, 0, 0, 0
          );

          // Compare using timestamps for precise equality
          if (normalizedCellDate.getTime() < normalizedFilterDate.getTime()) return -1;
          if (normalizedCellDate.getTime() > normalizedFilterDate.getTime()) return 1;
          return 0;
        }
      },
      cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
    },
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton
              size='small'
              onClick={() => router.push(`/${locale}/asset-managements/edit-asset/${params.data.id}`)}
              className='hover:bg-blue-50'
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => router.push(`/${locale}/asset-managements/view-asset/${params.data.id}`)}
              className='hover:bg-yellow-50'
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedAsset(params.data)
                setOpenConfirm(true)
              }}
              className='hover:bg-red-50'
            >
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        ),
        maxWidth: 150
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

  const handleExport = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: 'assets.csv',
        columnKeys: ['assetcode', 'assetname', 'location', 'category', 'status', 'brand', 'model', 'CreatedDate']
      })
    }
  }

  const handleTransfer = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to transfer.')
      return
    }

    const selectedIds = selectedRows.map(row => row.id).join(',')
    router.push(`/${locale}/asset-managements/asset-transfer?ids=${selectedIds}`)
  }

   const handleSticker = async () => {
     if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to generate stickers.')
      return
    }

    try {
      const selectedIds = selectedRows.map(row => row.id)
      const response = await axiosInstance.post('/sticker', { asset: selectedIds })
      if (response.data.status === 200) {
        const stickerData = response.data.data
        console.log('Sticker Data:', stickerData)
        toast.success('Stickers generated successfully.')
        const selectedIdsQuery = selectedIds.join(',')
        router.push(`/${locale}/asset-managements/genrate-sticker?ids=${selectedIdsQuery}`)
      } else {
        throw new Error(response.data.message || 'Failed to generate stickers')
      }
    } catch (err) {
      console.error('Error generating stickers:', err)
      toast.error('Error generating stickers. Please try again.')
    }
  }

  const handleFilterApply = useCallback(activeFilters => {
    setFilters(activeFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page on filter change
  }, [])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)

      if (value) {
        const filtered = rowData.filter(
          item =>
            (item.assetname && item.assetname.toLowerCase().includes(value.toLowerCase())) ||
            (item.assetcode && item.assetcode.toLowerCase().includes(value.toLowerCase())) ||
            (item.location && item.location.toLowerCase().includes(value.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(value.toLowerCase())) ||
            (item.status && item.status.toLowerCase().includes(value.toLowerCase())) ||
            (item.brand && item.brand.toLowerCase().includes(value.toLowerCase())) ||
            (item.model && item.model.toLowerCase().includes(value.toLowerCase())) ||
            (item.CreatedDate && item.CreatedDate.toLowerCase().includes(value.toLowerCase()))
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
      <Card className='flex-flex-col'>
        <div className='flex items-center justify-center p-10'>
          <Typography variant='body1'>Loading assets...</Typography>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className='flex flex-col'>
        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        <div className='flex flex-col'>
          <AssetTransferButton
            setData={setFilteredData}
            productData={rowData}
            onFilterApply={handleFilterApply}
            appliedFilters={filters}
            selectedRows={selectedRows}
            onTransfer={handleTransfer}
            onSticker={handleSticker}
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
              {/* <Button
                color='primary'
                variant='outlined'
                className='max-sm:w-full'
                startIcon={<i className='ri-download-2-line' />}
                onClick={handleImportClick}
              >
                Import
              </Button> */}
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept='.csv,.xlsx'
                onChange={handleFileUpload}
              />
              {/* <Button variant='outlined' color='secondary' onClick={handleExport}>
                Export
              </Button> */}
              {/* <Button
                variant='contained'
                color='primary'
                className='max-sm:w-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => router.push(`/${locale}/asset-managements/add-asset`)}
              >
                Add Asset
              </Button> */}
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
  if (typeof window !== 'undefined') {
    setCookie('assetPageSize', newSize)
  }
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

export default TransferListTable
