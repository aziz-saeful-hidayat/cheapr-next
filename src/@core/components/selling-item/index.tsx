import React, { useMemo } from 'react'
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_Row,
  MaterialReactTableProps,
  MRT_Cell
} from 'material-react-table'
import { Box, IconButton, Tooltip } from '@mui/material'

//Date Picker Imports
import { Delete, ContentCopy } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'

type InventoryItem = {
  [key: string]: any
}
type Payload = {
  pk?: number
  buying?: number
  product?: CAProduct
  status?: string
  serial?: string
  comment?: string
  room?: number
  total_cost?: number
  shipping_cost?: number
}
type CAProduct = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
}
type InventoryPayload = {
  buying: number
  selling: number
  product: number
  status: string
  serial: string
  comment: string
  room: number
  total_cost: number
  shipping_cost: number
}
const Items = ({
  data,
  reupdate,
  idx,
  update,
  handleAddItem
}: {
  data: InventoryItem[]
  reupdate: (order: number) => void
  idx: number
  update: (idx: number, rowIdx: number, key: string, value: any) => void
  handleAddItem: (values: InventoryPayload) => void
}) => {
  const { data: session }: { data: ExtendedSession | null } = useSession()

  const handleDeleteRow = (row: MRT_Row<InventoryItem>) => {
    if (!confirm(`Are you sure you want to delete Item #${row.index + 1} ${row.original.product.sku}`)) {
      return
    }
    fetch(`https://cheapr.my.id/inventory_items/${row.original.pk}/`, {
      // note we are going to /1
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ selling: null })
    })
      .then(response => response.status)
      .then(status => {
        if (status == 200) {
          reupdate(row.original.selling)
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
      enableRowActions
      positionActionsColumn='last'
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex' }}>
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
