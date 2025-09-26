'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Card,
  CardHeader,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Pagination,
  MenuItem,
  Typography
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { getCookie, setCookie } from 'cookies-next'

import axiosInstance from '@/utils/axiosinstance'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);

import WDVAddDrawer from './addDepreciation'
import WDVEditDrawer from './editDepereciation'

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const WDVListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('menuPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
    const [importErrors, setImportErrors] = useState([])
    const [openErrorDialog, setOpenErrorDialog] = useState(false)
      const [successMessage, setSuccessMessage] = useState('')
      const [errorMessage, setErrorMessage] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [openImportModal, setOpenImportModal] = useState(false)

  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
    const [error, setError] = useState(null)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  // const fetchData = async (page = 1, pageSize = defaultPageSize) => {
  //   try {
  //     setLoading(true)

  //     const response = await axiosInstance.get('rates/all', {
  //       params: { page, limit: pageSize }
  //     })

  //     if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
  //       const mappedData = response.data.data.map(item => ({
  //         id: item._id?.toString(),
  //         life: item.life,
  //         slmValue: item.slm_value?.$numberDecimal || item.slm_value,
  //         wdvValue: item.wdv_value?.$numberDecimal || item.wdv_value,
  //         createdDate: item.created_date || new Date().toISOString()
  //       }))

  //       setData(mappedData)
  //       setFilteredData(mappedData)

  //       const paginationData = response.data.pagination || {}
  //       setPagination(prev => ({
  //         ...prev,
  //         currentPage: page,
  //         pageSize,
  //         totalItems: paginationData.totalItems || mappedData.length,
  //         totalPages: Math.ceil((paginationData.totalItems || mappedData.length) / pageSize)
  //       }))
  //     } else {
  //       toast.error(response.data.message || 'Failed to fetch depreciation data.')
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Error fetching data.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchData = async (page = 1, pageSize = defaultPageSize) => {
    try {
      setLoading(true)

      const response = await axiosInstance.get('rates/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200 && Array.isArray(response.data?.data?.rates)) {
        const rates = response.data.data.rates
        const mappedData = rates.map(item => ({
          id: item._id?.toString(),
          life: item.life,
          slmValue: item.slm_value?.$numberDecimal || item.slm_value,
          wdvValue: item.wdv_value?.$numberDecimal || item.wdv_value,
          createdDate: item.created_date || new Date().toISOString()
        }))

        setData(mappedData)
        setFilteredData(mappedData)

        const paginationData = response.data.pagination || {}
        setPagination({
          currentPage: page,
          pageSize,
          totalItems: paginationData.totalItems || mappedData.length,
          totalPages: Math.ceil((paginationData.totalItems || mappedData.length) / pageSize)
        })
      } else {
        toast.error(response.data?.message || 'Failed to fetch depreciation data.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pagination.currentPage && pagination.pageSize) {
      fetchData(pagination.currentPage, pagination.pageSize)
    }
  }, [pagination.currentPage, pagination.pageSize])

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Life (Months)',
        field: 'life',
        width: 250,
        filter: 'agNumberColumnFilter',
        cellStyle: cellStyleDefault
      },
      {
        headerName: 'SLM Value',
        field: 'slmValue',
        width: 250,
        filter: 'agNumberColumnFilter',
        cellStyle: cellStyleDefault
      },
      {
        headerName: 'WDV Value',
        field: 'wdvValue',
        width: 250,
        filter: 'agNumberColumnFilter',
        cellStyle: cellStyleDefault
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 250,
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
                setOpenConfirm(true)
              }}
            >
              <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`rates/${selectedRow.id}`)

      if (response.data?.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'Rate deleted successfully!')
      } else {
        toast.error(response.data.message || 'Failed to delete rate.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting rate.')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }
  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/wdv.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'wdv.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('wdv file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading wdv file:', err)
      toast.error('Error downloading wdv file. Please try again.')
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

      const response = await axiosInstance.post('/rates/import-csv', formData, {
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
  const handleFilterChange = value => {
    setGlobalFilter(value)

    if (value) {
      const filtered = data.filter(
        item =>
          item.life.toString().includes(value.toLowerCase()) ||
          item.slmValue.toString().includes(value.toLowerCase()) ||
          item.wdvValue.toString().includes(value.toLowerCase())
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
        <CardHeader title='Depreciation Rates' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search' />
          <div className='flex items-center max-sm:flex-col gap-4'>
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
              className='max-sm:w-full'
              onClick={() => setCustomerUserOpen(true)}
              startIcon={<i className='ri-add-line' />}
            >
              Add Depreciation
            </Button>
          </div>
        </div>

        <div className='px-6'>
          <AgGridWrapper rowData={filteredData} columnDefs={columnDefs} domLayout='autoHeight' />
        </div>

        <div className='flex justify-between items-center px-6 py-4 flex-wrap gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Rows per page:</span>
            <TextField
              select
              size='small'
              value={pagination.pageSize}
              onChange={e => {
                const newSize = parseInt(e.target.value)
                if (typeof window !== 'undefined') {
                  setCookie('menuPageSize', newSize)
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

        <WDVAddDrawer open={customerUserOpen} handleClose={() => setCustomerUserOpen(false)} fetchData={fetchData} />
        <WDVEditDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          fetchData={fetchData}
          menuId={selectedRow?.id}
        />

        <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth='xs' fullWidth>
          <DialogTitle>Import WDV Rates</DialogTitle>
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
          <DialogContent>Are you sure you want to delete this rate?</DialogContent>
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

const cellStyleDefault = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  fontSize: '0.875rem',
  color: '#000000'
}

export default WDVListTable
