'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

const PermissionItems = ({ item, onPermissionChange, parentChecked = true }) => {
  const [checked, setChecked] = useState(item.actions ?? false)
  const [isOpen, setIsOpen] = useState(false)
  const checkboxRef = useRef(null)

  useEffect(() => {
    setChecked(item.actions ?? false)
  }, [item.actions])

  const effectiveChecked = parentChecked ? checked : false
  const disabled = !parentChecked
  const hasChildren = item.children && item.children.length > 0

  // Handle indeterminate state
  useEffect(() => {
    if (checkboxRef.current && hasChildren) {
      const allChecked = item.children.every(child => child.actions)
      const someChecked = item.children.some(child => child.actions)
      checkboxRef.current.indeterminate = !allChecked && someChecked
    }
  }, [item.children])

  const handleCheckboxChange = e => {
    const newVal = e.target.checked
    setChecked(newVal)
    onPermissionChange(item.menu_id, newVal)
  }

  const toggleOpen = e => {
    if (hasChildren) {
      e.stopPropagation()
      setIsOpen(prev => !prev)
    }
  }

  return (
    <div className='ml-4 mb-2'>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded ${
          hasChildren ? 'cursor-pointer hover:bg-gray-100' : ''
        } ${disabled ? 'opacity-60' : ''}`}
        onClick={toggleOpen}
      >
        {hasChildren ? (
          <button
            type='button'
            onClick={toggleOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            className='text-gray-500'
          >
            {isOpen ? <FaChevronDown className='w-4 h-4' /> : <FaChevronRight className='w-4 h-4' />}
          </button>
        ) : (
          <span className='inline-block w-4 h-4'></span>
        )}

        <div className='flex items-center gap-2 w-full'>
          <input
            type='checkbox'
            id={`permission-${item.menu_id}`}
            checked={effectiveChecked}
            onChange={handleCheckboxChange}
            disabled={disabled}
            ref={checkboxRef}
            className='w-4 h-4 cursor-pointer accent-blue-600 focus:outline-none focus:ring-0'
          />
          <label
            htmlFor={`permission-${item.menu_id}`}
            className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-800'} cursor-pointer`}
          >
            {item.menu_name}
          </label>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className='ml-6 pl-3 border-l border-gray-200'>
          {item.children.map(child => (
            <PermissionItems
              key={child.menu_id}
              item={child}
              onPermissionChange={onPermissionChange}
              parentChecked={effectiveChecked}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PermissionItems
