



'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { deleteCookie, getCookie } from 'cookies-next'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState('User')
  const anchorRef = useRef(null)

  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  // ✅ Get user name from cookie (client-side only)
  useEffect(() => {
  try {
    const userData = JSON.parse(getCookie('userData') || '{}')
    if (userData?.user_name) {
      setUserName(userData.user_name) // Correct key
    } else {
      setUserName('User')
    }
  } catch (err) {
    console.warn('Invalid or missing userData cookie')
    setUserName('User')
  }
}, [])


  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      const finalUrl = getLocalizedUrl(url, locale)
      window.location.href = finalUrl
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      deleteCookie('token')
      deleteCookie('user')
      deleteCookie('menuData')
      deleteCookie('menu_perm')
      deleteCookie('assetPageSize')
      deleteCookie('userData')
      // deleteCookie('allocatedAssets')
      


      sessionStorage.clear()
      await signOut({ callbackUrl: `/${locale}/login` })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={userName}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={userName} src={session?.user?.image || ''} />
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {userName}
                      </Typography>
                    </div>
                  </div>

                  <Divider className='mlb-1' />

                 

                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown

