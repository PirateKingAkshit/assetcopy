'use client'

import { useParams } from 'next/navigation'
import { getCookie, setCookie } from 'cookies-next'
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
  Paper
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '@/utils/axiosinstance'
import Link from 'next/link'

const ViewRecieveTransfer = () => {
  const { id } = useParams()
  const [transfer, setTransfer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReceiving, setIsReceiving] = useState(false)

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

  const handleReceiveAction = async () => {
    setIsReceiving(true)

    try {
      const url = `/transfer/${id}/receive`
      const res = await axiosInstance.put(url, {})

      const data = res.data

      if (data.status === 400) {
        toast.error(data.message || 'Transfer not approved or denied.')
      } else {
        toast.success(data.message || 'Transfer received successfully!')
        setCookie('reloadTransferList', 'true')
        fetchTransfer()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong.'
      toast.error(message)
    } finally {
      setIsReceiving(false)
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

  const isReceiveDisabled = () => {
    const status = transfer?.transfer_status?.status?.toLowerCase()
    const alreadyReceived = !!transfer?.received_by || !!transfer?.received_date
    return ['transfer approved', 'transfer rejected', 'done'].includes(status) || alreadyReceived
  }

  return (
    <>
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <CircularProgress />
        </div>
      ) : !transfer ? (
        <Card>
          <CardHeader title='Transfer Approval Details' />
          <Typography align='center' sx={{ padding: '20px' }}>
            No data found for this transfer.
          </Typography>
          <div className='flex justify-center p-4'>
            <Link href='/asset-managements/transferrecieve'>
              <Button variant='contained'>Back to List</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className='flex flex-col'>
          <CardHeader title='View Transfer Receive Details' />
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
                      <strong>Old Location</strong>
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
                    <TableCell>
                      <strong>Received By</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Received Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {/* <TableCell>{transfer.asset?.map(asset => asset.asset_name).join(', ') || 'None'}</TableCell> */}
                   <TableCell>{transfer.asset?.asset_name || 'None'}</TableCell>
    <TableCell>{transfer.asset?.asset_code || 'None'}</TableCell>
    <TableCell>{transfer.old_location?.location || 'None'}</TableCell>
    {/* <TableCell>{transfer.new_location?.location || 'None'}</TableCell> */}

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
                    <TableCell>{transfer.received_by?.user_name || '—'}</TableCell>
                    <TableCell>
                      {transfer.received_date ? new Date(transfer.received_date).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ mb: 2 }} />

            <div className='flex justify-start gap-4'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleReceiveAction}
                disabled={isReceiveDisabled() || isReceiving}
              >
                {isReceiving ? 'Receiving...' : 'Receive'}
              </Button>
            </div>
          </div>

          <div className='flex justify-end p-4'>
            <Link href='/asset-managements/transferrecieve'>
              <Button variant='outlined'>Back to List</Button>
            </Link>
          </div>
        </Card>
      )}
    </>
  )
}

export default ViewRecieveTransfer
