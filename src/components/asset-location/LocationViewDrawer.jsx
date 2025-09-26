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
import dayjs from 'dayjs'

// Vars
const initialData = {
  locationName: '',
  parentLocationId: '',
  status: '',
  createdDate: '',
  createdBy: '',
  location_lat: '',
  location_lng: ''
}

const LocationViewDrawer = ({ open, handleClose, customerData, categoryId }) => {
  const [formData, setFormData] = useState(initialData)
  const [parentLocations, setParentLocations] = useState([])

  // Fetch parent locations
  useEffect(() => {
    const fetchParentLocations = async () => {
      try {
        const response = await axiosInstance.get('/location/all')
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setParentLocations(response.data.data)
        } else {
          toast.error('Failed to fetch parent locations')
        }
      } catch (error) {
        console.error('Error fetching parent locations:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(`Failed to fetch parent locations: ${errorMessage}`)
        }
      }
    }

    if (open) {
      fetchParentLocations()
    }
  }, [open])

  // Fetch location details
  useEffect(() => {
    const fetchLocation = async () => {
      if (open && categoryId) {
        try {
          const response = await axiosInstance.get(`location/${categoryId}`)
          if (response.status === 200 && response.data?.data) {
            const location = response.data.data
            setFormData({
              locationName: location.location || 'N/A',
              parentLocationId: location.parent_location?._id || '',
              status: location.status ? 'Active' : 'Inactive',
              createdDate: location.created_date ? dayjs(location.created_date).format('DD-MM-YYYY') : 'N/A',
              createdBy: location.created_by?.user_name || 'Unknown',
              location_lat:
                location.location_lat != null && !isNaN(location.location_lat) ? location.location_lat.toString() : '0',
              location_lng:
                location.location_lng != null && !isNaN(location.location_lng) ? location.location_lng.toString() : '0'
            })
          } else {
            toast.error('Failed to fetch location details')
            setFormData(initialData)
          }
        } catch (error) {
          console.error('Error fetching location:', error)
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
          if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.')
          } else {
            toast.error(`Failed to fetch location: ${errorMessage}`)
          }
          setFormData(initialData)
        }
      }
    }
    fetchLocation()
  }, [open, categoryId])

  const handleReset = () => {
    setFormData(initialData)
    setParentLocations([])
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
        <Typography variant='h5'>View Location Details</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form className='flex flex-col gap-5'>
            <TextField disabled id='location-name' label='Location' value={formData.locationName} fullWidth />
            <FormControl fullWidth>
              <InputLabel id='parent-location-label'>Parent Location</InputLabel>
              <Select
                labelId='parent-location-label'
                id='parent-location-select'
                value={formData.parentLocationId}
                label='Parent Location'
                disabled
              >
                <MenuItem value=''>None</MenuItem>
                {parentLocations.map(loc => (
                  <MenuItem key={loc._id} value={loc._id}>
                    {loc.location || 'N/A'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id='status-label'>Status</InputLabel>
              <Select labelId='status-label' id='status-select' value={formData.status} label='Status' disabled>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField disabled id='created-date' label='Created Date' value={formData.createdDate} fullWidth />
            <TextField disabled id='created-by' label='Created By' value={formData.createdBy} fullWidth />
            <TextField disabled id='location-lat' label='Latitude' value={formData.location_lat} fullWidth />
            <TextField disabled id='location-lng' label='Longitude' value={formData.location_lng} fullWidth />
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

export default LocationViewDrawer
