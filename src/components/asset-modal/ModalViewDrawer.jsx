'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

// Vars
const initialData = {
  modelName: '',
  brandName: '',
  status: '',
  createdBy: '',
  createdDate: '',
  updatedDate: ''
}

const AssetViewModalDrawer = ({ open, handleClose, customerData, categoryId }) => {
  // States
  const [formData, setFormData] = useState(initialData)

  // Fetch model details
  useEffect(() => {
    const fetchModel = async () => {
      if (open && categoryId) {
        try {
          const response = await axiosInstance.get(`model/${categoryId}`)
          if (response.status === 200 && response.data?.data) {
            const model = response.data.data
            setFormData({
              modelName: model.model_name || 'N/A',
              brandName: model.brand?.name || 'N/A',
              status: model.status ? 'Active' : 'Inactive',
              createdBy: model.created_by?.user_name || 'Unknown',
              createdDate: model.created_date ? new Date(model.created_date).toISOString().split('T')[0] : 'N/A',
              updatedDate: model.updated_date ? new Date(model.updated_date).toISOString().split('T')[0] : 'N/A'
            })
          } else {
            toast.error('Failed to fetch model details')
            setFormData(initialData)
          }
        } catch (error) {
          console.error('Error fetching model:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch model: ${errorMessage}`)
          }
          setFormData(initialData)
        }
      }
    }
    fetchModel()
  }, [open, categoryId])

  const handleReset = () => {
    setFormData(initialData)
    handleClose()
  }

  const formatDate = dateString => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
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
        <Typography variant='h5'>View Model Details</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form className='flex flex-col gap-5'>
            <TextField disabled id='model-name' label='Model Name' value={formData.modelName} fullWidth />
            <FormControl fullWidth>
              <InputLabel id='brand-label'>Brand</InputLabel>
              <Select labelId='brand-label' id='brand-select' value={formData.brandName} label='Brand' disabled>
                <MenuItem value={formData.brandName}>{formData.brandName}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id='status-label'>Status</InputLabel>
              <Select labelId='status-label' id='status-select' value={formData.status} label='Status' disabled>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField disabled id='created-by' label='Created By' value={formData.createdBy} fullWidth />
            <TextField
              disabled
              id='created-date'
              label='Created Date'
              value={formatDate(formData.createdDate)}
              fullWidth
            />
            <TextField
              disabled
              id='updated-date'
              label='Updated Date'
              value={formatDate(formData.updatedDate)}
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

export default AssetViewModalDrawer
