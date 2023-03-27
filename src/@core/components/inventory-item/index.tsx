import React, { useMemo } from 'react'
import MaterialReactTable, { type MRT_ColumnDef, type MRT_Row, MaterialReactTableProps } from 'material-react-table'
import { Box, IconButton, Tooltip } from '@mui/material'

//Date Picker Imports
import { Delete, Edit } from '@mui/icons-material'

type InventoryItem = {
  pk: number
  buying: number
  product: CAProduct
  status: string
  serial: string
  comment: string
  room: number
  total_cost: number
  shipping_cost: number
}
type CAProduct = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
}

const Items = ({ data, reupdate }: { data: InventoryItem[]; reupdate: (order: number) => void }) => {
  const handleSaveRow: MaterialReactTableProps<InventoryItem>['onEditingRowSave'] = async ({
    exitEditingMode,
    row,
    values
  }) => {
    delete values['product.sku']
    console.log(values)
    fetch(`https://cheapr.my.id/inventory_items/${row.original.pk}/`, {
      // note we are going to /1
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
          reupdate(json.buying)
          exitEditingMode() //required to exit editing mode
        }
      })
  }
  const handleDeleteRow = (row: MRT_Row<InventoryItem>) => {
    if (!confirm(`Are you sure you want to delete Item #${row.index + 1} ${row.original.product.sku}`)) {
      return
    }
    fetch(`https://cheapr.my.id/inventory_items/${row.original.pk}/`, {
      // note we are going to /1
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.status)
      .then(status => {
        if (status == 204) {
          reupdate(row.original.buying)
        }
      })
  }
  const columnsItem = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product.sku',
        header: 'SKU',
        size: 150,
        enableEditing: false
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        size: 70
      },

      {
        accessorKey: 'total_cost',
        header: 'Total',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 250
      }

      //end
    ],
    []
  )

  return (
    <MaterialReactTable
      columns={columnsItem}
      enableTopToolbar={false}
      enableBottomToolbar={false}
      initialState={{ showColumnFilters: false }}
      enableEditing
      editingMode='modal'
      onEditingRowSave={handleSaveRow}
      manualFiltering
      manualPagination
      manualSorting
      data={data}
      muiTablePaperProps={{
        elevation: 0, //change the mui box shadow
        //customize paper styles
        sx: {
          marginY: 2,
          borderRadius: '0',
          border: '1px dashed #e0e0e0'
        }
      }}
      renderRowActions={({ row, table }) => (
        <Box sx={{ display: 'flex' }}>
          <Tooltip arrow placement='top' title='Edit'>
            <IconButton color='primary' onClick={() => table.setEditingRow(row)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip arrow placement='top' title='Delete'>
            <IconButton color='error' onClick={() => handleDeleteRow(row)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    />
  )
}
export default Items
