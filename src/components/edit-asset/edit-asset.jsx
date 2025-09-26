'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dayjs from 'dayjs'

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
import { FormLabel, RadioGroup, FormControlLabel, Radio, Box, Autocomplete } from '@mui/material'
import { CloudUpload } from 'lucide-react'

// Toastify Imports
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Axios Import
import axiosInstance from '@/utils/axiosinstance'

// Component Imports
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const EditAsset = () => {
  const router = useRouter()
  const params = useParams()
  const { lang: locale } = useParams()
  const assetId = params.id
  const [value, setValue] = useState('asset_details')
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [brands, setBrands] = useState([])
  const [conditions, setConditions] = useState([])
  const [users, setUsers] = useState([])
  const [allModels, setAllModels] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  const [vendor, setVendor] = useState([])
  const [rates, setRates] = useState([])
  const [validLives, setValidLives] = useState([])
  const [defaultMethod, setDefaultMethod] = useState('WDV')
  const [department, setDepartment] = useState([])
  const [loading, setLoading] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const [activeSection, setActiveSection] = useState('asset_details')
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [originalFinanceData, setOriginalFinanceData] = useState({})

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
    warranty_period: '',
    invoiceNo: '',
    invoiceDate: null,
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
    insuranceStartDate: null,
    insuranceEndDate: null,
    insurancePeriod: null,
    insuranceCompanyName: "",
    createdDate: null,
    warrantyStatus: '',
    depreciableAsset: 'yes',
    accumulatedDepreciation: '',
    depreciationMethod: 'WDV',
    shift: 'Single Shift',
    scrapValue: ''
  })

  const [errors, setErrors] = useState({
    asset_details: {},
    purchase_info: {},
    finance_info: {},
    alloted_info: {},
    warranty_info: {},
    insurance_info: {}
  })

  // Auto-calculate warranty end date when start date or period changes
  useEffect(() => {
    if (formData.warrantyStartDate && formData.warranty_period) {
      const startDate = dayjs(formData.warrantyStartDate)
      const period = parseInt(formData.warranty_period, 10)
      if (!isNaN(period) && period > 0) {
        const endDate = startDate.add(period, 'month')
        setFormData(prev => ({ ...prev, warrantyEndDate: endDate }))
      } else {
        setFormData(prev => ({ ...prev, warrantyEndDate: null }))
      }
    } else {
      setFormData(prev => ({ ...prev, warrantyEndDate: null }))
    }
  }, [formData.warrantyStartDate, formData.warranty_period])

  // Auto-update capitalizationDate and insuranceStartDate when invoiceDate changes
  useEffect(() => {
    if (formData.invoiceDate) {
      const newInvoiceDate = dayjs(formData.invoiceDate)
      const currentCapitalizationDate = formData.capitalizationDate ? dayjs(formData.capitalizationDate) : null

      if (currentCapitalizationDate && currentCapitalizationDate.isBefore(newInvoiceDate, 'day')) {
        setFormData(prev => ({ ...prev, capitalizationDate: newInvoiceDate }))
      }
    }
  }, [formData.invoiceDate])

  // Auto-update insuranceStartDate when capitalizationDate changes
  useEffect(() => {
    if (formData.capitalizationDate && formData.warrantyStatus === 'insurance') {
      const newCapitalizationDate = dayjs(formData.capitalizationDate)
      const currentInsuranceStartDate = formData.insuranceStartDate ? dayjs(formData.insuranceStartDate) : null

      // if (currentInsuranceStartDate && currentInsuranceStartDate.isBefore(newCapitalizationDate, 'day')) {
      //   setFormData(prev => ({ ...prev, insuranceStartDate: newCapitalizationDate }))
      // }
    }
  }, [formData.capitalizationDate, formData.warrantyStatus])

  // Fetch asset data and dropdown options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        const [
          categoryResponse,
          locationResponse,
          statusResponse,
          brandResponse,
          modelResponse,
          conditionResponse,
          vendorResponse,
          usersResponse,
          departmentResponse,
          assetResponse,
          ratesResponse
        ] = await Promise.all([
          axiosInstance.get('category/all'),
          axiosInstance.get('location/all'),
          axiosInstance.get('status/all'),
          axiosInstance.get('brand/all'),
          axiosInstance.get('model/all'),
          axiosInstance.get('condition/all'),
          axiosInstance.get('vendor/all'),
          axiosInstance.get('user/all'),
          axiosInstance.get('dept/all'),
          axiosInstance.get(`/asset/${assetId}`),
          axiosInstance.get('/rates/all')
        ])

        setCategories(categoryResponse.data.data || [])
        setLocations(locationResponse.data.data || [])
        setStatuses(statusResponse.data.data || [])
        setBrands(brandResponse.data.data || [])
        setAllModels(modelResponse.data.data || [])
        setConditions(conditionResponse.data.data || [])
        setVendor(vendorResponse.data.data || [])
        setUsers(usersResponse.data.data || [])
        setDepartment(departmentResponse.data.data || [])

        // Set rates and valid lives
        const apiRates = ratesResponse.data?.data?.rates || []
        setRates(apiRates)
        setValidLives(apiRates.map(r => r.life))
        const apiMethod = ratesResponse.data?.data?.method || 'WDV'
        setDefaultMethod(apiMethod)

        const assetData = assetResponse.data.data
        if (assetData) {
          const normalizeDepreciationMethod = method => {
            if (!method) return apiMethod
            const lowerMethod = method.toLowerCase()
            if (lowerMethod === 'slm' || lowerMethod === 'straight line method') return 'SLM'
            if (
              lowerMethod === 'wdv' ||
              lowerMethod === 'declining method' ||
              lowerMethod === 'declining balance method'
            )
              return 'WDV'
            return apiMethod
          }

          const normalizeShift = shift => {
            if (!shift) return 'Single Shift'
            const lowerShift = shift.toLowerCase()
            if (lowerShift === 'single shift') return 'Single Shift'
            if (lowerShift === '150% shift') return '150% Shift'
            if (lowerShift === 'double shift') return 'Double Shift'
            return 'Single Shift'
          }

          const normalizeDepreciableAsset = value => {
            if (value === true || value === 'true' || value?.toString().toLowerCase() === 'yes') return 'yes'
            if (value === false || value === 'false' || value?.toString().toLowerCase() === 'no') return 'no'
            return 'yes'
          }

          const updatedFormData = {
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
            file: null,
            vendorName: assetData.vendor?._id || '',
            warranty_period: assetData.warranty_period || '',
            invoiceNo: assetData.invoice_no || '',
            invoiceDate: assetData.invoice_date ? dayjs(assetData.invoice_date) : null,
            purchasePrice: assetData.purchase_price || '',
            PONo: assetData.po_number || '',
            capitalizationPrice: assetData.capitalization_price || '',
            capitalizationDate: assetData.capitalization_date ? dayjs(assetData.capitalization_date) : null,
            endOfLife: assetData.lifetime_months || '',
            depreciation: assetData.depreciation_perc?.$numberDecimal?.toString() || '',
            incomeTaxDepreciation: assetData.incometaxdepreciation_per?.$numberDecimal?.toString() || '',
            departmentId: assetData.dept?._id || '',
            allotedTo: assetData.alloted_to?._id || '',
            allotedUpTo: assetData.alloted_upto ? dayjs(assetData.alloted_upto) : null,
            amcVendor: assetData.amc_vendor?._id || '',
            amcStartDate: assetData.amc_startdate ? dayjs(assetData.amc_startdate) : null,
            amcEndDate: assetData.amc_enddate ? dayjs(assetData.amc_enddate) : null,
            insuranceStartDate: assetData.insurance_startdate ? dayjs(assetData.insurance_startdate) : null,
            insuranceEndDate: assetData.insurance_enddate ? dayjs(assetData.insurance_enddate) : null,
            insurancePeriod: assetData.insurance_period || null,
            insuranceCompanyName: assetData.insurance_companyName || "",
            warrantyStartDate: assetData.warranty_startdate ? dayjs(assetData.warranty_startdate) : null,
            warrantyEndDate: assetData.warranty_enddate ? dayjs(assetData.warranty_enddate) : null,
            createdDate: assetData.created_date ? dayjs(assetData.created_date) : null,
            warrantyStatus: assetData.warranty || '',
            depreciableAsset: normalizeDepreciableAsset(assetData.isDepreciation),
            accumulatedDepreciation: assetData.accumulated_depreciation ?? '',
            depreciationMethod: normalizeDepreciationMethod(assetData.depreciation_method || apiMethod),
            shift: normalizeShift(assetData.shift),
            scrapValue: assetData.scrap_value ?? ''
          }

          setFormData(updatedFormData)
          setOriginalFinanceData({
            capitalizationPrice: assetData.capitalization_price || '',
            capitalizationDate: assetData.capitalization_date ? dayjs(assetData.capitalization_date) : null,
            endOfLife: assetData.lifetime_months || '',
            depreciation: assetData.depreciation_perc?.$numberDecimal?.toString() || '',
            incomeTaxDepreciation: assetData.incometaxdepreciation_per?.$numberDecimal?.toString() || '',
            accumulatedDepreciation: assetData.accumulated_depreciation ?? '',
            depreciationMethod: normalizeDepreciationMethod(assetData.depreciation_method || apiMethod),
            shift: normalizeShift(assetData.shift),
            scrapValue: assetData.scrap_value ?? ''
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data')
        router.push(`/${locale}/asset-managements/asset-list`)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [assetId, router, locale])

  // Update formData when depreciableAsset changes
  useEffect(() => {
    if (formData.depreciableAsset === 'no') {
      setFormData(prev => ({
        ...prev,
        capitalizationPrice: '',
        capitalizationDate: null,
        endOfLife: '',
        depreciation: '',
        incomeTaxDepreciation: '',
        accumulatedDepreciation: '',
        depreciationMethod: defaultMethod || 'WDV',
        shift: 'Single Shift',
        scrapValue: ''
      }))
      setErrors(prev => ({
        ...prev,
        finance_info: {
          ...prev.finance_info,
          capitalizationPrice: '',
          capitalizationDate: '',
          endOfLife: '',
          depreciation: '',
          incomeTaxDepreciation: ''
        }
      }))
    } else if (formData.depreciableAsset === 'yes') {
      setFormData(prev => ({
        ...prev,
        ...originalFinanceData
      }))
      setErrors(prev => ({
        ...prev,
        finance_info: {
          ...prev.finance_info,
          capitalizationPrice: '',
          capitalizationDate: '',
          endOfLife: '',
          depreciation: '',
          incomeTaxDepreciation: ''
        }
      }))
    }
  }, [formData.depreciableAsset, originalFinanceData])

  // Depreciation prefill logic
  useEffect(() => {
    if (formData.depreciableAsset === 'no') {
      setFormData(prev => ({ ...prev, depreciation: '' }))
      setErrors(prev => ({
        ...prev,
        finance_info: { ...prev.finance_info, depreciation: '' }
      }))
      return
    }

    if (formData.endOfLife && rates.length > 0) {
      const matched = rates.find(r => r.life === Number(formData.endOfLife))

      if (matched) {
        const method = formData.depreciationMethod || defaultMethod || 'WDV'
        let dep = ''

        if (method === 'SLM') {
          dep = matched.slm_value?.$numberDecimal || ''
        } else if (method === 'WDV') {
          dep = matched.wdv_value?.$numberDecimal || ''
        }

        setFormData(prev => ({ ...prev, depreciation: dep }))
        setErrors(prev => ({
          ...prev,
          finance_info: {
            ...prev.finance_info,
            depreciation: dep ? '' : 'Depreciation value not found for this method'
          }
        }))
      } else {
        setFormData(prev => ({ ...prev, depreciation: '' }))
        setErrors(prev => ({
          ...prev,
          finance_info: {
            ...prev.finance_info
          }
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, depreciation: '' }))
      setErrors(prev => ({
        ...prev,
        finance_info: { ...prev.finance_info, depreciation: '' }
      }))
    }
  }, [formData.endOfLife, formData.depreciationMethod, formData.depreciableAsset, rates, defaultMethod])

  // Update filtered models when brand changes
  useEffect(() => {
    if (formData.brand) {
      const filtered = allModels.filter(model => model.brand?._id === formData.brand)
      setFilteredModels(filtered)
      if (!filtered.some(model => model._id === formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }))
      }
    } else {
      setFilteredModels(allModels)
    }
  }, [formData.brand, allModels])

  const tabs = ['asset_details', 'purchase_info', 'finance_info', 'alloted_info', 'warranty_info']

  const validateSection = section => {
    const newErrors = { ...errors }

    if (section === 'asset_details') {
      newErrors.asset_details = {
        assetName: formData.assetName ? '' : 'Asset Name is required',
        category: formData.category ? '' : 'Category is required',
        location: formData.location ? '' : 'Location is required',
        status: formData.status ? '' : 'Status is required',
        file: formData.file && formData.file.size > 5 * 1024 * 1024 ? 'File size must not exceed 5MB' : ''
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

      if (formData.depreciableAsset !== 'no') {
        if (!formData.capitalizationDate) {
          newErrors.finance_info.capitalizationDate = 'Capitalization Date is required'
        } else {
          const invoiceDate = formData.invoiceDate ? dayjs(formData.invoiceDate) : null
          const capitalizationDate = formData.capitalizationDate ? dayjs(formData.capitalizationDate) : null

          if (capitalizationDate && invoiceDate && capitalizationDate.isBefore(invoiceDate, 'day')) {
            newErrors.finance_info.capitalizationDate = `Capitalization Date cannot be earlier than Invoice Date (${invoiceDate.format(
              'DD-MM-YYYY'
            )})`
          } else {
            newErrors.finance_info.capitalizationDate = ''
          }
        }

        if (!formData.capitalizationPrice) {
          newErrors.finance_info.capitalizationPrice = 'Capitalization Price is required'
        } else if (Number(formData.capitalizationPrice) < Number(formData.purchasePrice)) {
          newErrors.finance_info.capitalizationPrice = `Capitalization Price cannot be less than Purchase Price (${formData.purchasePrice})`
        } else {
          newErrors.finance_info.capitalizationPrice = ''
        }
      } else {
        newErrors.finance_info.capitalizationDate = ''
        newErrors.finance_info.capitalizationPrice = ''
      }

      if (formData.depreciableAsset === 'yes') {
        newErrors.finance_info.endOfLife = formData.endOfLife ? '' : 'End of Life is required'
        newErrors.finance_info.scrapValue = formData.scrapValue ? '' : 'Scrap value is required'
        newErrors.finance_info.incomeTaxDepreciation = formData.incomeTaxDepreciation
          ? ''
          : 'Income Tax Depreciation is required'
      } else {
        newErrors.finance_info.endOfLife = ''
        newErrors.finance_info.depreciation = ''
        newErrors.finance_info.incomeTaxDepreciation = ''
        newErrors.finance_info.scrapValue = ''
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
        newErrors.warranty_info.insuranceStartDate = '' // Clear if not insurance
      }
      else if (formData.warrantyStatus === 'amc') {
        newErrors.warranty_info.amcVendor = formData.amcVendor ? '' : 'AMC Vendor is required'
        newErrors.warranty_info.amcStartDate = formData.amcStartDate ? '' : 'AMC Start Date is required'
        newErrors.warranty_info.amcEndDate = formData.amcEndDate ? '' : 'AMC End Date is required'
      }

    }
    else if (section === 'insurance_info') {
      newErrors.insurance_info = {}

      const hasInsuranceData =
        formData.insuranceStartDate ||
        formData.insuranceEndDate ||
        formData.insurancePeriod ||
        formData.insuranceCompanyName;

      if (!hasInsuranceData) {
        return { insurance_info: {} };
      }

      // --- Required fields ---
      if (!formData.insuranceStartDate) {
        newErrors.insurance_info.insuranceStartDate = 'Insurance Start Date is required';
      }

      if (!formData.insuranceEndDate) {
        newErrors.insurance_info.insuranceEndDate = 'Insurance End Date is required';
      }

      if (!formData.insurancePeriod) {
        newErrors.insurance_info.insurancePeriod = 'Insurance Period is required';
      }

      if (!formData.insuranceCompanyName) {
        newErrors.insurance_info.insuranceCompanyName = 'Insurance Company Name is required';
      }

      // --- Extra date logic: run only if we have all needed fields ---
      if (
        formData.insuranceStartDate &&
        formData.insuranceEndDate &&
        formData.insurancePeriod
      ) {
        const capitalizationDate = formData.capitalizationDate ? dayjs(formData.capitalizationDate) : null;
        const insuranceStartDate = dayjs(formData.insuranceStartDate);
        const insuranceEndDate = dayjs(formData.insuranceEndDate);
        const insurancePeriod = parseInt(formData.insurancePeriod);

        if (insuranceEndDate.isBefore(insuranceStartDate, 'day')) {
          newErrors.insurance_info.insuranceEndDate =
            `Insurance End Date cannot be earlier than Insurance Start Date (${insuranceStartDate.format('DD-MM-YYYY')})`;
        } else {
          const calculatedEndDate = insuranceStartDate.add(insurancePeriod, 'month');

          if (insuranceEndDate.isBefore(calculatedEndDate, 'day')) {
            newErrors.insurance_info.insuranceEndDate =
              `Insurance End Date should be at least ${insurancePeriod} month(s) after Insurance Start Date (${calculatedEndDate.format('DD-MM-YYYY')})`;
          }
        }

        if (capitalizationDate && insuranceStartDate.isBefore(capitalizationDate, 'day')) {
          newErrors.insurance_info.insuranceStartDate =
            `Insurance Start Date cannot be earlier than Capitalization Date (${capitalizationDate.format('DD-MM-YYYY')})`;
        }
      }
    }

    return newErrors
  }

  const handleNextClick = () => {
    const currentIndex = tabs.indexOf(value)
    const updatedErrors = validateSection(value)

    setErrors(updatedErrors)

    const sectionErrors = updatedErrors[value] || {}
    const hasErrors = Object.values(sectionErrors).some(error => error !== '')

    if (hasErrors) {
      toast.error('Please fill in all required fields before proceeding')
      return
    }

    if (currentIndex < tabs.length - 1) {
      setValue(tabs[currentIndex + 1])
      setActiveSection(tabs[currentIndex + 1])
    }
  }

  const handleAssetLifeChange = e => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, endOfLife: value }))

    if (value && !validLives.includes(Number(value))) {
      setErrors(prev => ({
        ...prev,
        finance_info: {
          ...prev.finance_info,
          endOfLife: 'This asset life is not mapped in our system, please add first'
        }
      }))
      setFormData(prev => ({ ...prev, depreciation: '' }))
    } else {
      setErrors(prev => ({
        ...prev,
        finance_info: { ...prev.finance_info, endOfLife: '' }
      }))
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

  const handleFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFormData({ ...formData, file })
      setFilePreview(URL.createObjectURL(file))
    }
  }

  const formatDate = date => {
    if (!date) return null
    return date.format('YYYY-MM-DD')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      // --- Insurance Start Date validation ---
      // if (formData.warrantyStatus === 'insurance') {
      //   if (!formData.insuranceStartDate) {
      //     setErrors(prev => ({
      //       ...prev,
      //       warranty_info: {
      //         ...prev.warranty_info,
      //         insuranceStartDate: 'Insurance Start Date is required'
      //       }
      //     }))
      //     toast.error('Please fix errors before submitting')
      //     setLoading(false)
      //     return
      //   }

      //   if (
      //     formData.capitalizationDate &&
      //     formData.depreciableAsset === 'yes' &&
      //     dayjs(formData.insuranceStartDate).isBefore(dayjs(formData.capitalizationDate), 'day')
      //   ) {
      //     setErrors(prev => ({
      //       ...prev,
      //       warranty_info: {
      //         ...prev.warranty_info,
      //         insuranceStartDate: `Insurance Start Date cannot be earlier than Capitalization Date (${dayjs(
      //           formData.capitalizationDate
      //         ).format('DD-MM-YYYY')})`
      //       }
      //     }))
      //     toast.error('Please fix errors before submitting')
      //     setLoading(false)
      //     return
      //   }

      //   // Clear error if valid
      //   setErrors(prev => ({
      //     ...prev,
      //     warranty_info: { ...prev.warranty_info, insuranceStartDate: '' }
      //   }))
      // }

      // Validate sections
      const assetErrors = validateSection('asset_details');
      const warrantyErrors = validateSection('warranty_info');
      const insuranceErrors = validateSection('insurance_info');

      // Update error state
      setErrors({
        ...errors,
        asset_details: assetErrors.asset_details || {},
        warranty_info: warrantyErrors.warranty_info || {},
        insurance_info: insuranceErrors.insurance_info || {}
      });

      // Check for any errors
      const hasAssetErrors = Object.values(assetErrors.asset_details || {}).some(error => error);
      const hasWarrantyErrors = Object.values(warrantyErrors.warranty_info || {}).some(error => error);
      const hasInsuranceErrors = Object.values(insuranceErrors.insurance_info || {}).some(error => error);

      if (hasAssetErrors || hasWarrantyErrors || hasInsuranceErrors) {
        // ❌ कोई submit नहीं होगा जब तक errors clear न हों
        setLoading(false);

        return;
      }

      const formDataToSend = new FormData()

      // Asset Details
      formDataToSend.append('asset_name', formData.assetName)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('status', formData.status)
      if (formData.serialNo) formDataToSend.append('serial_no', formData.serialNo)
      if (formData.brand) formDataToSend.append('brand', formData.brand)
      if (formData.model) formDataToSend.append('model', formData.model)
      if (formData.description) formDataToSend.append('description', formData.description)
      if (formData.condition) formDataToSend.append('condition', formData.condition)
      if (formData.file) formDataToSend.append('file_attached', formData.file)

      // Purchase Info
      formDataToSend.append('vendor', formData.vendorName)
      if (formData.invoiceNo) formDataToSend.append('invoice_no', formData.invoiceNo)
      if (formData.invoiceDate) formDataToSend.append('invoice_date', formatDate(formData.invoiceDate))
      if (formData.purchasePrice) formDataToSend.append('purchase_price', Number(formData.purchasePrice))
      if (formData.PONo) formDataToSend.append('po_number', formData.PONo)

      // Finance Info
      formDataToSend.append('isDepreciation', formData.depreciableAsset === 'yes' ? 'yes' : 'no')
      if (formData.depreciableAsset === 'yes') {
        if (formData.endOfLife) formDataToSend.append('lifetime_months', Number(formData.endOfLife))
        if (formData.capitalizationPrice)
          formDataToSend.append('capitalization_price', Number(formData.capitalizationPrice))
        if (formData.capitalizationDate)
          formDataToSend.append('capitalization_date', formatDate(formData.capitalizationDate))
        if (formData.depreciation) formDataToSend.append('depreciation_perc', Number(formData.depreciation))
        if (formData.incomeTaxDepreciation)
          formDataToSend.append('incometaxdepreciation_per', Number(formData.incomeTaxDepreciation))
        if (formData.depreciationMethod && formData.depreciationMethod !== 'as per company policy') {
          formDataToSend.append('depreciation_method', formData.depreciationMethod)
        }
        if (formData.shift) formDataToSend.append('shift', formData.shift)
        if (formData.accumulatedDepreciation)
          formDataToSend.append('accumulated_depreciation', Number(formData.accumulatedDepreciation))
        if (formData.scrapValue) formDataToSend.append('scrap_value', Number(formData.scrapValue))
      }

      // Allotted Info
      formDataToSend.append('dept', formData.departmentId)
      formDataToSend.append('alloted_to', formData.allotedTo)
      if (formData.allotedUpTo) formDataToSend.append('alloted_upto', formatDate(formData.allotedUpTo))

      // Warranty Info
      formDataToSend.append('warranty', formData.warrantyStatus)

      // --- AMC fields ---
      if (formData.warrantyStatus === 'amc') {
        if (formData.amcVendor) formDataToSend.append('amc_vendor', formData.amcVendor);
        if (formData.amcStartDate) formDataToSend.append('amc_startdate', formatDate(formData.amcStartDate));
        if (formData.amcEndDate) formDataToSend.append('amc_enddate', formatDate(formData.amcEndDate));
      } else if (formData.warrantyStatus === 'under warranty') {
        if (formData.warrantyStartDate) formDataToSend.append('warranty_startdate', formatDate(formData.warrantyStartDate));
        if (formData.warranty_period) formDataToSend.append('warranty_period', formData.warranty_period);
        if (formData.warrantyEndDate) formDataToSend.append('warranty_enddate', formatDate(formData.warrantyEndDate));
      }

      // --- Insurance fields ---
      if (formData.insuranceStartDate) formDataToSend.append('insurance_startdate', formatDate(formData.insuranceStartDate));
      if (formData.insuranceCompanyName) formDataToSend.append('insurance_companyName', formData.insuranceCompanyName);
      if (formData.insurancePeriod) formDataToSend.append('insurance_period', formData.insurancePeriod);
      if (formData.insuranceEndDate) formDataToSend.append('insurance_enddate', formatDate(formData.insuranceEndDate));

      // --- API Call ---
      const response = await axiosInstance.put(`/asset/${assetId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.status === 200) {
        toast.success(response.data.message || 'Asset updated successfully!')
        router.push(`/${locale}/asset-managements/asset-list`)
      } else {
        toast.error(response.data.message || 'Failed to update asset')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error.response?.data?.message || 'An error occurred while submitting the form.')
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
            ? 'Depreciation Details'
            : tab === 'alloted_info'
              ? 'Allotted Details'
              : 'Warranty Details'

    return <span style={{ color: activeSection === tab ? '#fff' : 'inherit' }}>{label}</span>
  }

  if (isLoadingData) {
    return <Typography>Loading...</Typography>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <TabContext value={value}>
          <TabList
            variant='scrollable'
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue)
              setActiveSection(newValue)
            }}
            className='border-be mt-6'
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              pl: 5,
              '& .MuiTabs-flexContainer': {
                gap: '8px'
              }
            }}
          >
            {tabs.map(tab => (
              <Tab
                key={tab}
                label={getTabLabel(tab)}
                value={tab}
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
                      label='Asset Code'
                      placeholder='Asset code'
                      disabled
                      value={formData.assetCode}
                      onChange={e => setFormData({ ...formData, assetCode: e.target.value })}
                      error={!!errors.asset_details.assetCode}
                      helperText={errors.asset_details.assetCode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.asset_details.category}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        label='Category'
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(category => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.category_name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.asset_details.category && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.category}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.asset_details.location}>
                      <InputLabel>Location</InputLabel>
                      <Select
                        label='Location'
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                      >
                        {locations.map(location => (
                          <MenuItem key={location._id} value={location._id}>
                            {location.location}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.asset_details.location && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.location}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.asset_details.status}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label='Status'
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statuses.map(status => (
                          <MenuItem key={status._id} value={status._id}>
                            {status.status}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.asset_details.status && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.status}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.asset_details.brand}>
                      <InputLabel>Brand</InputLabel>
                      <Select
                        label='Brand'
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      >
                        {brands.map(brand => (
                          <MenuItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.asset_details.brand && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.brand}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.asset_details.model}>
                      <InputLabel>Model</InputLabel>
                      <Select
                        label='Model'
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                        disabled={!formData.brand}
                      >
                        {filteredModels.length > 0 ? (
                          filteredModels.map(model => (
                            <MenuItem key={model._id} value={model._id}>
                              {model.model_name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value=''>
                            Select a brand first
                          </MenuItem>
                        )}
                      </Select>
                      {!!errors.asset_details.model && (
                        <Typography variant='caption' color='error'>
                          {errors.asset_details.model}
                        </Typography>
                      )}
                    </FormControl>
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
                    {filePreview && (
                      <Typography variant='body2' mt={1}>
                        {formData.file instanceof File ? formData.file.name : 'Current file'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value='purchase_info'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    {/* <FormControl fullWidth required error={!!errors.purchase_info.vendorName}>
                      <InputLabel>Vendor name</InputLabel>
                      <Select
                        label='Vendor name'
                        value={formData.vendorName}
                        onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                      >
                        {vendor.map(vendor => (
                          <MenuItem key={vendor._id} value={vendor._id}>
                            {vendor.vendor_name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.purchase_info.vendorName && (
                        <Typography variant='caption' color='error'>
                          {errors.purchase_info.vendorName}
                        </Typography>
                      )}
                    </FormControl> */}
                    <Autocomplete
                      fullWidth
                      options={vendor}
                      getOptionLabel={(option) => option.vendor_name || ''}
                      value={vendor.find((v) => v._id === formData.vendorName) || null}
                      onChange={(e, newValue) =>
                        setFormData({
                          ...formData,
                          vendorName: newValue ? newValue._id : '',
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vendor name*"
                          error={!!errors.purchase_info?.vendorName}
                          helperText={errors.purchase_info?.vendorName}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Invoice No'
                      placeholder='Invoice number'
                      value={formData.invoiceNo}
                      required
                      onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })}
                      error={!!errors.purchase_info.invoiceNo}
                      helperText={errors.purchase_info.invoiceNo}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label='Invoice Date'
                      value={formData.invoiceDate}
                      onChange={value => setFormData({ ...formData, invoiceDate: value })}
                      format='DD-MM-YYYY'
                      views={['year', 'month', 'day']}
                      openTo='day'
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.purchase_info.invoiceDate,
                          helperText: errors.purchase_info.invoiceDate,
                          placeholder: 'DD-MM-YYYY'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='PO Number'
                      placeholder='PO number'
                      value={formData.PONo}
                      onChange={e => {
                        const value = e.target.value
                        if (/^[a-zA-Z0-9/_-]*$/.test(value)) {
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
                      value={formData.purchasePrice}
                      required
                      onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
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
                          value={formData.depreciableAsset}
                          onChange={e => setFormData({ ...formData, depreciableAsset: e.target.value })}
                        >
                          <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel value='no' control={<Radio />} label='No' />
                        </RadioGroup>
                      </Box>
                      {!!errors.finance_info.depreciableAsset && (
                        <Typography variant='caption' color='error'>
                          {errors.finance_info.depreciableAsset}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

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
                          setFormData({ ...formData, capitalizationPrice: '' })
                          setErrors(prev => ({
                            ...prev,
                            finance_info: { ...prev.finance_info, capitalizationPrice: '' }
                          }))
                          return
                        }
                        setFormData({ ...formData, capitalizationPrice: value })
                        if (value !== '' && Number(value) < Number(formData.purchasePrice)) {
                          setErrors(prev => ({
                            ...prev,
                            finance_info: {
                              ...prev.finance_info,
                              capitalizationPrice: ` cannot be less than Purchase Price (${formData.purchasePrice})`
                            }
                          }))
                        } else {
                          setErrors(prev => ({
                            ...prev,
                            finance_info: { ...prev.finance_info, capitalizationPrice: '' }
                          }))
                        }
                      }}
                      error={!!errors.finance_info.capitalizationPrice}
                      helperText={errors.finance_info.capitalizationPrice}
                      disabled={formData.depreciableAsset === 'no'}
                      required={formData.depreciableAsset === 'yes'}
                    />
                  </Grid>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label='Capitalization Date'
                        value={formData.capitalizationDate}
                        onChange={value => {
                          setFormData(prev => ({ ...prev, capitalizationDate: value }))

                          if (formData.depreciableAsset !== 'no') {
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
                                finance_info: {
                                  ...prev.finance_info,
                                  capitalizationDate: ''
                                }
                              }))
                            }
                          }
                        }}
                        format='DD-MM-YYYY'
                        views={['year', 'month', 'day']}
                        openTo='day'
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.finance_info?.capitalizationDate,
                            helperText: errors.finance_info?.capitalizationDate,
                            required: formData.depreciableAsset !== 'no',
                            placeholder: 'DD-MM-YYYY',
                            disabled: formData.depreciableAsset === 'no'
                          }
                        }}
                      />
                    </Grid>
                  </LocalizationProvider>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Asset life (months)'
                      type='number'
                      placeholder='Asset life'
                      value={formData.depreciableAsset === 'no' ? '' : formData.endOfLife}
                      onChange={handleAssetLifeChange}
                      required={formData.depreciableAsset === 'yes'}
                      error={!!errors.finance_info.endOfLife}
                      helperText={errors.finance_info.endOfLife}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Depreciation %'
                      type='number'
                      placeholder='Depreciation %'
                      value={formData.depreciableAsset === 'no' ? '' : formData.depreciation}
                      onChange={e => setFormData({ ...formData, depreciation: e.target.value })}
                      error={!!errors.finance_info.depreciation}
                      helperText={errors.finance_info.depreciation}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Income Tax Depreciation %'
                      type='number'
                      placeholder='Income tax depreciation %'
                      value={formData.depreciableAsset === 'no' ? '' : formData.incomeTaxDepreciation}
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
                      value={formData.depreciableAsset === 'no' ? 'Single Shift' : formData.shift}
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                      disabled={formData.depreciableAsset === 'no'}
                    >
                      <MenuItem value='Single Shift'>Single Shift</MenuItem>
                      <MenuItem value='150% Shift'>150% Shift</MenuItem>
                      <MenuItem value='Double Shift'>Double Shift</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Scrap Value'
                      type='number'
                      placeholder='Scrap value'
                      value={formData.depreciableAsset === 'no' ? '' : formData.scrapValue}
                      onChange={e => setFormData({ ...formData, scrapValue: e.target.value })}
                      error={!!errors.finance_info.scrapValue}
                      required
                      helperText={errors.finance_info.scrapValue}
                      disabled={formData.depreciableAsset === 'no'}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value='alloted_info'>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.alloted_info.departmentId}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        label='Department'
                        value={formData.departmentId}
                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                      >
                        {department.map(department => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.department}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.alloted_info.departmentId && (
                        <Typography variant='caption' color='error'>
                          {errors.alloted_info.departmentId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.alloted_info.allotedTo}>
                      <InputLabel>Allotted To</InputLabel>
                      <Select
                        label='Allotted To'
                        value={formData.allotedTo}
                        onChange={e => setFormData({ ...formData, allotedTo: e.target.value })}
                      >
                        {users.map(user => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.user_name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.alloted_info.allotedTo && (
                        <Typography variant='caption' color='error'>
                          {errors.alloted_info.allotedTo}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
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
                </Grid>
              </TabPanel>

              <TabPanel value='warranty_info'>
                <Grid container spacing={4} sx={{ px: 3 }}>
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

                  {formData.warrantyStatus === 'amc' && (
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          sx={{ width: '100%' }}
                          fullWidth
                          options={vendor}
                          getOptionLabel={(option) => option.vendor_name || ''}
                          value={vendor.find((v) => v._id === formData.amcVendor) || null}
                          onChange={(e, newValue) =>
                            setFormData({
                              ...formData,
                              amcVendor: newValue ? newValue._id : '',
                            })
                          }
                          renderInput={(params) => (
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
                              required: true,
                              error: !!errors.warranty_info.amcStartDate,
                              helperText: errors.warranty_info.amcStartDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
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
                              required: true,
                              error: !!errors.warranty_info.amcEndDate,
                              helperText: errors.warranty_info.amcEndDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {formData.warrantyStatus === 'under warranty' && (
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={4}>
                        <DatePicker
                          label='Warranty Start Date'
                          value={formData.warrantyStartDate}
                          onChange={value => setFormData({ ...formData, warrantyStartDate: value })}
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.warranty_info.warrantyStartDate,
                              helperText: errors.warranty_info.warrantyStartDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Warranty period (months)'
                          type='number'
                          placeholder='Warranty period'
                          required
                          value={formData.warranty_period}
                          onChange={e => setFormData({ ...formData, warranty_period: e.target.value })}
                          error={!!errors.warranty_info.warranty_period}
                          helperText={errors.warranty_info.warranty_period}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <DatePicker
                          label='Warranty End Date'
                          value={formData.warrantyEndDate}
                          onChange={() => { }} // No-op to prevent manual changes
                          format='DD-MM-YYYY'
                          views={['year', 'month', 'day']}
                          openTo='day'
                          disabled
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.warranty_info.warrantyEndDate,
                              helperText: errors.warranty_info.warrantyEndDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                  <FormControl component='fieldset' fullWidth sx={{ mb: 2,mx:4, mt:4 }}>
                    <FormLabel className='text-textPrimary'>Insurance</FormLabel>
                  </FormControl>
                
                  <Grid container spacing={5} >
                    <Grid item xs={12} sm={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label='Insurance Start Date'
                          value={formData.insuranceStartDate}
                          onChange={value => {
                            const newInsuranceStartDate = value ? dayjs(value) : null
                            const capitalizationDate =
                              formData.capitalizationDate && formData.depreciableAsset === 'yes'
                                ? dayjs(formData.capitalizationDate)
                                : null

                            setFormData(prev => ({ ...prev, insuranceStartDate: value }))

                            if (!newInsuranceStartDate) {
                              setErrors(prev => ({
                                ...prev,
                                insurance_info: {
                                  ...prev.insurance_info,
                                  insuranceStartDate: 'Insurance Start Date is required'
                                }
                              }))
                            } else if (capitalizationDate && newInsuranceStartDate.isBefore(capitalizationDate, 'day')) {
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
                              error: !!errors.insurance_info.insuranceEndDate,
                              helperText: errors.insurance_info.insuranceEndDate,
                              placeholder: 'DD-MM-YYYY'
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                      <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Insurance Company Name"
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
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              )}
            </CardActions>
          </form>
        </TabContext>
      </Card>
    </LocalizationProvider>
  )
}

export default EditAsset
