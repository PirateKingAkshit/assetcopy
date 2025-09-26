// // 'use client'

// // // React Imports
// // import { useRef, useState, useEffect } from 'react'

// // // MUI Imports
// // import IconButton from '@mui/material/IconButton'
// // import Badge from '@mui/material/Badge'
// // import Popper from '@mui/material/Popper'
// // import Fade from '@mui/material/Fade'
// // import Paper from '@mui/material/Paper'
// // import ClickAwayListener from '@mui/material/ClickAwayListener'
// // import Typography from '@mui/material/Typography'
// // import Chip from '@mui/material/Chip'
// // import Tooltip from '@mui/material/Tooltip'
// // import Divider from '@mui/material/Divider'
// // import Avatar from '@mui/material/Avatar'
// // import useMediaQuery from '@mui/material/useMediaQuery'
// // import Button from '@mui/material/Button'

// // // Third Party Components
// // import classnames from 'classnames'
// // import PerfectScrollbar from 'react-perfect-scrollbar'
// // import { formatDistanceToNow, isToday } from 'date-fns'

// // // Component Imports
// // import CustomAvatar from '@core/components/mui/Avatar'

// // // Config Imports
// // import themeConfig from '@configs/themeConfig'

// // // Hook Imports
// // import { useSettings } from '@core/hooks/useSettings'

// // // Util Imports
// // import { getInitials } from '@/utils/getInitials'
// // import axiosInstance from '@/utils/axiosinstance'

// // // Scroll Wrapper
// // const ScrollWrapper = ({ children, hidden }) => {
// //   if (hidden) {
// //     return <div className='overflow-y-auto max-h-[400px]'>{children}</div>
// //   } else {
// //     return (
// //       <PerfectScrollbar
// //         className='bs-full'
// //         options={{ wheelPropagation: false, suppressScrollX: true }}
// //         style={{ maxHeight: '400px' }} // 👈 Fixed scroll height
// //       >
// //         {children}
// //       </PerfectScrollbar>
// //     )
// //   }
// // }

// // // Avatar Helper
// // const getAvatar = params => {
// //   const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

// //   if (avatarImage) {
// //     return <Avatar src={avatarImage} />
// //   } else if (avatarIcon) {
// //     return (
// //       <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
// //         <i className={avatarIcon} />
// //       </CustomAvatar>
// //     )
// //   } else {
// //     return (
// //       <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
// //         {avatarText || getInitials(title)}
// //       </CustomAvatar>
// //     )
// //   }
// // }

// // const NotificationDropdown = () => {
// //   // States
// //   const [open, setOpen] = useState(false)
// //   const [notificationsState, setNotificationsState] = useState([])

// //   // Vars
// //   const notificationCount = notificationsState.filter(notification => !notification.read).length
// //   const readAll = notificationsState.every(notification => notification.read)

// //   // Refs
// //   const anchorRef = useRef(null)
// //   const ref = useRef(null)

// //   // Hooks
// //   const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
// //   const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
// //   const { settings } = useSettings()

// //   // Fetch Notifications
// //   useEffect(() => {
// //     const fetchNotifications = async () => {
// //       try {
// //         const res = await axiosInstance.get('/notifi/all')
// //         if (res.status === 200 && res.data?.data) {
// //           const mapped = res.data.data.map(item => {
// //             const dateObj = new Date(item.created_date)

// //             let displayTime
// //             if (isToday(dateObj)) {
// //               displayTime = dateObj.toLocaleTimeString('en-GB', {
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //                 hour12: false
// //               })
// //             } else {
// //               displayTime = formatDistanceToNow(dateObj, { addSuffix: true })
// //             }

// //             return {
// //               id: item._id,
// //               title: item.title,
// //               subtitle: item.body,
// //               time: displayTime,
// //               read: item.isRead,
// //               avatarImage: null,
// //               avatarIcon: 'ri-notification-2-line',
// //               avatarColor: 'primary',
// //               avatarSkin: 'light'
// //             }
// //           })
// //           setNotificationsState(mapped)
// //         }
// //       } catch (error) {
// //         console.error('Error fetching notifications:', error)
// //       }
// //     }

// //     fetchNotifications()
// //   }, [])

// //   const handleClose = () => setOpen(false)
// //   const handleToggle = () => setOpen(prevOpen => !prevOpen)

// //   // Read notification
// //   const handleReadNotification = (event, value, index) => {
// //     event.stopPropagation()
// //     const newNotifications = [...notificationsState]
// //     newNotifications[index].read = value
// //     setNotificationsState(newNotifications)
// //   }


// //   //delete notification
  
// //   // Remove notification
// // // Remove notification
// // const handleRemoveNotification = async (event, index) => {
// //   event.stopPropagation()
// //   const notification = notificationsState[index]

// //   try {
// //     // 👇 API call
// //     const res = await axiosInstance.put(`/notifi/${notification.id}`, {
// //       isRead: true // or whatever your API expects (delete/update flag)
// //     })

// //     if (res.status === 200) {
// //       // Update state only if API success
// //       const newNotifications = [...notificationsState]
// //       newNotifications.splice(index, 1)
// //       setNotificationsState(newNotifications)
// //     }
// //   } catch (error) {
// //     console.error('Error updating notification:', error)
// //   }
// // }

// //   // Mark all as read/unread
// //   const readAllNotifications = () => {
// //     const newNotifications = [...notificationsState]
// //     newNotifications.forEach(notification => {
// //       notification.read = !readAll
// //     })
// //     setNotificationsState(newNotifications)
// //   }

// //   return (
// //     <>
// //       <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
// //         <Badge
// //           color='error'
// //           className='cursor-pointer'
// //           variant='dot'
// //           overlap='circular'
// //           invisible={notificationCount === 0}
// //           anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
// //         >
// //           <i className='ri-notification-2-line' />
// //         </Badge>
// //       </IconButton>

// //       <Popper
// //         open={open}
// //         transition
// //         disablePortal
// //         placement='bottom-end'
// //         ref={ref}
// //         anchorEl={anchorRef.current}
// //         className='z-[1] w-[380px] max-h-[70vh] '
// //       >
// //         {({ TransitionProps, placement }) => (
// //           <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
// //             <Paper
// //               className={classnames(
// //                 'bs-full flex flex-col',
// //                 settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'
// //               )}
// //             >
// //               <ClickAwayListener onClickAway={handleClose}>
// //                 <div className='bs-full flex flex-col'>
// //                   {/* Header */}
// //                   <div className='flex items-center justify-between plb-3 pli-4 is-full gap-2'>
// //                     <Typography variant='h6' className='flex-auto'>
// //                       Notifications
// //                     </Typography>
// //                     {notificationCount > 0 && (
// //                       <Chip variant='tonal' size='small' color='primary' label={`${notificationCount} New`} />
// //                     )}
// //                     <Tooltip
// //                       title={readAll ? 'Mark all as unread' : 'Mark all as read'}
// //                       placement={placement === 'bottom-end' ? 'left' : 'right'}
// //                     >
// //                       {notificationsState.length > 0 && (
// //                         <IconButton size='small' onClick={readAllNotifications} className='text-textPrimary'>
// //                           <i className={classnames(readAll ? 'ri-mail-line' : 'ri-mail-open-line', 'text-xl')} />
// //                         </IconButton>
// //                       )}
// //                     </Tooltip>
// //                   </div>

// //                   <Divider />

// //                   {/* Notifications List (Scrollable) */}
// //                   <ScrollWrapper hidden={hidden}>
// //                     {notificationsState.map((notification, index) => (
// //                       <div
// //                         key={notification.id}
// //                         className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
// //                           'border-be': index !== notificationsState.length - 1
// //                         })}
// //                         onClick={e => handleReadNotification(e, true, index)}
// //                       >
// //                         {getAvatar(notification)}
// //                         <div className='flex flex-col flex-auto'>
// //                           <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
// //                             {notification.title}
// //                           </Typography>
// //                           <Typography variant='caption' className='mbe-2' color='text.secondary'>
// //                             {notification.subtitle}
// //                           </Typography>
// //                           <Typography variant='caption' color='text.disabled'>
// //                             {notification.time}
// //                           </Typography>
// //                         </div>
// //                         <div className='flex flex-col items-end gap-2'>
// //                           <Badge
// //                             variant='dot'
// //                             color={notification.read ? 'secondary' : 'primary'}
// //                             onClick={e => handleReadNotification(e, !notification.read, index)}
// //                             className={classnames('mbs-1 mie-1', {
// //                               'invisible group-hover:visible': notification.read
// //                             })}
// //                           />
// //                           <i
// //                             className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
// //                             onClick={e => handleRemoveNotification(e, index)}
// //                           />
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </ScrollWrapper>

// //                   <Divider />

// //                   {/* Footer */}
// //                   <div className='p-4 sticky bottom-0 bg-white'>
// //                     <Button fullWidth variant='contained' size='small'>
// //                       View All Notifications
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </ClickAwayListener>
// //             </Paper>
// //           </Fade>
// //         )}
// //       </Popper>
// //     </>
// //   )
// // }

// // export default NotificationDropdown



// // React Imports
// import { useRef, useState, useEffect } from 'react'

// // MUI Imports
// import IconButton from '@mui/material/IconButton'
// import Badge from '@mui/material/Badge'
// import Popper from '@mui/material/Popper'
// import Fade from '@mui/material/Fade'
// import Paper from '@mui/material/Paper'
// import ClickAwayListener from '@mui/material/ClickAwayListener'
// import Typography from '@mui/material/Typography'
// import Chip from '@mui/material/Chip'
// import Tooltip from '@mui/material/Tooltip'
// import Divider from '@mui/material/Divider'
// import Avatar from '@mui/material/Avatar'
// import useMediaQuery from '@mui/material/useMediaQuery'
// import Button from '@mui/material/Button'

// // Third Party Components
// import classnames from 'classnames'
// import PerfectScrollbar from 'react-perfect-scrollbar'
// import { formatDistanceToNow, isToday } from 'date-fns'

// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import { useSettings } from '@core/hooks/useSettings'

// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// import axiosInstance from '@/utils/axiosinstance'

// // Scroll Wrapper
// const ScrollWrapper = ({ children, hidden }) => {
//   const maxHeight = hidden ? 'calc(70vh - 100px)' : '400px'
//   return hidden ? (
//     <div className='overflow-y-auto' style={{ maxHeight }}>
//       {children}
//     </div>
//   ) : (
//     <PerfectScrollbar
//       className='bs-full'
//       options={{ wheelPropagation: false, suppressScrollX: true }}
//       style={{ maxHeight }}
//     >
//       {children}
//     </PerfectScrollbar>
//   )
// }

// // Avatar Helper
// const getAvatar = params => {
//   const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params
//   if (avatarImage) return <Avatar src={avatarImage} />
//   else if (avatarIcon)
//     return (
//       <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
//         <i className={avatarIcon} />
//       </CustomAvatar>
//     )
//   else
//     return (
//       <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
//         {avatarText || getInitials(title)}
//       </CustomAvatar>
//     )
// }

// const NotificationDropdown = () => {
//   const [open, setOpen] = useState(false)
//   const [notificationsState, setNotificationsState] = useState([])
//   const notificationCount = notificationsState.filter(n => !n.read).length
//   const readAll = notificationsState.every(n => n.read)
//   const anchorRef = useRef(null)
//   const ref = useRef(null)
//   const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
//   const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
//   const { settings } = useSettings()

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await axiosInstance.get('/notifi/all')
//         if (res.status === 200 && res.data?.data) {
//           const mapped = res.data.data.map(item => {
//             const dateObj = new Date(item.created_date)
//             const displayTime = isToday(dateObj)
//               ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
//               : formatDistanceToNow(dateObj, { addSuffix: true })
//             return {
//               id: item._id,
//               title: item.title,
//               subtitle: item.body,
//               time: displayTime,
//               read: item.isRead,
//               avatarIcon: 'ri-notification-2-line',
//               avatarColor: 'primary',
//               avatarSkin: 'light'
//             }
//           })
//           setNotificationsState(mapped)
//         }
//       } catch (error) {
//         console.error('Error fetching notifications:', error)
//       }
//     }
//     fetchNotifications()
//   }, [])

//   const handleClose = () => setOpen(false)
//   const handleToggle = () => setOpen(prevOpen => !prevOpen)

//   const handleReadNotification = (event, value, index) => {
//     event.stopPropagation()
//     const newNotifications = [...notificationsState]
//     newNotifications[index].read = value
//     setNotificationsState(newNotifications)
//   }

//   const handleRemoveNotification = async (event, index) => {
//     event.stopPropagation()
//     const notification = notificationsState[index]
//     try {
//       const res = await axiosInstance.put(`/notifi/${notification.id}`, { isRead: true })
//       if (res.status === 200) {
//         const newNotifications = [...notificationsState]
//         newNotifications.splice(index, 1)
//         setNotificationsState(newNotifications)
//       }
//     } catch (error) {
//       console.error('Error updating notification:', error)
//     }
//   }

//   const readAllNotifications = () => {
//     const newNotifications = [...notificationsState]
//     newNotifications.forEach(n => (n.read = !readAll))
//     setNotificationsState(newNotifications)
//   }

//   const width = isSmallScreen ? '90vw' : '380px'
//   const maxHeight = `calc(${hidden ? '70vh' : '400px'} - ${isSmallScreen ? '50px' : '100px'})`

//   return (
//     <>
//       <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
//         <Badge
//           color='error'
//           variant='dot'
//           overlap='circular'
//           invisible={notificationCount === 0}
//           anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//         >
//           <i className='ri-notification-2-line' />
//         </Badge>
//       </IconButton>

//       <Popper
//         open={open}
//         transition
//         disablePortal
//         placement='bottom-end'
//         ref={ref}
//         anchorEl={anchorRef.current}
//         className='z-[1]'
//         style={{ width }}
//       >
//         {({ TransitionProps }) => (
//           <Fade {...TransitionProps}>
//             <Paper
//               className={classnames(
//                 'flex flex-col',
//                 settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'
//               )}
//             >
//               <ClickAwayListener onClickAway={handleClose}>
//                 <div className='flex flex-col'>
//                   <div className='flex items-center justify-between p-3 gap-2'>
//                     <Typography variant='h6'>Notifications</Typography>
//                     {notificationCount > 0 && (
//                       <Chip variant='tonal' size='small' color='primary' label={`${notificationCount} New`} />
//                     )}
//                     {notificationsState.length > 0 && (
//                       <Tooltip title={readAll ? 'Mark all as unread' : 'Mark all as read'}>
//                         <IconButton size='small' onClick={readAllNotifications} className='text-textPrimary'>
//                           <i className={classnames(readAll ? 'ri-mail-line' : 'ri-mail-open-line', 'text-xl')} />
//                         </IconButton>
//                       </Tooltip>
//                     )}
//                   </div>

//                   <Divider />

//                   <ScrollWrapper hidden={hidden}>
//                     {notificationsState.map((notification, index) => (
//                       <div
//                         key={notification.id}
//                         className={classnames('flex p-3 gap-3 cursor-pointer hover:bg-actionHover group', {
//                           'border-b': index !== notificationsState.length - 1
//                         })}
//                         onClick={e => handleReadNotification(e, true, index)}
//                       >
//                         {getAvatar(notification)}
//                         <div className='flex flex-col flex-auto'>
//                           <Typography variant='body2' className='font-medium mb-1' color='text.primary'>
//                             {notification.title}
//                           </Typography>
//                           <Typography variant='caption' className='mb-2' color='text.secondary'>
//                             {notification.subtitle}
//                           </Typography>
//                           <Typography variant='caption' color='text.disabled'>
//                             {notification.time}
//                           </Typography>
//                         </div>
//                         <div className='flex flex-col items-end gap-2'>
//                           <Badge
//                             variant='dot'
//                             color={notification.read ? 'secondary' : 'primary'}
//                             onClick={e => handleReadNotification(e, !notification.read, index)}
//                             className={classnames('mb-1 mr-1', {
//                               'invisible group-hover:visible': notification.read
//                             })}
//                           />
//                           <i
//                             className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
//                             onClick={e => handleRemoveNotification(e, index)}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </ScrollWrapper>

//                   <Divider />

//                   <div className='p-4 bg-white'>
//                     <Button fullWidth variant='contained' size='small'>
//                       View All Notifications
//                     </Button>
//                   </div>
//                 </div>
//               </ClickAwayListener>
//             </Paper>
//           </Fade>
//         )}
//       </Popper>
//     </>
//   )
// }

// export default NotificationDropdown


'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { formatDistanceToNow, isToday } from 'date-fns'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import axiosInstance from '@/utils/axiosinstance'

// Scroll Wrapper
const ScrollWrapper = ({ children, hidden }) => {
  const maxHeight = hidden ? 'calc(70vh - 100px)' : '400px'
  return hidden ? (
    <div className='overflow-y-auto' style={{ maxHeight }}>
      {children}
    </div>
  ) : (
    <PerfectScrollbar
      className='bs-full'
      options={{ wheelPropagation: false, suppressScrollX: true }}
      style={{ maxHeight }}
    >
      {children}
    </PerfectScrollbar>
  )
}

// Avatar Helper
const getAvatar = params => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params
  if (avatarImage) return <Avatar src={avatarImage} />
  else if (avatarIcon)
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  else
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState([])
  const notificationCount = notificationsState.filter(n => !n.read).length
  const readAll = notificationsState.every(n => n.read)
  const anchorRef = useRef(null)
  const ref = useRef(null)
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifi/all')
        if (res.status === 200 && res.data?.data) {
          const mapped = res.data.data.map(item => {
            const dateObj = new Date(item.created_date)
            const displayTime = isToday(dateObj)
              ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
              : formatDistanceToNow(dateObj, { addSuffix: true })
            return {
              id: item._id,
              title: item.title,
              subtitle: item.body,
              time: displayTime,
              read: item.isRead,
              avatarIcon: 'ri-notification-2-line',
              avatarColor: 'primary',
              avatarSkin: 'light'
            }
          })
          setNotificationsState(mapped)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    fetchNotifications()
  }, [])

  const handleClose = () => setOpen(false)
  const handleToggle = () => setOpen(prevOpen => !prevOpen)

  const handleReadNotification = (event, value, index) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]
    newNotifications[index].read = value
    setNotificationsState(newNotifications)
  }

  const handleRemoveNotification = async (event, index) => {
    event.stopPropagation()
    const notification = notificationsState[index]
    try {
      const res = await axiosInstance.put(`/notifi/${notification.id}`, { isRead: true })
      if (res.status === 200) {
        const newNotifications = [...notificationsState]
        newNotifications.splice(index, 1)
        setNotificationsState(newNotifications)
      }
    } catch (error) {
      console.error('Error updating notification:', error)
    }
  }

  const readAllNotifications = () => {
    const newNotifications = [...notificationsState]
    newNotifications.forEach(n => (n.read = !readAll))
    setNotificationsState(newNotifications)
  }

  const width = isSmallScreen ? '90vw' : '380px'
  const maxHeight = `calc(${hidden ? '70vh' : '400px'} - ${isSmallScreen ? '50px' : '100px'})`

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>

<Popper
  open={open}
  transition
  disablePortal
  placement="bottom-end"
  ref={ref}
  anchorEl={anchorRef.current}
  className="z-[1]"
  style={{ width }}
  modifiers={[
    {
      name: 'offset',
      options: {
        offset: [0, 10], // 👈 vertical space from icon
      },
    },
    {
      name: 'preventOverflow',
      options: {
        boundary: 'viewport',
        padding: 18, // 👈 keep 8px away from edges of screen
      },
    },
    {
      name: 'flip',
      options: {
        fallbackPlacements: ['bottom-start'],
      },
    },
  ]}
>
  {({ TransitionProps }) => (
    <Fade {...TransitionProps}>
      <Paper
        className={classnames(
          'flex flex-col',
          settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'
        )}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
          <ClickAwayListener onClickAway={handleClose}>
          <div className='flex flex-col'>
            <div className='flex items-center justify-between p-3 gap-2'>
              <Typography variant='h6'>Notifications</Typography>
              {notificationCount > 0 && (
                <Chip variant='tonal' size='small' color='primary' label={`${notificationCount} New`} />
              )}
              {notificationsState.length > 0 && (
                <Tooltip title={readAll ? 'Mark all as unread' : 'Mark all as read'}>
                  <IconButton size='small' onClick={readAllNotifications} className='text-textPrimary'>
                    <i className={classnames(readAll ? 'ri-mail-line' : 'ri-mail-open-line', 'text-xl')} />
                  </IconButton>
                </Tooltip>
              )}
            </div>

            <Divider />

            <ScrollWrapper hidden={hidden}>
              {notificationsState.map((notification, index) => (
                <div
                  key={notification.id}
                  className={classnames(
                    'flex p-3 gap-3 cursor-pointer hover:bg-actionHover group',
                    { 'border-b': index !== notificationsState.length - 1 }
                  )}
                  onClick={e => handleReadNotification(e, true, index)}
                >
                  {getAvatar(notification)}
                  <div className='flex flex-col flex-auto'>
                    <Typography variant='body2' className='font-medium mb-1' color='text.primary'>
                      {notification.title}
                    </Typography>
                    <Typography variant='caption' className='mb-2' color='text.secondary'>
                      {notification.subtitle}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {notification.time}
                    </Typography>
                  </div>
                  <div className='flex flex-col items-end gap-2'>
                    <Badge
                      variant='dot'
                      color={notification.read ? 'secondary' : 'primary'}
                      onClick={e => handleReadNotification(e, !notification.read, index)}
                      className={classnames('mb-1 mr-1', {
                        'invisible group-hover:visible': notification.read
                      })}
                    />
                    <i
                      className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
                      onClick={e => handleRemoveNotification(e, index)}
                    />
                  </div>
                </div>
              ))}
            </ScrollWrapper>

            <Divider />

            <div className='p-4 bg-white'>
              <Button fullWidth variant='contained' size='small'>
                View All Notifications
              </Button>
            </div>
          </div>
        </ClickAwayListener>
      </Paper>
    </Fade>
  )}
</Popper>


    </>
  )
}

export default NotificationDropdown
