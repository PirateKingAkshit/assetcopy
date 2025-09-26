// // utils/menuPaths.js
// export const menuPathMap = {
//   'Dashboard': '/dashboard',
//   'Add Asset': '/asset/add',
//   'Asset List': '/asset/list',
//   'Generate Sticker': '/asset/generate-sticker',
//   'Asset Transfer': '/asset/transfer',
//   'Discard or Sell': '/asset/discard-sell',
//   'Transfer Approval': '/asset/transfer-approval',
//   'Ticket List': '/ticket/list',
//   'Audit Config': '/audit/config',
//   'Discard or Sell Reports': '/report/discard-sell',
//   'Audit Reports': '/report/audit',
//   'Transfer Reports': '/report/transfer',
//   'Asset Category': '/masters/asset-category',
//   'Asset Location': '/masters/asset-location',
//   'Asset status': '/masters/asset-status',
//   'Asset condition': '/masters/asset-condition',
//   'Asset Department': '/masters/asset-department',
//   'Asset Vendor': '/masters/asset-vendor',
//   'Asset Brand': '/masters/asset-brand',
//   'Asset Model': '/masters/asset-model',
//   'Tax Master': '/masters/tax-master',
//   'User Role': '/masters/user-role',
//   'User Master': '/masters/user-master',
//   'Menu Master': '/config/menu-master',
// }

// utils/menuPaths.js
export const menuPathMap = {
  'Dashboard': {
    path: '/dashboard',
    icon: 'ri-dashboard-line'
  },
  'Add Asset': {
    path: '/asset-managements/add-asset',
    icon: 'ri-add-line'
  },
  'Asset List': {
    path: '/asset-managements/asset-list',
    icon: 'ri-list-check'
  },
  'Generate Sticker': {
    path: '/asset-managements/genrate-sticker',
    icon: 'ri-printer-line'
  },
  'Asset Transfer': {
    path: '/asset-managements/asset-transfer',
    icon: 'ri-exchange-line'
  },
  'Discard or Sell': {
    path: '/asset-managements/discard-sell',
    icon: 'ri-delete-bin-line'
  },
  'Transfer Approval': {
    path: '/asset-managements/transfer-approval',
    icon: 'ri-check-double-line'
  },
  'Ticket List': {
    path: '/ticket/ticket-list',
    icon: 'ri-ticket-line'
  },
  'Audit Config': {
    path: '/assetAudit/audit-config',
    icon: 'ri-settings-4-line'
  },
  'Discard or Sell Reports': {
    path: '/assetreports/discard-report',
    icon: 'ri-file-list-3-line'
  },
  'Audit Reports': {
    path: '/assetreports/audit-report',
    icon: 'ri-clipboard-line'
  },
  'Transfer Reports': {
    path: '/assetreports/transfer-report',
    icon: 'ri-bar-chart-grouped-line'
  },
  'Asset Category': {
    path: '/masters/asset-category',
    icon: 'ri-shapes-line'
  },
  'Asset Location': {
    path: '/masters/asset-location',
    icon: 'ri-map-pin-line'
  },
  'Asset status': {
    path: '/masters/asset-status',
    icon: 'ri-check-line'
  },
  'Asset condition': {
    path: '/masters/asset-condition',
    icon: 'ri-contrast-drop-line'
  },
  'Asset Department': {
    path: '/masters/asset-department',
    icon: 'ri-building-line'
  },
  'Asset Vendor': {
    path: '/masters/asset-vendor',
    icon: 'ri-store-line'
  },
  'Asset Brand': {
    path: '/masters/asset-brand',
    icon: 'ri-trademark-line'
  },
  'Asset Model': {
    path: '/masters/asset-modal',
    icon: 'ri-layout-line'
  },
  'Tax Master': {
    path: '/masters/tax-master',
    icon: 'ri-percent-line'
  },
  'User Role': {
    path: '/masters/user-role',
    icon: 'ri-shield-user-line'
  },
  'User Master': {
    path: '/masters/user-master',
    icon: 'ri-user-line'
  },
  'Menu Master': {
    path: '/config/menu-master',
    icon: 'ri-menu-line'
  }
}

export const getPathFromMenuName = name => menuPathMap[name]?.path || '#'
export const getIconFromMenuName = name => menuPathMap[name]?.icon || ''




// // <// utils/menuPaths.js
// export const menuPathMap = {
//   'Dashboard': { path: '/dashboard', icon: 'ri-dashboard-line' },
//   'Add Asset': { path: '/asset/add', icon: 'ri-add-line' },
//   'Asset List': { path: '/asset/list', icon: 'ri-list-check' },
//   'Generate Sticker': { path: '/asset/generate-sticker', icon: 'ri-printer-line' },
//   'Asset Transfer': { path: '/asset/transfer', icon: 'ri-exchange-line' },
//   'Discard or Sell': { path: '/asset/discard-sell', icon: 'ri-delete-bin-line' },
//   'Transfer Approval': { path: '/asset/transfer-approval', icon: 'ri-check-double-line' },
//   'Ticket List': { path: '/ticket/list', icon: 'ri-ticket-line' },
//   'Audit Config': { path: '/audit/config', icon: 'ri-settings-4-line' },
//   'Discard or Sell Reports': { path: '/report/discard-sell', icon: 'ri-file-list-3-line' },
//   'Audit Reports': { path: '/report/audit', icon: 'ri-clipboard-line' },
//   'Transfer Reports': { path: '/report/transfer', icon: 'ri-bar-chart-grouped-line' },
//   'Asset Category': { path: '/masters/asset-category', icon: 'ri-shapes-line' },
//   'Asset Location': { path: '/masters/asset-location', icon: 'ri-map-pin-line' },
//   'Asset status': { path: '/masters/asset-status', icon: 'ri-check-line' },
//   'Asset condition': { path: '/masters/asset-condition', icon: 'ri-contrast-drop-line' },
//   'Asset Department': { path: '/masters/asset-department', icon: 'ri-building-line' },
//   'Asset Vendor': { path: '/masters/asset-vendor', icon: 'ri-store-line' },
//   'Asset Brand': { path: '/masters/asset-brand', icon: 'ri-trademark-line' },
//   'Asset Model': { path: '/masters/asset-model', icon: 'ri-layout-line' },
//   'Tax Master': { path: '/masters/tax-master', icon: 'ri-percent-line' },
//   'User Role': { path: '/masters/user-role', icon: 'ri-shield-user-line' },
//   'User Master': { path: '/masters/user-master', icon: 'ri-user-line' },
//   'Menu Master': { path: '/config/menu-master', icon: 'ri-menu-line' }
// }
// >
