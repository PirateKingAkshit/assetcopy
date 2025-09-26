'use client'

import { Drawer, IconButton, Typography, TextField, Box, Divider, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from 'react'
import axiosInstance from '@/utils/axiosinstance'

// Format date as DD-MM-YYYY
const formatDate = dateStr => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB').split('/').join('-')
}

const ConfigViewDrawer = ({ open, handleClose, categoryData }) => {
  const [fullData, setFullData] = useState(null)

  useEffect(() => {
    if (open && categoryData?.id) {
      axiosInstance
        .get(`/config/${categoryData.id}`)
        .then(res => {
          if (res.data?.status === 200) {
            setFullData(res.data.data)
          }
        })
        .catch(err => {
          console.error('Error fetching view data:', err)
        })
    }
  }, [open, categoryData])

  if (!fullData) return null

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <Box className='w-full sm:w-[400px] p-5 flex flex-col h-full justify-between'>
        {/* Header */}
        <Box>
          <Box className='flex justify-between items-center mb-4'>
            <Typography variant='h6'>View Audit Configuration</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider className='mb-4' />

          {/* Content */}
        <Box className='flex flex-col gap-3'>
  <TextField label='Audit Name' value={fullData.audit_name || ''} fullWidth disabled />
  <TextField label='Audit Type' value={fullData.audit_type || ''} fullWidth disabled />
  <TextField label='Audit Fields' value={fullData.audit_field?.join(', ') || ''} fullWidth disabled />
  <TextField label='Start Date' value={formatDate(fullData.audit_startdate)} fullWidth disabled />
  <TextField label='End Date' value={formatDate(fullData.audit_enddate)} fullWidth disabled />
  
  {/* ✅ New As On Date Field */}
  <TextField label='As On Date' value={formatDate(fullData.as_on_date)} fullWidth disabled />

  <TextField label='Category' value={fullData.category?.category_name || ''} fullWidth disabled />
  <TextField label='Department' value={fullData.dept?.department || ''} fullWidth disabled />
  <TextField label='Status' value={fullData.status?.status || ''} fullWidth disabled />
  <TextField label='Condition' value={fullData.condition?.condition || ''} fullWidth disabled />
  <TextField label='Location' value={fullData.location?.location || ''} fullWidth disabled />
  <TextField
    label='Assigned To'
    value={fullData.assigned_to?.map(u => u.user_name).join(', ') || ''}
    fullWidth
    disabled
  />
  <TextField label='Created Date' value={formatDate(fullData.created_date)} fullWidth disabled />
  <TextField label='Updated Date' value={formatDate(fullData.updated_date)} fullWidth disabled />
</Box>

        </Box>

        {/* Footer */}
        <Box className='flex justify-end mt-4'>
          <Button variant='contained' onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ConfigViewDrawer
