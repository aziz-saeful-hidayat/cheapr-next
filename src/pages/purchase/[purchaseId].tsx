import React, { useEffect, useMemo, useState } from 'react'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MRT_TableOptions,
  MRT_Row
} from 'material-react-table'
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Popover from '@mui/material/Popover'
import { Delete, ContentCopy } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { withAuth } from 'src/constants/HOCs'
import { useRouter } from 'next/router'
import { ExtendedSession } from '../api/auth/[...nextauth]'
import { formatterUSDStrip } from 'src/constants/Utils'
import CardOrder from 'src/views/cards/CardOrder'
import CloseIcon from '@mui/icons-material/Close'
import { BuyingOrder, SellingBuying } from 'src/@core/types'

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
type Room = {
  pk: number
  name: string
  room_id: string
}
type Rating = {
  pk: number
  name: string
  color: string
}
type Item = {
  pk: number
  buying: number
  product: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
  }
  status: string
  serial: string
  comment: string
  room: Room
  rating: Rating
  total_cost: number
  shipping_cost: number
}

const person = {
  pk: 23,
  name: 'Leigh Ann Peters',
  phone: '+1 207-835-4259 ext. 30141',
  email: null,
  address: {
    pk: 22,
    street_1: '13517 STATESVILLE RD',
    street_2: null,
    zip: '28078-9047',
    city: {
      pk: 24,
      name: 'HUNTERSVILLE',
      state: {
        pk: 13,
        name: '',
        short: 'NC',
        country: {
          pk: 1,
          name: 'United States',
          short: 'US'
        }
      }
    }
  }
}
export type SalesOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  person: typeof person
  channel: {
    pk: number
    name: string
    image: string
  }
  seller: {
    pk: number
    name: string
  }
  status: string
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  channel_fee: number
  purchase_cost: number
  inbound_shipping: number
  purchase_items: number
  all_cost: number
  gross_sales: number
  profit: number
  refunded: number
  returned: number
  ss_shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
  destination: string
  sales: {
    pk: number
    order_id: string
  }
  selling_buying: SellingBuying[]
}

interface CreateModalProps {
  columns: MRT_ColumnDef<InventoryItem>[]
  onClose: () => void
  onSubmit: (values: Item) => void
  open: boolean
  roomData: Room[]
  ratingData: Rating[]
  session: ExtendedSession
}

interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
}
export const CreateNewAccountModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  roomData,
  ratingData,
  session
}: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly CAProduct[]>([])
  const loading = open && options.length === 0
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Item</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
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
              column.accessorKey === 'product.sku' ? (
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
                        product: newValue
                      })
                    }
                  }}
                  isOptionEqualToValue={(option, value) => option.sku === value.sku}
                  getOptionLabel={option => option.sku}
                  options={options}
                  loading={loading}
                  renderInput={params => (
                    <TextField
                      {...params}
                      onChange={e =>
                        fetch(`https://cheapr.my.id/caproduct/?sku=${e.target.value}`, {
                          // note we are going to /1
                          headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => response.json())
                          .then(json => {
                            setOptions(json.results)
                          })
                      }
                      label='SKU'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {loading ? <CircularProgress color='inherit' size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        )
                      }}
                    />
                  )}
                />
              ) : column.accessorKey === 'room.name' ? (
                <TextField
                  key={column.accessorKey}
                  label={column.header}
                  name={column.accessorKey}
                  onChange={e => setValues({ ...values, room: e.target.value })}
                  select
                >
                  {roomData?.map(room => (
                    <MenuItem key={room.pk} value={room.name}>
                      {room.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : column.accessorKey === 'rating.name' ? (
                <TextField
                  key={column.accessorKey}
                  label={column.header}
                  name={column.accessorKey}
                  onChange={e => setValues({ ...values, rating: e.target.value })}
                  select
                >
                  {ratingData?.map(rating => (
                    <MenuItem key={rating.pk} value={rating.name}>
                      {rating.name}
                    </MenuItem>
                  ))}
                </TextField>
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
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const DeleteModal = ({ open, onClose, onSubmit, data }: DeleteModalProps) => {
  const handleSubmit = () => {
    //put your validation logic here
    onClose()
    onSubmit()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Delete {data}</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='error' onClick={handleSubmit} variant='contained'>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
const Example = (props: any) => {
  const { session } = props
  const router = useRouter()
  const { purchaseId } = router.query

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [refresh, setRefresh] = useState(0)
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 100
  })
  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      refresh
    ],
    queryFn: async () => {
      const fetchURL = new URL('/inventory_items/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
      fetchURL.searchParams.set('buying_pk', typeof purchaseId == 'string' ? purchaseId : '')
      for (let f = 0; f < columnFilters.length; f++) {
        const filter = columnFilters[f]
        if (filter.id == 'product.sku') {
          fetchURL.searchParams.set('product', typeof filter.value === 'string' ? filter.value : '')
        } else {
          fetchURL.searchParams.set(filter.id, typeof filter.value === 'string' ? filter.value : '')
        }
      }
      fetchURL.searchParams.set('search', globalFilter ?? '')
      let ordering = ''
      for (let s = 0; s < sorting.length; s++) {
        const sort = sorting[s]
        if (s !== 0) {
          ordering = ordering + ','
        }
        if (sort.desc) {
          ordering = ordering + '-'
        }
        ordering = ordering + sort.id
      }
      fetchURL.searchParams.set('ordering', ordering)
      console.log(fetchURL.href)
      const response = await fetch(fetchURL.href, {
        method: 'get',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        })
      })
      const json = await response.json()

      return json
    },
    keepPreviousData: true
  })
  const [orderData, setOrderData] = useState<BuyingOrder>()

  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  const handleCreateNewRow = (values: Item) => {
    console.log(values)
    const room = roomData.find(room => room.name == values.room.toString())
    const rating = ratingData.find(rating => rating.name == values.rating.toString())
    const newValues = {
      ...values,
      buying: purchaseId,
      product: values.product.pk,
      room: room?.pk,
      rating: rating?.pk
    }
    console.log(newValues)
    fetch(`https://cheapr.my.id/inventory_items/`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(newValues)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
          tableData.unshift({ ...json, product: values.product, room: room, rating: rating })
          setTableData([...tableData])
        }
      })
  }
  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product.sku',
        header: 'SKU',
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) =>
          row.original.product ? (
            <div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <img
                  aria-owns={open ? 'mouse-over-popover' : undefined}
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  alt='avatar'
                  height={30}
                  src={row.original.product.image ?? '/images/no_image.png'}
                  loading='lazy'
                />
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            </div>
          ) : (
            <></>
          )
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        maxSize: 100
      },
      {
        accessorKey: 'room.name',
        header: 'Room',
        size: 200,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: roomData?.map(room => (
            <MenuItem key={room.pk} value={room.name}>
              {room.name}
            </MenuItem>
          ))
        }
      },
      {
        accessorKey: 'rating.name',
        header: 'Rating',
        maxSize: 70,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: ratingData?.map(rating => (
            <MenuItem key={rating.pk} value={rating.name}>
              <Box
                component='span'
                sx={theme => ({
                  backgroundColor: rating.color ?? theme.palette.success.dark,
                  borderRadius: '0.25rem',
                  color: '#fff',
                  maxWidth: '9ch',
                  p: '0.25rem'
                })}
              >
                {rating.name}
              </Box>
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => {
          if (row.original.rating) {
            return (
              <Box
                component='span'
                sx={theme => ({
                  backgroundColor: row.original.rating.color ?? theme.palette.success.dark,
                  borderRadius: '0.25rem',
                  color: '#fff',
                  maxWidth: '9ch',
                  p: '0.25rem'
                })}
              >
                {renderedCellValue}
              </Box>
            )
          } else {
            return <></>
          }
        }
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 200
      },
      {
        accessorKey: 'total_cost',
        header: 'Total',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{renderedCellValue && formatterUSDStrip(row.original.total_cost)}</Box>
        )
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_cost)}</Box>
        )
      }
    ],
    [roomData, ratingData, open]
  )
  useEffect(() => {
    const fetchURL = new URL('/room/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setRoomData(json.results)
      })
    const fetchRatingURL = new URL('/item_rating/', 'https://cheapr.my.id')
    fetch(fetchRatingURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setRatingData(json.results)
      })
  }, [session])
  useEffect(() => {
    fetch(`https://cheapr.my.id/buying_order/${purchaseId}/`, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setOrderData(json)
      })
  }, [session, tableData, purchaseId])
  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 100
    })
  }, [sorting, globalFilter, columnFilters])
  useEffect(() => {
    data?.results && setTableData(data?.results ?? [])
  }, [data])
  const handleSaveRow: MRT_TableOptions<InventoryItem>['onEditingRowSave'] = async ({
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
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
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
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.status)
      .then(status => {
        if (status == 204) {
          const newData: any = [...tableData]
          newData.splice(row, 1)
          setTableData([...newData])
        }
      })
  }
  const handleSaveCell = (cell: MRT_Cell<InventoryItem>, value: any) => {
    const key = cell.column.id
    const rowIdx = cell.row.index
    const payload: InventoryItem = {}
    const oldData = [...tableData]
    const newData: any = [...tableData]
    payload[key] = value
    console.log(key, value)
    if (key === 'room.name') {
      const room = roomData.find(room => room.name == value)
      payload['room'] = room?.pk
      newData[cell.row.index]['room'] = room
    } else if (key === 'rating.name') {
      const rating = ratingData.find(rating => rating.name == value)
      payload['rating'] = rating?.pk
      newData[cell.row.index]['rating'] = rating
    } else {
      payload[key as keyof Payload] = value === '' ? null : value
      newData[cell.row.index][cell.column.id as keyof InventoryItem] = value
    }

    newData[cell.row.index][cell.column.id as keyof Item] = value
    setTableData([...newData])
    console.log(cell.row.original.pk, key, value)
    fetch(`https://cheapr.my.id/inventory_items/${cell.row.original.pk}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
        }
      })
  }
  const handleAddItem = (values: InventoryPayload) => {
    const newValues = { ...values, room: roomData.find(room => room.name == values.room.toString())?.pk }
    console.log(newValues)

    fetch(`https://cheapr.my.id/inventory_items/`, {
      // note we are going to /1
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(newValues)
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
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
        muiEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 70,
        muiEditTextFieldProps: {
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
    <>
      {/* <Grid item xs={12}>
        <Typography variant='h5'>
          <Link href='https://materialdesignicons.com/' target='_blank'>
            Material Design Icons
          </Link>
        </Typography>
        <Typography variant='body2'>Material Design Icons from the Community</Typography>
      </Grid> */}
      <CardOrder
        orderData={orderData}
        type={'buying'}
        onClose={() => console.log('Closed')}
        session={session}
        setRefresh={() => setRefresh(r => r + 1)}
      />
      <Card sx={{ padding: 3 }}>
        <MaterialReactTable
          columns={columns}
          initialState={{ showColumnFilters: false }}
          enableEditing
          enableRowNumbers
          editDisplayMode='cell'
          onEditingRowSave={handleSaveRow}
          muiEditTextFieldProps={({ cell }) => ({
            //onBlur is more efficient, but could use onChange instead
            onBlur: event => {
              handleSaveCell(cell, event.target.value)
            }
          })}
          manualFiltering
          manualPagination
          manualSorting
          data={tableData}
          enableRowActions
          positionActionsColumn='last'
          renderTopToolbarCustomActions={() => (
            <>
              {/* <Tooltip arrow title='Refresh Data'>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip> */}
              <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
                Add Item
              </Button>
            </>
          )}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex' }}>
              <Tooltip arrow placement='top' title='Duplicate'>
                <IconButton
                  color='primary'
                  onClick={() =>
                    handleAddItem({
                      buying: row.original.buying,
                      selling: row.original.selling,
                      product: row.original.product.pk,
                      status: row.original.status,
                      serial: row.original.serial,
                      comment: row.original.comment,
                      room: row.original.room,
                      total_cost: row.original.total_cost,
                      shipping_cost: row.original.shipping_cost
                    })
                  }
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip arrow placement='top' title='Delete'>
                <IconButton color='error' onClick={() => handleDeleteRow(row)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          state={{
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isFetching,
            sorting
          }}
        />
      </Card>
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        roomData={roomData}
        ratingData={ratingData}
        session={session}
      />
      <Popover
        id='mouse-over-popover'
        sx={{
          pointerEvents: 'none'
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <img alt='avatar' height={250} src={'/images/no_image.png'} loading='lazy' />
      </Popover>
    </>
  )
}

const queryClient = new QueryClient()

const Inventory = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default withAuth(3 * 60)(Inventory)
