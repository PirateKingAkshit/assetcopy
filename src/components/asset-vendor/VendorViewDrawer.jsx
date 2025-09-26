'use client'

import { useState, useEffect } from 'react'
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
  Typography
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateField } from '@mui/x-date-pickers/DateField'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

const AssetViewVendorDrawer = ({ open, handleClose, categoryData }) => {
  const [status, setStatus] = useState(categoryData?.status === 'true' ? 'Active' : 'Inactive')

  useEffect(() => {
    setStatus(categoryData?.status === 'true' ? 'Active' : 'Inactive')
  }, [categoryData])

  const handleDownloadGST = async () => {
    try {
      const response = await axiosInstance.get(`/vendor/${categoryData?.id}/gst-certificate`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', categoryData?.reg_certificate || 'gst_certificate.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download GST certificate:', err)
      toast.error('Failed to download GST certificate')
    }
  }

  const handleReset = () => {
    handleClose()
    setStatus(categoryData?.status === 'true' ? 'Active' : 'Inactive')
  }

  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleReset}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <div className='flex items-center justify-between p-5'>
          <Typography variant='h5'>View Vendor Details</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <div className='p-5'>
            <form className='flex flex-col gap-5'>
              <TextField disabled label='Vendor Name' value={categoryData?.categoryName || ''} />
              <TextField disabled label='Vendor Code' value={categoryData?.parentCategory || ''} />
              <TextField disabled label='Email' value={categoryData?.email || ''} />
              <TextField disabled label='Contact Person Name' value={categoryData?.contact_person_name || ''} />
              <TextField disabled label='Contact Person Mobile' value={categoryData?.contact_person_mobile || ''} />
              <TextField disabled label='Address (Optional)' value={categoryData?.address || ''} />
              <TextField disabled label='City (Optional)' value={categoryData?.city || ''} />
              <TextField disabled label='State (Optional)' value={categoryData?.state || ''} />
              <TextField disabled label='Pincode (Optional)' value={categoryData?.pincode || ''} />
              <TextField disabled label='Country (Optional)' value={categoryData?.country || ''} />

              <div className='flex items-center gap-2'>
                <TextField
                  disabled
                  label='GST Certificate'
                  value={categoryData?.reg_certificate || 'No file attached'}
                  fullWidth
                />
                {categoryData?.reg_certificate && (
                  <Button variant='outlined' onClick={handleDownloadGST}>
                    Download
                  </Button>
                )}
              </div>

              <TextField
                disabled
                label='Created Date'
                fullWidth
                value={categoryData?.createdDate ? categoryData?.createdDate : ''}
              />

              <TextField disabled label='Created By' value={categoryData?.createdBy || ''} />

              <TextField
                disabled
                label='Updated Date'
                fullWidth
                value={
                  categoryData?.updatedDate && dayjs(categoryData.updatedDate).isValid()
                    ? dayjs(categoryData.updatedDate).format('DD-MM-YYYY')
                    : ''
                }
              />

              <FormControl fullWidth>
                <InputLabel id='status-select-label'>Status</InputLabel>
                <Select labelId='status-select-label' id='status-select' value={status} label='Status' disabled>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
              </FormControl>

              <div className='flex justify-end gap-4'>
                <Button variant='contained' onClick={handleReset}>
                  Close
                </Button>
              </div>
            </form>
          </div>
        </PerfectScrollbar>
      </Drawer>
    </>
  )
}

export default AssetViewVendorDrawer
