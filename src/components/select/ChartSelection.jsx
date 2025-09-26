import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { getCookie } from 'cookies-next';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const charts = [
  'Category wise assets',
  'Location wise assets',
  'Asset status count',
  'Audit status count',
  'Ticket status',
  'Ticket Assign Status',
];

function getStyles(chart, chartName, theme) {
  return {
    fontWeight: chartName.includes(chart)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function ChartSelection({ chartName, setChartName }) {
  const theme = useTheme();
  const email = JSON.parse(getCookie("userData")).email;

  // Load chartName from localStorage on mount
  React.useEffect(() => {
    if (!email) return;

    const stored = JSON.parse(localStorage.getItem('dashboard-data')) || [];
    const userEntry = stored.find((entry) => Object.keys(entry)[0] === email);

    if (userEntry && userEntry[email]?.chartName) {
      setChartName(userEntry[email].chartName);
    }
  }, [email, setChartName]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    const updatedChartName = typeof value === 'string' ? value.split(',') : value;

    setChartName(updatedChartName);

    const stored = JSON.parse(localStorage.getItem('dashboard-data')) || [];
    const userIndex = stored.findIndex((entry) => Object.keys(entry)[0] === email);

    if (userIndex > -1) {
      stored[userIndex][email].chartName = updatedChartName;
    } else {
      stored.push({ [email]: { assetName: [], chartName: updatedChartName } });
    }

    localStorage.setItem('dashboard-data', JSON.stringify(stored));
  };

  return (
  <div className="w-full flex justify-start">
    <FormControl
      sx={{
        m: 1,
        width: {
          xs: '100%',   // full width on extra-small screens
          sm: '90%',    // 90% width on small screens
          md: '70%',    // 70% width on medium screens
          lg: '50%',    // 50% width on large screens
          xl: '40%',    // 40% width on extra-large screens
        },
        minWidth: 120,   // prevent it from collapsing
        maxWidth: 600,   // optional: cap width on very large screens
      }}
    >
      <InputLabel id="demo-multiple-chip-label">Select Chart</InputLabel>
      <Select
        labelId="demo-multiple-chip-label"
        id="demo-multiple-chip"
        multiple
        value={chartName}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Select Chart" />}
        renderValue={(selected) => (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap', // wrap chips on small screens
              gap: 0.5,
            }}
          >
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {charts.map((chart) => (
          <MenuItem
            key={chart}
            value={chart}
            style={getStyles(chart, chartName, theme)}
          >
            {chart}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
);

}
