// 'use client'

// // React Imports
// import { useEffect, useState } from 'react'

// // Next Imports
// import Link from 'next/link'
// import { useParams, useRouter } from 'next/navigation'
// import Image from 'next/image'

// // MUI Imports
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Button from '@mui/material/Button'
// import Divider from '@mui/material/Divider'

// // Third-party Imports
// import { Controller, useForm } from 'react-hook-form'
// import { valibotResolver } from '@hookform/resolvers/valibot'
// import { object, pipe, string, email, minLength, nonEmpty } from 'valibot'
// import toast, { Toaster } from 'react-hot-toast'

// // Component Imports
// import Logo from '@components/layout/shared/Logo'

// // Hook Imports
// import { useSettings } from '@core/hooks/useSettings'

// // Config & Utils
// import themeConfig from '@configs/themeConfig'
// import axiosInstance from '@/utils/axiosinstance'
// import { signIn } from 'next-auth/react'
// import { getLocalizedUrl } from '@/utils/i18n'
// import classNames from 'classnames'
// import { setCookie, getCookie } from 'cookies-next'
// import { useDispatch } from 'react-redux'
// import { setEmail } from '@/redux-store/slices/user'

// const schema = object({
//   email: pipe(string(), minLength(1, 'Email is required'), email('Enter a valid email')),
//   password: pipe(string(), nonEmpty('Password is required'))
// })

// const Login = ({ mode }) => {
//   const dispatch = useDispatch()
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [menuData, setMenuData] = useState([])

//   const router = useRouter()
//   const { lang: locale } = useParams()
//   const { settings } = useSettings()

//   const {
//     control,
//     handleSubmit,
//     formState: { errors }
//   } = useForm({
//     resolver: valibotResolver(schema),
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   })

//   useEffect(() => {
//     setIsPasswordShown(false)
//   }, [])

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   const onSubmit = async data => {
//   setIsLoading(true)

//   try {
//     const response = await axiosInstance.post('/core/login', {
//       email: data.email,
//       password: data.password
//     })

//     if (response?.data?.status === 200) {
//       const { token, user } = response.data.data || {}

//       setCookie('token', token, { maxAge: 60 * 60 * 24 })
//       dispatch(setEmail(data.email))

//       // Save basic user data
//       setCookie('userData', JSON.stringify(user), { maxAge: 60 * 60 * 24 })

//       toast.success(response?.data?.message || 'Login successful!')

//       // Redirect based on userType
//       if (user?.userType === 'tenant_admin') {
//         router.push(`/${locale}/dashboard`)
//       } else if (user?.userType === 'tenant_user') {
//         router.push(`/${locale}/asset-managements/asset-list`)
//       } else if (user?.userType === 'superadmin') {
//         router.push(`/${locale}/clientMaster`)
//       } else {
//         toast.error('Unknown user type, cannot redirect.')
//       }
//     } else {
//       toast.error(response?.data?.message || 'Login failed. Please try again.')
//     }
//   } catch (error) {
//     const errorMessage =
//       error.response?.data?.message || error.message || 'Login failed. Check your credentials and try again.'
//     toast.error(errorMessage)
//   } finally {
//     setIsLoading(false)
//   }
// }


//   return (
//     <div className='flex bs-full justify-center relative min-bs-[100dvh]'>
//       <div className='absolute top-5 left-6 z-50'>
//         <Logo />
//       </div>

//       {/* Left side with background image */}
//       <div
//         className={classNames(
//           'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] p-6 max-md:hidden bg-[url(/images/login.png)] bg-no-repeat bg-center bg-contain',
//           {
//             'border-ie': settings.skin === 'bordered'
//           }
//         )}
//       ></div>

//       {/* Right side with login form */}
//       <div className='flex justify-center items-center bs-full bg-backgroundPaper px-4 py-8 md:p-12 min-bs-screen w-full max-w-[480px] relative z-10'>
//         <div className='flex flex-col gap-5 w-full'>
//           <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
//             <Controller
//               name='email'
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   label='User ID'
//                   error={!!errors.email}
//                   helperText={errors.email?.message}
//                   autoComplete='off'
//                 />
//               )}
//             />
//             <Controller
//               name='password'
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   label='Password'
//                   type={isPasswordShown ? 'text' : 'password'}
//                   error={!!errors.password}
//                   helperText={errors.password?.message}
//                   autoComplete='off'
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position='end'>
//                         <IconButton
//                           onClick={handleClickShowPassword}
//                           edge='end'
//                           aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
//                         >
//                           <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }}
//                 />
//               )}
//             />
//             <Typography className='text-end'>
//               {locale && <Link href={getLocalizedUrl('/forgot-password', locale)}>Forgot password?</Link>}
//             </Typography>
//             <Button variant='contained' type='submit' disabled={isLoading} suppressHydrationWarning>
//               {isLoading ? 'Logging in...' : 'Log In'}
//             </Button>
//           </form>
//         </div>
//       </div>

//       <Toaster position='top-right' reverseOrder={false} />
//     </div>
//   )
// }

// export default Login


'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, pipe, string, email, minLength, nonEmpty } from 'valibot'
import toast, { Toaster } from 'react-hot-toast'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Config & Utils
import axiosInstance from '@/utils/axiosinstance'
import { getLocalizedUrl } from '@/utils/i18n'
import classNames from 'classnames'
import { setCookie } from 'cookies-next'


import { useDispatch } from 'react-redux'
import { setEmail } from '@/redux-store/slices/user'
import { requestPermissionAndGetToken } from '@/libs/firebase'

//  Firebase imports
// import { requestPermissionAndGetToken } from '@/lib/firebase'

const schema = object({
  email: pipe(string(), minLength(1, 'Email is required'), email('Enter a valid email')),
  password: pipe(string(), nonEmpty('Password is required'))
})

const Login = ({ mode }) => {
  const dispatch = useDispatch()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    setIsPasswordShown(false)
  }, [])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async data => {
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/core/login', {
        email: data.email,
        password: data.password
      })

      if (response?.data?.status === 200) {
  const { token, user } = response.data.data || {}

  setCookie('token', token, { maxAge: 60 * 60 * 24 })
  dispatch(setEmail(data.email))

  // Save user data
  setCookie('userData', JSON.stringify(user), { maxAge: 60 * 60 * 24 })

 

  toast.success(response?.data?.message || 'Login successful!')


        //  यहाँ FCM token generate करके backend को भेजेंगे
        try {
  const token = await requestPermissionAndGetToken()  
  console.log("Generated FCM Token:", token)
  if (token) {
    await axiosInstance.post('/user/save-fcm-token', { token })  // send { token } as backend expects
    console.log("FCM token saved:", token)
  }
} catch (err) {
  console.error("Error saving FCM token:", err)
}
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/firebase-messaging-sw.js")
//     .then((registration) => {
//       console.log("Service Worker registered ✅", registration.scope);
//     })
//     .catch((err) => {
//       console.error("Service Worker registration failed ❌", err);
//     });
// }

        // Redirect based on userType
        if (user?.userType === 'tenant_admin') {
          router.push(`/${locale}/dashboard`)
        } else if (user?.userType === 'tenant_user') {
          router.push(`/${locale}/asset-managements/asset-list`)
        } else if (user?.userType === 'superadmin') {
          router.push(`/${locale}/clientMaster`)
        } else {
          toast.error('Unknown user type, cannot redirect.')
        }
      } else {
        toast.error(response?.data?.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed. Check your credentials and try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center relative min-bs-[100dvh]'>
      <div className='absolute top-5 left-6 z-50'>
        <Logo />
      </div>

      {/* Left side with background image */}
      <div
        className={classNames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] p-6 max-md:hidden bg-[url(/images/login.png)] bg-no-repeat bg-center bg-contain',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      ></div>

      {/* Right side with login form */}
      <div className='flex justify-center items-center bs-full bg-backgroundPaper px-4 py-8 md:p-12 min-bs-screen w-full max-w-[480px] relative z-10'>
        <div className='flex flex-col gap-5 w-full'>
          <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='User ID'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete='off'
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete='off'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge='end'
                          aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            <Typography className='text-end'>
              {locale && <Link href={getLocalizedUrl('/forgot-password', locale)}>Forgot password?</Link>}
            </Typography>
            <Button variant='contained' type='submit' disabled={isLoading} suppressHydrationWarning>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
      </div>

      <Toaster position='top-right' reverseOrder={false} />
    </div>
  )
}

export default Login
