// // Next Imports
// import Link from 'next/link'

// // MUI Imports
// import Grid from '@mui/material/Grid2'
// import Typography from '@mui/material/Typography'

// // Component Imports
//
//

// // Data Imports
// import { getEcommerceData } from '@/app/server/asset-category'
// import AssetListTable from '@/components/asset-list/AssetListTable'
// import AddAsset from '@/components/add-asset/Addasset'
// import EditAsset from '@/components/edit-asset/edit-asset'
// import PrintLabelsPage from '@/components/genrate-sticker/genratesticker'

// // Component Imports
// // import MaterialTable from '@/views/material-table/materialTable'
// // import ProductCard from '@/views/apps/ecommerce/products/list/ProductCard'
// // import ProductListTable from '@/views/apps/ecommerce/products/list/ProductListTable'

// const AssetSticker = async () => {
//   // Vars
//   const data = await getEcommerceData()

//   return (
//     <Grid container spacing={6}>
//       {/* <Grid size={{ xs: 12 }}>
//         <Typography variant='h4'>Asset Category</Typography>
//       </Grid> */}
//       {/* <Grid size={{ xs: 12 }}>
//         <ProductCard />
//       </Grid> */}
//       <Grid size={{ xs: 12 }}>
//         <PrintLabelsPage productData={data?.products} />
//       </Grid>
//     </Grid>
//   )
// }

// export default AssetSticker
// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/asset-category'
import AssetListTable from '@/components/asset-list/AssetListTable'
import GenrateListTable from '@/components/genrate-sticker/genrateList'

// Component Imports
// import MaterialTable from '@/views/material-table/materialTable'
// import ProductCard from '@/views/apps/ecommerce/products/list/ProductCard'
// import ProductListTable from '@/views/apps/ecommerce/products/list/ProductListTable'

const AssetList = async () => {
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
        <GenrateListTable productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default AssetList
