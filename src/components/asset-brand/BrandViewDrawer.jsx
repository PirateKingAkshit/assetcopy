import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import PerfectScrollbar from 'react-perfect-scrollbar'
import dayjs from 'dayjs'

const BrandViewDrawer = ({ open, handleClose, categoryData }) => {
  const formatDate = dateString => {
    if (!dateString) return ''
    try {
      return dayjs(dateString).format('DD-MM-YYYY') // <-- Proper formatting here
    } catch (e) {
      console.error('Error formatting date:', e)
      return ''
    }
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
        <Typography variant='h5'>View Brand Details</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form className='flex flex-col gap-5'>
            <TextField disabled label='Brand Name' value={categoryData?.categoryName || ''} fullWidth />

            <FormControl fullWidth variant='outlined'>
              <InputLabel shrink>Status</InputLabel>
              <Select value={categoryData?.status === 'true' ? 'Active' : 'Inactive'} label='Status' disabled>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>

            <TextField
              disabled
              label='Created Date'
              value={categoryData?.createdDate ? categoryData?.createdDate : ''}
              fullWidth
            />

            <TextField disabled label='Created By' value={categoryData?.createdBy || ''} fullWidth />

            <div className='flex justify-end'>
              <Button variant='contained' onClick={handleClose}>
                Close
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default BrandViewDrawer
