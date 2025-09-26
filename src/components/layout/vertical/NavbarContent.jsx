



'use client'
 
import { useState } from 'react'
import { useRouter,useParams } from 'next/navigation'
import classnames from 'classnames'
import { CirclePlus, List, QrCode } from 'lucide-react'
 
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import QrScan from '@/components/qr-scan/QrScan'
 
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

 
const NavbarContent = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [open, setOpen] = useState(false)
 
  const handleScanResult = (result) => {
    console.log('Scanned:', result)
  }
 
  return (
    <div
      className={classnames(
        verticalLayoutClasses.navbarContent,
        'w-full flex flex-col md:flex-row items-end justify-between gap-2 py-1'
      )}
    >
      {/* Left Side: NavToggle and NavSearch (Search hidden on mobile) */}
      <div className='flex items-center gap-2 w-full md:w-auto'>
        <NavToggle />
        <div className='flex items-end gap-2 w-full md:w-auto'>
          {/* NavSearch only visible on md and up */}
          <div className='hidden md:flex w-full md:w-auto'>
            <NavSearch />
          </div>
 
          {/* Mobile-only: QR + Dropdowns */}
          <div className='flex md:hidden items-center gap-2 ml-auto'>
            {/* QR Code - mobile only */}
            <button
              onClick={() => setOpen(true)}
              className='flex cursor-pointer items-center gap-1 shadow-[0_0_1px_1px_#00000047] py-[6px] px-[10px] rounded-[30px]'
            >
              <QrCode width={18} height={18} />
            </button>
            <ModeDropdown />
            <NotificationsDropdown notifications={[]} />
            <UserDropdown />
          </div>
        </div>
      </div>
 
      {/* Right Side: Actions and dropdowns */}
      <div className='flex items-center justify-between md:w-auto gap-2'>
        {/* Menu items */}
        <ul className='flex items-center gap-2'>
          {/* Add Asset - Hidden on mobile */}
          <li
           
          onClick={() => router.push(`/${locale}/asset-managements/add-asset`)}

            className='hidden md:flex cursor-pointer list-none items-center gap-1 shadow-[0_0_1px_1px_#00000047] py-[6px] px-[10px] rounded-[30px]'
          >
           
            <CirclePlus width={18} height={18} />
            Add Asset
           
          </li>
 
          {/* Asset List - Hidden on mobile */}
          <li
           
              onClick={() => router.push(`/${locale}/asset-managements/asset-list`)}
            className='hidden md:flex cursor-pointer list-none items-center gap-1 shadow-[0_0_1px_1px_#00000047] py-[6px] px-[10px] rounded-[30px]'
          >
             <List width={18} height={18} />
            Asset List
           
          </li>
 
          {/* QR Scanner - Hidden on mobile (moved to top) */}
          <li className='hidden md:flex cursor-pointer list-none items-center gap-1 shadow-[0_0_1px_1px_#00000047] py-[6px] px-[10px] rounded-[30px]' onClick={() => setOpen(true)}>
            <QrCode width={18} height={18} />
          </li>
        </ul>
 
        {/* Right-side dropdowns - md and up */}
        <div className='hidden md:flex items-center gap-2'>
          <ModeDropdown />
          <NotificationsDropdown notifications={[]} />
          <UserDropdown />
        </div>
      </div>
 
      {/* QR Scan Dialog */}
      <QrScan open={open} onClose={() => setOpen(false)} onScan={handleScanResult} />
    </div>
  )
}
 
export default NavbarContent
 
 
