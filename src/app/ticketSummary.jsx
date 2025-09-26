


'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  Select
} from '@mui/material'
import { useSearchParams, useRouter ,useParams} from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'

const TicketSummary = () => {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('id')
  const router = useRouter()
  const { lang: locale } = useParams()

  const [ticket, setTicket] = useState(null)
  const [status, setStatus] = useState('')
  const [statusOptions, setStatusOptions] = useState([])
  const [comment, setComment] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const historyRef = useRef(null)

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId)
    }
    fetchStatusOptions()
  }, [ticketId])

  const fetchTicketDetails = async id => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/ticket/${id}`)
      if (response.data.status === 200) {
        const ticketData = response.data.data
        setTicket(ticketData)
        setStatus(ticketData.status?._id || '')

        // Check if the ticket status is "close" and redirect
        if (ticketData.status?.status === 'close') {
          toast.error('This ticket is already closed')
          router.back() // Redirect to the previous page
        }
      } else if (response.data.status === 400 && response.data.message === 'This ticket is already closed') {
        toast.error(response.data.message)
        router.back() // Redirect to the previous page
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Error fetching ticket details')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatusOptions = async () => {
    try {
      const response = await axiosInstance.get('/status/all')
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        setStatusOptions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching status options:', error)
    }
  }

  const formatDate = iso => {
    const date = new Date(iso)
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Comment is required')
      return
    }

    const formData = new FormData()
    formData.append('status', status)
    formData.append('comment', comment)
    if (file) formData.append('file', file)

    try {
      const response = await axiosInstance.put(`/ticket/${ticketId}`, formData)
      if (response.data.status === 200) {
        toast.success('Task updated successfully')
        setFile(null)
        setComment('')
        await fetchTicketDetails(ticketId)
        setShowHistory(true)
        setTimeout(() => {
          historyRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } else {
        toast.error('Something went wrong')
      }
    } catch (err) {
      toast.error('Error updating task')
      console.error('Update error', err)
    }
  }

  if (loading || !ticket) {
    return (
      <div className='flex justify-center p-10'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card className='p-6 space-y-4'>
      <Typography variant='h5'>Task Summary</Typography>

      <div className='grid grid-cols-2 gap-4'>
        <TextField label='Ticket Number' value={ticket.ticket_no || ''} InputProps={{ readOnly: true }} fullWidth />
        <TextField
          label='Ticket Type'
          value={ticket.ticket_type || 'REGULAR TASK'}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label='Assign Name'
          value={ticket.assigned_to?.user_name || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label='Asset Name'
          value={ticket.asset?.asset_name || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label='Asset Location'
          value={ticket.asset_loc?.location || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label='Ticket Location'
          value={ticket.ticket_loc?.location || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField label='Priority' value={ticket.priority || ''} InputProps={{ readOnly: true }} fullWidth />
        <TextField
          label='Created Date'
          value={ticket.created_date ? formatDate(ticket.created_date) : ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField label='Status' value={ticket.status?.status || ''} InputProps={{ readOnly: true }} fullWidth />
      </div>

      {showHistory && ticket.history && ticket.history.length > 0 && (
        <div ref={historyRef}>
          <Typography variant='h6' className='mt-6 mb-2'>
            Ticket History
          </Typography>

          <div className='space-y-4 pl-1'>
            {[...ticket.history]
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map((item, index) => (
                <div key={item._id || index} className='bg-gray-50 border border-gray-200 p-4 rounded-md shadow-sm'>
                  <Typography>
                    <strong>Status:</strong> {item.status?.status || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Comment:</strong> {item.comment || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Updated At:</strong> {item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}
                  </Typography>
                </div>
              ))}
          </div>
        </div>
      )}

      <Typography variant='h6' className='mt-6'>
        Update Status
      </Typography>

      <FormControl fullWidth>
        <InputLabel id='status-label'>Update Status</InputLabel>
        <Select labelId='status-label' value={status} onChange={e => setStatus(e.target.value)} label='Update Status'>
          {statusOptions.map(option => (
            <MenuItem key={option._id} value={option._id}>
              {option.status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        label='Comment'
        value={comment}
        onChange={e => setComment(e.target.value)}
        required
        error={!comment.trim()}
        helperText={!comment.trim() ? 'Comment is required' : ''}
      />

      <Button variant='outlined' component='label'>
        Choose File
        <input type='file' hidden onChange={e => setFile(e.target.files[0])} />
      </Button>

      <div className='flex justify-end gap-2'>
        <Button variant='outlined' color='secondary' onClick={() => router.push(`/${locale}/ticket/ticket-list`)}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      {/* <ToastContainer /> */}
    </Card>
  )
}

export default TicketSummary
