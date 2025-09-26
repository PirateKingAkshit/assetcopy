

'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const ForgotPasswordV2 = ({ mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-4-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  return (
   <div className='flex h-screen justify-center items-center bg-backgroundPaper p-6 md:p-12'>
  <Link
    href={getLocalizedUrl('/', locale)}
    className='absolute top-5 left-5 sm:top-10 sm:left-10'
  >
    <Logo />
  </Link>

  <div className='flex flex-col gap-5 w-full max-w-sm'>
    <Typography variant='h4'>Forgot Password</Typography>
    <Typography className='mb-4'>
      Enter your email and we&#39;ll send you instructions to reset your password
    </Typography>

    <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-4'>
      <TextField autoFocus fullWidth label='Email' />
      <Button fullWidth variant='contained' type='submit' className='bg-[#6E6FE2] hover:bg-[#6E6FE2]'>
        Send reset link
      </Button>

      <Typography className='flex justify-center items-center text-primary'>
        <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1.5 hover:underline'>
          <DirectionalIcon
            ltrIconClass='ri-arrow-left-s-line'
            rtlIconClass='ri-arrow-right-s-line'
            className='text-xl'
          />
          <span>Back to Login</span>
        </Link>
      </Typography>
    </form>
  </div>
</div>

  )
}

export default ForgotPasswordV2
