import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import { getCookie } from 'cookies-next'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

const assets = ['Total Assets', 'Total Tickets', 'Total Audits', 'Total Discards']

function getStyles(asset, assetName, theme) {
  return {
    fontWeight: assetName.includes(asset) ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular
  }
}

export default function MultipleSelectChip({ assetName, setAssetName }) {
  const theme = useTheme()
  const email = JSON.parse(getCookie('userData')).email

  // Load assetName from localStorage on mount
  React.useEffect(() => {
    if (!email) return

    const stored = JSON.parse(localStorage.getItem('dashboard-data')) || []
    const userEntry = stored.find(entry => Object.keys(entry)[0] === email)

    if (userEntry && userEntry[email]?.assetName) {
      setAssetName(userEntry[email].assetName)
    }
  }, [email, setAssetName])

  const handleChange = event => {
    const {
      target: { value }
    } = event

    const updatedAssetName = typeof value === 'string' ? value.split(',') : value
    setAssetName(updatedAssetName)

    // Get existing data
    const stored = JSON.parse(localStorage.getItem('dashboard-data')) || []
    const userIndex = stored.findIndex(entry => Object.keys(entry)[0] === email)

    if (userIndex > -1) {
      stored[userIndex][email].assetName = updatedAssetName
    } else {
      stored.push({ [email]: { assetName: updatedAssetName, chartName: [] } })
    }

    localStorage.setItem('dashboard-data', JSON.stringify(stored))
  }

  return (
    <div className='w-full flex justify-start'>
      <FormControl
        sx={{
          m: 1,
          mb: 3,
          width: {
            xs: '100%', // full width on mobile
            sm: '90%', // 90% width on small screens
            md: '70%', // 70% width on medium screens
            lg: '50%', // 50% width on large screens
            xl: '40%' // 40% width on extra-large
          },
          minWidth: 120,
          maxWidth: 600
        }}
      >
        <InputLabel id='demo-multiple-chip-label'>Select Analytics</InputLabel>
        <Select
          labelId='demo-multiple-chip-label'
          id='demo-multiple-chip'
          multiple
          value={assetName}
          onChange={handleChange}
          input={<OutlinedInput id='select-multiple-chip' label='Select Analytics' />}
          renderValue={selected => (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5
              }}
            >
              {selected.map(value => (
                <Chip key={value} label={value} className='mr-1' />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {assets.map(asset => (
            <MenuItem key={asset} value={asset} style={getStyles(asset, assetName, theme)}>
              {asset}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
