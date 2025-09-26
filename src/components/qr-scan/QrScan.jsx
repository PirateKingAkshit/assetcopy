'use client'
 
import { useEffect, useRef, useState } from 'react'
 
import { useRouter } from 'next/navigation'
 
import { Dialog, DialogTitle, DialogContent, IconButton, Alert, Button, Stack, Typography } from '@mui/material'
 
import CloseIcon from '@mui/icons-material/Close'
 
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
 
import { toast } from 'react-toastify'
 
 
import ErrorIcon from '@mui/icons-material/Error';
 
import Box from '@mui/material/Box';
 
import axiosInstance from '@/utils/axiosinstance'
 
 
const QrScan = ({ open, onClose }) => {
  const isProcessingRef = useRef(false);
 
  const qrCodeRegionId = 'html5qr-code-full-region'
 
  const scannerRef = useRef(null)
 
  const isStoppingRef = useRef(false)
 
  const [error, setError] = useState(null)
 
  const [rearCameraId, setRearCameraId] = useState(null)
 
  const [frontCameraId, setFrontCameraId] = useState(null)
 
  const [currentCameraId, setCurrentCameraId] = useState(null)
 
  const [retryDialog, setRetryDialog] = useState(false)
 
  const [scannerError, setScannerError] = useState(null)
 
  const router = useRouter()
 
  const getLocation = () => {
    return new Promise(resolve => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
 
              longitude: position.coords.longitude
            })
          },
 
          () => {
            toast.warning('Location permission denied or unavailable.')
 
            resolve({ latitude: null, longitude: null })
          }
        )
      } else {
        toast.warning('Geolocation not supported.')
 
        resolve({ latitude: null, longitude: null })
      }
    })
  }
 
  const stopAndClearScanner = async () => {
    if (scannerRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true
 
      try {
        const state = scannerRef.current.getState()
 
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop()
 
          await new Promise(res => setTimeout(res, 300))
        }
 
        await scannerRef.current.clear()
 
        scannerRef.current = null
      } catch (err) {
        console.error('Stop/Clear scanner error:', err)
      } finally {
        isStoppingRef.current = false
      }
    }
  }
 
  const startScanner = async cameraId => {
    await stopAndClearScanner()
 
    const element = document.getElementById(qrCodeRegionId)
 
    if (!element) {
      setError('QR scanner failed to initialize.')
 
      return
    }
 
 
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrCodeRegionId)
    }
 
    try {
      await scannerRef.current.start(
        cameraId,
 
        { fps: 10, qrbox: { width: 250, height: 250 } },
 
        async qrCodeMessage => {
          if (isProcessingRef.current) return;   // 👈 block repeated calls
          isProcessingRef.current = true;
          const trimmedQR = qrCodeMessage.trim()
 
          try {
            setError(null)
 
            const location = await getLocation()
 
            const geo_loc = location.latitude && location.longitude ? [location.latitude, location.longitude] : null
 
            const response = await axiosInstance.post('/sticker/check', {
              qr_code: trimmedQR,
 
              geo_loc
            })
 
            if (response?.data?.status === 200) {
              await stopAndClearScanner()
 
              toast.success(response.data.data)
 
              onClose()
 
              router.push(`/en/auditConfirmation/audit-confirm?qr_code=${trimmedQR}`)
            } else {
              setError(null);
              isProcessingRef.current = false;
              setScannerError(response?.data?.message || 'Scan error')
              setRetryDialog(true)
 
            }
          } catch (e) {
            if (e.response?.status === 400 && e.response?.data?.message?.includes('No active audit exists')) {
              toast.error(e.response.data.message)
            } else {
              toast.error(e.message || 'Scan error')
            }
          }
          finally {
            isProcessingRef.current = false;  // 👈 reset when done
          }
        }
      )
 
      setCurrentCameraId(cameraId)
    } catch (err) {
      setError('Failed to start scanner. Please allow camera access.')
    }
  }
 
  const detectFrontAndRearCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
 
      if (!devices.length) {
        setError('No camera found on this device.')
 
        return
      }
 
      const rear = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0]
 
      const front = devices.find(d => d.label.toLowerCase().includes('front')) || devices.find(d => d !== rear)
 
      setRearCameraId(rear?.id || null)
 
      setFrontCameraId(front?.id || null)
 
      // Start with rear camera by default
 
      if (rear?.id) {
        await startScanner(rear.id)
      } else if (front?.id) {
        await startScanner(front.id)
      } else {
        setError('Could not detect front or rear camera.')
      }
    } catch (err) {
      setError('Camera access failed. Please allow permissions.')
    }
  }
 
  const toggleCamera = async () => {
    const newCameraId = currentCameraId === rearCameraId ? frontCameraId : rearCameraId
 
    if (newCameraId) {
      await startScanner(newCameraId)
    }
  }
 
  useEffect(() => {
    if (open) {
      detectFrontAndRearCameras()
    } else {
      stopAndClearScanner()
    }
 
    return () => {
      stopAndClearScanner()
    }
  }, [open])
 
  const handleRetry = async () => {
    setRetryDialog(false);
    setError(null);
    setScannerError(null);
    isProcessingRef.current = false;
  }
 
  const handleCancel = ()=>{
    setRetryDialog(false);
    setError(null);
    setScannerError(null);
    isProcessingRef.current = false;
    onClose();
  }
 
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
        <DialogTitle>
          Scan QR Code
          <IconButton aria-label='close' onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
 
          <Stack direction='row' justifyContent='flex-end' sx={{ mb: 1 }}>
            {frontCameraId && rearCameraId && (
              <Button size='small' variant='outlined' onClick={toggleCamera}>
                Switch Camera
              </Button>
            )}
          </Stack>
 
          <div id={qrCodeRegionId} style={{ width: '100%', minHeight: '300px' }} />
        </DialogContent>
      </Dialog>
      <Dialog
        open={retryDialog}
        onClose={() => setRetryDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              Failed
            </Typography>
            <ErrorIcon color="error" fontSize="inherit" />
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setRetryDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
 
        <DialogContent>
          {scannerError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mb: 3,
                fontSize: '0.9rem',
              }}
            >
              {scannerError}
            </Alert>
          )}
 
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}       // 👈 adds equal margin between buttons
            sx={{ mt: 1 }}
          >
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                handleRetry()
              }}
            >
              Retry
            </Button>
 
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                handleCancel()
              }}
            >
              Cancel
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
 
    </>
  )
}
 
export default QrScan
 
 