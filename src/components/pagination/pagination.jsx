'use client'

import { useState, useEffect } from 'react'
import { Pagination, TextField, MenuItem, Box } from '@mui/material'
import { getCookie, setCookie } from 'cookies-next'

const PaginationComponent = ({
  totalItems,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20],
  storageKey = 'pageSize'
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(pageSize)

  useEffect(() => {
    const storedPageSize = parseInt(getCookie(storageKey))
    if (storedPageSize && storedPageSize !== pageSize) {
      setRowsPerPage(storedPageSize)
      onPageSizeChange(storedPageSize)
    }
  }, [])

  const handlePageSizeChange = event => {
    const newSize = parseInt(event.target.value)
    setRowsPerPage(newSize)
    setCookie(storageKey, newSize)
    onPageSizeChange(newSize)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'medium' }}>Rows per page:</span>
        <TextField
          select
          size='small'
          value={rowsPerPage}
          onChange={handlePageSizeChange}
          // sx={{ minWidth: '70px' }}
        >
          {pageSizeOptions.map(size => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Pagination
        color='primary'
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        siblingCount={0}
        boundaryCount={1}
        size='small' // Smaller pagination for mobile
        // showFirstButton
        // showLastButton
      />
    </Box>
  )
}

export default PaginationComponent
