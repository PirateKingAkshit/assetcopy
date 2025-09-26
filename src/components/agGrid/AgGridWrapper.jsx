import { AgGridReact } from 'ag-grid-react'
import { themeBalham, ModuleRegistry, provideGlobalGridOptions, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'

provideGlobalGridOptions({ theme: 'balham' })
const myTheme = themeBalham.withParams({ accentColor: 'red' })

ModuleRegistry.registerModules([
  AllCommunityModule // or AllEnterpriseModule
])

const AgGridWrapper = ({ gridRef, columnDefs, rowData, pageSize, ...gridProps }) => {
  return (
    <div className='ag-theme-balham' style={{ width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        theme={'legacy'}
        columnDefs={columnDefs}
        rowData={rowData}
        rowModelType='clientSide'
        paginationPageSize={pageSize}
        cacheBlockSize={pageSize}
        maxBlocksInCache={10}
        getRowHeight={() => 35}
        headerHeight={35}
        // getRowStyle={()=>({
        //   minHeight:"20px",
        // })}
        defaultColDef={{
          filter: true,
          sortable: true,
          resizable: true,
          floatingFilter: false
        }}
        {...gridProps}
      />
    </div>
  )
}

export default AgGridWrapper
