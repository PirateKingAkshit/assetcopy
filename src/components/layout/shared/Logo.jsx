// // 'use client'

// // // React Imports
// // import { useEffect, useRef } from 'react'

// // // Third-party Imports
// // import styled from '@emotion/styled'

// // // Component Imports
// // import MaterializeLogo from '@core/svg/Logo'

// // // Config Imports
// // import themeConfig from '@configs/themeConfig'

// // // Hook Imports
// // import useVerticalNav from '@menu/hooks/useVerticalNav'
// // import { useSettings } from '@core/hooks/useSettings'
// // import Image from 'next/image'

// // const LogoText = styled.span`
// //   font-size: 1.25rem;
// //   line-height: 1.2;
// //   font-weight: 600;
// //   letter-spacing: 0.15px;
// //   text-transform: capitalize;
// //   color: var(--mui-palette-text-primary);
// //   color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
// //   transition: ${({ transitionDuration }) =>
// //     `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

// //   ${({ isHovered, isCollapsed, isBreakpointReached }) =>
// //     !isBreakpointReached && isCollapsed && !isHovered
// //       ? 'opacity: 0; margin-inline-start: 0;'
// //       : 'opacity: 1; margin-inline-start: 8px;'}
// // `

// // const Logo = ({ color }) => {
// //   // Refs
// //   const logoTextRef = useRef(null)

// //   // Hooks
// //   const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
// //   const { settings } = useSettings()

// //   // Vars
// //   const { layout } = settings

// //   useEffect(() => {
// //     if (layout !== 'collapsed') {
// //       return
// //     }

// //     if (logoTextRef && logoTextRef.current) {
// //       if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
// //         logoTextRef.current?.classList.add('hidden')
// //         console.log('close')
// //       } else {
// //         logoTextRef.current.classList.remove('hidden')
// //         console.log('open')
// //       }
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [isHovered, layout, isBreakpointReached])

// //   return (
// //     <div className='flex items-center min-bs-[24px]'>
// //       <Image
// //         src='/images/logo.png'
// //         width={80}
// //         height={45}
// //         alt='logo'
// //         className={`w-full ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? 'hidden' : ''}`}
// //       ></Image>
// //       <Image
// //         src='/images/sidebar-logo.png'
// //         width={80}
// //         height={45}
// //         alt='logo'
// //         className={`w-full ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? '' : 'hidden'}`}
// //       ></Image>

// //       <LogoText
// //         color={color}
// //         ref={logoTextRef}
// //         isHovered={isHovered}
// //         isCollapsed={layout === 'collapsed'}
// //         transitionDuration={transitionDuration}
// //         isBreakpointReached={isBreakpointReached}
// //       >
// //         {themeConfig.templateName}
// //       </LogoText>
// //     </div>
// //   )
// // }

// // export default Logo



// 'use client'

// // React Imports
// import { useEffect, useRef } from 'react'

// // Next Imports
// import Image from 'next/image'
// import Link from 'next/link'
// import { useParams } from 'next/navigation'

// // Third-party Imports
// import styled from '@emotion/styled'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import useVerticalNav from '@menu/hooks/useVerticalNav'
// import { useSettings } from '@core/hooks/useSettings'

// // Styled Component
// const LogoText = styled.span`
//   font-size: 1.25rem;
//   line-height: 1.2;
//   font-weight: 600;
//   letter-spacing: 0.15px;
//   text-transform: capitalize;
//   color: var(--mui-palette-text-primary);
//   color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
//   transition: ${({ transitionDuration }) =>
//     `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

//   ${({ isHovered, isCollapsed, isBreakpointReached }) =>
//     !isBreakpointReached && isCollapsed && !isHovered
//       ? 'opacity: 0; margin-inline-start: 0;'
//       : 'opacity: 1; margin-inline-start: 8px;'};
// `

// const Logo = ({ color }) => {
//   // Refs
//   const logoTextRef = useRef(null)

//   // Hooks
//   const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
//   const { settings } = useSettings()
//   const { lang } = useParams()

//   // Vars
//   const { layout } = settings

//   // Logo visibility based on nav state
//   useEffect(() => {
//     if (layout !== 'collapsed') return

//     if (logoTextRef.current) {
//       if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
//         logoTextRef.current?.classList.add('hidden')
//       } else {
//         logoTextRef.current.classList.remove('hidden')
//       }
//     }
//   }, [isHovered, layout, isBreakpointReached])

//   return (
//     <Link href={`/${lang}/dashboard`} className='flex items-center min-bs-[24px]'>
//       <Image
//         src='/images/logo.png'
//         width={80}
//         height={45}
//         alt='logo'
//         className={`w-full ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? 'hidden' : ''}`}
//       />
//       <Image
//         src='/images/sidebar-logo.png'
//         width={80}
//         height={45}
//         alt='sidebar-logo'
//         className={`w-full ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? '' : 'hidden'}`}
//       />
//       <LogoText
//         color={color}
//         ref={logoTextRef}
//         isHovered={isHovered}
//         isCollapsed={layout === 'collapsed'}
//         transitionDuration={transitionDuration}
//         isBreakpointReached={isBreakpointReached}
//       >
//         {themeConfig.templateName}
//       </LogoText>
//     </Link>
//   )
// }

// export default Logo


'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component
const LogoText = styled.span`
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: capitalize;
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 8px;'}
`

const Logo = ({ color }) => {
  const logoTextRef = useRef(null)

  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { lang } = useParams()
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') return
    if (!logoTextRef.current) return

    if (!isBreakpointReached && !isHovered) {
      logoTextRef.current.classList.add('hidden')
    } else {
      logoTextRef.current.classList.remove('hidden')
    }
  }, [isHovered, layout, isBreakpointReached])

  return (
   <div className='flex items-center min-bs-[24px]'>
      <Image
        src='/images/assetLogo.png'
        width={80}
        height={45}
        alt='logo'
        priority
        className={`w-[190px] h-auto ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? 'hidden' : ''}`}
      />
      <Image
        src='/images/assetsigmaicon.png'
        width={80}
        height={45}
        alt='sidebar-logo'
        className={`w-full ${!isBreakpointReached && layout === 'collapsed' && !isHovered ? '' : 'hidden'}`}
      />
      <LogoText
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        {themeConfig.templateName}
      </LogoText>
    </div>
  )
}

export default Logo
