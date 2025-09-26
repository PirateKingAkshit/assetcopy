





'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import SearchIcon from '@mui/icons-material/Search'

const NavSearch = () => {
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const { lang: locale } = useParams()
  const data = useSearchParams()
  const keyword = data.get('keyword')

  useEffect(() => {
    setSearchValue(keyword ?? '')
  }, [keyword])

  // const handleSearch = () => {
  //   if (searchValue.trim()) {
  //     const url = getLocalizedUrl(
  //       `/asset-managements/asset-list?keyword=${encodeURIComponent(searchValue.trim())}`,
  //       locale
  //     )
  //     router.push(url)
  //   }
  // }

  const handleSearch = () => {
  if (searchValue.trim()) {
    console.log('NavSearch: Searching for keyword:', searchValue.trim()); // Debug log
    const url = getLocalizedUrl(
      `/asset-managements/asset-list?keyword=${encodeURIComponent(searchValue.trim())}`,
      locale
    );
    router.push(url);
  }
};

  return (
    <div className="flex items-center">
  <div 
    className="flex items-center justify-between bg-white border border-gray-300 rounded-full px-3 h-9 w-full min-w-[160px] shadow-[0_0_1px_1px_#00000047]" 
    style={{ height: '36px' }} 
  >
    <SearchIcon fontSize="small" className="text-gray-500" />
    <input
      type="text"
      placeholder="Find Your Asset"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch();
      }}
      className="flex-1 bg-transparent text-sm outline-none px-2"
    />
  </div>
</div>
  )
}

export default NavSearch
