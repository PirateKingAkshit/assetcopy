'use client'

import { useEffect, useState } from 'react'
import { useParams , useRouter} from 'next/navigation'
import { Card, CardHeader, Divider, Button, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

import * as XLSX from 'xlsx';

import axiosInstance from '@/utils/axiosinstance'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('@/components/agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses window/document
);

import dayjs from 'dayjs'
const formatDate = iso => {
  if (!iso || iso === 'N/A') return 'N/A'

  const date = dayjs(iso)
  return date.isValid() ? date.format('DD-MM-YY') : 'N/A'
}

const AuditList = () => {
  const router = useRouter()
  const { id } = useParams()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAssets = async () => {
    try {
      const res = await axiosInstance.get(`/config/${id}/audits`)
      if (res?.data?.status === 200) {
        const formatted = res.data.data.map(item => ({
          id: item._id,
          assetName: item.asset?.asset_name || 'N/A',
          assetCode: item.asset?.asset_code || 'N/A',
          auditCode: item.audit?.audit_code || 'N/A',
          auditType: item.audit?.audit_type || 'N/A',
          auditName: item.audit?.audit_name || 'N/A',
          auditStartDate: formatDate(item.audit?.audit_startdate),
          auditEndDate: formatDate(item.audit?.audit_enddate),
          assetLocation: item.asset?.location?.location || 'N/A',
          auditLocation: item.audit_loc || 'N/A',
          condition: item.condition?.condition || 'N/A',
          remark: item.remark || 'N/A'
        }))
        setAssets(formatted)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Error loading asset data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchAssets()
  }, [id])

  

const handleExport = () => {
  try {
    if (!assets || assets.length === 0) {
      toast.warning('No data to export!');
      return;
    }

    // Map assets data for export
    const exportData = assets.map(asset => ({
      'Asset Code': asset.assetCode,
      'Asset Name': asset.assetName,
      'Audit Code': asset.auditCode,
      'Audit Type': asset.auditType,
      'Audit Name': asset.auditName,
      'Start Date': asset.auditStartDate,
      'End Date': asset.auditEndDate,
      'Asset Location': asset.assetLocation,
      'Audit Location': asset.auditLocation,
      'Condition': asset.condition,
      'Remark': asset.remark
    }));

    // Create a worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Optional: set column widths
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(key.length + 2, 15) // header length + some padding
    }));
    worksheet['!cols'] = colWidths;

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Assets');

    // Export to file
    const fileName = `audit_assets_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Export successful!');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Error exporting data. Please try again.');
  }
};


  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.875rem',
    color: '#000000'
  }

  const columnDefs = [
    { headerName: 'Asset Code', field: 'assetCode', width: 180, cellStyle: baseStyle },
    { headerName: 'Asset Name', field: 'assetName', width: 200, cellStyle: baseStyle },
    { headerName: 'Audit Code', field: 'auditCode', width: 180, cellStyle: baseStyle },
    { headerName: 'Audit Type', field: 'auditType', width: 150, cellStyle: baseStyle },
    { headerName: 'Audit Name', field: 'auditName', width: 200, cellStyle: baseStyle },
    { headerName: 'Start Date', field: 'auditStartDate', width: 160, cellStyle: baseStyle },
    { headerName: 'End Date', field: 'auditEndDate', width: 160, cellStyle: baseStyle },
    { headerName: 'Asset Location', field: 'assetLocation', width: 160, cellStyle: baseStyle },
    { headerName: 'Audit Location', field: 'auditLocation', width: 160, cellStyle: baseStyle },
    { headerName: 'Condition', field: 'condition', width: 140, cellStyle: baseStyle },
    { headerName: 'Remark', field: 'remark', width: 180, cellStyle: baseStyle }
  ]

  return (
    <Card>
      <CardHeader
        title='Audited Asset'
        action={
          // <Button
          //   variant='outlined'
          //   startIcon={<i className='ri-upload-2-line' />}
          //   onClick={handleExport}
          //   disabled={loading || assets.length === 0}
          // >
          //   Export
          // </Button>
           <div className='flex gap-4'>
                      <Button
                        variant='outlined'
                        color='secondary'
                        startIcon={<i className='ri-arrow-left-line' />}
                        onClick={() => router.back()}
                      >
                        Back
                      </Button>
                      <Button
                        variant='outlined'
                        startIcon={<i className='ri-upload-2-line' />}
                        onClick={handleExport}
                        disabled={loading || assets.length === 0}
                      >
                        Export
                      </Button>
                    </div>
        }
      />
      <Divider />
      <div className='p-4'>
        {loading ? (
          <CircularProgress />
        ) : (
          <AgGridWrapper rowData={assets} columnDefs={columnDefs} domLayout='autoHeight' />
        )}
      </div>
    </Card>
  )
}

export default AuditList
