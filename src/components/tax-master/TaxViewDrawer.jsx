'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
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

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

const TaxViewDrawer = ({ open, handleClose, customerData, taxId }) => {
  // Find the tax record by taxId
  const taxData = useMemo(() => {
    return customerData?.find(item => item.id === taxId) || {}
  }, [customerData, taxId])

  const handleReset = () => {
    handleClose()
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
        <Typography variant='h5'>View Tax Details</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <div className='flex flex-col gap-5'>
            <TextField fullWidth label='Tax Code' value={taxData.tax_code || 'N/A'} disabled />
            <FormControl fullWidth>
              <InputLabel id='tax-type-label'>Tax Type</InputLabel>
              <Select
                labelId='tax-type-label'
                id='tax-type-select'
                label='Tax Type'
                value={taxData.tax_type || 'GST'}
                disabled
              >
                <MenuItem value='GST'>GST</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id='gst-type-label'>GST Type</InputLabel>
              <Select
                labelId='gst-type-label'
                id='gst-type-select'
                label='GST Type'
                value={taxData.gst_type || ''}
                disabled
              >
                <MenuItem value=''>Select GST Type</MenuItem>
                <MenuItem value='CGST'>CGST</MenuItem>
                <MenuItem value='SGST'>SGST</MenuItem>
                <MenuItem value='IGST'>IGST</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label='Tax Percentage'
              value={taxData.tax_percentage ? `${taxData.tax_percentage}%` : 'N/A'}
              disabled
            />
            <TextField fullWidth label='Description' value={taxData.description || 'No description'} disabled />
            <FormControl fullWidth>
              <InputLabel id='state-type-label'>State Type</InputLabel>
              <Select
                labelId='state-type-label'
                id='state-type-select'
                label='State Type'
                value={taxData.state_type || ''}
                disabled
              >
                <MenuItem value=''>Select State Type</MenuItem>
                <MenuItem value='Interstate'>Interstate</MenuItem>
                <MenuItem value='Intrastate'>Intrastate</MenuItem>
                <MenuItem value='Both'>Both</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id='status-label'>Status</InputLabel>
              <Select
                labelId='status-label'
                id='status-select'
                label='Status'
                value={taxData.status ? 'Active' : 'Inactive'}
                disabled
              >
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label='Created By' value={taxData.createdBy || 'Unknown'} disabled />
            <TextField
              fullWidth
              label='Created Date'
              value={taxData?.createdDate ? taxData.createdDate : ''}
              disabled
            />
            {/* <div className='flex justify-end gap-4'>
              <Button variant='outlined'  onClick={handleReset}>
                Close
              </Button>
            </div> */}
             <div className='flex justify-end gap-4'>
                            <Button variant='contained' onClick={handleReset}>
                              Close
                            </Button>
                          </div>
          </div>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default TaxViewDrawer
