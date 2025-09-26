


'use client'

import {
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormHelperText
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const WDVAddDrawer = ({ open, handleClose, fetchData }) => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      life: '',
      slm_value: '',
      wdv_value: ''
    }
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async data => {
    setLoading(true)
    try {
      const payload = {
        life: Number(data.life),
        slm_value: Number(data.slm_value),
        wdv_value: Number(data.wdv_value)
      }

      const response = await axiosInstance.post('/rates', payload)

      if (response.data?.status === 200) {
        toast.success('Depreciation rate added successfully')
        fetchData()
        handleClose()
      } else {
        toast.error(response.data.message || 'Failed to add depreciation rate')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding depreciation rate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <div className='w-full sm:w-[400px] p-5 flex flex-col gap-4'>
        <div className='flex justify-between items-center mb-2'>
          <Typography variant='h6'>Add Depreciation Rate</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Life */}
          <Controller
            name='life'
            control={control}
            rules={{ required: 'Life is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type='number'
                fullWidth
                label='Life (months/years)'
                error={Boolean(errors.life)}
                helperText={errors.life?.message}
              />
            )}
          />

          {/* SLM Value */}
          <Controller
            name='slm_value'
            control={control}
            rules={{ required: 'SLM value is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type='number'
                fullWidth
                label='SLM Value (%)'
                error={Boolean(errors.slm_value)}
                helperText={errors.slm_value?.message}
              />
            )}
          />

          {/* WDV Value */}
          <Controller
            name='wdv_value'
            control={control}
            rules={{ required: 'WDV value is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type='number'
                fullWidth
                label='WDV Value (%)'
                error={Boolean(errors.wdv_value)}
                helperText={errors.wdv_value?.message}
              />
            )}
          />

          {/* Submit / Cancel */}
          <div className='flex items-center gap-2'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button variant='outlined' color='error' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default WDVAddDrawer
