'use client'

import { useEffect, useState } from 'react'

// import PermissionItem from './PermissionItem'

import axiosInstance from '@/utils/axiosinstance'

import { toast } from 'react-toastify'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

import PermissionItems from './permissionItem'
import { Button } from '@mui/material'

export default function RolePermissionPage() {
  const instance = axiosInstance()
  const [treeData, setTreeData] = useState([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang: locale } = useParams()
  const roleId = searchParams.get('role')

  useEffect(() => {
    if (!roleId || roleId === 'null') {
      toast.error('Missing or invalid role ID in URL')
      // router.push('/masters/user-role')
      router.push(`/${locale}/masters/user-role`)
      return
    }
    fetchPermission(roleId)
  }, [roleId])

  const fetchPermission = async roleId => {
    try {
      // Step 1: Get role permissions (menu_perm)
      const roleRes = await axiosInstance.get(`/role/${roleId}`, {
        headers: { pass: 'pass' }
      })
      const allowedMenuIds = roleRes?.data?.data?.menu_perm ?? []

      // Step 2: Get all menus
      const menuRes = await axiosInstance.get(`menu/all?role_id=${roleId}`, {
        headers: { pass: 'pass' }
      })

      if (menuRes?.data?.data) {
        const raw = menuRes.data.data

        const mapItem = item => ({
          menu_id: item._id,
          menu_name: item.menu_name,
          actions: allowedMenuIds.includes(item._id),
          children: (item.permission || []).map(mapItem)
        })

        const tree = raw.filter(item => item.parent_menu === null).map(mapItem)
        setTreeData(tree)
      } else {
        toast.error('No permission data found')
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Failed to load permissions')
    }
  }

  const setAllChildren = (children, newVal) => {
    return children.map(child => ({
      ...child,
      actions: newVal,
      children: child.children ? setAllChildren(child.children, newVal) : []
    }))
  }

  const updateTreeNode = (nodes, menu_id, newVal) => {
    return nodes.map(node => {
      if (node.menu_id === menu_id) {
        return {
          ...node,
          actions: newVal,
          children: setAllChildren(node.children, newVal)
        }
      } else if (node.children?.length > 0) {
        return {
          ...node,
          children: updateTreeNode(node.children, menu_id, newVal)
        }
      }
      return node
    })
  }

  const handlePermissionChange = (menu_id, newVal) => {
    setTreeData(prevTree => updateTreeNode(prevTree, menu_id, newVal))
  }

  const handleSubmit = async () => {
    const collectCheckedMenuIds = nodes => {
      let ids = []
      for (const node of nodes) {
        if (node.actions) ids.push(node.menu_id)
        if (node.children && node.children.length > 0) {
          ids = ids.concat(collectCheckedMenuIds(node.children))
        }
      }
      return ids
    }

    const selectedPermissions = collectCheckedMenuIds(treeData)

    const payload = {
      role_id: roleId,
      menu_perm: selectedPermissions
    }

    try {
      const response = await axiosInstance.put(`role/perm/${roleId}`, payload, {
        headers: { pass: 'pass' }
      })

      if (response?.data?.status === 200) {
        toast.success('Permissions updated successfully')
      } else {
        toast.error(response?.data?.message || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update permissions')
    }
  }

  return (
    <div className='px-4 py-6'>
      <div className='bg-white rounded-lg shadow-md'>
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>Role Permissions</h2>
          {/* <Link
            href='/masters/user-role'
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold'
          >
            Back
          </Link> */}
          <Button
            variant='outlined'
            color='secondary'
            startIcon={<i className='ri-arrow-left-line' />}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        <div className='p-4 md:p-6'>
          {treeData.length === 0 ? (
            <p className='text-center text-gray-500 my-4'>Loading permissions...</p>
          ) : (
            <div className='bg-gray-50 p-4 rounded-md'>
              {treeData.map(item => (
                <PermissionItems key={item.menu_id} item={item} onPermissionChange={handlePermissionChange} />
              ))}
            </div>
          )}

          <div className='text-right mt-4'>
            <Button variant='outlined' color='secondary' onClick={handleSubmit} disabled={treeData.length === 0}>
              Save Permissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
