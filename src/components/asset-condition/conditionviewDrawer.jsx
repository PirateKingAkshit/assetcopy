'use client'

import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { isValid, parse, format } from 'date-fns'

const ConditionViewDrawer = ({ open, handleClose, categoryData }) => {
  const [conditionData, setConditionData] = useState({
    conditionName: 'N/A',
    status: '',
    createdBy: 'Unknown',
    createdDate: '',
    updatedDate: ''
  })

  useEffect(() => {
    if (open && categoryData) {
      const parseDate = dateStr => {
        if (!dateStr) return ''
        // Assuming dateStr is in DD-MM-YYYY format from ConditionListTable
        const parsed = parse(dateStr, 'dd-MM-yyyy', new Date())
        return isValid(parsed) ? dateStr : ''
      }

      setConditionData({
        conditionName: categoryData.conditionName || 'N/A',
        status: categoryData.status ? 'true' : 'false',
        createdBy: categoryData.createdBy || 'Unknown',
        createdDate: parseDate(categoryData.createdDate),
        updatedDate: parseDate(categoryData.updatedDate || categoryData.createdDate)
      })
    }
  }, [open, categoryData])

  const handleReset = () => {
    setConditionData({
      conditionName: 'N/A',
      status: '',
      createdBy: 'Unknown',
      createdDate: '',
      updatedDate: ''
    })
    handleClose()
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    // Assuming dateString is already in DD-MM-YYYY format
    const parsed = parse(dateString, 'dd-MM-yyyy', new Date())
    return isValid(parsed) ? format(parsed, 'dd-MM-yyyy') : 'N/A'
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h5'>View Condition Details</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form className='flex flex-col gap-5'>
            <TextField
              disabled
              id='condition-name'
              label='Condition Name'
              value={conditionData.conditionName}
              fullWidth
            />
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='status-label'>Status</InputLabel>
              <Select labelId='status-label' id='status-select' value={conditionData.status} label='Status' disabled>
                <MenuItem value='true'>Active</MenuItem>
                <MenuItem value='false'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField disabled id='created-by' label='Created By' value={conditionData.createdBy} fullWidth />
            <TextField
              disabled
              id='created-date'
              label='Created Date'
              value={formatDate(conditionData.createdDate)}
              fullWidth
            />
            <TextField
              disabled
              id='updated-date'
              label='Updated Date'
              value={formatDate(conditionData.updatedDate)}
              fullWidth
            />
            <div className='flex justify-end'>
              <Button variant='contained' onClick={handleReset}>
                Close
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default ConditionViewDrawer
