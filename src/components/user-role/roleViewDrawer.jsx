'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateField } from '@mui/x-date-pickers/DateField'
import PerfectScrollbar from 'react-perfect-scrollbar'
import dayjs from 'dayjs'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'

const RoleViewDrawer = ({ open, handleClose, roleId }) => {
  const [roleData, setRoleData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!roleId) return

      setLoading(true)
      try {
        const response = await axiosInstance.get(`/role/${roleId}`)
        if (response.data?.status === 200) {
          setRoleData({
            roleName: response.data.data.role_name,
            status: response.data.data.status,
            createdBy: response.data.data.created_by?.user_name || 'Unknown',
            createdDate: response.data.data.created_date,
            updatedDate: response.data.data.updated_date || response.data.data.created_date
          })
        } else {
          toast.error(response.data?.message || 'Failed to fetch role data')
        }
      } catch (error) {
        console.error('Error fetching role:', error)
        toast.error(error.response?.data?.message || 'Error fetching role details')
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchRoleData()
    } else {
      setRoleData(null)
    }
  }, [open, roleId])

  const formatDate = dateString => {
    if (!dateString) return null
    try {
      return dayjs(dateString)
    } catch (e) {
      console.error('Error formatting date:', e)
      return null
    }
  }

  const getStatusDisplay = () => {
    if (roleData?.status === undefined) return ''
    if (roleData.status === true || roleData.status === 'true') return 'Active'
    if (roleData.status === false || roleData.status === 'false') return 'Inactive'
    return String(roleData.status)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h5'>View Role Details</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <CircularProgress />
            </div>
          ) : (
            <form className='flex flex-col gap-5'>
              <TextField disabled label='Role Name' value={roleData?.roleName || 'N/A'} fullWidth />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={getStatusDisplay()} label='Status' disabled>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
              </FormControl>

              <TextField disabled label='Created By' value={roleData?.createdBy || 'Unknown'} fullWidth />

              <TextField
                disabled
                label='Created Date'
                value={roleData?.createdDate ? dayjs(roleData.createdDate).format('DD-MM-YYYY') : 'N/A'}
                fullWidth
              />

              <TextField
                disabled
                label='Updated Date'
                value={roleData?.updatedDate ? dayjs(roleData.updatedDate).format('DD-MM-YYYY') : 'N/A'}
                fullWidth
              />

              <div className='flex justify-end'>
                <Button variant='contained' onClick={handleClose}>
                  Close
                </Button>
              </div>
            </form>
          )}
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default RoleViewDrawer
