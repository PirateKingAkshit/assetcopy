'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import Link from 'next/link'
import { setCookie } from 'cookies-next'

const ViewApprovalTransfer = () => {
  const { id } = useParams()
  const [transfer, setTransfer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [remarks, setRemarks] = useState('')

  const fetchTransfer = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/transfer/${id}`)
      if (response.data?.status === 200 && response.data.data) {
        setTransfer(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to fetch transfer details.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching transfer details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchTransfer()
  }, [id])

  const handleFinalAction = async () => {
    try {
      const payload = {
        action: actionType,
        approval_remark: remarks
      }
      const url = `/transfer/${id}`
      const res = await axiosInstance.put(url, payload)
      toast.success(res.data.message || `${actionType} successful!`)
      setOpenDialog(false)
      setRemarks('')
      setCookie('reloadTransferList', 'true')

      fetchTransfer()
    } catch (error) {
      toast.error(error.response?.data?.message || `${actionType} failed.`)
    }
  }

  const getStatusColor = status => {
    const s = status?.toLowerCase()
    if (s.includes('pending')) return 'warning'
    if (s.includes('approved')) return 'success'
    if (s.includes('reject')) return 'error'
    if (s.includes('done')) return 'success'
    return 'default'
  }

  const isFinalStatus = () => {
    const status = transfer?.transfer_status?.status?.toLowerCase()
    return ['transfer approve', 'transfer reject', 'done'].includes(status)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <CircularProgress />
      </div>
    )
  }

  if (!transfer) {
    return (
      <Card>
        <CardHeader title='Transfer Approval Details' />
        <Typography align='center' sx={{ padding: '20px' }}>
          No data found for this transfer.
        </Typography>
        <div className='flex justify-center p-4'>
          <Link href='/asset-managements/transfer-approval-list'>
            <Button variant='contained'>Back to List</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <>
    
      <Card className='flex flex-col'>
        <CardHeader title='View Transfer Approval Details' />
        <div className='px-6 pt-4'>
          <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 0 }}>
            <Table size='small'>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <strong>Asset Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Asset Code</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Asset Location</strong>
                  </TableCell>
                  <TableCell>
                    <strong>New Location</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Remarks</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* <TableCell>{transfer.asset?.map(asset => asset.asset_name).join(', ') || 'None'}</TableCell>
                  <TableCell>{transfer.asset?.map(asset => asset.asset_code).join(', ') || 'None'}</TableCell>
                  <TableCell>{transfer.asset?.map(asset => asset.location?.location).join(', ') || 'None'}</TableCell> */}
                   <TableCell>{transfer.asset?.asset_name || 'None'}</TableCell>
    <TableCell>{transfer.asset?.asset_code || 'None'}</TableCell>
    <TableCell>{transfer.old_location?.location || 'None'}</TableCell>
                     <TableCell>{transfer.new_location?.location || 'None'}</TableCell>
                  <TableCell>
                    {transfer.approval_remark || transfer.transfer_remark || transfer.remark || 'None'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.transfer_status?.status || 'Pending'}
                      color={getStatusColor(transfer.transfer_status?.status)}
                      variant='tonal'
                      size='small'
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ mb: 2 }} />

          <div className='flex justify-start gap-4'>
            <Button
              variant='contained'
              color='success'
              onClick={() => {
                setActionType('approve')
                setOpenDialog(true)
              }}
              disabled={isFinalStatus()}
            >
              Approve
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setActionType('reject')
                setOpenDialog(true)
              }}
              disabled={isFinalStatus()}
            >
              Reject
            </Button>
          </div>
        </div>

        <div className='flex justify-end p-4'>
          <Link href='/asset-managements/transfer-approval'>
            <Button variant='outlined'>Back to List</Button>
          </Link>
        </div>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth='sm'>
        <DialogTitle>{actionType === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            label='Remarks'
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            minRows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleFinalAction}>
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ViewApprovalTransfer
