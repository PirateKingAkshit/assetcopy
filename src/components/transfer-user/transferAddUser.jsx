'use client'

import {
  Drawer,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '@/utils/axiosinstance'

const initialValues = {
  assigned_to: []
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200
    }
  }
}

const TransferAddDrawer = ({ open, handleClose, refreshData }) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const response = await axiosInstance.get('/user/all')
          setUsers(response.data?.data || [])
        } catch (error) {
          console.error('Error fetching users:', error)
          toast.error('Failed to load users')
        }
      }
      fetchUsers()
    } else {
      setFormData(initialValues)
      setErrors({})
    }
  }, [open])

  const handleChange = value => {
    setFormData(prev => ({ ...prev, assigned_to: value }))
    setErrors(prev => ({ ...prev, assigned_to: value.length === 0 ? 'Required' : '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (formData.assigned_to.length === 0) {
      setErrors({ assigned_to: 'Please select at least one user' })
      toast.error('Please select assigned users')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const payload = {
        assign_to: formData.assigned_to
      }

      const response = await axiosInstance.post('/transferApproval', payload)

      if (response.data?.status === 200) {
        toast.success(response.data.message || 'Added successfully')
        refreshData()
        setFormData(initialValues)
        handleClose()
      } else {
        toast.error(response.data?.message || 'Failed to submit')
      }
    } catch (error) {
      console.error('Submit error:', error)

      // ✅ Handle validation array error properly
      if (error.response?.data?.errors?.length) {
        const validationMsgs = error.response.data.errors.map(e => e.msg).join(', ')
        toast.error(validationMsgs || 'Validation failed')
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Add Users</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <FormControl fullWidth>
  <InputLabel id='assigned-to-select'>Select User</InputLabel>
  <Select
  labelId='assigned-to-select'
  multiple
  value={formData.assigned_to}
  onChange={e => handleChange(e.target.value)} // <-- only pass the array
  input={<OutlinedInput label='Select User' />}
  renderValue={selected =>
    selected
      .map(value => {
        const user = users.find(u => u._id === value)
        
        return user?.user_name || value
      })
      .join(', ')
  }
  MenuProps={MenuProps}
>

    {users.map(user => (
      <MenuItem key={user._id} value={user._id}>
        <Checkbox checked={formData.assigned_to.includes(user._id)} />
        <ListItemText primary={user.user_name} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

          <div className='flex items-center gap-2 mt-4'>
            
            <Button type='submit' variant='contained' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button onClick={handleClose} variant='outlined' color='error' disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default TransferAddDrawer
