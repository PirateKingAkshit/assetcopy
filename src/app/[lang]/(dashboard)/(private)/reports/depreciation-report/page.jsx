// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import Depreciationreports from '@/components/depreciationReports/depreciationReports'

const DepreReports = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Depreciationreports productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default DepreReports
