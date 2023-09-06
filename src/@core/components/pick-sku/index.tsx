import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import { CreateNewSKUModal } from './new-sku'

type InventoryItem = {
  [key: string]: any
}
type CAProduct = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
}

type Channel = {
  pk: number
  name: string
  image: string
}

export type SellingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  channel: {
    pk: number
    name: string
    image: string
  }
  tracking_number: string
  seller_name: string
  status: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  ss_shipping_cost: number
  channel_fee: number
  purchase_cost: number
  inbound_shipping: number
  purchase_items: number
  all_cost: number
  gross_sales: number
  profit: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
}

interface CreateModalProps {
  columns: MRT_ColumnDef<InventoryItem>[]
  onClose: () => void
  onSubmit: (values: InventoryItem) => void
  purchaseId: string
  open: boolean
  session: ExtendedSession
}

export const CreateItemModal = ({ open, columns, onClose, onSubmit, session }: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly CAProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [createSKUModalOpen, setCreateSKUModalOpen] = useState(false)

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }
  const columnsNewSKU = useMemo<MRT_ColumnDef<CAProduct>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU'
      },
      {
        accessorKey: 'make',
        header: 'Make'
      },
      {
        accessorKey: 'model',
        header: 'Model'
      },
      {
        accessorKey: 'mpn',
        header: 'MPN'
      },
      {
        accessorKey: 'asin',
        header: 'ASIN'
      }
    ],
    []
  )
  const handleCreateSKU = (values: CAProduct) => {
    console.log(values)
    fetch(`https://cheapr.my.id/caproduct/`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(values)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
        }
      })
  }

  return (
    <>
      <Dialog open={open}>
        <DialogTitle textAlign='center'>Pick SKU</DialogTitle>
        <DialogContent>
          <form onSubmit={e => e.preventDefault()}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
                paddingTop: 3
              }}
            >
              {columns.map(column =>
                column.accessorKey === 'product' ? (
                  <Autocomplete
                    key={column.accessorKey}
                    id='asynchronous-demo'
                    open={isopen}
                    onOpen={() => {
                      setOpen(true)
                    }}
                    onClose={() => {
                      setOpen(false)
                    }}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setValues({
                          ...values,
                          product: newValue?.pk
                        })
                      }
                    }}
                    filterOptions={x => x}
                    isOptionEqualToValue={(option, value) => option.sku === value.sku}
                    getOptionLabel={option => `${option.sku}`}
                    options={options}
                    loading={loading}
                    renderInput={params => (
                      <TextField
                        {...params}
                        onChange={e => {
                          setLoading(true)
                          fetch(`https://cheapr.my.id/caproduct/?sku=${e.target.value}`, {
                            // note we are going to /1
                            headers: {
                              'Content-Type': 'application/json'
                            }
                          })
                            .then(response => response.json())
                            .then(json => {
                              setOptions(json.results)
                            })
                            .finally(() => {
                              setLoading(false)
                            })
                        }}
                        label='SKU'
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                              {loading ? (
                                <CircularProgress color='inherit' size={20} />
                              ) : (
                                <Add onClick={() => setCreateSKUModalOpen(true)} />
                              )}
                            </>
                          )
                        }}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                    type={
                      column.accessorKey === 'total_cost' || column.accessorKey === 'shipping_cost' ? 'number' : 'text'
                    }
                  />
                )
              )}
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button color='primary' onClick={handleSubmit} variant='contained'>
            Choose
          </Button>
        </DialogActions>
      </Dialog>
      <CreateNewSKUModal
        columns={columnsNewSKU}
        open={createSKUModalOpen}
        onClose={() => setCreateSKUModalOpen(false)}
        onSubmit={handleCreateSKU}
      />
    </>
  )
}
