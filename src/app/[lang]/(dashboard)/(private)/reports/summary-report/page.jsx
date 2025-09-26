// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import SummaryReportTable from '@/components/summaryReportTable/summaryTable'

const SummaryList = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Asset Category</Typography>
      </Grid> */}
      {/* <Grid size={{ xs: 12 }}>
        <ProductCard />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <SummaryReportTable productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default SummaryList
