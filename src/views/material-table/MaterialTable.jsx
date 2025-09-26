'use client'
import React, { useState } from 'react'
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { ArrowRightLeft, EllipsisVertical, Eye } from 'lucide-react'

const columns = [
  { id: 'asset', label: 'Asset Name', group: 'Default Section' },
  { id: 'condition', label: 'Condition', group: 'Additional Information' },
  { id: 'vendor', label: 'Vendor Name', group: 'Purchase Information' },
  { id: 'po', label: 'PO Number', group: 'Purchase Information' },
  { id: 'invoiceDate', label: 'Invoice Date', group: 'Purchase Information' },
  { id: 'invoiceNo', label: 'Invoice No', group: 'Purchase Information' },
  { id: 'purchaseDate', label: 'Purchase Date', group: 'Purchase Information' }
]

const rows = [
  {
    id: 1,
    asset: 'Axial Fan Unit',
    condition: 'Good',
    vendor: '',
    po: '34564642',
    invoiceDate: '',
    invoiceNo: '',
    purchaseDate: '19/05/2015'
  },
  {
    id: 2,
    asset: 'Electric Starter Panel',
    condition: 'Good',
    vendor: '',
    po: '34564640',
    invoiceDate: '',
    invoiceNo: '',
    purchaseDate: '19/05/2015'
  },
  {
    id: 3,
    asset: 'Fresh Air Fan Unit',
    condition: 'Good',
    vendor: '',
    po: '34564637',
    invoiceDate: '',
    invoiceNo: '',
    purchaseDate: '19/05/2015'
  },
  {
    id: 4,
    asset: 'Laptop',
    condition: 'Good',
    vendor: '',
    po: '',
    invoiceDate: '',
    invoiceNo: '',
    purchaseDate: '01/04/2017'
  },
  {
    id: 5,
    asset: 'Laptop',
    condition: 'Good',
    vendor: '',
    po: '',
    invoiceDate: '',
    invoiceNo: '',
    purchaseDate: '01/04/2017'
  }
]

const MaterialTable = () => {
  const [filters, setFilters] = useState({})
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }))
  }

  const filteredRows = rows.filter(row =>
    columns.every(col => {
      const filter = filters[col.id] || ''
      return row[col.id]?.toLowerCase?.().includes(filter.toLowerCase())
    })
  )

  const groupedHeaders = Array.from(new Set(columns.map(c => c.group)))

  return (
    <div className='category_table'>
      <Box p={2}>
        <Typography variant='subtitle1' mb={1} className='table_head'>
          {selected.length} Row(s) Selected ❌
        </Typography>

        <TableContainer component={Paper}>
          <Table size='small' sx={{ border: '1px solid #e2e2e2' }}>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} padding='checkbox'>
                  <Checkbox />
                </TableCell>
                <TableCell rowSpan={2}></TableCell>
                {groupedHeaders.map(group => {
                  const span = columns.filter(c => c.group === group).length
                  return (
                    <TableCell key={group} align='center' colSpan={span} sx={{ border: '1px solid #e0e0e0' }}>
                      {group}
                    </TableCell>
                  )
                })}
              </TableRow>

              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.id} sx={{ border: '1px solid #e0e0e0' }}>
                    <Box display='flex' flexDirection='column'>
                      <Typography fontWeight='bold' variant='body2'>
                        {col.label}
                      </Typography>
                      <TextField
                        variant='standard'
                        value={filters[col.id] || ''}
                        onChange={e => handleFilterChange(col.id, e.target.value)}
                        InputProps={{ disableUnderline: true }}
                      />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                <TableRow key={row.id} hover>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onChange={() =>
                        setSelected(prev =>
                          prev.includes(row.id) ? prev.filter(i => i !== row.id) : [...prev, row.id]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className='flex items-center'>
                    <IconButton size='small'>
                      <Eye size={16} />
                    </IconButton>
                    <IconButton size='small'>
                      <ArrowRightLeft size={16} />
                    </IconButton>
                    <IconButton size='small'>
                      <EllipsisVertical size={16} />
                    </IconButton>
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.id} sx={{ border: '1px solid #e2e2e2' }}>
                      <Typography fontWeight={col.id === 'asset' ? 'bold' : 'normal'}>{row[col.id] || ''}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component='div'
            count={filteredRows.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      </Box>
    </div>
  )
}

export default MaterialTable
