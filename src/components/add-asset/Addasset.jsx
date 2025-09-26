'use client'
import { useState, useEffect, useRef } from 'react'

import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import {
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  CircularProgress,
  ListSubheader,
  Autocomplete,
  Tooltip
} from '@mui/material'
import { CloudUpload } from 'lucide-react'
import AddIcon from '@mui/icons-material/Add'

// Toastify Imports
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Axios Import

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import dayjs from 'dayjs'

import axiosInstance from '@/utils/axiosinstance'
import AssetAddVendorDrawer from '../asset-vendor/VendorAddDrawer'

const AddAsset = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [value, setValue] = useState('asset_details')
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [brands, setBrands] = useState([])
  const [conditions, setConditions] = useState([])
  const [users, setUsers] = useState([])
  const [allModels, setAllModels] = useState([]) // Store all models
  const [filteredModels, setFilteredModels] = useState([]) // Store filtered models
  const [vendor, setVendor] = useState([])
  const [department, setDepartment] = useState([])
  const [loading, setLoading] = useState(false)
  const [codeType, setCodeType] = useState('AUTO')
  const [assetCodeEditable, setAssetCodeEditable] = useState(false)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('asset_details')
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [parentCategory, setParentCategory] = useState('')
  const [status, setStatus] = useState('Active')
  const [openLocationDrawer, setOpenLocationDrawer] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [parentLocationName, setParentLocationName] = useState('')
  const [lattitdude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [brandName, setBrandName] = useState('')
  const [openBrandDrawer, setOpenBrandDrawer] = useState(false)
  const [modelName, setModelName] = useState('')
  const [openModelDrawer, setOpenModelDrawer] = useState(false)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [openVendorDrawer, setOpenVendorDrawer] = useState(false)
  const [data, setData] = useState([])
  const [showPriceHint, setShowPriceHint] = useState(false) // Separate state for TextField
  const [validLives, setValidLives] = useState([])
  const [rates, setRates] = useState([])
  const [prevFinanceData, setPrevFinanceData] = useState({})
  const [defaultMethod, setDefaultMethod] = useState('')
  const fileInputRef = useRef(null)
  const [vendorErrors, setVendorErrors] = useState({})

  const initialValues = {
    vendor_name: '',
    email: '',
    contact_person_name: '',
    contact_person_mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    file_attached: null,
    status: 'Active'
  }

  const [vendorLoading, setVendorLoading] = useState(false)
  const [vendorFormData, setVendorFormData] = useState(initialValues)

  const [addCategoryErrors, setAddCategoryErrors] = useState({
    name: '',
    status: ''
  })

  const [addLoactionErrors, setAddLocationErrors] = useState({
    name: '',
    status: ''
  })

  const [addBrandErrors, setAddBrandErrors] = useState({
    name: '',
    status: ''
  })

  const [addModelErrors, setAddModelErrors] = useState({
    name: '',
    status: '',
    brand: ''
  })

  const [formData, setFormData] = useState({
    assetName: '',
    serialNo: '',
    description: '',
    assetCode: '',
    category: '',
    location: '',
    warranty_period: '',
    status: '',
    brand: '',
    model: '',
    condition: '',
    serialNo: '',
    file: null,
    vendorName: '',
    invoiceNo: '',
    invoiceDate: null,

    // purchaseDate: null,
    purchasePrice: '',
    capitalizationPrice: '',
    capitalizationDate: null,
    endOfLife: null,
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
    insuranceStartDate: null,
    insuranceEndDate: null,
    insurancePeriod: null,
    insuranceCompanyName: '',
    createdDate: null,
    warrantyStatus: 'under warranty',
    ponumber: '', // New field
    // accumulatedDepreciation: '', // New field
    scrapvalue: '', // New field
    // shift: '', // New field
    // depreciationmethod: '' // New field
    depreciableAsset: 'yes',

    // depreciationMethod: 'as per company policy', // default value
    shift: 'single shift' // default value
  })

  const [errors, setErrors] = useState({
    asset_details: {},
    purchase_info: {},
    finance_info: {},
    asset_details: {},
    alloted_info: {},
    warranty_info: {},
    insurance_info: {}
  })

  // Fetch data for dropdowns
  const fetchData = async () => {
    try {
      const [
        categoryResponse,
        locationResponse,
        statusResponse,
        brandResponse,
        conditionResponse,
        vendorResponse,
        usersResponse,
        departmentResponse,
        modelResponse
      ] = await Promise.all([
        axiosInstance.get('category/all'),
        axiosInstance.get('location/all'),
        axiosInstance.get('status/all'),
        axiosInstance.get('brand/all'),
        axiosInstance.get('condition/all'),
        axiosInstance.get('vendor/all'),
        axiosInstance.get('user/all'),
        axiosInstance.get('dept/all'),
        axiosInstance.get('model/all')
      ])

      setCategories(categoryResponse.data.data || [])
      setLocations(locationResponse.data.data || [])
      setStatuses(statusResponse.data.data || [])
      setBrands(brandResponse.data.data || [])
      setConditions(conditionResponse.data.data || [])
      setVendor(vendorResponse.data.data || [])
      setUsers(usersResponse.data.data || [])
      setDepartment(departmentResponse.data.data || [])
      setAllModels(modelResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch dropdown data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.capitalizationDate && formData.warranty_period) {
      setFormData(prev => ({
        ...prev,

        warrantyEndDate: prev.warrantyStartDate
          ? dayjs(prev.warrantyStartDate).add(parseInt(prev.warranty_period), 'month')
          : prev.warrantyEndDate
      }))
    }
  }, [formData.capitalizationDate, formData.warranty_period, formData.warrantyStartDate])

  useEffect(() => {
    const fetchNextAssetCode = async () => {
      try {
        const response = await axiosInstance.get('/asset/next-code')

        if (response.data.status === 200) {
          setCodeType(response.data.data.codeType)

          if (response.data.data.codeType === 'AUTO') {
            // AUTO mode: prefill and make non-editable
            setFormData(prev => ({
              ...prev,
              assetCode: response.data.data.nextAssetCode
            }))
            setAssetCodeEditable(false)
          } else {
            // MANUAL mode: clear and make editable
            setFormData(prev => ({ ...prev, assetCode: '' }))
            setAssetCodeEditable(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch next asset code', error)
        // Fallback to MANUAL mode on error
        setCodeType('MANUAL')
        setAssetCodeEditable(true)
      }
    }

    fetchNextAssetCode()
  }, [])
  //asset life matched data
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axiosInstance.get('/rates/all')

        if (res.data?.data) {
          setRates(res.data.data.rates || [])
          setValidLives((res.data.data.rates || []).map(r => r.life)) // ✅ asset lives set

          if (res.data.data.method) {
            setDefaultMethod(res.data.data.method) // e.g. "WDV"
            setFormData(prev => ({ ...prev, method: res.data.data.method }))
          }
        }
      } catch (err) {
        console.error('Error fetching rates:', err)
      }
    }

    fetchRates()
  }, [setFormData])

  useEffect(() => {
    if (statuses.length > 0 && !formData.status) {
      const inUseStatus = statuses.find(s => s.status.toLowerCase() === 'in use')

      if (inUseStatus) {
        setFormData(prev => ({
          ...prev,
          status: inUseStatus._id
        }))
      }
    }

    if (conditions.length > 0 && !formData.condition) {
      const goodCondition = conditions.find(c => c.condition.toLowerCase() === 'good')

      if (goodCondition) {
        setFormData(prev => ({
          ...prev,
          condition: goodCondition._id
        }))
      }
    }
  }, [statuses, conditions, formData.status, formData.condition])

  //depreciation

  useEffect(() => {
    if (formData.endOfLife && defaultMethod && rates.length > 0) {
      const matched = rates.find(item => item.life === Number(formData.endOfLife))

      if (matched) {
        let value = ''

        if (defaultMethod === 'SLM') {
          value = matched.slm_value?.$numberDecimal
        } else if (defaultMethod === 'WDV') {
          value = matched.wdv_value?.$numberDecimal
        }

        if (value) {
          setFormData(prev => ({ ...prev, depreciation: value }))
          setErrors(prev => ({
            ...prev,
            finance_info: { ...prev.finance_info, depreciation: '' }
          }))
        }
      } else {
        setErrors(prev => ({
          ...prev,
          finance_info: { ...prev.finance_info, depreciation: 'Invalid asset life' }
        }))
      }
    }
  }, [formData.endOfLife, defaultMethod, rates, setFormData, setErrors])

  useEffect(() => {
    if (formData.brand) {
      const filtered = allModels.filter(model => model.brand._id === formData.brand)

      setFilteredModels(filtered)

      if (!filtered.some(model => model._id === formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }))
      }
    } else {
      setFilteredModels([])
      setFormData(prev => ({ ...prev, model: '' }))
    }
  }, [formData.brand, allModels])

  const tabs = ['asset_details', 'purchase_info', 'finance_info', 'alloted_info', 'warranty_info']

  const validateSection = section => {
    const newErrors = {}

    if (section === 'asset_details') {
      newErrors.asset_details = {
        assetName: formData.assetName ? '' : 'Asset Name is required',
        category: formData.category ? '' : 'Category is required',
        location: formData.location ? '' : 'Location is required',
        status: formData.status ? '' : 'Status is required',
        file: formData.file && formData.file.size > 5 * 1024 * 1024 ? 'File size must not exceed 5MB' : '' ,
         assetCode: codeType === 'MANUAL' 
      ? formData.assetCode 
        ? '' 
        : 'Asset Code is required in MANUAL mode'
      : ''

      }
    } else if (section === 'purchase_info') {
      newErrors.purchase_info = {
        vendorName: formData.vendorName ? '' : 'Vendor Name is required',
        invoiceDate: formData.invoiceDate ? '' : 'Invoice Date is required',
        purchasePrice: formData.purchasePrice ? '' : 'Purchase Price is required',
        invoiceNo: formData.invoiceNo ? '' : 'Invoice Number is required'
      }
    } else if (section === 'finance_info') {
      newErrors.finance_info = {}

      if (formData.depreciableAsset === 'yes') {
        // ✅ Capitalization Date
        if (!formData.capitalizationDate) {
          newErrors.finance_info.capitalizationDate = 'Capitalization Date is required'
        } else {
          const invoiceDate = formData.invoiceDate ? dayjs(formData.invoiceDate) : null
          const capitalizationDate = formData.capitalizationDate ? dayjs(formData.capitalizationDate) : null

          if (capitalizationDate && invoiceDate && capitalizationDate.isBefore(invoiceDate, 'day')) {
            newErrors.finance_info.capitalizationDate = `Capitalization Date cannot be earlier than Invoice Date (${invoiceDate.format('DD-MM-YYYY')})`
          } else {
            newErrors.finance_info.capitalizationDate = ''
          }
        }

        // ✅ Capitalization Price
        if (!formData.capitalizationPrice) {
          newErrors.finance_info.capitalizationPrice = 'Capitalization Price is required'
        } else if (Number(formData.capitalizationPrice) < Number(formData.purchasePrice)) {
          newErrors.finance_info.capitalizationPrice = `Cannot be less than Purchase Price (${formData.purchasePrice})`
        } else {
          newErrors.finance_info.capitalizationPrice = ''
        }

        // ✅ Other finance fields
        newErrors.finance_info.endOfLife = formData.endOfLife ? '' : 'End of Life is required'
        newErrors.finance_info.depreciation = formData.depreciation ? '' : 'Depreciation % is required'
        newErrors.finance_info.scrapvalue = formData.scrapvalue ? '' : 'Scrap value is required'
        newErrors.finance_info.incomeTaxDepreciation = formData.incomeTaxDepreciation
          ? ''
          : 'Income Tax Depreciation is required'
      } else {
        // ✅ If depreciableAsset = "no", clear all finance errors
        newErrors.finance_info.capitalizationDate = ''
        newErrors.finance_info.capitalizationPrice = ''
        newErrors.finance_info.endOfLife = ''
        newErrors.finance_info.depreciation = ''
        newErrors.finance_info.scrapvalue = ''
        newErrors.finance_info.incomeTaxDepreciation = ''
      }
    } else if (section === 'alloted_info') {
      newErrors.alloted_info = {
        departmentId: formData.departmentId ? '' : 'Department is required',
        allotedTo: formData.allotedTo ? '' : 'Alloted To is required'
      }
    } else if (section === 'warranty_info') {
      newErrors.warranty_info = {}

      if (formData.warrantyStatus === 'under warranty') {
        newErrors.warranty_info.warrantyStartDate = formData.warrantyStartDate ? '' : 'Warranty Start Date is required'
        newErrors.warranty_info.warranty_period = formData.warranty_period ? '' : 'Warranty Period is required'
        newErrors.warranty_info.warrantyEndDate = formData.warrantyEndDate ? '' : 'Warranty End Date is required'
      } else if (formData.warrantyStatus === 'amc') {
        newErrors.warranty_info.amcVendor = formData.amcVendor ? '' : 'AMC Vendor is required'
        newErrors.warranty_info.amcStartDate = formData.amcStartDate ? '' : 'AMC Start Date is required'
        newErrors.warranty_info.amcEndDate = formData.amcEndDate ? '' : 'AMC End Date is required'
      } else {
        // If no warranty
        newErrors.warranty_info.warrantyStartDate = ''
        newErrors.warranty_info.warranty_period = ''
        newErrors.warranty_info.warrantyEndDate = ''
      }
    } else if (section === 'insurance_info') {
      newErrors.insurance_info = {}

      const hasInsuranceData =
        formData.insuranceStartDate ||
        formData.insuranceEndDate ||
        formData.insurancePeriod ||
        formData.insuranceCompanyName

      if (!hasInsuranceData) {
        return { insurance_info: {} }
      }

      // --- Required fields ---
      if (!formData.insuranceStartDate) {
        newErrors.insurance_info.insuranceStartDate = 'Insurance Start Date is required'
      }

      if (!formData.insuranceEndDate) {
        newErrors.insurance_info.insuranceEndDate = 'Insurance End Date is required'
      }

      if (!formData.insurancePeriod) {
        newErrors.insurance_info.insurancePeriod = 'Insurance Period is required'
      }

      if (!formData.insuranceCompanyName) {
        newErrors.insurance_info.insuranceCompanyName = 'Insurance Company Name is required'
      }

      // --- Extra date logic: run only if we have all needed fields ---
      if (formData.insuranceStartDate && formData.insuranceEndDate && formData.insurancePeriod) {
        const capitalizationDate = formData.capitalizationDate ? dayjs(formData.capitalizationDate) : null
        const insuranceStartDate = dayjs(formData.insuranceStartDate)
        const insuranceEndDate = dayjs(formData.insuranceEndDate)
        const insurancePeriod = parseInt(formData.insurancePeriod)

        if (insuranceEndDate.isBefore(insuranceStartDate, 'day')) {
          newErrors.insurance_info.insuranceEndDate = `Insurance End Date cannot be earlier than Insurance Start Date (${insuranceStartDate.format('DD-MM-YYYY')})`
        } else {
          const calculatedEndDate = insuranceStartDate.add(insurancePeriod, 'month')

          if (insuranceEndDate.isBefore(calculatedEndDate, 'day')) {
            newErrors.insurance_info.insuranceEndDate = `Insurance End Date should be at least ${insurancePeriod} month(s) after Insurance Start Date (${calculatedEndDate.format('DD-MM-YYYY')})`
          }
        }

        if (capitalizationDate && insuranceStartDate.isBefore(capitalizationDate, 'day')) {
          newErrors.insurance_info.insuranceStartDate = `Insurance Start Date cannot be earlier than Capitalization Date (${capitalizationDate.format('DD-MM-YYYY')})`
        }
      }
    }

    return newErrors
  }

  const handleNextClick = () => {
    const currentIndex = tabs.indexOf(value)
    const sectionErrors = validateSection(value)

    setErrors({ ...errors, [value]: sectionErrors })

    // ✅ Fixed error checking logic
    const hasErrors = Object.values(sectionErrors).some(error => {
      if (typeof error === 'object') {
        // Check nested objects like finance_info
        return Object.values(error).some(nestedError => nestedError !== '')
      }

      return error !== ''
    })

    if (hasErrors) {
      toast.error('Please fill in all required fields before proceeding')

      return
    }

    if (currentIndex < tabs.length - 1) {
      setValue(tabs[currentIndex + 1])
      setActiveSection(tabs[currentIndex + 1])
    }
  }

  const handlePrevClick = () => {
    const currentIndex = tabs.indexOf(value)

    if (currentIndex > 0) {
      setValue(tabs[currentIndex - 1])
      setActiveSection(tabs[currentIndex - 1])
    }
  }

  const handleBackClick = () => {
    router.push(`/${locale}/asset-managements/asset-list`)
  }

  const handleChange = e => {
    const value = e.target.value

    setFormData({ ...formData, endOfLife: value })

    if (value && !validLives.includes(Number(value))) {
      setErrors(prev => ({
        ...prev,
        finance_info: {
          ...prev.finance_info,
          endOfLife: 'This assetLife is not mapped in our system, please add first'
        }
      }))
    } else {
      setErrors(prev => ({
        ...prev,
        finance_info: {
          ...prev.finance_info,
          endOfLife: ''
        }
      }))
    }
  }

  const handleFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const maxSizeInBytes = 5 * 1024 * 1024 // 5MB in bytes

      if (file.size > maxSizeInBytes) {
        toast.error('File size exceeds 5MB. Please choose a smaller file.')
        e.target.value = null // Reset the file input
        setErrors({
          ...errors,
          asset_details: { ...errors.asset_details, file: 'File size must not exceed 5MB' }
        })

        return
      }

      setFormData({ ...formData, file })

      setErrors({ ...errors, asset_details: { ...errors.asset_details, file: '' } }) // Clear file error
    }
  }

  const formatDate = date => {
    if (!date) return null
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    // Validate sections
    const assetErrors = validateSection('asset_details')
    const warrantyErrors = validateSection('warranty_info')
    const insuranceErrors = validateSection('insurance_info')

    // Update error state
    setErrors({
      ...errors,
      asset_details: assetErrors.asset_details || {},
      warranty_info: warrantyErrors.warranty_info || {},
      insurance_info: insuranceErrors.insurance_info || {}
    })

    // Check for any errors
    const hasAssetErrors = Object.values(assetErrors.asset_details || {}).some(error => error)
    const hasWarrantyErrors = Object.values(warrantyErrors.warranty_info || {}).some(error => error)
    const hasInsuranceErrors = Object.values(insuranceErrors.insurance_info || {}).some(error => error)

    if (hasAssetErrors || hasWarrantyErrors || hasInsuranceErrors) {
      setLoading(false)

      return
    }

    try {
      const formDataToSend = new FormData()

      // ---------------- Asset Details ----------------
      formDataToSend.append('asset_name', formData.assetName)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('status', formData.status)
      if (formData.serialNo) formDataToSend.append('serial_no', formData.serialNo)
      if (formData.assetCode) formDataToSend.append('asset_code', formData.assetCode)
      if (formData.brand) formDataToSend.append('brand', formData.brand)
      if (formData.model) formDataToSend.append('model', formData.model)
      if (formData.description) formDataToSend.append('description', formData.description)
      if (formData.condition) formDataToSend.append('condition', formData.condition)
      if (formData.file) formDataToSend.append('file_attached', formData.file)

      // ---------------- Purchase Info ----------------
      formDataToSend.append('vendor', formData.vendorName)
      if (formData.invoiceNo) formDataToSend.append('invoice_no', formData.invoiceNo)
      if (formData.invoiceDate) formDataToSend.append('invoice_date', formatDate(formData.invoiceDate))
      if (formData.purchasePrice) formDataToSend.append('purchase_price', Number(formData.purchasePrice))
      if (formData.PONo) formDataToSend.append('po_number', formData.PONo)

      // ---------------- Finance Info ----------------
      if (formData.endOfLife) formDataToSend.append('lifetime_months', Number(formData.endOfLife))
      if (formData.capitalizationPrice)
        formDataToSend.append('capitalization_price', Number(formData.capitalizationPrice))
      if (formData.capitalizationDate)
        formDataToSend.append('capitalization_date', formatDate(formData.capitalizationDate))
      if (formData.depreciation) formDataToSend.append('depreciation_perc', Number(formData.depreciation))
      if (formData.incomeTaxDepreciation)
        formDataToSend.append('incometaxdepreciation_per', Number(formData.incomeTaxDepreciation))
      if (formData.shift) formDataToSend.append('shift', formData.shift)

      if (formData.depreciableAsset) {
        formDataToSend.append('isDepreciation', formData.depreciableAsset.toLowerCase())
      }

      if (formData.scrapvalue) formDataToSend.append('scrap_value', Number(formData.scrapvalue))

      // ---------------- Alloted Info ----------------
      formDataToSend.append('dept', formData.departmentId)
      formDataToSend.append('alloted_to', formData.allotedTo)
      if (formData.allotedUpTo) formDataToSend.append('alloted_upto', formatDate(formData.allotedUpTo))

      // ---------------- Warranty Info ----------------
      formDataToSend.append('warranty', formData.warrantyStatus)

      // --- AMC or Warranty fields ---
      if (formData.warrantyStatus === 'amc') {
        if (formData.amcVendor) formDataToSend.append('amc_vendor', formData.amcVendor)
        if (formData.amcStartDate) formDataToSend.append('amc_startdate', formatDate(formData.amcStartDate))
        if (formData.amcEndDate) formDataToSend.append('amc_enddate', formatDate(formData.amcEndDate))
      } else if (formData.warrantyStatus === 'under warranty') {
        if (formData.warrantyStartDate)
          formDataToSend.append('warranty_startdate', formatDate(formData.warrantyStartDate))
        if (formData.warranty_period) formDataToSend.append('warranty_period', formData.warranty_period)
        if (formData.warrantyEndDate) formDataToSend.append('warranty_enddate', formatDate(formData.warrantyEndDate))
      }

      // --- Insurance fields (always send if filled) ---
      if (formData.insuranceStartDate)
        formDataToSend.append('insurance_startdate', formatDate(formData.insuranceStartDate))
      if (formData.insuranceCompanyName) formDataToSend.append('insurance_companyName', formData.insuranceCompanyName)
      if (formData.insurancePeriod) formDataToSend.append('insurance_period', formData.insurancePeriod)
      if (formData.insuranceEndDate) formDataToSend.append('insurance_enddate', formatDate(formData.insuranceEndDate))

      // ---------------- Submit ----------------
      const response = await axiosInstance.post('/asset', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.status === 200) {
        toast.success(response.data.message || 'Asset created successfully!')
        router.push(`/${locale}/asset-managements/asset-list`)
      } else {
        toast.error(response.data.message || 'Failed to create asset')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error.response?.data?.message || 'An error occurred while submitting the form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTabLabel = tab => {
    const label =
      tab === 'asset_details'
        ? 'Asset Details'
        : tab === 'purchase_info'
          ? 'Purchase Details'
          : tab === 'finance_info'
            ? 'Depreciation Details '
            : tab === 'alloted_info'
              ? 'Allotted Details'
              : 'Warranty Details'

    return <span style={{ color: activeSection === tab ? '#fff' : 'inherit' }}>{label}</span>
  }

  const handleAddCategory = async () => {
    setDrawerLoading(true)

    try {
      if (!categoryName) {
        setAddCategoryErrors({
          name: 'Name is required'
        })
        setDrawerLoading(false)

        return
      }

      if (!status) {
        setAddCategoryErrors({
          status: 'Status is required'
        })
        setDrawerLoading(false)

        return
      }

      const payload = {
        category_name: categoryName,
        parent_category: parentCategory,
        status: status === 'Active' ? true : false
      }

      const response = await axiosInstance.post(`/category`, payload)

      if (response?.data?.status === 400) {
        toast.error(response?.data?.message)
        setCategoryName('')
        setParentCategory('')
        setStatus('Active')
        setDrawerLoading(false)
      }

      if (response?.data?.status === 200) {
        toast.success(response?.data?.message)
        setCategoryName('')
        setParentCategory('')
        setStatus('')
        const categoryResponse = await axiosInstance.get('category/all')

        setCategories(categoryResponse.data.data || [])
        setOpenCategoryDrawer(false)
        setDrawerLoading(false)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while adding the category.'

      toast.error(errorMsg)
      console.error('Error', error)
      setDrawerLoading(false)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleAddLocation = async () => {
    setDrawerLoading(true)

    try {
      if (!locationName) {
        setAddLocationErrors({
          name: 'Name is required'
        })
        setDrawerLoading(false)

        return
      }

      if (!status) {
        setAddLocationErrors({
          status: 'Status is required'
        })
        setDrawerLoading(false)

        return
      }

      const payload = {
        location: locationName,
        parent_location: parentLocationName || null,
        status: status === 'Active',
        location_lat: parseFloat(lattitdude) || 0,
        location_lng: parseFloat(longitude) || 0
      }

      const response = await axiosInstance.post(`/location`, payload)

      if (response?.data?.status === 400) {
        toast.error(response?.data?.message)
        setLocationName('')
        setParentLocationName('')
        setStatus('Active')
        setLatitude('')
        setLongitude('')
        setDrawerLoading(false)
      }

      if (response?.data?.status === 200) {
        toast.success(response?.data?.message)
        setLocationName('')
        setParentLocationName('')
        setStatus('')
        setLatitude('')
        setLongitude('')
        const locationResponse = await axiosInstance.get('location/all')

        setLocations(locationResponse.data.data || [])
        setOpenLocationDrawer(false)
        setDrawerLoading(false)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while adding the location.'

      toast.error(errorMsg)
      console.error('Error', error)
      setDrawerLoading(false)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleAddBrand = async () => {
    setDrawerLoading(true)

    try {
      if (!brandName) {
        setAddBrandErrors({
          name: 'Name is required'
        })
        setDrawerLoading(false)

        return
      }

      if (!status) {
        setAddBrandErrors({
          status: 'Status is required'
        })
        setDrawerLoading(false)

        return
      }

      const payload = {
        name: brandName,
        status: status === 'Active' ? true : false
      }

      const response = await axiosInstance.post(`/brand`, payload)

      if (response?.data?.status === 400) {
        toast.error(response?.data?.message)
        setBrandName('')
        setStatus('Active')
        setDrawerLoading(false)
      }

      if (response?.data?.status === 200) {
        toast.success(response?.data?.message)
        setBrandName('')
        setStatus('')
        const brandResponse = await axiosInstance.get('brand/all')

        setBrands(brandResponse.data.data || [])
        setOpenBrandDrawer(false)
        setDrawerLoading(false)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while adding the category.'

      toast.error(errorMsg)
      console.error('Error', error)
      setDrawerLoading(false)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleAddModel = async () => {
    setDrawerLoading(true)

    try {
      if (!modelName) {
        setAddModelErrors({
          name: 'Name is required'
        })
        setDrawerLoading(false)

        return
      }

      if (!brandName) {
        setAddModelErrors({
          brand: 'Brand is required'
        })
        setDrawerLoading(false)

        return
      }

      if (!status) {
        setAddModelErrors({
          status: 'Status is required'
        })
        setDrawerLoading(false)

        return
      }

      const payload = {
        model_name: modelName,
        brand: brandName,
        status: status === 'Active' ? true : false
      }

      const response = await axiosInstance.post(`/model`, payload)

      if (response?.data?.status === 400) {
        toast.error(response?.data?.message)
        setBrandName('')
        setModelName('')
        setStatus('Active')
        setDrawerLoading(false)
      }

      if (response?.data?.status === 200) {
        toast.success(response?.data?.message)
        setModelName('')
        setBrandName('')
        setStatus('Active')

        const modelResponse = await axiosInstance.get('model/all')

        setAllModels(modelResponse.data.data || [])
        setOpenModelDrawer(false)
        setDrawerLoading(false)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while adding the Model.'

      toast.error(errorMsg)
      console.error('Error', error)
      setDrawerLoading(false)
    } finally {
      setDrawerLoading(false)
    }
  }

  const validate = () => {
    const errs = {}

    Object.keys(vendorFormData).forEach(key => {
      if (!['address', 'city', 'state', 'pincode', 'country'].includes(key)) {
        Object.assign(errs, validateField(key, vendorFormData[key]))
      }
    })

    return errs
  }

  const handleAddVendor = async e => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setVendorErrors(validationErrors)
      toast.error('Please fill all required fields correctly')

      return
    }

    if (vendorLoading) return
    setVendorLoading(true)

    try {
      const formDataToSend = new FormData()

      // ✅ Required fields
      formDataToSend.append('vendor_name', vendorFormData.vendor_name)
      formDataToSend.append('email', vendorFormData.email)
      formDataToSend.append('contact_person_name', vendorFormData.contact_person_name)
      formDataToSend.append('contact_person_mobile', vendorFormData.contact_person_mobile)

      // ✅ Optional fields (only append if value exists)
      if (vendorFormData.address) formDataToSend.append('address', vendorFormData.address)
      if (vendorFormData.city) formDataToSend.append('city', vendorFormData.city)
      if (vendorFormData.state) formDataToSend.append('state', vendorFormData.state)

      // ✅ Enhanced pincode validation
      if (vendorFormData.pincode) {
        if (!/^\d{6}$/.test(vendorFormData.pincode)) {
          setVendorErrors(prev => ({ ...prev, pincode: 'Pincode must be exactly 6 digits' }))
          toast.error('Pincode must be exactly 6 digits')
          setVendorLoading(false)

          return
        }

        formDataToSend.append('pincode', Number(vendorFormData.pincode))
      }

      if (vendorFormData.country) formDataToSend.append('country', vendorFormData.country)

      // ✅ File (only if selected)
      if (vendorFormData.file_attached) {
        formDataToSend.append('reg_certificate', vendorFormData.file_attached)
      }

      // ✅ Status (boolean true/false)
      formDataToSend.append('status', vendorFormData.status === 'Active')

      const response = await axiosInstance.post('/vendor', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.status === 200) {
        await fetchData()
        toast.success(response.data.message || 'Vendor added successfully')
        setVendorFormData(initialValues)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setVendorErrors({})
        setOpenVendorDrawer(false)
      } else {
        toast.error(response.data?.message || 'Failed to add vendor.')
      }
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        } else if (error.response.data.errors && error.response.data.errors.length > 0) {
          const firstError = error.response.data.errors[0]

          toast.error(firstError.msg || 'Validation error')

          if (firstError.path) {
            setVendorErrors(prev => ({ ...prev, [firstError.path]: firstError.msg }))
          }
        }
      } else {
        toast.error(
          error.code === 'ERR_NETWORK' ? 'Network error: Please check your connection.' : 'Failed to add vendor.'
        )
      }
    } finally {
      setVendorLoading(false)
    }
  }

  const validateField = (name, value) => {
    const errs = {}

    if (name === 'vendor_name' && !value.trim()) errs.vendor_name = 'Vendor name is required'

    if (name === 'email') {
      if (!value.trim()) errs.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errs.email = 'Invalid email format'
    }

    if (name === 'contact_person_name' && !value.trim()) errs.contact_person_name = 'Contact person name is required'

    if (name === 'contact_person_mobile') {
      if (!value || !value.trim()) {
        errs.contact_person_mobile = 'Mobile number is required'
      } else if (!/^\d{10}$/.test(value)) {
        errs.contact_person_mobile = 'Mobile number must be 10 digits'
      }
    }

    if (name === 'file_attached' && !value) errs.file_attached = 'Registration certificate is required'
    if (name === 'status' && !value) errs.status = 'Status is required'

    return errs
  }

  const handleVendorDrawerChange = e => {
    const { name, value } = e.target

    if (name === 'contact_person_mobile') {
      const numeric = value.replace(/\D/g, '')

      if (numeric.length <= 10) {
        setVendorFormData(prev => ({ ...prev, [name]: numeric }))
        setVendorErrors(prev => ({ ...prev, [name]: validateField(name, numeric)[name] || '' }))
      }

      return
    }

    // Simplified pincode handling - just take whatever input is given
    if (name === 'pincode') {
      setVendorFormData(prev => ({ ...prev, [name]: value }))

      return
    }

    if (name === 'status') {
      setVendorFormData(prev => ({ ...prev, status: value }))
      setVendorErrors(prev => ({ ...prev, status: validateField('status', value).status || '' }))

      return
    }

    setVendorFormData(prev => ({ ...prev, [name]: value }))
    setVendorErrors(prev => ({ ...prev, [name]: validateField(name, value)[name] || '' }))
  }

  const handleVendorFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
        if (file.size > 5 * 1024 * 1024) {
          setVendorErrors(prev => ({ ...prev, file_attached: 'File size must be less than 5MB' }))

          return
        }

        setVendorFormData(prev => ({ ...prev, file_attached: file }))
        setVendorErrors(prev => ({ ...prev, file_attached: '' }))
      } else {
        setVendorFormData(prev => ({ ...prev, file_attached: null }))
        setVendorErrors(prev => ({
          ...prev,
          file_attached: 'Please upload a valid JPEG, PNG, or PDF file'
        }))
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <Card>
        <TabContext value={value}>
          <TabList
            variant='scrollable'
            className='border-be mt-6'
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              pl: 5, // <-- Add left padding here (pl: 2 = padding-left: 16px)
              '& .MuiTabs-flexContainer': {
                gap: '8px'

                // Optionally add more space here too if needed:
                // pl: 2
              }
            }}
          >
            {tabs.map(tab => (
              <Tab
                key={tab}
                label={getTabLabel(tab)}
                value={tab}
                disabled={false}
                sx={{
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontWeight: '500',
                  padding: '8px 16px',
                  minHeight: '36px',
                  '&.Mui-selected': {
                    backgroundColor: '#6366F1',
                    color: 'white',
                    border: 'none'
                  },
                  '&:not(.Mui-selected)': {
                    border: '1px solid #6366F1',
                    backgroundColor: 'transparent',
                    color: '#5B5BDD',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)'
                    }
                  }
                }}
              />
            ))}
          </TabList>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <TabPanel value='asset_details'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Asset Name'
                      placeholder='Asset name'
                      value={formData.assetName}
                      onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                      required
                      error={!!errors.asset_details.assetName}
                      helperText={errors.asset_details.assetName}
                    />
                  </Grid>

                 
                <Grid item xs={12} sm={4}>
  <TextField
    fullWidth
    label="Asset Code"
    placeholder="Asset code"
    value={formData.assetCode}
    onChange={e => {
      const value = e.target.value
      if (codeType === 'MANUAL' || /^[a-zA-Z0-9\/\-_]*$/.test(value)) {
        setFormData({ ...formData, assetCode: value })
      }
    }}
    error={!!errors.asset_details.assetCode}
    helperText={
      errors.asset_details.assetCode ||
      (codeType === 'MANUAL' && !formData.assetCode ? 'Please enter asset code manually' : '')
    }
    InputProps={{
      readOnly: codeType !== 'MANUAL', // Editable only in MANUAL mode
      sx: {
        backgroundColor: 'transparent' // Remove grey background
      }
    }}
  />
</Grid>



                  <Grid item xs={12} sm={4}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <FormControl fullWidth required error={!!errors.asset_details.category}>
                        <Autocomplete
                          options={categories}
                          getOptionLabel={option => option.category_name || ''}
                          value={categories.find(cat => cat._id === formData.category) || null}
                          onChange={(event, value) => {
                            setFormData({ ...formData, category: value?._id || '' })
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label=' Category *'
                              placeholder='Select Category'
                              error={!!errors.asset_details.category}
                              helperText={errors.asset_details.category || ''}
                            />
                          )}
                          ListboxProps={{
                            style: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }}
                        />
                      </FormControl>

                      <Tooltip title='Add New'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => setOpenCategoryDrawer(true)}
                          sx={{
                            mt: errors.asset_details.category ? -3 : 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50px'
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <FormControl fullWidth required error={!!errors.asset_details.location}>
                        <Autocomplete
                          options={locations}
                          getOptionLabel={option => option.location || ''}
                          value={locations.find(loc => loc._id === formData.location) || null}
                          onChange={(event, value) => {
                            setFormData({ ...formData, location: value?._id || '' })
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label=' Location *'
                              placeholder='Select Location'
                              error={!!errors.asset_details.location}
                              helperText={errors.asset_details.location || ''}
                            />
                          )}
                          ListboxProps={{
                            style: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }}
                        />
                      </FormControl>
                      <Tooltip title='Add New'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => {
                            setOpenLocationDrawer(true)
                          }}
                          sx={{
                            mt: errors.asset_details.category ? -3 : 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50px'
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.asset_details?.status}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label='Status'
                        value={formData.status || ''}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statuses.map(status => (
                          <MenuItem key={status._id} value={status._id}>
                            {status.status}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.asset_details?.status && (
                        <FormHelperText error>{errors.asset_details.status}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <FormControl fullWidth required error={!!errors.asset_details.brand}>
                        <Autocomplete
                          options={brands}
                          getOptionLabel={option => option.name || ''}
                          value={brands.find(b => b._id === formData.brand) || null}
                          onChange={(event, value) => {
                            setFormData({ ...formData, brand: value?._id || '' })
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Brand '
                              placeholder='Select Brand'
                              error={!!errors.asset_details.brand}
                              helperText={errors.asset_details.brand || ''}
                            />
                          )}
                          ListboxProps={{
                            style: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }}
                        />
                      </FormControl>
                      <Tooltip title='Add New'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => {
                            setOpenBrandDrawer(true)
                          }}
                          sx={{
                            mt: errors.asset_details.category ? -3 : 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50px'
                          }} // adjusts if error text is present
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <FormControl fullWidth required error={!!errors.asset_details.model}>
                        <Autocomplete
                          options={filteredModels}
                          getOptionLabel={option => option.model_name || ''}
                          value={filteredModels.find(m => m._id === formData.model) || null}
                          onChange={(event, value) => {
                            setFormData({ ...formData, model: value?._id || '' })
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Model '
                              placeholder={formData.brand ? 'Select Model' : 'Select a brand first'}
                              error={!!errors.asset_details.model}
                              helperText={errors.asset_details.model || ''}
                            />
                          )}
                          ListboxProps={{
                            style: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }}
                          disabled={!formData.brand} // ✅ disables until brand is selected
                        />
                      </FormControl>
                      <Tooltip title='Add New'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => {
                            setOpenModelDrawer(true)
                            console.log('openmode', openModelDrawer)
                          }}
                          sx={{
                            mt: errors.asset_details.category ? -3 : 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50px'
                          }} // adjusts if error text is present
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Serial No'
                      placeholder='Serial number'
                      value={formData.serialNo}
                      onChange={e => setFormData({ ...formData, serialNo: e.target.value })}
                      error={!!errors.asset_details.serialNo}
                      helperText={errors.asset_details.serialNo}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Description'
                      placeholder='Description'
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.asset_details.condition}>
                      <InputLabel>Condition</InputLabel>
                      <Select
                        label='Condition'
                        value={formData.condition}
                        onChange={e => setFormData({ ...formData, condition: e.target.value })}
                      >
                        <MenuItem value='' disabled>
                          Select condition
                        </MenuItem>
                        {conditions.map(condition => (
                          <MenuItem key={condition._id} value={condition._id}>
                            {condition.condition}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.asset_details.condition && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.condition}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant='outlined'
                      component='label'
                      fullWidth
                      className='h-[56px] text-gray-500 border-gray-300'
                    >
                      <CloudUpload className='text-gray-500' />
                      Asset pic
                      <input type='file' hidden onChange={handleFileChange} />
                    </Button>
                    {formData.file && (
                      <Typography variant='body2' mt={1}>
                        {formData.file.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Other TabPanels remain unchanged */}
              <TabPanel value='purchase_info'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.purchase_info?.vendorName}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={vendor}
                          getOptionLabel={option => option.vendor_name || ''}
                          value={vendor.find(v => v._id === formData.vendorName) || null}
                          onChange={(e, newValue) =>
                            setFormData({
                              ...formData,
                              vendorName: newValue ? newValue._id : ''
                            })
                          }
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Vendor name*'
                              error={!!errors.purchase_info?.vendorName}
                              helperText={errors.purchase_info?.vendorName}
                            />
                          )}
                        />

                        <Tooltip title='Add New'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => setOpenVendorDrawer(true)}
                            sx={{
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              borderRadius: '50%', // perfect circle
                              p: 2 // padding to keep it round
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Invoice No'
                      placeholder='Invoice number'
                      value={formData.invoiceNo}
                      onChange={e => {
                        const value = e.target.value

                        if (/^[a-zA-Z0-9/-_]*$/.test(value)) {
                          setFormData({ ...formData, invoiceNo: value })
                        }
                      }}
                      error={!!errors.purchase_info.invoiceNo}
                      required
                      helperText={errors.purchase_info.invoiceNo}
                    />
                  </Grid>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label='Invoice Date'
                        value={formData.invoiceDate}
                        onChange={value =>
                          setFormData({
                            ...formData,
                            invoiceDate: value,
                            capitalizationDate: value // Invoice Date ke sath sync
                          })
                        }
                        format='DD-MM-YYYY'
                        views={['year', 'month', 'day']}
                        openTo='day'
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.purchase_info.invoiceDate,
                            helperText: errors.purchase_info.invoiceDate,
                            required: true,
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                  </LocalizationProvider>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='PO Number'
                      placeholder='PO number'
                      value={formData.PONo}
                      onChange={e => {
                        const value = e.target.value

                        if (/^[a-zA-Z0-9/-_]*$/.test(value)) {
                          setFormData({ ...formData, PONo: value })
                        }
                      }}
                      error={!!errors.purchase_info.PONo}
                      helperText={errors.purchase_info.PONo}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Purchase Price'
                      type='number'
                      placeholder='Purchase price'
                      required
                      value={formData.purchasePrice}
                      onChange={e => {
                        const value = e.target.value

                        setFormData({
                          ...formData,
                          purchasePrice: value,
                          capitalizationPrice: value // purchase price ke sath sync
                        })
                      }}
                      error={!!errors.purchase_info.purchasePrice}
                      helperText={errors.purchase_info.purchasePrice}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
              <TabPanel value='finance_info'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={12}>
                    <FormControl>
                      <Box display='flex' alignItems='center' gap={2}>
                        <FormLabel sx={{ marginRight: 1 }}>Depreciable Asset</FormLabel>
                        <RadioGroup
                          row
                          value={formData.depreciableAsset ?? 'yes'}
                          onChange={e => {
                            const value = e.target.value

                            if (value === 'no') {
                              // Backup current finance fields
                              setPrevFinanceData({
                                capitalizationPrice: formData.capitalizationPrice,
                                capitalizationDate: formData.capitalizationDate,
                                endOfLife: formData.endOfLife,
                                depreciation: formData.depreciation,
                                incomeTaxDepreciation: formData.incomeTaxDepreciation,
                                shift: formData.shift,
                                scrapvalue: formData.scrapvalue
                              })

                              // Clear fields
                              setFormData(prev => ({
                                ...prev,
                                depreciableAsset: 'no',
                                capitalizationPrice: '',
                                capitalizationDate: null,
                                endOfLife: '',
                                depreciation: '',
                                incomeTaxDepreciation: '',
                                shift: '',
                                scrapvalue: ''
                              }))
                              setErrors(prev => ({ ...prev, finance_info: {} }))
                            } else {
                              // Restore previous data if available
                              setFormData(prev => ({
                                ...prev,
                                depreciableAsset: 'yes',
                                ...prevFinanceData
                              }))
                            }
                          }}
                        >
                          <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel value='no' control={<Radio />} label='No' />
                        </RadioGroup>
                      </Box>
                    </FormControl>
                  </Grid>

                  {/* Capitalization Price */}

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Capitalization Price'
                      type='number'
                      placeholder='Capitalization price'
                      value={formData.depreciableAsset === 'no' ? '' : formData.capitalizationPrice}
                      onChange={e => {
                        const value = e.target.value

                        if (formData.depreciableAsset === 'no') {
                          setFormData({
                            ...formData,
                            capitalizationPrice: ''
                          })
                          setErrors(prev => ({
                            ...prev,
                            finance_info: { ...prev.finance_info, capitalizationPrice: '' }
                          }))

                          return
                        }

                        setFormData({
                          ...formData,
                          capitalizationPrice: value
                        })

                        if (value !== '' && Number(value) < Number(formData.purchasePrice)) {
                          setErrors(prev => ({
                            ...prev,
                            finance_info: {
                              ...prev.finance_info,
                              capitalizationPrice: `cannot be less than Purchase Price (${formData.purchasePrice})`
                            }
                          }))
                        } else {
                          setErrors(prev => ({
                            ...prev,
                            finance_info: { ...prev.finance_info, capitalizationPrice: '' }
                          }))
                        }
                      }}
                      onFocus={() => setShowPriceHint(true)}
                      onBlur={() => setShowPriceHint(false)}
                      error={!!errors.finance_info.capitalizationPrice}
                      helperText={errors.finance_info.capitalizationPrice}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                    {showPriceHint && (
                      <div
                        style={{
                          position: 'absolute',
                          border: '2px solid red',
                          padding: '5px',
                          borderRadius: '4px',
                          marginTop: '5px',
                          zIndex: 30,
                          backgroundColor: '#fff',
                          marginBottom: '30px',
                          boxShadow: '0px 6px 44px 0px #ccc'
                        }}
                      >
                        including sales tax, freight and installation
                      </div>
                    )}
                  </Grid>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label='Capitalization Date'
                        value={formData.capitalizationDate}
                        onChange={value => {
                          setFormData({
                            ...formData,
                            capitalizationDate: value
                          })

                          // ✅ Inline validation
                          const invoiceDate = formData.invoiceDate ? dayjs(formData.invoiceDate) : null
                          const capitalizationDate = value ? dayjs(value) : null

                          if (capitalizationDate && invoiceDate && capitalizationDate.isBefore(invoiceDate, 'day')) {
                            setErrors(prev => ({
                              ...prev,
                              finance_info: {
                                ...prev.finance_info,
                                capitalizationDate: `Capitalization Date cannot be earlier than Invoice Date (${invoiceDate.format('DD-MM-YYYY')})`
                              }
                            }))
                          } else {
                            setErrors(prev => ({
                              ...prev,
                              finance_info: { ...prev.finance_info, capitalizationDate: '' }
                            }))
                          }
                        }}
                        format='DD-MM-YYYY'
                        views={['year', 'month', 'day']}
                        openTo='day'
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.finance_info.capitalizationDate,
                            helperText: errors.finance_info.capitalizationDate,
                            required: formData.depreciableAsset === 'yes',
                            placeholder: 'DD-MM-YYYY',
                            disabled: formData.depreciableAsset === 'no'
                          }
                        }}
                      />
                    </Grid>
                  </LocalizationProvider>
                  {/* End Of Life */}

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Asset life (months)'
                      type='number'
                      placeholder='Asset life'
                      value={formData.endOfLife ?? ''}
                      onChange={handleChange}
                      required={formData.depreciableAsset === 'yes'}
                      error={!!errors.finance_info?.endOfLife}
                      helperText={errors.finance_info?.endOfLife}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Depreciation %'
                      placeholder='Depreciation %'
                      value={formData.depreciation || ''}
                      onChange={e => setFormData({ ...formData, depreciation: e.target.value })}
                      error={!!errors.finance_info.depreciation}
                      helperText={errors.finance_info.depreciation}
                      disabled={formData.depreciableAsset === 'no'} // no par fully disabled
                      InputProps={{
                        readOnly: formData.depreciableAsset === 'yes' // yes par read-only
                      }}
                    />
                  </Grid>

                  {/* Income Tax Depreciation% */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Income Tax Depreciation%'
                      placeholder='Income tax depreciation%'
                      value={formData.incomeTaxDepreciation}
                      onChange={e => setFormData({ ...formData, incomeTaxDepreciation: e.target.value })}
                      required={formData.depreciableAsset === 'yes'}
                      error={!!errors.finance_info.incomeTaxDepreciation}
                      helperText={errors.finance_info.incomeTaxDepreciation}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      label='Shift'
                      value={formData.shift}
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                      disabled={formData.depreciableAsset === 'no'} // ✅ disable
                    >
                      <MenuItem value='single shift'>Single Shift</MenuItem>
                      <MenuItem value='150% shift'>150% Shift</MenuItem>
                      <MenuItem value='double shift'>Double Shift</MenuItem>
                    </TextField>
                  </Grid>

                  {/* ✅ New: Scrap Value */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Scrap Value'
                      type='number'
                      placeholder='Scrap value'
                      value={formData.scrapvalue}
                      onChange={e => setFormData({ ...formData, scrapvalue: e.target.value })}
                      error={!!errors.finance_info.scrapvalue}
                      required
                      helperText={errors.finance_info.scrapvalue}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
              {/* allotted info */}
              <TabPanel value='alloted_info'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.alloted_info.departmentId}>
                      <Autocomplete
                        options={department}
                        getOptionLabel={option => option.department || ''}
                        value={department.find(dep => dep._id === formData.departmentId) || null}
                        onChange={(event, newValue) => {
                          setFormData({
                            ...formData,
                            departmentId: newValue ? newValue._id : ''
                          })
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Department*'
                            error={!!errors.alloted_info.departmentId}
                            helperText={errors.alloted_info.departmentId}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.alloted_info.allotedTo}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={option => option.user_name || ''}
                        value={users.find(u => u._id === formData.allotedTo) || null}
                        onChange={(event, newValue) =>
                          setFormData({ ...formData, allotedTo: newValue ? newValue._id : '' })
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Allotted To'
                            error={!!errors.alloted_info.allotedTo}
                            helperText={errors.alloted_info.allotedTo}
                            required
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label='Allotted Up To'
                        value={formData.allotedUpTo}
                        onChange={value => setFormData({ ...formData, allotedUpTo: value })}
                        format='DD-MM-YYYY'
                        views={['year', 'month', 'day']}
                        openTo='day'
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.alloted_info.allotedUpTo,
                            helperText: errors.alloted_info.allotedUpTo,

                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                  </LocalizationProvider>
                </Grid>
              </TabPanel>

              <TabPanel value='warranty_info'>
                <Grid container spacing={4} sx={{ px: 3 }}>
                  {/* Warranty Status */}
                  <Grid item xs={12} sm={4}>
                    <FormControl component='fieldset' fullWidth>
                      <FormLabel className='text-textPrimary'>Warranty Status</FormLabel>
                      <RadioGroup
                        row
                        name='warrantyStatus'
                        value={formData.warrantyStatus}
                        onChange={e => setFormData({ ...formData, warrantyStatus: e.target.value })}
                      >
                        <FormControlLabel value='amc' control={<Radio />} label='AMC' />
                        <FormControlLabel value='under warranty' control={<Radio />} label='Warranty' />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {/* AMC Fields */}
                  {formData.warrantyStatus === 'amc' && (
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          sx={{ width: '100%' }}
                          fullWidth
                          options={vendor}
                          getOptionLabel={option => option.vendor_name || ''}
                          value={vendor.find(v => v._id === formData.amcVendor) || null}
                          onChange={(e, newValue) =>
                            setFormData({
                              ...formData,
                              amcVendor: newValue ? newValue._id : ''
                            })
                          }
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='AMC Vendor'
                              error={!!errors.warranty_info.amcVendor}
                              helperText={errors.warranty_info.amcVendor}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='AMC Start Date'
                            value={formData.amcStartDate}
                            onChange={value => setFormData({ ...formData, amcStartDate: value })}
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.warranty_info.amcStartDate,
                                helperText: errors.warranty_info.amcStartDate,
                                placeholder: 'DD-MM-YYYY'
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='AMC End Date'
                            value={formData.amcEndDate}
                            onChange={value => setFormData({ ...formData, amcEndDate: value })}
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.warranty_info.amcEndDate,
                                helperText: errors.warranty_info.amcEndDate,
                                placeholder: 'DD-MM-YYYY'
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  )}

                  {formData.warrantyStatus === 'under warranty' && (
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Warranty Start Date'
                            value={formData.warrantyStartDate}
                            onChange={value =>
                              setFormData(prev => ({
                                ...prev,
                                warrantyStartDate: value,
                                warrantyEndDate: prev.warranty_period
                                  ? dayjs(value).add(parseInt(prev.warranty_period), 'month')
                                  : prev.warrantyEndDate
                              }))
                            }
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.warranty_info.warrantyStartDate,
                                helperText: errors.warranty_info.warrantyStartDate,
                                placeholder: 'DD-MM-YYYY'
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Warranty Period (months)'
                          type='number'
                          required
                          placeholder='Warranty period'
                          value={formData.warranty_period || ''}
                          onChange={e => {
                            const period = e.target.value

                            setFormData(prev => ({
                              ...prev,
                              warranty_period: period,
                              warrantyEndDate:
                                period && prev.warrantyStartDate
                                  ? dayjs(prev.warrantyStartDate).add(parseInt(period), 'month')
                                  : prev.warrantyEndDate
                            }))
                          }}
                          error={!!errors.warranty_info?.warranty_period}
                          helperText={errors.warranty_info?.warranty_period}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            disabled
                            label='Warranty End Date'
                            value={formData.warrantyEndDate}
                            onChange={value => setFormData({ ...formData, warrantyEndDate: value })}
                            format='DD-MM-YYYY'
                            views={['year', 'month', 'day']}
                            openTo='day'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.warranty_info.warrantyEndDate,
                                helperText: errors.warranty_info.warrantyEndDate,
                                placeholder: 'DD-MM-YYYY'
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  )}
                  {/*insurance*/}
                  <Grid item xs={12} sm={4}>
                    <FormControl component='fieldset' fullWidth sx={{ mb: 2 }}>
                      <FormLabel className='text-textPrimary'>Insurance</FormLabel>
                    </FormControl>
                  </Grid>

                  <Grid container spacing={5}>
                    <Grid item xs={12} sm={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label='Insurance Start Date'
                          value={formData.insuranceStartDate}
                          onChange={value => {
                            setFormData(prev => ({
                              ...prev,
                              insuranceStartDate: value,
                              insuranceEndDate: prev.insurancePeriod
                                ? dayjs(value).add(parseInt(prev.insurancePeriod), 'month')
                                : prev.insuranceEndDate
                            }))

                            // ✅ Inline validation (Capitalization Date ke sath compare)
                            const capitalizationDate = formData.capitalizationDate
                              ? dayjs(formData.capitalizationDate)
                              : null

                            const insuranceStartDate = value ? dayjs(value) : null

                            if (
                              insuranceStartDate &&
                              capitalizationDate &&
                              insuranceStartDate.isBefore(capitalizationDate, 'day')
                            ) {
                              setErrors(prev => ({
                                ...prev,
                                insurance_info: {
                                  ...prev.insurance_info,
                                  insuranceStartDate: `Insurance Start Date cannot be earlier than Capitalization Date (${capitalizationDate.format('DD-MM-YYYY')})`
                                }
                              }))
                            } else {
                              setErrors(prev => ({
                                ...prev,
                                insurance_info: { ...prev.insurance_info, insuranceStartDate: '' }
                              }))
                            }
                          }}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.insurance_info?.insuranceStartDate,
                              helperText: errors.insurance_info?.insuranceStartDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label='Insurance Period (months)'
                        type='number'
                        placeholder='Insurance period'
                        value={formData.insurancePeriod || ''}
                        onChange={e => {
                          const period = e.target.value

                          setFormData(prev => ({
                            ...prev,
                            insurancePeriod: period,
                            insuranceEndDate:
                              period && prev.insuranceStartDate
                                ? dayjs(prev.insuranceStartDate).add(parseInt(period), 'month')
                                : prev.null
                          }))
                        }}
                        error={!!errors.insurance_info?.insurancePeriod}
                        helperText={errors.insurance_info?.insurancePeriod}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled
                          label='Insurance End Date'
                          value={formData.insuranceEndDate}
                          onChange={value => setFormData({ ...formData, insuranceEndDate: value })}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.warranty_info.insurance_info,
                              helperText: errors.warranty_info.insurance_info,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label='Insurance Company Name'
                        placeholder='Insurance Company Name'
                        value={formData.insuranceCompanyName}
                        onChange={e => setFormData({ ...formData, insuranceCompanyName: e.target.value })}
                        error={!!errors.insurance_info?.insuranceCompanyName}
                        helperText={errors.insurance_info?.insuranceCompanyName}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>
            </CardContent>
            <Divider />
            <CardActions>
              <Button variant='outlined' color='error' onClick={handleBackClick} disabled={loading}>
                Cancel
              </Button>
              {value !== 'asset_details' && (
                <Button type='button' variant='outlined' onClick={handlePrevClick} disabled={loading}>
                  Previous
                </Button>
              )}
              {value !== 'warranty_info' && (
                <Button type='button' variant='contained' onClick={handleNextClick} disabled={loading}>
                  Next
                </Button>
              )}
              {value === 'warranty_info' && (
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </CardActions>
          </form>
        </TabContext>
      </Card>

      <Dialog
        open={openCategoryDrawer}
        maxWidth='sm'
        fullWidth
        onClose={() => {
          setOpenCategoryDrawer(false)
        }}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent dividers>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category Name */}
            <TextField
              fullWidth
              label='Category Name'
              placeholder='Enter category name'
              value={categoryName}
              onChange={e => {
                setCategoryName(e.target.value)

                if (addCategoryErrors.name) {
                  setAddCategoryErrors(prev => ({ ...prev, name: '' }))
                }
              }}
              error={Boolean(addCategoryErrors.name)}
              helperText={addCategoryErrors.name || ''}
            />

            {/* Parent Category */}
            <Autocomplete
              options={categories}
              getOptionLabel={option => option.category_name}
              renderInput={params => (
                <TextField {...params} label='Parent Category' placeholder='Select parent category' />
              )}
              ListboxProps={{
                style: {
                  maxHeight: 300,
                  overflow: 'auto'
                }
              }}
              onChange={(event, value) => {
                setParentCategory(value?._id || '')
              }}
            />

            {/* Status */}
            <FormControl
              fullWidth
              error={Boolean(addCategoryErrors.status)} // ✅ Makes border red when error exists
            >
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                label='status'
                labelId='status-select'
                value={status}
                onChange={e => {
                  setStatus(e.target.value)

                  if (addCategoryErrors.status) {
                    setAddCategoryErrors(prev => ({ ...prev, status: '' }))
                  }
                }}
              >
                <MenuItem value='' disabled>
                  Select Status
                </MenuItem>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
              {addCategoryErrors.status && <FormHelperText>{addCategoryErrors.status}</FormHelperText>}
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }} className='mt-2'>
          <Button
            disabled={drawerLoading}
            variant='outlined'
            color='error'
            onClick={() => {
              setOpenCategoryDrawer(false)
              setCategoryName('')
              setParentCategory('')
              setStatus('')
              setAddCategoryErrors({})
            }}
          >
            Cancel
          </Button>
          <Button disabled={drawerLoading} variant='contained' color='primary' onClick={handleAddCategory}>
            {drawerLoading ? 'Submitting' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLocationDrawer}
        maxWidth='sm'
        fullWidth
        onClose={() => {
          setOpenLocationDrawer(false)
        }}
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent dividers>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category Name */}
            <TextField
              fullWidth
              label='Location Name'
              placeholder='Enter Location name'
              value={locationName}
              onChange={e => {
                setLocationName(e.target.value)

                if (addLoactionErrors.name) {
                  setAddLocationErrors(prev => ({ ...prev, name: '' }))
                }
              }}
              error={Boolean(addLoactionErrors.name)}
              helperText={addLoactionErrors.name || ''}
            />

            {/* Parent Category */}
            <Autocomplete
              options={locations}
              getOptionLabel={option => option.location}
              renderInput={params => (
                <TextField {...params} label='Parent Location' placeholder='Select parent location' />
              )}
              ListboxProps={{
                style: {
                  maxHeight: 300,
                  overflow: 'auto'
                }
              }}
              onChange={(event, value) => {
                setParentLocationName(value?._id || '')
              }}
            />

            {/* Status */}
            <FormControl
              fullWidth
              error={Boolean(addLoactionErrors.status)} // ✅ Makes border red when error exists
            >
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                label='status'
                labelId='status-select'
                value={status}
                onChange={e => {
                  setStatus(e.target.value)

                  if (addLoactionErrors.status) {
                    setAddLocationErrors(prev => ({ ...prev, status: '' }))
                  }
                }}
              >
                <MenuItem value='' disabled>
                  Select Status
                </MenuItem>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
              {addLoactionErrors.status && <FormHelperText>{addLoactionErrors.status}</FormHelperText>}
            </FormControl>

            <TextField
              fullWidth
              label='Latitude'
              placeholder='Latitude'
              value={lattitdude}
              onChange={e => {
                setLatitude(e.target.value)
              }}
            />
            <TextField
              fullWidth
              label='Longitude'
              placeholder='Longitude'
              value={longitude}
              onChange={e => {
                setLongitude(e.target.value)
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }} className='mt-2'>
          <Button
            variant='outlined'
            color='error'
            onClick={() => {
              setOpenLocationDrawer(false)
              setLocationName('')
              setParentLocationName('')
              setStatus('')
              setLongitude('')
              setLatitude('')
              setAddLocationErrors({})
            }}
          >
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={handleAddLocation}>
            {drawerLoading ? 'Submitting' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBrandDrawer}
        maxWidth='sm'
        fullWidth
        onClose={() => {
          setOpenBrandDrawer(false)
        }}
      >
        <DialogTitle>Add New Brand</DialogTitle>
        <DialogContent dividers>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Brand Name */}
            <TextField
              fullWidth
              label='Brand Name'
              placeholder='Enter brand name'
              value={brandName}
              onChange={e => {
                setBrandName(e.target.value)

                if (addBrandErrors.name) {
                  setAddBrandErrors(prev => ({ ...prev, name: '' }))
                }
              }}
              error={Boolean(addBrandErrors.name)}
              helperText={addBrandErrors.name || ''}
            />

            {/* Status */}
            <FormControl
              fullWidth
              error={Boolean(addBrandErrors.status)} // ✅ Makes border red when error exists
            >
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                label='status'
                labelId='status-select'
                value={status}
                onChange={e => {
                  setStatus(e.target.value)

                  if (addBrandErrors.status) {
                    setAddBrandErrors(prev => ({ ...prev, status: '' }))
                  }
                }}
              >
                <MenuItem value='' disabled>
                  Select Status
                </MenuItem>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
              {addBrandErrors.status && <FormHelperText>{addBrandErrors.status}</FormHelperText>}
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }} className='mt-2'>
          <Button
            disabled={drawerLoading}
            variant='outlined'
            color='error'
            onClick={() => {
              setOpenBrandDrawer(false)
              setBrandName('')
              setStatus('')
              setAddBrandErrors({})
            }}
          >
            Cancel
          </Button>
          <Button disabled={drawerLoading} variant='contained' color='primary' onClick={handleAddBrand}>
            {drawerLoading ? 'Submitting' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openModelDrawer}
        maxWidth='sm'
        fullWidth
        onClose={() => {
          setOpenModelDrawer(false)
        }}
      >
        <DialogTitle>Add New Model</DialogTitle>
        <DialogContent dividers>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category Name */}
            <TextField
              fullWidth
              label='Model Name'
              placeholder='Enter model name'
              value={modelName}
              onChange={e => {
                setModelName(e.target.value)

                if (addModelErrors.name) {
                  setAddModelErrors(prev => ({ ...prev, name: '' }))
                }
              }}
              error={Boolean(addModelErrors.name)}
              helperText={addModelErrors.name || ''}
            />

            {/* Parent Category */}
            <FormControl
              fullWidth
              error={Boolean(addModelErrors.brand)} // ✅ This makes the border and label red
            >
              <Autocomplete
                options={brands}
                getOptionLabel={option => option.name}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Brand'
                    placeholder='Brand'
                    error={Boolean(addModelErrors.brand)}
                    helperText={addModelErrors.brand || ''}
                  />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                    overflow: 'auto'
                  }
                }}
                onChange={(event, value) => {
                  setBrandName(value?._id || '')

                  if (addModelErrors.brand) {
                    setAddModelErrors(prev => ({ ...prev, brand: '' }))
                  }
                }}
              />
              {/* You can remove this if using helperText above */}
            </FormControl>

            {/* Status */}
            <FormControl
              fullWidth
              error={Boolean(addModelErrors.status)} // ✅ Makes border red when error exists
            >
              <InputLabel id='status-select'>Status</InputLabel>
              <Select
                label='status'
                labelId='status-select'
                value={status}
                onChange={e => {
                  setStatus(e.target.value)

                  if (addModelErrors.status) {
                    setAddModelErrors(prev => ({ ...prev, status: '' }))
                  }
                }}
              >
                <MenuItem value='' disabled>
                  Select Status
                </MenuItem>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </Select>
              {addModelErrors.status && <FormHelperText>{addModelErrors.status}</FormHelperText>}
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }} className='mt-2'>
          <Button
            disabled={drawerLoading}
            variant='outlined'
            color='error'
            onClick={() => {
              setOpenModelDrawer(false)
              setModelName('')
              setBrandName('')
              setStatus('')
              setAddModelErrors({})
            }}
          >
            Cancel
          </Button>
          <Button disabled={drawerLoading} variant='contained' color='primary' onClick={handleAddModel}>
            {drawerLoading ? 'Submitting' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openVendorDrawer}
        maxWidth='sm'
        fullWidth
        onClose={() => {
          setOpenVendorDrawer(false)
        }}
      >
        <DialogTitle>Add New Vendor</DialogTitle>
        <form className='flex flex-col' onSubmit={handleAddVendor}>
          <DialogContent
            dividers
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pb: 10 // add bottom padding for sticky actions
            }}
          >
            {[
              { name: 'vendor_name', label: 'Vendor Name', required: true },
              { name: 'email', label: 'Email', required: true },
              { name: 'contact_person_name', label: 'Contact Person Name', required: true },
              { name: 'contact_person_mobile', label: 'Mobile No.', required: true },
              { name: 'address', label: 'Address (Optional)' },
              { name: 'city', label: 'City (Optional)' },
              { name: 'state', label: 'State (Optional)' },
              { name: 'pincode', label: 'Pincode (Optional)' },
              { name: 'country', label: 'Country (Optional)' }
            ].map(({ name, label, required }) => (
              <Box key={name} mb={2}>
                <TextField
                  name={name}
                  label={label}
                  value={vendorFormData[name]}
                  onChange={handleVendorDrawerChange}
                  fullWidth
                  error={!!vendorErrors[name]}
                  helperText={vendorErrors[name]}
                  required={required}
                  inputProps={{
                    ...(name === 'contact_person_mobile' ? { maxLength: 10, inputMode: 'numeric' } : {})
                  }}
                />
              </Box>
            ))}

            <Box mb={2}>
              <Button variant='outlined' component='label' fullWidth className='h-[56px] text-gray-500 border-gray-300'>
                <CloudUpload className='text-gray-500 mr-2' />
                Registration Certificate *
                <input
                  type='file'
                  name='file_attached'
                  accept='image/jpeg,image/png,application/pdf'
                  onChange={handleVendorFileChange}
                  ref={fileInputRef}
                  hidden
                />
              </Button>

              {vendorFormData.file_attached && (
                <Typography variant='body2' mt={1}>
                  {vendorFormData.file_attached.name}
                </Typography>
              )}

              {/* ✅ Use FormHelperText instead of Typography */}
              {vendorErrors.file_attached && <FormHelperText error>{vendorErrors.file_attached}</FormHelperText>}
            </Box>

            <Box mb={2}>
              <FormControl fullWidth error={!!vendorErrors.status}>
                <InputLabel id='vendor-status-label'>Status</InputLabel>
                <Select
                  name='status'
                  labelId='vendor-status-label'
                  label='Status *'
                  value={vendorFormData.status}
                  onChange={handleVendorDrawerChange}
                >
                  <MenuItem value='' disabled>
                    Select Status
                  </MenuItem>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
                {vendorErrors.status && (
                  <Typography variant='caption' color='error'>
                    {vendorErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 2,
              position: 'sticky',
              bottom: 0,
              background: 'white',
              zIndex: 10,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.04)'
            }}
            className='mt-2'
          >
            <div className='flex items-center gap-2 mt-4'>
              <Button type='submit' variant='contained' color='primary' disabled={vendorLoading}>
                {vendorLoading ? 'Submitting' : 'Submit'}
              </Button>
              <Button
                onClick={() => {
                  setOpenVendorDrawer(false)
                  setVendorErrors({})
                  setVendorFormData(initialValues)
                }}
                variant='outlined'
                color='error'
                disabled={vendorLoading}
              >
                Cancel
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default AddAsset
