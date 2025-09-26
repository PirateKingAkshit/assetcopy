// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import LocationListTable from '@/components/asset-location/LocationListTable'

// Component Imports
// import MaterialTable from '@/views/material-table/materialTable'
// import ProductCard from '@/views/apps/ecommerce/products/list/ProductCard'
// import ProductListTable from '@/views/apps/ecommerce/products/list/ProductListTable'

const LocationProductlist = async () => {
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
        <LocationListTable productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default LocationProductlist
