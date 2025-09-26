// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'



// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'

import RolePermissionPage from '@/components/rolePermissions/rolePermissions'

const BrandList = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <RolePermissionPage productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default BrandList
