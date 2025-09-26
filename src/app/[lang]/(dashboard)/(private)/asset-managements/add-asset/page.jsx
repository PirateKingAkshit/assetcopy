// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import AssetListTable from '@/components/asset-list/AssetListTable'
import AddAsset from '@/components/add-asset/Addasset'


const AssetaddList = async () => {
  // Vars
  const data = await getEcommerceData()

  return (

   <Grid container spacing={6}>

      <Grid size={{ xs: 12 }}>
        <AddAsset productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default AssetaddList
