'use client'

import { useEffect, useMemo, useState } from 'react'
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
  Pagination,
  MenuItem
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
import MenuAddDrawer from './addTicket'
import MenuEditDrawer from './editTicketDrawer'
import MenuViewDrawer from './viewTicketDrawer'

const productStatusObj = {
  true: { title: 'Active', color: 'success' },
  false: { title: 'Inactive', color: 'error' }
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const MenuListTable = () => {
  const [defaultPageSize, setDefaultPageSize] = useState(10)

  useEffect(() => {
    const storedPageSize = parseInt(getCookie('menuPageSize')) || 10
    setDefaultPageSize(storedPageSize)
  }, [])

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)
  const [categoryViewOpen, setCategoryViewOpen] = useState(false)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }))
  }, [defaultPageSize])

  const fetchData = async (page = 1, pageSize = defaultPageSize) => {
    try {
      setLoading(true)

      const response = await axiosInstance.get('menu/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200 && Array.isArray(response.data?.data)) {
        const mappedData = response.data.data.map(item => ({
          id: item._id?.toString(),
          menuName: item.menu_name,
          menuOrder: item.menu_order,
          icon: item.icon,
          parentMenu: item.parent_menu ? item.parent_menu.menu_name : 'None',
          status: item.status.toString(),
          createdBy: item.created_by?.user_name || 'Unknown',
          createdDate: item.created_date || new Date().toISOString()
        }))

        setData(mappedData)
        setFilteredData(mappedData)

        const paginationData = response.data.pagination || {}
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          pageSize,
          totalItems: paginationData.totalItems || mappedData.length,
          totalPages: Math.ceil((paginationData.totalItems || mappedData.length) / pageSize)
        }))
      } else {
        toast.error(response.data.message || 'Failed to fetch menu data.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching menus.')
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
        headerName: 'Menu Name',
        field: 'menuName',
        width: 200,
        filter: 'agTextColumnFilter',
        cellStyle: cellStyleDefault
      },
      {
        headerName: 'Parent Menu',
        field: 'parentMenu',
        width: 200,
        filter: 'agTextColumnFilter',
        cellStyle: cellStyleDefault
      },
      {
        headerName: 'Menu Order',
        field: 'menuOrder',
        width: 150,
        filter: 'agNumberColumnFilter',
        cellStyle: cellStyleDefault
      },
      // {
      //   headerName: 'Icon',
      //   field: 'icon',
      //   width: 150,
      //   filter: false,
      //   cellRenderer: params => (
      //     params.data.icon ? (
      //       <img src={params.data.icon} alt='Menu Icon' style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
      //     ) : <span>No Icon</span>
      //   ),
      //   cellStyle: cellStyleDefault
      // },
      {
        headerName: 'Icon',
        field: 'icon',
        width: 150,
        filter: false,
        cellRenderer: params => {
          const iconPath = params?.data?.icon
          const baseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL || 'http://assetsigma.com/backend/'

          return (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <img
                src={iconPath ? `${baseUrl}${iconPath}` : '/images/no-image.png'}
                alt='Menu Icon'
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )
        },
        cellStyle: cellStyleDefault
      },

      {
        headerName: 'Status',
        field: 'status',
        width: 150,
        filter: 'agTextColumnFilter',
        cellRenderer: params => (
          <Chip
            label={productStatusObj[params.data.status]?.title}
            variant='tonal'
            color={productStatusObj[params.data.status]?.color}
            size='small'
          />
        ),
        cellStyle: cellStyleDefault
      },
     
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 200,
        valueFormatter: params => {
          const date = new Date(params.value)
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
        },
        cellStyle: cellStyleDefault
      },
    
    ],
    []
  )

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return

    try {
      setDeleteLoading(true)
      const response = await axiosInstance.delete(`menu/${selectedRow.id}`)

      if (response.data?.status === 200) {
        fetchData(pagination.currentPage, pagination.pageSize)
        toast.success(response.data.message || 'Menu deleted successfully!')
      } else {
        toast.error(response.data.message || 'Failed to delete menu.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting menu.')
    } finally {
      setOpenConfirm(false)
      setSelectedRow(null)
      setDeleteLoading(false)
    }
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleFilterChange = value => {
    setGlobalFilter(value)

    if (value) {
      const filtered = data.filter(
        item =>
          item.menuName.toLowerCase().includes(value.toLowerCase()) ||
          item.parentMenu.toLowerCase().includes(value.toLowerCase()) ||
          item.createdBy.toLowerCase().includes(value.toLowerCase()) ||
          new Date(item.createdDate).toLocaleDateString().toLowerCase().includes(value.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }

  const handleCategoryUpdate = updated => {
    const updatedItem = {
      id: updated.id,
      menuName: updated.menu_name,
      menuOrder: updated.menu_order,
      icon: updated.icon,
      parentMenu: updated.parent_menu || 'None',
      status: updated.status.toString(),
      createdBy: updated.created_by?.user_name || 'Unknown',
      createdDate: updated.updated_date || new Date().toISOString()
    }

    setData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
    setFilteredData(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
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
        <CardHeader title='Menu Master' />
        <Divider />
        <div className='flex justify-between flex-col sm:flex-row p-5 gap-y-4'>
          <DebouncedInput value={globalFilter} onChange={handleFilterChange} placeholder='Search Menu' />
          <div className='flex items-center max-sm:flex-col gap-4'>
            <Button
              variant='contained'
              color='primary'
              className='max-sm:w-full'
              onClick={() => setCustomerUserOpen(true)}
              startIcon={<i className='ri-add-line' />}
            >
              Add Menu
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

        <MenuAddDrawer open={customerUserOpen} handleClose={() => setCustomerUserOpen(false)} fetchData={fetchData} />
        <MenuEditDrawer
          open={categoryEditOpen}
          handleClose={() => setCategoryEditOpen(false)}
          fetchData={fetchData}
          menuId={selectedRow?.id}
        />
        <MenuViewDrawer
          open={categoryViewOpen}
          handleClose={() => setCategoryViewOpen(false)}
          menuId={selectedRow?.id}
        />
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this menu?</DialogContent>
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

export default MenuListTable
