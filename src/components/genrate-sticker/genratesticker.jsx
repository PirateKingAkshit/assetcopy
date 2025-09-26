
 
'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControl,
} from '@mui/material';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosinstance';

export default function PrintLabelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const printRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown state
  const [qrFields, setQrFields] = useState([]);

  const qrFieldOptions = [
    { label: 'QR with name', value: 'name' },
    { label: 'QR with code', value: 'code' },
    { label: 'QR with location', value: 'location' },
  ];

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        setLoading(true);
        setError(null);
        const ids = searchParams.get('ids')?.split(',') || [];

        if (ids.length === 0) {
          setError('No asset IDs provided.');
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get('/sticker/all');

        if (response.data.status === 200) {
          const stickerData = response.data.data
            .filter(sticker => ids.includes(sticker.asset?._id?.toString()))
            .map(sticker => ({
              assetCode: sticker.asset?.asset_code || 'N/A',
              assetName: sticker.asset?.asset_name || 'N/A',
              assetLocation: sticker.asset?.location || {}, // location is an object
              qrCode: sticker.qr_code || '',
            }));

          console.log('Fetched sticker data:', stickerData); // Debug log
          if (stickerData.length === 0) {
            setError('No stickers found for the selected assets.');
          } else {
            setLabels(stickerData);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch stickers');
        }
      } catch (err) {
        console.error('Error fetching stickers:', err.response?.data || err.message);
        setError(err.message || 'Error loading stickers. Please try again.');
        setLabels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, [searchParams]);

  const handlePrint = () => {
    if (!printRef.current) {
      toast.error('Print content is not available.');
      return;
    }

    const printContent = printRef.current.outerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Labels</title>');

      const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');

      styles.forEach(style => {
        printWindow.document.head.appendChild(style.cloneNode(true));
      });

      printWindow.document.write(`
        <style>
          @media print {
            @page {
              size: auto;
              margin: 5mm;
            }
            body, html {
              background: #fff !important;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      `);

      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1000);
    } else {
      toast.error('Could not open print window. Please check your browser settings.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant='body1'>Loading stickers...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center px-6 pt-4'>
          <Typography variant='h5' fontWeight={600} gutterBottom>
            Print Labels/Stickers
          </Typography>
        </div>
        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Dropdown to select fields */}
        <Box sx={{ mb: 4, width: '100%', maxWidth: 220 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='qr-fields-label'>Get your label</InputLabel>
            <Select
              labelId='qr-fields-label'
              multiple
              value={qrFields}
              onChange={e =>
                setQrFields(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
              }
              input={<OutlinedInput label='Get your label' />}
              renderValue={selected =>
                selected
                  .map(value => qrFieldOptions.find(opt => opt.value === value)?.label || value)
                  .join(', ')
              }
            >
              {qrFieldOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={qrFields.includes(option.value)} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Printable section */}
        <div
  ref={printRef}
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-start',
    padding: '16px',
    overflowY: 'visible',
    borderRadius: '8px',
  }}
>
  {labels.map((item, index) => (
    <div
      key={index}
      style={{
        width: '192px',
        height: '96px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        pageBreakInside: 'avoid',
      }}
    >
      <div style={{ flexShrink: 0, height: '66px', width: '66px' }}>
        <QRCode value={item.qrCode || 'N/A'} size={66} />
      </div>

      <div
        style={{
          marginLeft: '8px',
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {qrFields.includes('code') && (
          <p style={{ fontSize: '0.7rem', lineHeight: 1.2, color: 'black', margin: 0 }}>
            {item.assetCode}
          </p>
        )}
        {qrFields.includes('name') && (
          <p style={{ fontSize: '0.7rem', lineHeight: 1.2, color: 'black', margin: '4px 0 0 0' }}>
            {item.assetName}
          </p>
        )}
        {qrFields.includes('location') && (
          <p style={{ fontSize: '0.7rem', lineHeight: 1.2, color: 'black', margin: '4px 0 0 0' }}>
            {item.assetLocation?.location || 'N/A'}
          </p>
        )}
      </div>
    </div>
  ))}
</div>


        <Box display='flex' justifyContent='flex-end' mt={4} gap={2}>
          <Button
            variant='contained'
            color='primary'
            onClick={handlePrint}
            disabled={labels.length === 0}
          >
            Print
          </Button>
          <Button
            variant='outlined'
            color='error'
            onClick={() => router.push('/en/asset-managements/asset-list')}
          >
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
