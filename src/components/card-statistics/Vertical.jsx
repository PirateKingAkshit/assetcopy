// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import Chip from '@mui/material/Chip'

// // Third-party Imports
// import classnames from 'classnames'

// // Components Imports
// import CustomAvatar from '@core/components/mui/Avatar'

// const CardStatVertical = props => {
//   const { title, stats, avatarIcon, avatarColor, avatarSkin, avatarSize } = props

//   return (
//     <Card>
//       <CardContent className='flex flex-wrap justify-between items-start gap-2'>
//         <CustomAvatar size={avatarSize} variant='rounded' skin={avatarSkin} color={avatarColor}>
//           <i className={avatarIcon} />
//         </CustomAvatar>
//       </CardContent>

//       <CardContent className='flex flex-col items-start gap-4'>
//         <div className='flex flex-col flex-wrap gap-1'>
//           <Typography variant='h5'>{stats}</Typography>
//           <Typography>{title}</Typography>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


// export default CardStatVertical

// 'use client'

// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import CustomAvatar from '@core/components/mui/Avatar'
// import { useRouter } from 'next/navigation'

// const CardStatVertical = props => {
//   const { title, stats, avatarIcon, avatarColor, avatarSkin, avatarSize, link } = props
//   const router = useRouter()

//   const handleClick = () => {
//     if (link) {
//       router.push(link)
//     }
//   }

//   return (
//     <Card
//       onClick={handleClick}
//       className='cursor-pointer hover:shadow-md transition-all'
//       sx={{ height: '100%' }}
//     >
//       <CardContent className='flex justify-between items-start'>
//         {/* Count at top-left, bold */}
//         <Typography variant='h5' fontWeight={700}>
//           {stats}
//         </Typography>

//         {/* Icon on top-right */}
//         <CustomAvatar
//           size={avatarSize}
//           variant='rounded'
//           skin={avatarSkin}
//           color={avatarColor}
//         >
//           <i className={avatarIcon} />
//         </CustomAvatar>
//       </CardContent>

//       <CardContent>
//         <Typography>{title}</Typography>
//       </CardContent>
//     </Card>
//   )
// }

// export default CardStatVertical

'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CustomAvatar from '@core/components/mui/Avatar'
import { useRouter, useParams } from 'next/navigation'

const CardStatVertical = props => {
  const { title, stats, avatarIcon, avatarColor, avatarSkin, avatarSize, link } = props

  const router = useRouter()
  const { lang: locale } = useParams() 

  const handleClick = () => {
    if (link && locale) {
      router.push(`/${locale}${link}`) 
    }
  }

  return (
    <Card
      onClick={handleClick}
      className='cursor-pointer hover:shadow-md transition-all'
      sx={{ height: '100%' }}
    >
      <CardContent className='flex justify-between items-start'>
        {/* Count at top-left, bold */}
        <Typography variant='h5' fontWeight={700}>
          {stats}
        </Typography>

        {/* Icon on top-right */}
        <CustomAvatar
          size={avatarSize}
          variant='rounded'
          skin={avatarSkin}
          color={avatarColor}
        >
          <i className={avatarIcon} />
        </CustomAvatar>
      </CardContent>

      <CardContent>
        <Typography>{title}</Typography>
      </CardContent>
    </Card>
  )
}

export default CardStatVertical
