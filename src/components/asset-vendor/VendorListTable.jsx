'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
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
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { getCookie, setCookie } from 'cookies-next'

import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import AssetViewVendorDrawer from './VendorViewDrawer'
import VendorEditDrawer from './VendorEditDrawer'
import AssetAddVendorDrawer from './VendorAddDrawer'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import PaginationComponent from '../pagination/pagination'

ModuleRegistry.registerModules([AllCommunityModule])

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
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

const VendorListTable = () => {
  const defaultPageSize = parseInt(getCookie('vendorPageSize')) || 10

  const { lang: locale } = useParams()
    const fileInputRef = useRef(null)

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
   const [openImportModal, setOpenImportModal] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
     const [importErrors, setImportErrors] = useState([])
    const [openErrorDialog, setOpenErrorDialog] = useState(false)
     const [error, setError] = useState(null)
      const [successMessage, setSuccessMessage] = useState('')
      const [errorMessage, setErrorMessage] = useState('')
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

  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('vendor/all', {
          params: { page, limit: pageSize }
        })

        if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => {
            const createdDate = item.created_date || null
            return {
              id: item._id,
              categoryName: item.vendor_name,
              parentCategory: item.vendor_code || 'None',
              email: item.email,
              contact_person_name: item.contact_person_name,
              contact_person_mobile: item.contact_person_mobile,
              address: item.address || '',
              city: item.city,
              state: item.state,
              pincode: item.pincode,
              country: item.country,
              reg_certificate: item.reg_certificate,
              status: item.status.toString(),
              createdBy: item.created_by?.user_name || 'Unknown',
              createdDate: createdDate ? formatDate(createdDate) : '',
              updatedDate: item.updated_date
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
          //     pageSize: response.data.pagination.pageSize || pageSize
          //   })
          // }
        } else {
          toast.error(response.data?.message || 'Failed to fetch vendor data.')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(error.response?.data?.message || 'Error fetching vendor data.')
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage, pagination.pageSize])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Vendor Name',
        field: 'categoryName',
        width: 200,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
        suppressMenu: true,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Vendor Code',
        field: 'parentCategory',
        width: 200,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
        suppressMenu: true,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
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
        suppressMenu: true,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        width: 200,
        filter: 'agTextColumnFilter',
        headerClass: 'header-spacing',
        suppressMenu: true,
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
        width: 200,
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
            >
              <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setCategoryViewOpen(true)
              }}
            >
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedRow(params.data)
                setOpenConfirm(true)
              }}
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`vendor/${selectedRow.id}`)

      if (response.data.status === 200) {
        setData(prev => prev.filter(item => item.id !== selectedRow.id))
        setFilteredData(prev => prev.filter(item => item.id !== selectedRow.id))
        toast.success(response.data.message || 'Vendor deleted successfully.')
      } else {
        toast.error(response.data?.message || 'Failed to delete vendor.')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error(error.response?.data?.message || 'An error occurred during deletion.')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }, [selectedRow])


  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/vendor.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'vendor.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('vendor file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading vendor file:', err)
      toast.error('Error downloading vendor file. Please try again.')
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
  
        const response = await axiosInstance.post('/vendor/import-csv', formData, {
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
  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const filtered = data.filter(
          item =>
            item.categoryName.toLowerCase().includes(value.toLowerCase()) ||
            item.parentCategory.toLowerCase().includes(value.toLowerCase()) ||
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
          <CardHeader title='Asset Vendor' />
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col sm:flex-row gap-y-4 p-5'>
            <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Vendor' />
            <div className='flex gap-4'>
              {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
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
                className='max-sm:is-full'
                onClick={() => setCustomerUserOpen(true)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Vendor
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
        </div>

        <AssetAddVendorDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          customerData={data}
           fetchData={fetchData} // Added fetchData prop
        />

        <VendorEditDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          setData={setData}
          vendorId={selectedRow?.id}
          vendorData={data}
        />

        <AssetViewVendorDrawer
          open={categoryViewOpen}
          handleClose={() => setCategoryViewOpen(false)}
          categoryData={selectedRow}
        />


  <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth='xs' fullWidth>
                  <DialogTitle>Import Vendors</DialogTitle>
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
          <DialogContent>Are you sure you want to delete this vendor?</DialogContent>
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

export default VendorListTable
