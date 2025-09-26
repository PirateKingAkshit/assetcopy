// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem, Alert, Badge } from '@mui/material'
// import { FaFilter } from 'react-icons/fa'
// import { ArrowLeftRight } from 'lucide-react'
// import axiosInstance from '@/utils/axiosinstance'
// import { toast } from 'react-toastify'
// import { getCookie } from 'cookies-next'

// const AssetTransferButton = ({ onFilterApply, setData, productData, selectedRows, appliedFilters, onSticker, activeButtons  }) => {
//   const router = useRouter()
//   const { lang: locale } = useParams()

//   const [isFilterOpen, setIsFilterOpen] = useState(false)
//   const [error, setError] = useState(null)
//   const [isAdmin, setIsAdmin] = useState(false)

//   const [filters, setFilters] = useState({
//     model: appliedFilters?.model || '',
//     category: appliedFilters?.category || '',
//     location: appliedFilters?.location || '',
//     status: appliedFilters?.status || '',
//     brand: appliedFilters?.brand || ''
//   })

//   const [filterOptions, setFilterOptions] = useState({
//     category: [],
//     location: [],
//     status: [],
//     brand: [],
//     model: []
//   })

//   const labelMap = {
//     model: 'Model',
//     category: 'Category',
//     location: 'Location',
//     status: 'Status',
//     brand: 'Brand'
//   }

//   const activeFilterCount = Object.values(filters).filter(value => value !== '').length
// const enabledButtons = activeButtons.filter(btn => btn.isButton === true).map(btn => btn.name)
//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const [categoryRes, locationRes, statusRes, brandRes, modelRes] = await Promise.all([
//           axiosInstance.get('/category/all'),
//           axiosInstance.get('/location/all'),
//           axiosInstance.get('/status/all'),
//           axiosInstance.get('/brand/all'),
//           axiosInstance.get('/model/all')
//         ])

//         setFilterOptions({
//           category: categoryRes.data?.data?.map(c => ({ id: c._id, name: c.category_name })) || [],
//           location: locationRes.data?.data?.map(l => ({ id: l._id, name: l.location })) || [],
//           status: statusRes.data?.data?.map(s => ({ id: s._id, name: s.status })) || [],
//           brand: brandRes.data?.data?.map(b => ({ id: b._id, name: b.name })) || [],
//           model: modelRes.data?.data?.map(m => ({ id: m._id, name: m.model_name })) || []
//         })
//       } catch (error) {
//         console.error('Failed to fetch filter options:', error)
//         setError('Failed to load filter options. Please try again.')
//       }
//     }

//     fetchFilters()

//     try {
//       const cookie = getCookie('userData')
//       const userData = cookie ? JSON.parse(cookie) : null

//       if (userData?.isAdmin === true || userData?.isAdmin === 'true') {
//         setIsAdmin(true)
//       }
//     } catch (err) {
//       console.error('Error parsing userData cookie:', err)
//     }
//   }, [])

//   const handleFilterChange = e => {
//     const { name, value } = e.target
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }))
//     setError(null)
//   }

//   const handleApplyFilter = async () => {
//     try {
//       const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
//       const response = await axiosInstance.post('/filter', activeFilters)
//       if (response.data.status === 200) {
//         onFilterApply(activeFilters)
//         setIsFilterOpen(false)
//         setError(null)
//       } else {
//         throw new Error(response.data.message || 'Failed to apply filters')
//       }
//     } catch (error) {
//       console.error('Error applying filters:', error)
//       setError('Failed to apply filters. Falling back to direct filtering.')
//       onFilterApply(filters)
//       setIsFilterOpen(false)
//     }
//   }

//   const handleResetFilter = () => {
//     setFilters({
//       model: '',
//       category: '',
//       location: '',
//       status: '',
//       brand: ''
//     })
//     onFilterApply({})
//     setIsFilterOpen(false)
//     setError(null)
//   }

//   const handleTransfer = () => {
//     if (selectedRows.length === 0) {
//       toast.error('Please select at least one asset to transfer.')
//       return
//     }
//     const selectedIds = selectedRows.map(row => row.id).join(',')
//     router.push(`/${locale || 'en'}/asset-managements/asset-transferData?ids=${selectedIds}`)
//   }

//   const handleApproval = () => {
//     router.push(`/${locale}/asset-managements/transfer-approval`)
//   }

//   const handleReceive = () => {
//     router.push(`/${locale}/asset-managements/transferrecieve`)
//   }

//   return (
//     <>
//       <CardContent>
//         {error && (
//           <Alert severity='error' sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         <Grid container spacing={2} justifyContent='space-between' alignItems='center'>
//           <Grid item>
//             <Grid container spacing={2}>
//               {/* Show Initiate Transfer button only for Admin */}
//               {isAdmin && (
//                 <Grid item xs={12} sm='auto'>
//                   <Button
//                     variant='contained'
//                     color='primary'
//                     startIcon={<ArrowLeftRight size={18} />}
//                     onClick={handleTransfer}
//                     className='max-sm:w-full'
//                   >
//                     Initiate Transfer
//                   </Button>
//                 </Grid>
//               )}

//               {/* Show other buttons always */}
//                {enabledButtons.includes('Transfer Approval') && (
//               <Grid item xs={12} sm='auto'>
//                 <Button
//                   variant='contained'
//                   color='primary'
//                   startIcon={<img src='/images/approval.png' alt='Approval Icon' style={{ width: 18, height: 18 }} />}
//                   onClick={handleApproval}
//                   className='max-sm:w-full'
//                 >
//                   Transfer Approval
//                 </Button>
//               </Grid>
//                )}
//                  {enabledButtons.includes('Transfer Receive') && (
//               <Grid item xs={12} sm='auto'>
//                 <Button
//                   variant='contained'
//                   color='primary'
//                   startIcon={<img src='/images/receiveData.png' alt='Receive Icon' style={{ width: 18, height: 18 }} />}
//                   onClick={handleReceive}
//                   className='max-sm:w-full'
//                 >
//                   Transfer Receive
//                 </Button>
//               </Grid>
//                  )}
//             </Grid>
//           </Grid>

//           <Grid item>
//             <Badge
//               badgeContent={activeFilterCount}
//               color='primary'
//               invisible={activeFilterCount === 0}
//               sx={{
//                 '& .MuiBadge-badge': {
//                   top: -5,
//                   right: -5,
//                   minWidth: '20px',
//                   height: '20px',
//                   borderRadius: '50%',
//                   fontSize: '12px',
//                   fontWeight: 'bold'
//                 }
//               }}
//             >
//               {/* Filter button (optional) */}
//               {/* 
//             <Button
//               variant='outlined'
//               startIcon={<FaFilter />}
//               onClick={() => setIsFilterOpen(true)}
//             >
//               Filter
//             </Button> 
//             */}
//             </Badge>
//           </Grid>
//         </Grid>
//       </CardContent>

//       {/* Filter Modal */}
//       <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} aria-labelledby='filter-modal-title'>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '10%',
//             left: '50%',
//             transform: 'translate(-50%, 0)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//             outline: 'none'
//           }}
//         >
//           <Typography variant='h6' gutterBottom>
//             Filter Assets
//           </Typography>

//           <Grid container spacing={2}>
//             {Object.entries(filterOptions).map(([key, options]) => (
//               <Grid item xs={12} key={key}>
//                 <TextField
//                   select
//                   fullWidth
//                   label={labelMap[key]}
//                   name={key}
//                   value={filters[key]}
//                   onChange={handleFilterChange}
//                 >
//                   <MenuItem value=''>All {labelMap[key]}</MenuItem>
//                   {options.length > 0 ? (
//                     options.map(option => (
//                       <MenuItem key={option.id} value={option.id}>
//                         {option.name || 'N/A'}
//                       </MenuItem>
//                     ))
//                   ) : (
//                     <MenuItem disabled>No options available</MenuItem>
//                   )}
//                 </TextField>
//               </Grid>
//             ))}
//           </Grid>

//           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
//             <Button onClick={handleResetFilter}>Reset</Button>
//             <Button color='primary' variant='contained' onClick={handleApplyFilter}>
//               Apply
//             </Button>
//             <Button variant='outlined' color='secondary' onClick={() => setIsFilterOpen(false)}>
//               Cancel
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     </>
//   )
// }

// export default AssetTransferButton

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, CardContent, Grid, Modal, Box, Typography, TextField, MenuItem, Alert, Badge } from '@mui/material'
import { FaFilter } from 'react-icons/fa'
import { ArrowLeftRight } from 'lucide-react'
import axiosInstance from '@/utils/axiosinstance'
import { toast } from 'react-toastify'
import { getCookie } from 'cookies-next'

const AssetTransferButton = ({ onFilterApply, setData, productData, selectedRows, appliedFilters, activeButtons = [] }) => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filters, setFilters] = useState({
    model: appliedFilters?.model || '',
    category: appliedFilters?.category || '',
    location: appliedFilters?.location || '',
    status: appliedFilters?.status || '',
    brand: appliedFilters?.brand || '',
    vendor: appliedFilters?.vendor || '',
    department: appliedFilters?.department || '',
    alloted_to: appliedFilters?.alloted_to || ''
  })

  const [filterOptions, setFilterOptions] = useState({
    category: [],
    location: [],
    status: [],
    brand: [],
    model: [],
    vendor: [],
    department: [],
    alloted_to: []
  })

  const labelMap = {
    model: 'Model',
    category: 'Category',
    location: 'Location',
    status: 'Status',
    brand: 'Brand',
    vendor: 'Vendor',
    department: 'Department',
    alloted_to: 'Allotted To'
  }

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length

  // Normalize button names to handle typos (e.g., "Intitate Transfer" -> "Initiate Transfer")
  const normalizeButtonName = name => {
    if (name === 'Intitate Transfer') return 'Initiate Transfer'
    return name
  }

  // Filter activeButtons to only include those with isButton: true
  const enabledButtons = activeButtons
    .filter(btn => btn.isButton === true)
    .map(btn => normalizeButtonName(btn.name))

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoryRes, locationRes, statusRes, brandRes, modelRes, vendorRes, departmentRes, userRes] = await Promise.all([
          axiosInstance.get('/category/all'),
          axiosInstance.get('/location/all'),
          axiosInstance.get('/status/all'),
          axiosInstance.get('/brand/all'),
          axiosInstance.get('/model/all'),
          axiosInstance.get('/vendor/all'),
          axiosInstance.get('/dept/all'),
          axiosInstance.get('/user/all')
        ])

        setFilterOptions({
          category: categoryRes.data?.data?.map(c => ({ id: c._id, name: c.category_name })) || [],
          location: locationRes.data?.data?.map(l => ({ id: l._id, name: l.location })) || [],
          status: statusRes.data?.data?.map(s => ({ id: s._id, name: s.status })) || [],
          brand: brandRes.data?.data?.map(b => ({ id: b._id, name: b.name })) || [],
          model: modelRes.data?.data?.map(m => ({ id: m._id, name: m.model_name })) || [],
          vendor: vendorRes.data?.data?.map(v => ({ id: v._id, name: v.vendor_name })) || [],
          department: departmentRes.data?.data?.map(d => ({ id: d._id, name: d.department })) || [],
          alloted_to: userRes.data?.data?.map(u => ({ id: u._id, name: u.user_name })) || []
        })
      } catch (error) {
        console.error('Failed to fetch filter options:', error)
        setError('Failed to load filter options. Please try again.')
      }
    }

    fetchFilters()

    try {
      const cookie = getCookie('userData')
      const userData = cookie ? JSON.parse(cookie) : null
      if (userData?.isAdmin === true || userData?.isAdmin === 'true') {
        setIsAdmin(true)
      }
    } catch (err) {
      console.error('Error parsing userData cookie:', err)
    }
  }, [])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleApplyFilter = async () => {
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      const response = await axiosInstance.post('/filter', activeFilters)
      if (response.data.status === 200) {
        onFilterApply(activeFilters)
        setIsFilterOpen(false)
        setError(null)
      } else {
        throw new Error(response.data.message || 'Failed to apply filters')
      }
    } catch (error) {
      console.error('Error applying filters:', error)
      setError('Failed to apply filters. Falling back to direct filtering.')
      onFilterApply(filters)
      setIsFilterOpen(false)
    }
  }

  const handleResetFilter = () => {
    setFilters({
      model: '',
      category: '',
      location: '',
      status: '',
      brand: '',
      vendor: '',
      department: '',
      alloted_to: ''
    })
    onFilterApply({})
    setIsFilterOpen(false)
    setError(null)
  }

  const handleTransfer = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to transfer.')
      return
    }
    const selectedIds = selectedRows.map(row => row.id).join(',')
    router.push(`/${locale || 'en'}/asset-managements/asset-transferData?ids=${selectedIds}`)
  }

  const handleApproval = () => {
    router.push(`/${locale}/asset-managements/transfer-approval`)
  }

  const handleReceive = () => {
    router.push(`/${locale}/asset-managements/transferrecieve`)
  }

  return (
    <>
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Grid container spacing={2}>
              {/* Conditionally render buttons based on activeButtons */}
            {isAdmin && (
                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<ArrowLeftRight size={18} />}
                    onClick={handleTransfer}
                    className='max-sm:w-full'
                  >
                    Initiate Transfer
                  </Button>
                </Grid>
            )}
            
             {(isAdmin || enabledButtons.includes('Transfer Approval')) && (

                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<img src='/images/approval.png' alt='Approval Icon' style={{ width: 18, height: 18 }} />}
                    onClick={handleApproval}
                    className='max-sm:w-full'
                  >
                    Transfer Approval
                  </Button>
                </Grid>
              )}
             {(isAdmin || enabledButtons.includes('Transfer Receive')) && (

                <Grid item xs={12} sm='auto'>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<img src='/images/receiveData.png' alt='Receive Icon' style={{ width: 18, height: 18 }} />}
                    onClick={handleReceive}
                    className='max-sm:w-full'
                  >
                    Transfer Receive
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item>
            <Badge
              badgeContent={activeFilterCount}
              color='primary'
              invisible={activeFilterCount === 0}
              sx={{
                '& .MuiBadge-badge': {
                  top: -5,
                  right: -5,
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }
              }}
            >
              {/* <Button
                variant='outlined'
                startIcon={<FaFilter />}
                onClick={() => setIsFilterOpen(true)}
              >
                Filter
              </Button> */}
            </Badge>
          </Grid>
        </Grid>
      </CardContent>

      <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} aria-labelledby='filter-modal-title'>
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none'
          }}
        >
          <Typography variant='h6' gutterBottom>
            Filter Assets
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(filterOptions).map(([key, options]) => (
              <Grid item xs={12} key={key}>
                <TextField
                  select
                  fullWidth
                  label={labelMap[key]}
                  name={key}
                  value={filters[key]}
                  onChange={handleFilterChange}
                >
                  <MenuItem value=''>All {labelMap[key]}</MenuItem>
                  {options.length > 0 ? (
                    options.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name || 'N/A'}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options available</MenuItem>
                  )}
                </TextField>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={handleResetFilter}>Reset</Button>
            <Button color='primary' variant='contained' onClick={handleApplyFilter}>
              Apply
            </Button>
            <Button variant='outlined' color='secondary' onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default AssetTransferButton
