'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Alert,
  Pagination,
  MenuItem,
  Box,
  Grid,
  InputLabel,
  FormControl,
  Select,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import classnames from 'classnames'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

import { Trash2 } from 'lucide-react'

import axiosInstance from '@/utils/axiosinstance'
import tableStyles from '@core/styles/table.module.css'
import dynamic from 'next/dynamic';

const AgGridWrapper = dynamic(() =>
  import('../agGrid/AgGridWrapper'),
  { ssr: false } // disable SSR if the component uses the browser (e.g., window, document)
);
import { toast } from 'react-toastify'
import { setCookie, getCookie } from 'cookies-next'

import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AssetTransferButton from './transferButton'

ModuleRegistry.registerModules([AllCommunityModule])

const formatDate = iso => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const TransferListTable = () => {
  const defaultPageSize = typeof window !== 'undefined' ? parseInt(getCookie('assetPageSize')) || 10 : 10
  const [rowData, setRowData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [viewAsset, setViewAsset] = useState(null)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeButtons, setActiveButtons] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize
  })

  // State for dynamic dropdown data
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [conditions, setConditions] = useState([])
  const [vendors, setVendors] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])

  const router = useRouter()
  const { lang: locale } = useParams()
  const gridRef = useRef(null)

  const mapAssetData = (assets = []) => {
  return assets.map(asset => ({
    id: asset._id,
    assetcode: asset.asset_code || 'N/A',
    assetname: asset.asset_name || 'N/A',
    location: asset.location?.location || 'N/A',
    locationId: asset.location?._id || null,
    category: asset.category?.category_name || 'N/A',
    categoryId: asset.category?._id || null,
    status: asset.status?.status || 'N/A',
    statusId: asset.status?._id || null,
    brand: asset.brand?.name || 'N/A',
    brandId: asset.brand?._id || null,
    model: asset.model?.model_name || 'N/A',
    modelId: asset.model?._id || null,
    vendor_name: asset.vendor?.vendor_name || 'N/A',
    vendorId: asset.vendor?._id || null,
    department_name: asset.dept?.department || 'N/A',
    departmentId: asset.dept?._id || null,
    alloted_username: asset.alloted_to?.user_name || 'N/A',
    allotedId: asset.alloted_to?._id || null,
    image: asset.file_attached || null,
    createdDate: asset.created_date ? formatDate(asset.created_date) : '',

    // 🔥 new fields
    shift: asset.shift || 'N/A',
    capitalizationPrice: asset.capitalization_price ?? 'N/A',
    capitalizationDate: asset.capitalization_date ? formatDate(asset.capitalization_date) : 'N/A',

    // ⏳ lifetime & depreciation
    lifetimeMonths: asset.lifetime_months ?? 'N/A',
    endOfLife: asset.end_of_life ? formatDate(asset.end_of_life) : 'N/A',
    depreciationMethod: asset.depreciation_method || 'N/A',
    depreciationPerc: asset.depreciation_perc?.$numberDecimal || 'N/A',
    scrapValue: asset.scrap_value ?? 'N/A'
  }))
}

  const [formData, setFormData] = useState({
    assetName: '',
    assetCode: '',
    serialNo: '',
    description: '',
    category: '',
    location: '',
    status: '',
    brand: '',
    model: '',
    condition: '',
    file: null,
    vendorName: '',
    invoiceNo: '',
    invoiceDate: null,
    purchaseDate: null,
    purchasePrice: '',
    PONo: '',
    capitalizationPrice: '',
    capitalizationDate: null,
    endOfLife: '',
    depreciation: '',
    incomeTaxDepreciation: '',
    departmentId: '',
    allotedTo: '',
    allotedUpTo: null,
    warranty_period: '',
    amcVendor: '',
    amcStartDate: null,
    amcEndDate: null,
    warrantyStartDate: null,
    warrantyEndDate: null,
    createdDate: null,
    warrantyStatus: '',
    depreciableAsset: '',
    accumulatedDepreciation: '',
    depreciationMethod: 'as per company policy',
    shift: 'Single Shift',
    scrapValue: ''
  })

  const fetchDropdownData = async () => {
    try {
      setLoading(true)
      const [
        categoriesRes,
        locationsRes,
        statusesRes,
        brandsRes,
        modelsRes,
        conditionsRes,
        vendorsRes,
        departmentsRes,
        usersRes
      ] = await Promise.all([
        axiosInstance.get('/category/all'),
        axiosInstance.get('/location/all'),
        axiosInstance.get('/status/all'),
        axiosInstance.get('/brand/all'),
        axiosInstance.get('/model/all'),
        axiosInstance.get('/condition/all'),
        axiosInstance.get('/vendor/all'),
        axiosInstance.get('/dept/all'),
        axiosInstance.get('/user/all')
      ])

      setCategories(categoriesRes.data.data || [])
      setLocations(locationsRes.data.data || [])
      setStatuses(statusesRes.data.data || [])
      setBrands(brandsRes.data.data || [])
      setModels(modelsRes.data.data || [])
      setConditions(conditionsRes.data.data || [])
      setVendors(vendorsRes.data.data || [])
      setDepartments(departmentsRes.data.data || [])
      setUsers(usersRes.data.data || [])
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
      setError('Error loading dropdown data. Please try again.')
      toast.error('Error loading dropdown data. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const fetchAssets = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('asset/all', {
        params: { page, limit: pageSize }
      })

      if (response.data?.status === 200) {
        // Always use assets from API
        const assets = response.data.data.assets || []
        const allAssets = mapAssetData(assets)

        // Use backend activeButtons
        setActiveButtons(response.data.data?.activeButtons || [])

        // Apply filters if any
        let filteredAssets = allAssets
        if (Object.keys(filters).length > 0) {
          filteredAssets = allAssets.filter(
            asset =>
              (!filters.category || asset.categoryId === filters.category) &&
              (!filters.location || asset.locationId === filters.location) &&
              (!filters.status || asset.statusId === filters.status) &&
              (!filters.brand || asset.brandId === filters.brand) &&
              (!filters.model || asset.modelId === filters.model) &&
              (!filters.vendor || asset.vendorId === filters.vendor) &&
              (!filters.department || asset.departmentId === filters.department) &&
              (!filters.alloted_to || asset.allotedId === filters.alloted_to)
          )
        }

        if (filteredAssets.length === 0 && Object.keys(filters).length > 0) {
          setError('No assets found for the selected filters.')
        } else {
          setError(null)
        }

        setPagination(response.data.pagination || {})
        setRowData(filteredAssets)
        setFilteredData(filteredAssets)
      } else {
        throw new Error(response.data?.message || 'Failed to fetch assets')
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setError(err.message || 'Error loading assets. Please try again.')
      setRowData([])
      setFilteredData([])
      setActiveButtons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdownData()
    const userData = typeof window !== 'undefined' ? JSON.parse(getCookie('userData') || '{}') : {}
    setIsAdmin(userData?.isAdmin || false)
    fetchAssets(pagination.currentPage, pagination.pageSize)
  }, [pagination.currentPage, pagination.pageSize, filters])

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || []
    const selectedData = selectedNodes.map(node => node.data)
    setSelectedRows(selectedData)
  }, [])

   const columnDefs = useMemo(
    () => [
      {
        headerName: '',
        field: 'select',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        maxWidth: 60,
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center' }
      },
      {
        headerName: 'Asset Code',
        field: 'assetcode',
        sortable: true,
        maxWidth: 160,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: params => (
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: isAdmin ? 'primary.main' : '#000000',
              textDecoration: isAdmin ? 'underline' : 'none',
              cursor: isAdmin ? 'pointer' : 'default',
              '&:hover': isAdmin ? { color: 'primary.dark' } : {}
            }}
            onClick={() => {
              if (isAdmin) {
                handleViewAsset(params.data)
              }
            }}
          >
            {params.value || 'N/A'}
          </Typography>
        ),
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Asset Name',
        field: 'assetname',
        maxWidth: 140,
        cellRenderer: params => params.value,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      
      {
        headerName: 'Category',
        field: 'category',
        maxWidth: 160,
        valueGetter: params => params.data.category || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
{
        headerName: 'Location',
        field: 'location',
        maxWidth: 140,
        valueGetter: params => params.data.location || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Capitalization Price',
        field: 'capitalizationPrice',
        maxWidth: 180,
        filter: 'agNumberColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000' }
      },
      {
        headerName: 'Capitalization Date',
        field: 'capitalizationDate',
        maxWidth: 180,
        filter: 'agDateColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000' }
      },
      {
        headerName: 'Shift',
        field: 'shift',
        maxWidth: 140,
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000' }
      },
{
  headerName: 'Lifetime (Months)',
  field: 'lifetimeMonths',
  maxWidth: 180,
  filter: 'agNumberColumnFilter',
  cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000' }
},
      {
        headerName: 'Status',
        field: 'status',
        maxWidth: 120,
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' },
        cellRenderer: params => (
          <Chip
            label={params.value || 'N/A'}
            variant='tonal'
            color={params.value === 'active' ? 'success' : params.value === 'inactive' ? 'error' : 'warning'}
            size='small'
          />
        ),
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Brand',
        field: 'brand',
        maxWidth: 140,
        valueGetter: params => params.data.brand || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Model',
        field: 'model',
        minWidth: 250,
        valueGetter: params => params.data.model || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Vendor',
        field: 'vendor_name',
        minWidth: 140,
        valueGetter: params => params.data.vendor_name || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Department',
        field: 'department_name',
        minWidth: 180,
        valueGetter: params => params.data.department_name || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Allotted To',
        field: 'alloted_username',
        maxWidth: 140,
        valueGetter: params => params.data.alloted_username || 'N/A',
        filter: 'agTextColumnFilter',
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        maxWidth: 140,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['equals', 'lessThan', 'greaterThan'],
          suppressAndOrCondition: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue || typeof cellValue !== 'string') return 0
            const dateParts = cellValue.split('-')
            if (dateParts.length !== 3) return 0
            const cellDate = new Date(
              parseInt(dateParts[2], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[0], 10)
            )
            if (isNaN(cellDate.getTime())) return 0
            const normalizedCellDate = new Date(
              cellDate.getFullYear(),
              cellDate.getMonth(),
              cellDate.getDate(),
              0,
              0,
              0,
              0
            )
            const normalizedFilterDate = new Date(
              filterLocalDateAtMidnight.getFullYear(),
              filterLocalDateAtMidnight.getMonth(),
              filterLocalDateAtMidnight.getDate(),
              0,
              0,
              0,
              0
            )
            if (normalizedCellDate.getTime() < normalizedFilterDate.getTime()) return -1
            if (normalizedCellDate.getTime() > normalizedFilterDate.getTime()) return 1
            return 0
          }
        },
        cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.875rem', color: '#000000' }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: params => (
          <div className='flex items-center gap-1 h-full'>
            {isAdmin && (
              <IconButton
                size='small'
                onClick={() => router.push(`/${locale}/asset-managements/edit-asset/${params.data.id}`)}
                className='hover:bg-blue-50'
              >
                <i className='ri-edit-line text-lg text-blue-500 hover:text-blue-600' />
              </IconButton>
            )}
            <IconButton size='small' onClick={() => handleViewAsset(params.data)} className='hover:bg-yellow-50'>
              <i className='ri-eye-line text-lg text-yellow-500 hover:text-yellow-600' />
            </IconButton>
            {isAdmin && (
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedAsset(params.data)
                  setOpenConfirm(true)
                }}
                className='hover:bg-red-50'
              >
                <Trash2 className='w-5 h-5 text-red-500 hover:text-red-600' strokeWidth={1.5} />
              </IconButton>
            )}
          </div>
        ),
        maxWidth: 150
      }
    ],
    [locale, router, isAdmin]
  )


  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMenu: false,
      cellStyle: { display: 'flex', alignItems: 'center' }
    }),
    []
  )

  const handleViewAsset = async asset => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/asset/${asset.id}`)
      console.log('Asset Details Response:', response.data)

      if (response.data && response.data.status === 200) {
        const assetData = response.data.data
        const depreciableAsset = assetData.isDepreciation || ''

        // Debug dropdown arrays
        console.log('Categories:', categories)
        console.log('Locations:', locations)
        console.log('Vendors:', vendors)
        console.log('Departments:', departments)
        console.log('Users:', users)
        console.log('Conditions:', conditions)

        setFormData({
          // Asset Details
          assetName: assetData.asset_name || '',
          assetCode: assetData.asset_code || '',
          serialNo: assetData.serial_no || '',
          description: assetData.description || '',
          category: assetData.category?._id || '',
          location: assetData.location?._id || '',
          status: assetData.status?._id || '',
          brand: assetData.brand?._id || '',
          model: assetData.model?._id || '',
          condition: assetData.condition?._id || '',
          file: assetData.file_attached || null,
          // Purchase Info
          vendorName: assetData.vendor?._id || '',
          invoiceNo: assetData.invoice_no || '',
          invoiceDate: assetData.invoice_date ? dayjs(assetData.invoice_date) : null,
          purchaseDate: assetData.purchase_date ? dayjs(assetData.purchase_date) : null,
          purchasePrice: assetData.purchase_price || '',
          PONo: assetData.po_number || '',
          // Finance Info
          capitalizationPrice: depreciableAsset === 'yes' ? assetData.capitalization_price || '' : '',
          capitalizationDate:
            depreciableAsset === 'yes'
              ? assetData.capitalization_date
                ? dayjs(assetData.capitalization_date)
                : null
              : null,
          endOfLife: depreciableAsset === 'yes' ? assetData.lifetime_months || '' : '',
          depreciation:
            depreciableAsset === 'yes'
              ? assetData.depreciation_perc?.$numberDecimal || assetData.depreciation_perc || ''
              : '',
          incomeTaxDepreciation:
            depreciableAsset === 'yes'
              ? assetData.incometaxdepreciation_per?.$numberDecimal || assetData.incometaxdepreciation_per || ''
              : '',
          depreciationMethod:
            depreciableAsset === 'yes' ? assetData.depreciation_method || 'as per company policy' : '',
          accumulatedDepreciation: depreciableAsset === 'yes' ? assetData.accumulated_depreciation || '' : '',
          shift:
            depreciableAsset === 'yes'
              ? assetData.shift
                ? assetData.shift
                    .split(' ')
                    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ')
                : 'Single Shift'
              : '',
          scrapValue: depreciableAsset === 'yes' ? assetData.scrap_value || '' : '',
          // Other Info
          departmentId: assetData.dept?._id || '',
          allotedTo: assetData.alloted_to?._id || '',
          allotedUpTo: assetData.alloted_upto ? dayjs(assetData.alloted_upto) : null,
          amcVendor: assetData.amc_vendor || '',
          amcStartDate: assetData.amc_startdate ? dayjs(assetData.amc_startdate) : null,
          amcEndDate: assetData.amc_enddate ? dayjs(assetData.amc_enddate) : null,
          // Warranty Info
          warrantyStartDate: assetData.warranty_startdate ? dayjs(assetData.warranty_startdate) : null,
          warranty_period: assetData.warranty_period || '',
          warrantyEndDate: assetData.warranty_enddate ? dayjs(assetData.warranty_enddate) : null,
          warrantyStatus: assetData.warranty || '',
          // Insurance Info
          insuranceStartDate: assetData.insurance_startdate ? dayjs(assetData.insurance_startdate) : null,
          // Misc
          createdDate: assetData.created_date ? dayjs(assetData.created_date) : null,
          depreciableAsset
        })

        // Debug formData values
        console.log('FormData:', {
          category: assetData.category?._id,
          location: assetData.location?._id,
          vendorName: assetData.vendor?._id,
          departmentId: assetData.dept?._id,
          allotedTo: assetData.alloted_to?._id,
          condition: assetData.condition?._id
        })

        setViewAsset(asset)
        setOpenViewDialog(true)
      } else {
        throw new Error(response.data.message || 'Failed to fetch asset details')
      }
    } catch (err) {
      console.error('Error fetching asset details:', err)
      setError(err.message || 'Error fetching asset details. Please try again.')
      toast.error(err.message || 'Error fetching asset details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setViewAsset(null)
    setFormData({
      assetName: '',
      assetCode: '',
      serialNo: '',
      description: '',
      category: '',
      location: '',
      status: '',
      brand: '',
      model: '',
      condition: '',
      file: null,
      vendorName: '',
      invoiceNo: '',
      invoiceDate: null,
      purchaseDate: null,
      purchasePrice: '',
      PONo: '',
      capitalizationPrice: '',
      capitalizationDate: null,
      endOfLife: '',
      depreciation: '',
      incomeTaxDepreciation: '',
      departmentId: '',
      allotedTo: '',
      allotedUpTo: null,
      amcVendor: '',
      amcStartDate: null,
      amcEndDate: null,
      warrantyStartDate: null,
      warrantyEndDate: null,
      createdDate: null,
      warrantyStatus: '',
      depreciableAsset: '',
      accumulatedDepreciation: '',
      depreciationMethod: 'as per company policy',
      shift: 'Single Shift',
      scrapValue: ''
    })
  }

  const handleFilterApply = useCallback(activeFilters => {
    setFilters(activeFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleFilterChange = useCallback(
  value => {
    setGlobalFilter(value)
    if (value) {
      const lowerValue = value.toLowerCase()
      const filtered = rowData.filter(item =>
        (item.assetname && item.assetname.toLowerCase().includes(lowerValue)) ||
        (item.assetcode && item.assetcode.toLowerCase().includes(lowerValue)) ||
        (item.location && item.location.toLowerCase().includes(lowerValue)) ||
        (item.category && item.category.toLowerCase().includes(lowerValue)) ||
        (item.status && item.status.toLowerCase().includes(lowerValue)) ||
        (item.brand && item.brand.toLowerCase().includes(lowerValue)) ||
        (item.model && item.model.toLowerCase().includes(lowerValue)) ||
        (item.vendor_name && item.vendor_name.toLowerCase().includes(lowerValue)) ||
        (item.department_name && item.department_name.toLowerCase().includes(lowerValue)) ||
        (item.alloted_username && item.alloted_username.toLowerCase().includes(lowerValue)) ||
        (item.createdDate && item.createdDate.toLowerCase().includes(lowerValue)) ||

        // 🔥 new fields included
        (item.shift && item.shift.toLowerCase().includes(lowerValue)) ||
        (item.capitalizationPrice && String(item.capitalizationPrice).toLowerCase().includes(lowerValue)) ||
        (item.capitalizationDate && item.capitalizationDate.toLowerCase().includes(lowerValue)) ||
        (item.lifetimeMonths && String(item.lifetimeMonths).toLowerCase().includes(lowerValue))
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(rowData)
    }
  },
  [rowData]
)



  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`asset/${selectedAsset.id}`)
      setRowData(prevData => prevData.filter(asset => asset.id !== selectedAsset.id))
      setFilteredData(prevData => prevData.filter(asset => asset.id !== selectedAsset.id))
      setOpenConfirm(false)
      toast.success('Asset deleted successfully!')
    } catch (err) {
      console.error('Error deleting asset:', err)
      setError('Error deleting asset. Please try again.')
      toast.error('Error deleting asset. Please try again.')
    }
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  if (loading) {
    return (
      <Card className='flex flex-col'>
        <div className='flex items-center justify-center p-10'>
          <Typography variant='body1'>Loading assets...</Typography>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className='flex flex-col'>
        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        <div className='flex flex-col'>
          <AssetTransferButton
            setData={setFilteredData}
            productData={rowData}
            onFilterApply={handleFilterApply}
            appliedFilters={filters}
            selectedRows={selectedRows}
            activeButtons={activeButtons}
          />
          <Divider />
        </div>
        {isAdmin && (
          <div className='flex flex-col p-5 gap-4'>
            <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4'>
              <DebouncedInput
                value={globalFilter}
                onChange={handleFilterChange}
                placeholder='Search Asset'
                className='max-sm:w-full'
              />
              <div className='flex items-center max-sm:flex-col gap-4 max-sm:w-full'>
              
              </div>
            </div>
            <div>
              <AgGridWrapper
                rowData={filteredData}
                columnDefs={columnDefs}
                onSelectionChanged={onSelectionChanged}
                gridRef={gridRef}
                rowSelection='multiple'
                domLayout='autoHeight'
              />
            </div>
            <div className='flex justify-between items-center py-4 flex-wrap gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Rows per page:</span>
                <TextField
                  select
                  size='small'
                  value={pagination.pageSize}
                  onChange={e => {
                    const newSize = parseInt(e.target.value)
                    if (typeof window !== 'undefined') {
                      setCookie('assetPageSize', newSize)
                    }
                    setPagination(prev => ({
                      ...prev,
                      pageSize: newSize,
                      currentPage: 1,
                      totalPages: Math.ceil(prev.totalItems / newSize)
                    }))
                  }}
                >
                  {[10, 15, 20].map(size => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <Pagination
                color='primary'
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
              />
            </div>
          </div>
        )}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>Are you sure you want to delete this asset?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color='inherit'>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* view asset */}
        <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth='md' fullWidth>
          <DialogTitle
            sx={{ bgcolor: 'primary.main', color: 'white', py: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <i className='ri-information-line text-lg' />
            View Asset Details
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#f9fafb', py: 4 }}>
            {viewAsset && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Asset Details Section */}
                  <Box
                    sx={{
                      bgcolor: 'white',
                      p: 3,
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: 'box-shadow 0.3s ease',
                      marginTop: 4
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-box-3-line text-lg' />
                      Asset Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Asset Name'
                          placeholder='Asset name'
                          value={formData.assetName}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Asset Code'
                          placeholder='Asset code'
                          value={formData.assetCode}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Category</InputLabel>
                          <Select
                            label='Category'
                            value={formData.category}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {categories.map(category => (
                              <MenuItem key={category._id} value={category._id}>
                                {category.category_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Location</InputLabel>
                          <Select
                            label='Location'
                            value={formData.location}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {locations.map(location => (
                              <MenuItem key={location._id} value={location._id}>
                                {location.location}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Status</InputLabel>
                          <Select
                            label='Status'
                            value={formData.status}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {statuses.map(status => (
                              <MenuItem key={status._id} value={status._id}>
                                {status.status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Brand</InputLabel>
                          <Select
                            label='Brand'
                            value={formData.brand}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {brands.map(brand => (
                              <MenuItem key={brand._id} value={brand._id}>
                                {brand.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Model</InputLabel>
                          <Select
                            label='Model'
                            value={formData.model}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {models.map(model => (
                              <MenuItem key={model._id} value={model._id}>
                                {model.model_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Serial No'
                          placeholder='Serial number'
                          value={formData.serialNo}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Description'
                          placeholder='Description'
                          value={formData.description}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Condition</InputLabel>
                          <Select
                            label='Condition'
                            value={formData.condition}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {conditions.map(condition => (
                              <MenuItem key={condition._id} value={condition._id}>
                                {condition.condition}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Purchase Info Section */}
                  <Box
                    sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 3, transition: 'box-shadow 0.3s ease' }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-shopping-cart-line text-lg' />
                      Purchase Info
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Vendor name</InputLabel>
                          <Select
                            label='Vendor name'
                            value={formData.vendorName}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {vendors.map(vendor => (
                              <MenuItem key={vendor._id} value={vendor._id}>
                                {vendor.vendor_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Invoice No'
                          type='text'
                          placeholder='Invoice number'
                          value={formData.invoiceNo}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label='Invoice Date'
                          value={formData.invoiceDate}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          disabled
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: 'DD-MM-YYYY',
                              sx: {
                                '& .MuiInputBase-root.Mui-disabled': {
                                  // bgcolor: '#f5f5f5',
                                  color: 'text.primary',
                                  '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  borderRadius: 1
                                },
                                '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='PO Number'
                          placeholder='PO number'
                          value={formData.PONo}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Purchase Price'
                          type='number'
                          placeholder='Purchase price'
                          value={formData.purchasePrice}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Finance Info Section */}
                  <Box
                    sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 3, transition: 'box-shadow 0.3s ease' }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-money-dollar-circle-line text-lg' />
                      Finance Info
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl>
                          <Box display='flex' alignItems='center' gap={2}>
                            <FormLabel sx={{ marginRight: 1, color: '#262b43ba', fontWeight: 500 }}>
                              Depreciable Asset
                            </FormLabel>
                            <RadioGroup
                              row
                              value={formData.depreciableAsset}
                              disabled
                              sx={{
                                '& .MuiRadio-root.Mui-disabled': { color: 'text.secondary' },
                                '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' }
                              }}
                            >
                              <FormControlLabel value='yes' disabled control={<Radio />} label='Yes' />
                              <FormControlLabel value='no' disabled control={<Radio />} label='No' />
                            </RadioGroup>
                          </Box>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Capitalization Price'
                          type='number'
                          placeholder='Capitalization price'
                          value={formData.capitalizationPrice}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label='Capitalization Date'
                          value={formData.capitalizationDate}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          disabled
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: 'DD-MM-YYYY',
                              sx: {
                                '& .MuiInputBase-root.Mui-disabled': {
                                  bgcolor: '#f5f5f5',
                                  color: 'text.primary',
                                  '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  borderRadius: 1
                                },
                                '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Asset life(months)'
                          type='number'
                          placeholder='Asset life'
                          value={formData.endOfLife}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Depreciation%'
                          placeholder='Depreciation%'
                          value={formData.depreciation}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Income Tax Depreciation%'
                          placeholder='Income tax depreciation%'
                          value={formData.incomeTaxDepreciation}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label='Shift'
                          value={formData.shift}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        >
                          <MenuItem value='Single Shift'>Single Shift</MenuItem>
                          <MenuItem value='150% Shift'>150% Shift</MenuItem>
                          <MenuItem value='Double Shift'>Double Shift</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Scrap Value'
                          type='number'
                          placeholder='Scrap value'
                          value={formData.scrapValue}
                          disabled
                          sx={{
                            '& .MuiInputBase-root.Mui-disabled': {
                              // bgcolor: '#f5f5f5',
                              color: 'text.primary',
                              '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                            },
                            '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Alloted Info Section */}
                  <Box
                    sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 3, transition: 'box-shadow 0.3s ease' }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-user-line text-lg' />
                      Alloted Info
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Department</InputLabel>
                          <Select
                            label='Department'
                            value={formData.departmentId}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {departments.map(department => (
                              <MenuItem key={department._id} value={department._id}>
                                {department.department}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}>Allotted To</InputLabel>
                          <Select
                            label='Allotted To'
                            value={formData.allotedTo}
                            disabled
                            sx={{
                              '&.Mui-disabled': { color: 'text.primary' },
                              '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'text.primary' }
                            }}
                          >
                            {users.map(user => (
                              <MenuItem key={user._id} value={user._id}>
                                {user.user_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label='Allotted Up To'
                          value={formData.allotedUpTo}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          disabled
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: 'DD-MM-YYYY',
                              sx: {
                                '& .MuiInputBase-root.Mui-disabled': {
                                  // bgcolor: '#f5f5f5',
                                  color: 'text.primary',
                                  '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  borderRadius: 1
                                },
                                '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Warranty Info Section */}
                  <Box
                    sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 3, transition: 'box-shadow 0.3s ease' }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-shield-check-line text-lg' />
                      Warranty Info
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {' '}
                        <FormControl component='fieldset' fullWidth>
                          {' '}
                          <FormLabel sx={{ color: 'text.primary', fontWeight: 500, mb: 1 }}>
                            {' '}
                            Warranty Status{' '}
                          </FormLabel>{' '}
                          <RadioGroup
                            row
                            name='warrantyStatus'
                            value={formData.warrantyStatus}
                            disabled
                            sx={{
                              '& .MuiRadio-root.Mui-disabled': { color: 'text.secondary' },
                              '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' }
                            }}
                          >
                            {' '}
                            <FormControlLabel value='amc' control={<Radio disabled />} label='AMC' />{' '}
                            <FormControlLabel value='under warranty' control={<Radio disabled />} label='Warranty' />{' '}
                            <FormControlLabel value='insurance' control={<Radio disabled />} label='Insurance' />{' '}
                          </RadioGroup>{' '}
                        </FormControl>{' '}
                      </Grid>

                      {formData.warrantyStatus === 'amc' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label='AMC Vendor'
                              placeholder='AMC Vendor'
                              value={formData.amcVendor}
                              disabled
                              sx={{
                                '& .MuiInputBase-root.Mui-disabled': {
                                  // bgcolor: '#f5f5f5',
                                  color: 'text.primary',
                                  '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary' }
                                },
                                '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary' }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label='AMC Start Date'
                              value={formData.amcStartDate}
                              format='DD-MM-YYYY'
                              views={['year', 'month', 'day']}
                              openTo='day'
                              disabled
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  placeholder: 'DD-MM-YYYY',
                                  sx: {
                                    '& .MuiInputBase-root.Mui-disabled': {
                                      // bgcolor: '#f5f5f5',
                                      color: 'text.primary',
                                      '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      borderRadius: 1
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label='AMC End Date'
                              value={formData.amcEndDate}
                              format='DD-MM-YYYY'
                              views={['year', 'month', 'day']}
                              openTo='day'
                              disabled
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  placeholder: 'DD-MM-YYYY',
                                  sx: {
                                    '& .MuiInputBase-root.Mui-disabled': {
                                      // bgcolor: '#f5f5f5',
                                      color: 'text.primary',
                                      '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      borderRadius: 1
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}
                      {formData.warrantyStatus === 'under warranty' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label='Warranty Start Date'
                              value={formData.warrantyStartDate}
                              format='DD-MM-YYYY'
                              views={['year', 'month', 'day']}
                              openTo='day'
                              disabled
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  placeholder: 'DD-MM-YYYY',
                                  sx: {
                                    '& .MuiInputBase-root.Mui-disabled': {
                                      // bgcolor: '#f5f5f5',
                                      color: 'text.primary',
                                      '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      borderRadius: 1
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label='Warranty period'
                              type='number'
                              disabled
                              placeholder='Warranty period'
                              value={formData.warranty_period}
                              onChange={e => {
                                const value = e.target.value

                                setFormData({
                                  ...formData,
                                  warranty_period: value
                                })
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label='Warranty End Date'
                              value={formData.warrantyEndDate}
                              format='DD-MM-YYYY'
                              views={['year', 'month', 'day']}
                              openTo='day'
                              disabled
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  placeholder: 'DD-MM-YYYY',
                                  sx: {
                                    '& .MuiInputBase-root.Mui-disabled': {
                                      // bgcolor: '#f5f5f5',
                                      color: 'text.primary',
                                      '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      borderRadius: 1
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}
                      {formData.warrantyStatus === 'insurance' && (
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label='Insurance Start Date'
                            value={formData.insuranceStartDate}
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            disabled
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: 'DD-MM-YYYY',
                                sx: {
                                  '& .MuiInputBase-root.Mui-disabled': {
                                    color: 'text.primary',
                                    '& .MuiInputBase-input': { WebkitTextFillColor: 'text.primary', opacity: 1 },
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    borderRadius: 1
                                  },
                                  '& .MuiInputLabel-root.Mui-disabled': { color: 'text.secondary', opacity: 1 }
                                }
                              }
                            }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
              </LocalizationProvider>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f9fafb' }}>
            <Button
              onClick={handleCloseViewDialog}
              color='inherit'
              sx={{
                bgcolor: 'grey.200',
                '&:hover': { bgcolor: 'grey.300' },
                px: 3,
                borderRadius: 1
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default TransferListTable
