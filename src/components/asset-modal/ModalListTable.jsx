'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
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
  Typography,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material'

// Third-party Imports
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { getCookie, setCookie } from 'cookies-next'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'

import axiosInstance from '@/utils/axiosinstance'

// Component Imports
import ModalFilter from './ModalFilter'
import AssetAddModalDrawer from './ModalAddDrawer'
import AssetEditModalDrawer from './ModalEditDrawer'
import AssetViewModalDrawer from './ModalViewDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'
//import PaginationComponent from './PaginationComponent'; // Import the reusable PaginationComponent

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

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
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const ModalListTable = () => {
  const defaultPageSize = parseInt(getCookie('modelPageSize')) || 10

  const { lang: locale } = useParams()
    const fileInputRef = useRef(null)
    

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
    const [openImportModal, setOpenImportModal] = useState(false)
     const [importErrors, setImportErrors] = useState([])
    const [openErrorDialog, setOpenErrorDialog] = useState(false)
     const [error, setError] = useState(null)
      const [successMessage, setSuccessMessage] = useState('')
      const [errorMessage, setErrorMessage] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [categoryEditUserOpen, setCategoryEditUserOpen] = useState(false)
  const [categoryViewUserOpen, setCategoryViewUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  // Fetch data from API
  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('model/all', {
        params: { page, limit: pageSize }
      })

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => {
          const createdDate = item.created_date || null
          return {
            id: item._id,
            modelName: item.model_name || 'N/A',
            brandName: item.brand?.name || 'N/A',
            status: item.status, // Keep as boolean
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
        toast.error('Failed to fetch models')
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to fetch models: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await axiosInstance.delete(`model/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        // Update table immediately
        setData(prevData => prevData.filter(item => item.id !== selectedRowId))
        setFilteredData(prevData => prevData.filter(item => item.id !== selectedRowId))

        toast.success(response.data.message || 'Model deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete model')
      }
    } catch (error) {
      console.error('Error deleting model:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to delete model: ${errorMessage}`)
      }
    }
    setOpenConfirm(false)
    setSelectedRowId(null)
  }, [selectedRowId])

  const handleEditClick = useCallback(id => {
    setSelectedRowId(id)
    setCategoryEditUserOpen(true)
  }, [])

  const handleViewClick = useCallback(id => {
    setSelectedRowId(id)
    setCategoryViewUserOpen(true)
  }, [])

  const handleDeleteClick = useCallback(id => {
    setSelectedRowId(id)
    setOpenConfirm(true)
  }, [])

  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/model.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'model.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Sample file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading sample file:', err)
      toast.error('Error downloading sample file. Please try again.')
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
  
        const response = await axiosInstance.post('/model/import-csv', formData, {
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
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Model Name',
        field: 'modelName',
        width: 230,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.modelName,

        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Brand',
        field: 'brandName',
        width: 230,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.brandName,

        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },

      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['Active', 'Inactive'],
          suppressSelectAll: true
        },
        cellRenderer: params => (
          <Chip
            label={params.data.status ? productStatusObj?.Active?.title : productStatusObj?.Inactive?.title}
            variant='tonal'
            color={params.data.status ? productStatusObj?.Active?.color : productStatusObj?.Inactive?.color}
            size='small'
          />
        ),
        headerClass: 'header-spacing',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px'
        }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 200,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
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
        width: 230,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            <IconButton size='small' onClick={() => handleEditClick(params.data.id)} className='hover:bg-blue-50'>
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleViewClick(params.data.id)} className='hover:bg-yellow-50'>
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteClick(params.data.id)} className='hover:bg-red-50'>
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        ),
        headerClass: 'header-spacing',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px'
        }
      }
    ],
    []
  )

const handleFilterChange = useCallback(
  value => {
    setGlobalFilter(value)
    if (value) {
      const searchValue = value.toLowerCase()
      const filtered = data.filter(
        item =>
          (item.modelName || '').toLowerCase().includes(searchValue) ||
          (item.brandName || '').toLowerCase().includes(searchValue) ||
          (item.status ? 'active' : 'inactive').toLowerCase().includes(searchValue) ||
          (item.createdBy || '').toLowerCase().includes(searchValue) ||
          (item.createdDate || '').toLowerCase().includes(searchValue)   // ✅ Fix here
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
        <div className='flex flex-col'>
          <CardHeader title='Asset Model' />
          {/* <ModalFilter setData={setFilteredData} productData={data} /> */}
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search Model'
              className='max-sm:is-full'
            />
            <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
              {/* <Button
                color='secondary'
                variant='outlined'
                className='max-sm:is-full is-auto'
                startIcon={<i className='ri-upload-2-line' />}
              >
                Export
              </Button> */}

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
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => setCustomerUserOpen(!customerUserOpen)}
              >
                Add Model
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
            storageKey='modelPageSize'
          />
        </div>

        <AssetAddModalDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(!customerUserOpen)}
          setData={setData}
          customerData={data}
           fetchData={fetchData} // Added fetchData prop
        />
        <AssetEditModalDrawer
          open={categoryEditUserOpen}
          handleClose={() => setCategoryEditUserOpen(false)}
          setData={setData}
          customerData={data}
          categoryId={selectedRowId}
        />
        <AssetViewModalDrawer
          open={categoryViewUserOpen}
          handleClose={() => setCategoryViewUserOpen(false)}
          customerData={data}
          categoryId={selectedRowId}
        />
          <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth='xs' fullWidth>
                  <DialogTitle>Import Models</DialogTitle>
                  <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Typography variant='body2' color='text.secondary' style={{ fontWeight: 500, width: '80px' }}>
                          Sample File:
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
          <DialogContent>Are you sure you want to delete?</DialogContent>
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

export default ModalListTable
