'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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
  Typography
} from '@mui/material'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import axiosInstance from '@/utils/axiosinstance'
import BrandEditDrawer from './BrandEditDrawer'
import BrandViewDrawer from './BrandViewDrawer'
import BrandAddDrawer from './BrandAddDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'
import { getCookie, setCookie } from 'cookies-next'

ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
}

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

const BrandListTable = () => {
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
    const fileInputRef = useRef(null)
  

  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const [data, setData] = useState([])
  const [openImportModal, setOpenImportModal] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
    const [importErrors, setImportErrors] = useState([])
      const [openErrorDialog, setOpenErrorDialog] = useState(false)
        const [successMessage, setSuccessMessage] = useState('')
        const [errorMessage, setErrorMessage] = useState('')
          const [error, setError] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  })

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('brandPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  // Sync pagination.pageSize when defaultPageSize updates
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: defaultPageSize
    }))
  }, [defaultPageSize])

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('brand/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          return {
            id: item._id,
            categoryName: item.name,
            status: item.status.toString(),
            createdBy: item.created_by?.user_name || 'Unknown',
            createdDate: createdDate ? formatDate(createdDate) : ''
          }
        })
        setPagination(response.data.pagination)
        setData(mappedData)
        setFilteredData(mappedData)

        // if (response.data.pagination) {
        //   setPagination({
        //     totalItems: response.data.pagination.totalItems || 0,
        //     totalPages: response.data.pagination.totalPages || 1,
        //     currentPage: response.data.pagination.currentPage || 1,
        //     pageSize: response.data.pagination.pageSize || pageSize,
        //   });
        // }
      } else {
        toast.error(response.data?.message || 'Failed to fetch brand data.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Error fetching brand data.')
      console.error('Error fetching data:', error)
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
        headerName: 'Brand Name',
        field: 'categoryName',
        width: 250,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 250,
        filter: 'agSetColumnFilter',
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color}
            size='small'
          />
        ),
        headerClass: 'header-spacing',
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
        width: 250,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '0.875rem',
          color: '#000000'
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
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
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 240,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryEditOpen(true)
              }}
              className='hover:bg-blue-50'
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryViewOpen(true)
              }}
              className='hover:bg-yellow-50'
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
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
        headerClass: 'header-spacing'
      }
    ],
    []
  )
  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/brand.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'brand.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('brand file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading brand file:', err)
      toast.error('Error downloading brand file. Please try again.')
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

      const response = await axiosInstance.post('brand/import-csv', formData, {
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

        await fetchData(pagination.currentPage, pagination.pageSize)
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
  const handleFileChange = event => {
    const file = event.target.files[0]
    setSelectedFile(file)
  }
  const handleImportClick = () => {
    setOpenImportModal(true)
  }
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`brand/${selectedRow.id}`)

      if (response.data?.status === 200) {
        toast.success(response.data.message || 'Brand deleted successfully')
        setData(prev => prev.filter(item => item.id !== selectedRow.id))
        setFilteredData(prev => prev.filter(item => item.id !== selectedRow.id))
      } else {
        toast.error(response.data?.message || 'Failed to delete brand.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Error deleting brand.')
      console.error('Error deleting brand:', error)
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }, [selectedRow])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(
          item =>
            item.categoryName.toLowerCase().includes(value.toLowerCase()) ||
            item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
            formatDate(item.createdDate).toLowerCase().includes(value.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
  )

  const handleCategoryUpdate = useCallback(updatedBrand => {
    setData(prev => prev.map(item => (item.id === updatedBrand.id ? updatedBrand : item)))
    setFilteredData(prev => prev.map(item => (item.id === updatedBrand.id ? updatedBrand : item)))
  }, [])

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handlePageSizeChange = useCallback(newSize => {
    setCookie('brandPageSize', newSize)
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
   
      <Card className='flex flex-col'>
        <CardHeader title='Asset Brand' />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter}
            onChange={handleFilterChange}
            placeholder='Search Brand'
            className='max-sm:is-full'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>

                <Button
                            color='primary'
                            variant='outlined'
                            className='max-sm:w-full'
                            startIcon={<i className='ri-download-2-line' />}
                            onClick={handleImportClick}
                          >
                            Import
                          </Button>
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => setCustomerUserOpen(true)}
              startIcon={<i className='ri-add-line' />}
            >
              Add Brand
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
          storageKey='brandPageSize'
        />

        <BrandAddDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          setFilteredData={setFilteredData}
           fetchData={fetchData} // Added fetchData prop
        />
        <BrandEditDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          setData={handleCategoryUpdate}
          customerData={data}
          categoryId={selectedRow?.id}
        />
        <BrandViewDrawer
          open={categoryViewOpen}
          handleClose={() => setCategoryViewOpen(false)}
          categoryData={selectedRow}
        />


  <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth='xs' fullWidth>
          <DialogTitle>Import Brands</DialogTitle>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant='body2' color='text.secondary' style={{ fontWeight: 500, width: '80px' }}>
                  Brand File:
                </Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<i className='ri-download-line' />}
                  onClick={handleDownloadSample}
                  style={{ textTransform: 'none' }}
                >
                  Download
                </Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant='body2' color='text.secondary' style={{ fontWeight: 500, width: '80px' }}>
                  Your File:
                </Typography>
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    type='file'
                    inputRef={fileInputRef}
                    inputProps={{ accept: '.csv,.xlsx' }}
                    onChange={handleFileChange}
                    fullWidth
                    size='small'
                    variant='outlined'
                  />
                  {selectedFile && (
                    <Typography variant='caption' color='text.secondary' style={{ marginTop: '8px', display: 'block' }}>
                      Chosen: {selectedFile.name}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImportModal(false)} color='error'>
              Cancel
            </Button>
            <Button onClick={handleFileUpload} color='primary' variant='contained' disabled={!selectedFile || loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

           <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)} maxWidth='sm' fullWidth>
                  <DialogTitle>Import Messages</DialogTitle>
                  <DialogContent>
                    {successMessage && (
                      <Typography variant='body1' color='success.main' sx={{ mb: 2 }}>
                        {successMessage}
                      </Typography>
                    )}
                    {errorMessage && (
                      <Typography variant='body1' color='error' sx={{ mb: 2 }}>
                        {errorMessage}
                      </Typography>
                    )}
                    {importErrors.length > 0 && (
                      <>
                        <Typography variant='body2' color='text.primary' sx={{ mb: 1, fontWeight: 500 }}>
                          Detailed Errors:
                        </Typography>
                      {importErrors.map((error, index) => (
  <Typography key={index} variant='body2' className='text-black' sx={{ mt: 1 }}>
    {error}
  </Typography>
))}

                      </>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        setOpenErrorDialog(false)
                        setOpenImportModal(false)
                        setSelectedFile(null)
                        setSuccessMessage('')
                        setErrorMessage('')
                        setImportErrors([])
                      }}
                      color='inherit'
                    >
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
        

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this Brand?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default BrandListTable
