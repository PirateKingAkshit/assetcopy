// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'



// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import AssetListTable from '@/components/asset-list/AssetListTable'
import AddAsset from '@/components/add-asset/Addasset'
import EditAsset from '@/components/edit-asset/edit-asset'

import AssetSellForm from '@/components/discardAsset/discardasset'



const AssetDiscards = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>

      <Grid size={{ xs: 12 }}>
        <AssetSellForm productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default AssetDiscards
