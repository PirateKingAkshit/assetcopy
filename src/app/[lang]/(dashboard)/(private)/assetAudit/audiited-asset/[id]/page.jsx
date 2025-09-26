// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'

import AuditAssetPage from '@/components/audit-asset/AuditAsset'
import AuditList from '@/components/audiitedData/audiitedData'

const AuditedList = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AuditList productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default AuditedList
