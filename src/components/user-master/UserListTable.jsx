'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { getCookie, setCookie } from 'cookies-next'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { Trash2 } from 'lucide-react'

import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Component Imports
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import UserEditDrawer from './userEditDrawer'
import UserAddDrawer from './userAddDrawer'
import UserViewDrawer from './userViewDrawer'

// Register AG Grid Community Modules
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

const UserListTable = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const fileInputRef = useRef(null)

  const getInitialPageSize = () => {
    const saved = getCookie('userPageSize')
    return saved ? parseInt(saved) : 10
  }

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [importErrors, setImportErrors] = useState([])
  const [openErrorDialog, setOpenErrorDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [error, setError] = useState(null)
  const [categoryEditUserOpen, setCategoryEditUserOpen] = useState(false)
  const [categoryViewUserOpen, setCategoryViewUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: getInitialPageSize()
  })

  const fetchTaxes = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('user/all', {
          params: { page, limit: pageSize }
        })
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          const mappedData = response.data.data.map(item => {
            const createdDate = item.created_date || null
            return {
              id: item._id,
              user_name: item.user_name || 'N/A',
              role_name: item.role?.role_name || 'N/A',
              role_id: item.role?._id || 'N/A',
              email: item.email || 'N/A',
              mobile: item.mobile || 'N/A',
              is_admin: item.is_admin ? 'Yes' : 'No',
              reported_to: item.reported_to?.user_name || 'N/A',
              department: item.department?.department || 'N/A',
              status: item.status,
              createdBy: item.created_by?.user_name || 'Unknown',
              createdDate: createdDate ? formatDate(createdDate) : ''
            }
          })
          setData(mappedData)
          setFilteredData(mappedData)
          setPagination(response.data.pagination)
        } else {
          toast.error('Invalid API response')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(`Failed to fetch users: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    },
    [pagination.pageSize]
  )

  useEffect(() => {
    fetchTaxes(pagination.currentPage, pagination.pageSize)
  }, [fetchTaxes, pagination.currentPage, pagination.pageSize])

  const handlePermissionClick = useCallback(
    (userId, roleId) => {
      router.push(`/${locale}/role-permissions?user=${userId}&role=${roleId}`)
    },
    [router, locale]
  )

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

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRowId) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`user/${selectedRowId}`)
      if (response.data.status === 200 || response.status === 204) {
        toast.success(response.data.message || 'User deleted successfully')
        fetchTaxes(pagination.currentPage, pagination.pageSize)
      } else {
        toast.error(response.data.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(`Failed to delete user: ${errorMessage}`)
      }
    } finally {
      setOpenConfirm(false)
      setSelectedRowId(null)
      setDeleteLoading(false)
    }
  }, [selectedRowId, pagination.currentPage, pagination.pageSize, fetchTaxes])

  const handleFilterChange = useCallback(
    value => {
      setGlobalFilter(value)
      if (value) {
        const searchValue = value.toLowerCase()
        const filtered = data.filter(
          item =>
            (item.user_name || '').toLowerCase().includes(searchValue) ||
            (item.role_name || '').toLowerCase().includes(searchValue) ||
            (item.email || '').toLowerCase().includes(searchValue) ||
            (item.mobile || '').toLowerCase().includes(searchValue) ||
            (item.department || '').toLowerCase().includes(searchValue) ||
            (item.is_admin || '').toLowerCase().includes(searchValue) ||
            (item.reported_to || '').toLowerCase().includes(searchValue) ||
            (item.createdBy || '').toLowerCase().includes(searchValue) ||
            (item.status?.toString() || '').toLowerCase().includes(searchValue) ||
            (item.role_id || '').toLowerCase().includes(searchValue) ||
            (item.createdDate || '').toLowerCase().includes(searchValue) // ✅ FIXED
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(data)
      }
    },
    [data]
  )

  const handleDownloadSample = async () => {
    try {
      const sampleFileUrl = '/user.csv'
      const link = document.createElement('a')
      link.href = sampleFileUrl
      link.download = 'user.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('user file downloaded successfully.')
    } catch (err) {
      console.error('Error downloading user file:', err)
      toast.error('Error downloading user file. Please try again.')
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

      const response = await axiosInstance.post('/user/import-csv', formData, {
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

        await fetchTaxes(pagination.currentPage, pagination.pageSize)
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
        headerName: 'User Name',
        field: 'user_name',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.user_name,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Role',
        field: 'role_name',
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.role_name,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.email,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Mobile',
        field: 'mobile',
        width: 250,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'endsWith'],
          suppressAndOrCondition: true
        },
        cellRenderer: params => params.data.mobile,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Department',
        field: 'department',
        width: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: params => params.data.department,
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['true', 'false'],
          suppressSelectAll: true
        },
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title || params.data.status}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color || 'default'}
            size='small'
          />
        ),
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px' }
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
            if (!cellValue || typeof cellValue !== 'string') return 0
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
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 200,
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
            {/* <IconButton size='small' onClick={() => handlePermissionClick(params.data.id, params.data.role_id)} className='hover:bg-purple-50'>
              <i className='ri-shield-user-line text-lg text-purple-500 hover:text-purple-600' />
            </IconButton> */}
          </div>
        ),
        headerClass: 'header-spacing',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px' }
      }
    ],
    [handleEditClick, handleViewClick, handleDeleteClick, handlePermissionClick]
  )

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
          <CardHeader title='User List' />
          <Divider />
        </div>

        <div>
          <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
            <DebouncedInput
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder='Search user'
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
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => setCustomerUserOpen(true)}
              >
                Add User
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
                  setCookie('userPageSize', newSize)
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
              onChange={(e, page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            />
          </div>
        </div>

        <UserAddDrawer
          open={customerUserOpen}
          handleClose={() => setCustomerUserOpen(false)}
          setData={setData}
          setFilteredData={setFilteredData}
          customerData={data}
          refreshData={fetchTaxes}
        />
        <UserEditDrawer
          open={categoryEditUserOpen}
          handleClose={() => setCategoryEditUserOpen(false)}
          setData={setData}
          customerData={data}
          taxId={selectedRowId}
          refreshData={fetchTaxes}
        />
        <UserViewDrawer
          open={categoryViewUserOpen}
          handleClose={() => setCategoryViewUserOpen(false)}
          customerData={data}
          taxId={selectedRowId}
        />
        
        <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth='xs' fullWidth>
          <DialogTitle>Import Users</DialogTitle>
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
          <DialogContent>Are you sure you want to delete this User?</DialogContent>
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

export default UserListTable
