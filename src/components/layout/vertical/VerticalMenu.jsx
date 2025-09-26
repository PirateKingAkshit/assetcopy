// 'use client'

// import { useEffect, useState } from 'react'

// import { useParams } from 'next/navigation'

// import { useTheme } from '@mui/material/styles'
// import PerfectScrollbar from 'react-perfect-scrollbar'

// import { getCookie } from 'cookies-next'

// import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'
// import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
// import axiosInstance from '@/utils/axiosinstance'
// import useVerticalNav from '@menu/hooks/useVerticalNav'

// const RenderExpandIcon = ({ open, transitionDuration }) => (
//   <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
//     <i className='ri-arrow-right-s-line' />
//   </StyledVerticalNavExpandIcon>
// )

// const VerticalMenu = ({ dictionary, scrollMenu }) => {
//   const theme = useTheme()
//   const verticalNavOptions = useVerticalNav()
//   const { lang: locale } = useParams()
//   const [menuData, setMenuData] = useState([])
//   const [loading, setLoading] = useState(true)

//   const { isBreakpointReached, transitionDuration } = verticalNavOptions
//   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

//   const hiddenNames = [
//   'Transfer Approval',
//   'Transfer Receive'
// ]

//   // remove menus with hidden names
// const removeHiddenMenus = menus => {
//   return menus
//     .filter(menu => !hiddenNames.includes(menu.menu_name))
//     .map(menu => ({
//       ...menu,
//       children: menu.children ? removeHiddenMenus(menu.children) : []
//     }))
// }
//   useEffect(() => {
//     const fetchMenuData = async () => {
//       try {
//         const response = await axiosInstance.get('/sidebar/all-menu')
//         let menus = response.data.data || []

//         // Get userType from cookie
//         let userType = null

//         try {
//           const userDataRaw = getCookie('userData')

//           if (userDataRaw) {
//             const userData = JSON.parse(userDataRaw)

//             userType = userData?.userType || null
//           }
//         } catch (err) {
//           console.error('Error parsing userData cookie:', err)
//         }

//         let menusToSet = []

//         if (userType === 'superadmin') {
//           // Static menu for superadmin
//           menusToSet = [
//             {
//               _id: 'static-client-master',
//               menu_name: 'Client Master',
//               route: '/clientMaster',
//               icon: '/images/clientMaster.png',
//               children: []
//             },
//           {
//   _id: 'static-queries',
//   menu_name: 'User Queries', // remove extra space
//   route: '/queries',
//   icon: '/images/query.png', // keep relative path
//   children: []
// }

//           ]
//         } else {
//           menusToSet = menus
//         }

//         // Remove hidden menus
//         menusToSet = removeHiddenMenus(menusToSet)
//         setMenuData(menusToSet)
//         setLoading(false)
//       } catch (error) {
//         console.error('Error fetching menu data:', error)
//         setMenuData([])
//         setLoading(false)
//       }
//     }

//     fetchMenuData()
//   }, [])

//   const renderMenuItems = items => {
//     const baseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL || 'http://assetsigma.com/backend'

//     return items.map(item => {
//      const iconSrc =
//   item.icon?.startsWith('/images/')
//     ? item.icon // agar local public folder ki image hai to direct use karo
//     : item.icon
//       ? `${baseUrl}${item.icon.replace(baseUrl, '')}`
//       : null


//       if (item.children?.length > 0) {
//         return (
//           <SubMenu
//             key={item._id}
//             label={item.menu_name}
//             icon={
//               iconSrc ? (
//                 <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} />
//               ) : (
//                 <i className='ri-folder-line' />
//               )
//             }
//           >
//             {item.route && (
//               <MenuItem
//                 key={`${item._id}-parent-link`}
//                 href={`/${locale}${item.route}`}
//                 icon={
//                   iconSrc ? (
//                     <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} />
//                   ) : (
//                     <i className='ri-file-line' />
//                   )
//                 }
//               >
//                 {item.menu_name}
//               </MenuItem>
//             )}
//             {renderMenuItems(item.children)}
//           </SubMenu>
//         )
//       }

//       return (
//         <MenuItem
//           key={item._id}
//           href={item.route ? `/${locale}${item.route}` : '#'}
//           icon={
//             iconSrc ? <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} /> : <i className='ri-file-line' />
//           }
//         >
//           {item.menu_name}
//         </MenuItem>
//       )
//     })
//   }

//   if (loading) {
//     return (
//       <ScrollWrapper>
//         <Menu>
//           <MenuItem>Loading menu...</MenuItem>
//         </Menu>
//       </ScrollWrapper>
//     )
//   }

//   return (
//     <ScrollWrapper
//       {...(isBreakpointReached
//         ? {
//             className: 'bs-full overflow-y-auto',
//             onScroll: container => scrollMenu(container, false)
//           }
//         : {
//             options: { wheelPropagation: false, suppressScrollX: true },
//             onScrollY: container => scrollMenu(container, true)
//           })}
//     >
//       <Menu
//         popoutMenuOffset={{ mainAxis: 17 }}
//         menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
//         menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
//         renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
//       >
//         {renderMenuItems(menuData)}
//       </Menu>
//     </ScrollWrapper>
//   )
// }

// export default VerticalMenu


'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { getCookie } from 'cookies-next'
import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import axiosInstance from '@/utils/axiosinstance'
import useVerticalNav from '@menu/hooks/useVerticalNav'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { lang: locale } = useParams()
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)

  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const hiddenNames = ['Transfer Approval', 'Transfer Receive']

  // Recursive remove hidden menus
  const removeHiddenMenus = menus => {
    return menus
      .filter(menu => !hiddenNames.includes(menu.menu_name))
      .map(menu => ({
        ...menu,
        children: menu.children ? removeHiddenMenus(menu.children) : []
      }))
  }

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        let menus = []

        // 🔹 Fetch from API
        try {
          const response = await axiosInstance.get('/sidebar/all-menu')
          if (response?.data?.data) {
            menus = response.data.data
          }
        } catch (err) {
          console.error('Error fetching menu data from API:', err?.message || err)
        }

        // 🔹 Get userType from cookie
        let userType = null
        try {
          const userDataRaw = getCookie('userData')
          if (userDataRaw) {
            try {
              const userData = JSON.parse(userDataRaw)
              userType = userData?.userType || null
            } catch (err) {
              console.error('Invalid userData cookie:', userDataRaw, err)
            }
          }
        } catch (err) {
          console.error('Error reading userData cookie:', err)
        }

        // 🔹 Apply superadmin static menu
        let menusToSet = []
        if (userType === 'superadmin') {
          menusToSet = [
            {
              _id: 'static-client-master',
              menu_name: 'Client Master',
              route: '/clientMaster',
              icon: '/images/clientMaster.png',
              children: []
            },
            {
              _id: 'static-queries',
              menu_name: 'User Queries',
              route: '/queries',
              icon: '/images/query.png',
              children: []
            }
          ]
        } else {
          menusToSet = menus
        }

        // 🔹 Remove hidden menus
        menusToSet = removeHiddenMenus(menusToSet)

        setMenuData(menusToSet)
      } catch (error) {
        console.error('Unexpected error in fetchMenuData:', error)
        setMenuData([])
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  const renderMenuItems = items => {
    const baseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL || 'http://assetsigma.com/backend'

    return items.map(item => {
      const iconSrc =
        item.icon?.startsWith('/images/')
          ? item.icon // if it's from public/images
          : item.icon
          ? `${baseUrl}${item.icon.replace(baseUrl, '')}`
          : null

      if (item.children?.length > 0) {
        return (
          <SubMenu
            key={item._id}
            label={item.menu_name}
            icon={
              iconSrc ? (
                <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} />
              ) : (
                <i className='ri-folder-line' />
              )
            }
          >
            {item.route && (
              <MenuItem
                key={`${item._id}-parent-link`}
                href={`/${locale}${item.route}`}
                icon={
                  iconSrc ? (
                    <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} />
                  ) : (
                    <i className='ri-file-line' />
                  )
                }
              >
                {item.menu_name}
              </MenuItem>
            )}
            {renderMenuItems(item.children)}
          </SubMenu>
        )
      }

      return (
        <MenuItem
          key={item._id}
          href={item.route ? `/${locale}${item.route}` : '#'}
          icon={
            iconSrc ? (
              <img src={iconSrc} alt='' style={{ width: 20, height: 20 }} />
            ) : (
              <i className='ri-file-line' />
            )
          }
        >
          {item.menu_name}
        </MenuItem>
      )
    })
  }

  if (loading) {
    return (
      <ScrollWrapper>
        <Menu>
          <MenuItem>Loading menu...</MenuItem>
        </Menu>
      </ScrollWrapper>
    )
  }

  if (!menuData.length) {
    return (
      <ScrollWrapper>
        <Menu>
          <MenuItem>No menu available</MenuItem>
        </Menu>
      </ScrollWrapper>
    )
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
      >
        {renderMenuItems(menuData)}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu

