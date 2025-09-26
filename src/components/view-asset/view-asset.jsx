


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
import { FormLabel, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material'
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

const ViewAsset = () => {
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
  const [model, setModel] = useState([])
  const [vendor, setVendor] = useState([])
  const [department, setDepartment] = useState([])
  const [filePreview, setFilePreview] = useState(null)
  const [activeSection, setActiveSection] = useState('asset_details')

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
    amcVendor: '',
    amcStartDate: null,
    amcEndDate: null,
    warrantyStartDate: null,
    warrantyEndDate: null,
    createdDate: null,
    warrantyStatus: '',
   depreciableAsset: '',
    accumulatedDepreciation: '',
    depreciationMethod: ' as per company policy',
    shift: 'Single Shift',
    scrapValue: ''
  })

  // Fetch asset data and dropdown options
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          assetResponse
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
          axiosInstance.get(`/asset/${assetId}`)
        ])

        setCategories(categoryResponse.data.data || [])
        setLocations(locationResponse.data.data || [])
        setStatuses(statusResponse.data.data || [])
        setBrands(brandResponse.data.data || [])
        setModel(modelResponse.data.data || [])
        setConditions(conditionResponse.data.data || [])
        setVendor(vendorResponse.data.data || [])
        setUsers(usersResponse.data.data || [])
        setDepartment(departmentResponse.data.data || [])

        const assetData = assetResponse.data.data
       if (assetData) {
  // normalize depreciableAsset value
  let depreciableAsset = ''
  if (
    assetData.isDepreciation === true ||
    assetData.isDepreciation === 'true' ||
    assetData.isDepreciation?.toLowerCase() === 'yes'
  ) {
    depreciableAsset = 'yes'
  } else if (
    assetData.isDepreciation === false ||
    assetData.isDepreciation === 'false' ||
    assetData.isDepreciation?.toLowerCase() === 'no'
  ) {
    depreciableAsset = 'no'
  }

  setFormData({
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
    invoiceNo: assetData.invoice_no || '',
    invoiceDate: assetData.invoice_date ? dayjs(assetData.invoice_date) : null,
    purchaseDate: assetData.purchase_date ? dayjs(assetData.purchase_date) : null,
    purchasePrice: assetData.purchase_price || '',
    PONo: assetData.po_number || '',

    capitalizationPrice:
      depreciableAsset === 'yes' ? assetData.capitalization_price || '' : '',
    capitalizationDate:
      depreciableAsset === 'yes'
        ? (assetData.capitalization_date ? dayjs(assetData.capitalization_date) : null)
        : null,

    endOfLife: assetData.lifetime_months || '',
    depreciation: assetData.depreciation_perc
      ? assetData.depreciation_perc.$numberDecimal || assetData.depreciation_perc
      : '',
    incomeTaxDepreciation: assetData.incometaxdepreciation_per
      ? assetData.incometaxdepreciation_per.$numberDecimal || assetData.incometaxdepreciation_per
      : '',
    departmentId: assetData.dept?._id || '',
    allotedTo: assetData.alloted_to?._id || '',
    allotedUpTo: assetData.alloted_upto ? dayjs(assetData.alloted_upto) : null,
    amcVendor: assetData.amc_vendor || '',
    amcStartDate: assetData.amc_startdate ? dayjs(assetData.amc_startdate) : null,
    amcEndDate: assetData.amc_enddate ? dayjs(assetData.amc_enddate) : null,
    warrantyStartDate: assetData.warranty_startdate ? dayjs(assetData.warranty_startdate) : null,
    warrantyEndDate: assetData.warranty_enddate ? dayjs(assetData.warranty_enddate) : null,
    createdDate: assetData.created_date ? dayjs(assetData.created_date) : null,
    warrantyStatus: assetData.warranty || '',

    depreciableAsset, // safe normalized value
    accumulatedDepreciation: assetData.accumulated_depreciation || '',
    depreciationMethod:
      assetData.depreciation_method === 'as per company policy'
        ? ' as per company policy'
        : assetData.depreciation_method || ' as per company policy',
    shift: assetData.shift
      ? assetData.shift
          .split(' ')
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
      : 'Single Shift',
    scrapValue: assetData.scrap_value || ''
  })

  if (assetData.file_attached) {
    setFilePreview(assetData.file_attached)
  }
}

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data')
        router.push(`/${locale}/asset-managements/asset-list`)
      }
    }
    fetchData()
  }, [assetId, router, locale])

  const tabs = ['asset_details', 'purchase_info', 'finance_info', 'alloted_info', 'warranty_info']

  const handleNextClick = () => {
    const currentIndex = tabs.indexOf(value)
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

          <CardContent>
            <TabPanel value='asset_details'>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Asset Name'
                    placeholder='Asset name'
                    value={formData.assetName}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Asset Code'
                    placeholder='Asset code'
                    value={formData.assetCode}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select label='Category' value={formData.category} disabled>
                      {categories.map(category => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.category_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Location</InputLabel>
                    <Select label='Location' value={formData.location} disabled>
                      {locations.map(location => (
                        <MenuItem key={location._id} value={location._id}>
                          {location.location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label='Status' value={formData.status} disabled>
                      {statuses.map(status => (
                        <MenuItem key={status._id} value={status._id}>
                          {status.status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select label='Brand' value={formData.brand} disabled>
                      {brands.map(brand => (
                        <MenuItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Model</InputLabel>
                    <Select label='Model' value={formData.model} disabled>
                      {model.map(model => (
                        <MenuItem key={model._id} value={model._id}>
                          {model.model_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Serial No'
                    placeholder='Serial number'
                    value={formData.serialNo}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Description'
                    placeholder='Description'
                    value={formData.description}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select label='Condition' value={formData.condition} disabled>
                      {conditions.map(condition => (
                        <MenuItem key={condition._id} value={condition._id}>
                          {condition.condition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant='outlined'
                    component='label'
                    fullWidth
                    className='h-[56px] text-gray-500 border-gray-300'
                    disabled
                  >
                    <CloudUpload className='text-gray-500' />
                    Asset pic
                    <input type='file' hidden />
                  </Button>
                  {filePreview && (
                    <Typography variant='body2' mt={1}>
                      Current file
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='purchase_info'>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Vendor name</InputLabel>
                    <Select label='Vendor name' value={formData.vendorName} disabled>
                      {vendor.map(vendor => (
                        <MenuItem key={vendor._id} value={vendor._id}>
                          {vendor.vendor_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Invoice No'
                    type='number'
                    placeholder='Invoice number'
                    value={formData.invoiceNo}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                        placeholder: 'DD-MM-YYYY'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label='PO Number' placeholder='PO number' value={formData.PONo} disabled />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Purchase Price'
                    type='number'
                    placeholder='Purchase price'
                    value={formData.purchasePrice}
                    disabled
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
                        <FormControlLabel value='yes' disabled control={<Radio />} label='Yes' />
                        <FormControlLabel value='no' disabled control={<Radio />} label='No' />
                      </RadioGroup>
                    </Box>
                  </FormControl>
                </Grid>
             
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label='Capitalization Price'
                        type='number'
                        placeholder='Capitalization price'
                        value={formData.capitalizationPrice}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Asset life(months)'
                    type='number'
                    placeholder='Asset life'
                    value={formData.endOfLife}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Depreciation%'
                    placeholder='Depreciation%'
                    value={formData.depreciation}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Income Tax Depreciation%'
                    placeholder='Income tax depreciation%'
                    value={formData.incomeTaxDepreciation}
                    disabled
                  />
                </Grid>
                {/* <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Accumulated Depreciation'
                    type='number'
                    placeholder='Accumulated depreciation'
                    value={formData.accumulatedDepreciation}
                    disabled
                  />
                </Grid> */}
                {/* <Grid item xs={12} sm={4}>
                  <TextField select fullWidth label='Depreciation Method' value={formData.depreciationMethod} disabled>
                    <MenuItem value=' as per company policy'> as per company policy</MenuItem>
                    <MenuItem value='Straight line method'>Straight line method</MenuItem>
                    <MenuItem value='Declining method'>Declining method</MenuItem>
                  </TextField>
                </Grid> */}
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth label='Shift' value={formData.shift} disabled>
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
                    value={formData.scrapValue}
                    disabled
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='alloted_info'>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select label='Department' value={formData.departmentId} disabled>
                      {department.map(department => (
                        <MenuItem key={department._id} value={department._id}>
                          {department.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Allotted To</InputLabel>
                    <Select label='Allotted To' value={formData.allotedTo} disabled>
                      {users.map(user => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.user_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                        placeholder: 'DD-MM-YYYY'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* <TabPanel value='warranty_info'>
              <Grid container spacing={5} className='flex flex-col'>
                <Grid item xs={12} sm={4}>
                  <FormControl component='fieldset' fullWidth>
                    <FormLabel className='text-textPrimary'>Warranty Status</FormLabel>
                    <RadioGroup row name='warrantyStatus' value={formData.warrantyStatus} disabled>
                      <FormControlLabel value='amc' control={<Radio disabled />} label='AMC' />
                      <FormControlLabel value='under warranty' control={<Radio disabled />} label='Warranty' />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {formData.warrantyStatus === 'amc' && (
                  <Grid item xs={12} sm={12} className='flex justify-between gap-2'>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label='AMC Vendor'
                        placeholder='AMC Vendor'
                        value={formData.amcVendor}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                )}

                {formData.warrantyStatus === 'under warranty' && (
                  <Grid item xs={12} sm={12} className='flex justify-between gap-2'>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label='Created Date'
                        value={formData.createdDate}
                        format='DD-MM-YYYY'
                        views={['year', 'month', 'day']}
                        openTo='day'
                        disabled
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                            placeholder: 'DD-MM-YYYY'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </TabPanel> */}
            <TabPanel value="warranty_info">
  <Grid container spacing={5} sx={{ px: 2 }}>
    {/* Warranty Status */}
    <Grid item xs={12} sm={4}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel className="text-textPrimary">Warranty Status</FormLabel>
        <RadioGroup
          row
          name="warrantyStatus"
          value={formData.warrantyStatus}
          disabled
        >
          <FormControlLabel value="amc" control={<Radio disabled />} label="AMC" />
          <FormControlLabel value="under warranty" control={<Radio disabled />} label="Warranty" />
        </RadioGroup>
      </FormControl>
    </Grid>

    {/* AMC Fields */}
  {/* AMC Fields */}
{formData.warrantyStatus === "amc" && (
  <Grid container spacing={5}>
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        label="AMC Vendor"
        placeholder="AMC Vendor"
        value={formData.amcVendor}
        disabled
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <DatePicker
        label="AMC Start Date"
        value={formData.amcStartDate}
        format="DD-MM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        disabled
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD-MM-YYYY",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <DatePicker
        label="AMC End Date"
        value={formData.amcEndDate}
        format="DD-MM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        disabled
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD-MM-YYYY",
          },
        }}
      />
    </Grid>
  </Grid>
)}


    {/* Warranty Fields */}
  {formData.warrantyStatus === "under warranty" && (
  <Grid container spacing={5}>
    <Grid item xs={12} sm={4}>
      <DatePicker
        label="Created Date"
        value={formData.createdDate}
        format="DD-MM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        disabled
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD-MM-YYYY",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <DatePicker
        label="Warranty Start Date"
        value={formData.warrantyStartDate}
        format="DD-MM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        disabled
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD-MM-YYYY",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <DatePicker
        label="Warranty End Date"
        value={formData.warrantyEndDate}
        format="DD-MM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        disabled
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD-MM-YYYY",
          },
        }}
      />
    </Grid>
  </Grid>
)}

  </Grid>
</TabPanel>

          </CardContent>
          <Divider />
          <CardActions>
            <Button variant='outlined' color='error' onClick={handleBackClick}>
              Cancel
            </Button>
            {value !== 'asset_details' && (
              <Button type='button' variant='outlined' onClick={handlePrevClick}>
                Previous
              </Button>
            )}
            {value !== 'warranty_info' && (
              <Button type='button' variant='contained' onClick={handleNextClick}>
                Next
              </Button>
            )}
          </CardActions>
        </TabContext>
      </Card>
    </LocalizationProvider>
  )
}

export default ViewAsset
