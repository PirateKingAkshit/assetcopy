
// import { headers } from 'next/headers'
// import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
// import 'react-perfect-scrollbar/dist/css/styles.css'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
// import TranslationWrapper from '@/hocs/TranslationWrapper'
// import { i18n } from '@configs/i18n'
// import { getSystemMode } from '@core/utils/serverHelpers'
// import '@/app/globals.css'
// import '@assets/iconify-icons/generated-icons.css'

// ModuleRegistry.registerModules([AllCommunityModule])

// export const metadata = {
//   title: 'Asset Sigma',
//   description: 'Asset Sigma',
// }

// const RootLayout = async (props) => {
//   const params = await props.params
//   const { children } = props

//   const headersList = await headers()
//   const systemMode = await getSystemMode()
//   const direction = i18n.langDirection[params.lang]

//   return (
//     <TranslationWrapper headersList={headersList} lang={params.lang}>
//       {/* Only render content inside <body> */}
//       <div className={`flex is-full min-bs-full flex-auto flex-col`} dir={direction}>
//         <InitColorSchemeScript attribute="data" defaultMode={systemMode} />
//         {children}

//         {/* Toast notifications */}
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={direction === 'rtl'}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </div>
//     </TranslationWrapper>
//   )
// }

// export default RootLayout



import { headers } from 'next/headers'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import TranslationWrapper from '@/hocs/TranslationWrapper'
import { i18n } from '@configs/i18n'
import { getSystemMode } from '@core/utils/serverHelpers'
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'

ModuleRegistry.registerModules([AllCommunityModule])

export const metadata = {
  title: 'Asset Sigma',
  description: 'Asset Sigma',
  manifest: '/manifest.json', // Specifies the web manifest for PWA
  // themeColor: '#ffffff',      // Theme color for PWA
  icons: {
    icon: '/images/assetsigmaicon192.png', // Default favicon
    apple: '/images/assetsigmaicon192.png', // Apple touch icon for iOS
  },
}

export const viewport = {
  themeColor: "#ffffff", // ✅ move here
}

const RootLayout = async (props) => {
  const params = await props.params
  const { children } = props

  const headersList = await headers()
  const systemMode = await getSystemMode()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      {/* Only render content inside <body> */}
      <div className="flex is-full min-bs-full flex-auto flex-col" dir={direction}>
        <InitColorSchemeScript attribute="data" defaultMode={systemMode} />
        {children}

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={direction === 'rtl'}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </TranslationWrapper>
  )
}

export default RootLayout
