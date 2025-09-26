// import './globals.css'

// export const metadata = {
//     title: 'AssetSigma',
//     description: 'Landing page example',
//     icons: {
//         icon: '/favicon1.png', // or '/images/favicon.png'
//     },
// };
 
// export default function RootLayout({ children }) {
//     return (
//         <html lang="en">
//             <body className='w-screen'>
//                 {children}
//             </body>
//         </html>
//     );
// }
 
 
 
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export const metadata = {
  title: 'AssetSigma',
  description: 'Landing page example',
  icons: {
    icon: '/favicon1.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-screen">
        {children}

        {/* Toast container yaha add karna zaruri hai */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  )
}
