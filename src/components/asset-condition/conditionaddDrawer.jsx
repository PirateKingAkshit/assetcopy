'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'

import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import axiosInstance from '@/utils/axiosinstance'

const initialData = {
  condition: '',
  status: ''
}

const ConditionAddDrawer = ({ open, handleClose, setData, refreshData }) => {
  
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      condition: '',
      status: 'true'
    }
  })

  useEffect(() => {
  if (open) {
    resetForm({
      condition: '',
      status: 'true'   
    })
  }
}, [open, resetForm])


  const onSubmit = async data => {
    try {
      const payload = {
        condition: data.condition,
        status: data.status === 'true'
      }

      const response = await axiosInstance.post('condition', payload)

      if (response.data.status === 200) {
        refreshData()

        toast.success(response.data.message)
        resetForm({ condition: '', status: '' })
        handleClose()
      } else {
        toast.error(response.data.message)
        console.error('Error response:', response.data)
      }
    } catch (error) {
      console.error('Error adding condition:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'

      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error('Failed to add condition: ' + errorMessage)
      }
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm({ condition: '', status: '' })
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
        <Typography variant='h5'>Add Condition</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
          <Controller
  name='condition'   
  control={control}
  rules={{ required: true }}
  render={({ field }) => (
    <FormControl fullWidth>
      <InputLabel id='condition-select'>Condition</InputLabel>
      <Select
        {...field}
        fullWidth
        id='select-condition'
        label='Condition'
        labelId='condition-select'
        {...(errors.condition && { error: true })}
      >
        <MenuItem value='good'>Good</MenuItem>
        <MenuItem value='poor'>Poor</MenuItem>
        <MenuItem value='new'>New</MenuItem>
        <MenuItem value='damaged'>Damaged</MenuItem>
      </Select>
      {errors.condition && <FormHelperText error>This field is required.</FormHelperText>}
    </FormControl>
  )}
/>

            <Controller
              name='status'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Status</InputLabel>
                  <Select
                    {...field}
                    fullWidth
                    id='select-status'
                    label='Status'
                    labelId='status-select'
                    {...(errors.status && { error: true })}
                  >
                    <MenuItem value='' disabled>
                      Select Status
                    </MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText error>This field is required.</FormHelperText>}
                </FormControl>
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit'>
                Submit
              </Button>
              <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
                cancel
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default ConditionAddDrawer
