'use client'

import {
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import { CloudUpload } from 'lucide-react'

const WDVViewDrawer = ({ open, handleClose, menuId }) => {
  const [formData, setFormData] = useState({
    menu_name: '',
    menu_order: '',
    parent_menu: '',
    status: 'true',
    created_date: '',
    updated_date: '',
    icon: null // Add icon to formData for upload
  })
  const [existingIcon, setExistingIcon] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [menuOptions, setMenuOptions] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open || !menuId) return

    const fetchMenuDetails = async () => {
      setFetching(true)
      try {
        const response = await axiosInstance.get(`/menu/${menuId}`)
        console.log('Fetched menu data:', response.data)
        if (response.data?.status === 200) {
          const menu = response.data.data
          const formatDate = date => {
            if (!date) return 'N/A'
            const d = new Date(date)
            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
          }
          setFormData({
            menu_name: menu.menu_name || '',
            menu_order: String(menu.menu_order) || '',
            parent_menu: menu.parent_menu?._id || '',
            status: menu.status ? 'true' : 'false',
            created_date: formatDate(menu.created_date),
            updated_date: formatDate(menu.updated_date),
            icon: null
          })
          setExistingIcon(menu.icon || null)
        } else {
          toast.error(response.data?.message || 'Failed to fetch menu details')
        }
      } catch (err) {
        console.error('Failed to fetch menu data:', err)
        toast.error('Failed to load menu details')
      } finally {
        setFetching(false)
      }
    }

    const fetchMenuOptions = async () => {
      try {
        const response = await axiosInstance.get('/menu/all')
        console.log('Fetched menu options:', response.data)
        const options =
          response.data?.data
            ?.filter(item => item._id !== menuId)
            .map(item => ({ id: item._id, name: item.menu_name })) || []
        setMenuOptions(options)
      } catch (err) {
        console.error('Failed to fetch menu options:', err)
        toast.error('Failed to fetch parent menu options')
      }
    }

    fetchMenuDetails()
    fetchMenuOptions()
  }, [open, menuId])

  useEffect(() => {
    if (!open) {
      setFormData({
        menu_name: '',
        menu_order: '',
        parent_menu: '',
        status: 'true',
        created_date: '',
        updated_date: '',
        icon: null
      })
      setExistingIcon(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open])

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, icon: file }))
      setExistingIcon(null) // Clear existing icon when new file is selected
    } else {
      toast.error('Please upload a valid JPEG, PNG, or PDF file')
      setFormData(prev => ({ ...prev, icon: null }))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>View Menu Details</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {fetching ? (
          <div className='flex justify-center items-center h-64'>
            <CircularProgress />
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <TextField name='menu_name' label='Menu Name' value={formData.menu_name} fullWidth disabled />

            <TextField
              name='menu_order'
              label='Menu Order'
              type='number'
              value={formData.menu_order}
              fullWidth
              disabled
            />

            <FormControl fullWidth>
              <InputLabel id='parent-menu-label'>Parent Menu</InputLabel>
              <Select
                labelId='parent-menu-label'
                name='parent_menu'
                value={formData.parent_menu}
                label='Parent Menu'
                disabled
              >
                <MenuItem value=''>None</MenuItem>
                {menuOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id='status-label'>Status</InputLabel>
              <Select name='status' labelId='status-label' label='Status' value={formData.status} disabled>
                <MenuItem value='true'>Active</MenuItem>
                <MenuItem value='false'>Inactive</MenuItem>
              </Select>
            </FormControl>

            <TextField name='created_date' label='Created Date' value={formData.created_date} fullWidth disabled />

            <TextField name='updated_date' label='Updated Date' value={formData.updated_date} fullWidth disabled />

            <div>
              <Button
                variant='outlined'
                component='label'
                fullWidth
                className='h-[56px] text-gray-500 border-gray-300'
                disabled // Disable the upload button in view mode
              >
                <CloudUpload className='text-gray-500 mr-2' />
                Upload Icon
                <input
                  type='file'
                  name='icon'
                  accept='image/jpeg,image/png,application/pdf'
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  hidden
                  disabled
                />
              </Button>
              {existingIcon && !formData.icon && (
                <Typography variant='body2' mt={1}>
                  Current Icon:{' '}
                  <a href={existingIcon} target='_blank' rel='noopener noreferrer'>
                    View Icon
                  </a>
                </Typography>
              )}
              {formData.icon && (
                <Typography variant='body2' mt={1}>
                  New Icon: {formData.icon.name}
                </Typography>
              )}
              {!existingIcon && !formData.icon && (
                <Typography variant='body2' mt={1} color='textSecondary'>
                  No Icon Available
                </Typography>
              )}
            </div>

            {/* <div className='flex justify-end gap-2'>
              <Button variant='outlined' onClick={handleClose}>
                Close
              </Button>
            </div> */}
             <div className='flex justify-end gap-2'>
                            <Button variant='contained' onClick={handleClose}>
                              Close
                            </Button>
                          </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default WDVViewDrawer
