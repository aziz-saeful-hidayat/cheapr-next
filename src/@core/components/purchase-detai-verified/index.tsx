import React, { useEffect, useMemo, useState } from 'react'
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MaterialReactTableProps,
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
  Modal,
  Stack,
  TextField,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
  Chip
} from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'
import DraftsIcon from '@mui/icons-material/Drafts'
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
import { formatterUSDStrip } from 'src/constants/Utils'
import CardOrder from 'src/views/cards/CardOrder'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import { SalesOrder } from 'src/pages/purchase/[purchaseId]'
import { setDefaultLocale } from 'react-datepicker'
import { Refresh } from 'mdi-material-ui'
import { CreateItemModal } from '../pick-sku'
import { Close } from 'mdi-material-ui'
import CloseIcon from '@mui/icons-material/Close'
import PickMacthingSales from '../pick-matching-sales'

type InventoryItem = {
  [key: string]: any
}
type Payload = {
  pk?: number
  buying?: number
  product?: CAProduct | null
  status?: string
  serial?: string
  comment?: string
  room?: number
  total_cost?: number
  shipping_cost?: number
  item?: number | null
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
type Carrier = {
  pk: number
  name: string
  image: string
  prefix: string
  suffix: string
  suffix2: string
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
export type BuyingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  channel: {
    pk: number
    name: string
    image: string
  }
  seller: {
    pk: number
    name: string
  }
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
  destination: string
  sales: {
    pk: number
    order_id: string
  }
  person: typeof person
}

export type SalesItem = {
  pk: number
  selling: number
  sku: {
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
  total_cost: string
  shipping_cost: string
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
interface PickSalesModalProps {
  onClose: () => void
  onSubmit: (sales: number) => void
  onReset: () => void
  open: boolean
  data: { best: SalesOrder[]; other: SalesOrder[] }
  picked: number | undefined
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

const PurchaseDetailVerified = (props: any) => {
  const { session, pk, modalOpen, onClose } = props
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 100
  })
  const [refresh, setRefresh] = useState(0)
  const [isError, setisError] = useState(false)

  const [isFetching, setisFetching] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const [orderData, setOrderData] = useState<BuyingOrder | SalesOrder>()

  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [matchesData, setMatchesData] = useState<{ best: SalesOrder[]; other: SalesOrder[] }>({ best: [], other: [] })
  const [salesItemData, setSalesItemData] = useState<SalesItem[]>([])
  const [carrierData, setCarrierData] = useState<Carrier[]>([])

  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createSKUModalOpen, setCreateSKUModalOpen] = useState(false)
  const [itemPk, setItemPk] = useState<string>()

  const [matchSalesModalOpen, setMatchSalesModalOpen] = useState(false)

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
    const room = roomData.find(room => room.name == values.room?.toString())
    const rating = ratingData.find(rating => rating.name == values.rating?.toString())
    const newValues = {
      ...values,
      buying: pk,
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
  const statusOptions: any[] = [
    { key: 'D', name: 'Delivered', color: 'success' },
    { key: 'T', name: 'Transit', color: 'warning' },
    { key: 'I', name: 'Issue', color: 'error' },
    { key: 'N', name: 'Not Started', color: 'default' }
  ]
  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Item Name',
        maxSize: 200,
        enableEditing: false
      },
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
                  gap: '1rem',
                  marginBottom: 2
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
                <span
                  onClick={() => {
                    setCreateSKUModalOpen(true)
                  }}
                >
                  {renderedCellValue}
                </span>
                <Tooltip arrow placement='top' title='Remove'>
                  <IconButton
                    color='error'
                    onClick={() => {
                      const oldData = [...tableData]
                      const newData: any = [...tableData]
                      const payload: Payload = {}

                      payload['product'] = null

                      const id = row.original.pk
                      fetch(`https://cheapr.my.id/inventory_items/${id}/`, {
                        method: 'PATCH',
                        headers: new Headers({
                          Authorization: `Bearer ${session?.accessToken}`,
                          'Content-Type': 'application/json'
                        }),
                        body: JSON.stringify(payload)
                      })
                        .then(response => response.json())
                        .then(json => {
                          console.log(json)
                        })
                        .finally(() => {
                          setRefresh(ref => ref + 1)
                        })
                    }}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              </Box>
            </div>
          ) : (
            <div>
              <Chip
                sx={{
                  fontSize: 10
                }}
                label={'Pick SKU'}
                onClick={() => {
                  setItemPk(row.original.pk)
                  setCreateSKUModalOpen(true)
                }}
              />
            </div>
          )
      },
      {
        accessorKey: 'product.make',
        header: 'Make',
        maxSize: 100,
        enableEditing: false
      },
      {
        accessorKey: 'product.model',
        header: 'Model',
        maxSize: 100,
        enableEditing: false
      },
      {
        accessorKey: 'product.mpn',
        header: 'MPN',
        maxSize: 100,
        enableEditing: false
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        maxSize: 100
      },

      {
        accessorKey: 'total_cost',
        header: 'Item Price',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{renderedCellValue && formatterUSDStrip(row.original.total_cost)}</Box>
        ),
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Our Label',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_cost)}</Box>
        ),
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorFn: row =>
          formatterUSDStrip(parseFloat(row.total_cost?.toString()) + parseFloat(row.shipping_cost?.toString())), //accessorFn used to join multiple data into a single cell
        id: 'cost', //id is still required when using accessorFn instead of accessorKey
        header: 'Total Cost',
        maxSize: 100,
        enableEditing: false,
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'itemsales.sku.sku',
        header: 'Order SKU',
        size: 200,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: salesItemData?.map(salesItem => (
            <MenuItem key={salesItem.pk} value={salesItem.pk}>
              {salesItem.sku.sku}
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            <span>{renderedCellValue}</span>
            {row.original.itemsales && (
              <Tooltip arrow placement='top' title='Remove'>
                <IconButton
                  color='error'
                  onClick={() => {
                    const payload: Payload = {}

                    payload['item'] = null

                    const pk = row.original.pk
                    fetch(`https://cheapr.my.id/sales_items/${row.original.itemsales.pk}/`, {
                      method: 'PATCH',
                      headers: new Headers({
                        Authorization: `Bearer ${session?.accessToken}`,
                        'Content-Type': 'application/json'
                      }),
                      body: JSON.stringify(payload)
                    })
                      .then(response => response.json())
                      .then(json => {
                        console.log(json)
                      })
                      .finally(() => {
                        setRefresh(ref => ref + 1)
                      })
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'itemsales.tracking.fullcarrier.name',
        header: 'Carrier',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: carrierData?.map(carrier => (
            <MenuItem key={carrier.pk} value={carrier.pk}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <img alt='avatar' height={25} src={carrier.image} loading='lazy' style={{ borderRadius: '50%' }} />
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{carrier.name}</span>
              </Box>
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) =>
          row.original.itemsales?.tracking?.fullcarrier ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <img
                alt='avatar'
                height={25}
                src={row.original.itemsales?.tracking?.fullcarrier.image}
                loading='lazy'
                style={{ borderRadius: '50%' }}
              />
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ) : (
            <></>
          )
      },
      {
        accessorKey: 'itemsales.tracking.tracking_number',
        header: 'Tracking',
        size: 100
      },
      {
        accessorKey: 'itemsales.tracking.eta_date',
        header: 'ETA',
        size: 75
      },
      {
        accessorKey: 'itemsales.tracking.status',
        header: 'Status',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: statusOptions?.map(status => (
            <MenuItem key={status.key} value={status.key}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{status.name}</span>
              </Box>
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original.itemsales?.tracking?.status ? (
              <Chip
                sx={{
                  fontSize: 12
                }}
                label={statusOptions.find(e => e.key == renderedCellValue)?.name}
                color={statusOptions.find(e => e.key == renderedCellValue)?.color}
              />
            ) : null}
          </Box>
        )
      }
    ],
    [roomData, salesItemData, open]
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
    const fetchCarrierURL = new URL('/carrier/', 'https://cheapr.my.id')
    fetch(fetchCarrierURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setCarrierData(json.results)
      })
  }, [session])
  useEffect(() => {
    if (!modalOpen) {
      return
    }
    fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setOrderData(json)
        json?.inventoryitems && setTableData(json?.inventoryitems)
      })
  }, [session, pk, modalOpen, refresh])
  useEffect(() => {
    orderData?.sales?.pk
      ? fetch(`https://cheapr.my.id/sales_items/?item=&no_item=true&selling=${orderData?.sales?.pk}`, {
          method: 'get',
          headers: new Headers({
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          })
        })
          .then(response => response.json())
          .then(json => {
            console.log(json)
            setSalesItemData(json.results)
          })
      : setSalesItemData([])
  }, [orderData, refresh])
  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 100
    })
  }, [sorting, globalFilter, columnFilters])
  useEffect(() => {
    if (modalOpen == false) {
      setTableData([])
    }
  }, [modalOpen])
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
          newData.splice(row.index, 1)
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
    if (key === 'itemsales.sku.sku') {
      fetch(`https://cheapr.my.id/sales_items/${value}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item: cell.row.original.pk })
      })
        .then(response => response.json())
        .then(json => {
          if (json.pk) {
            if (!cell.row.original.product) {
              fetch(`https://cheapr.my.id/inventory_items/${cell.row.original.pk}/`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product: json.pk })
              })
                .then(response => response.json())
                .then(json => {
                  if (json.pk) {
                    setRefresh(refresh + 1)
                  }
                })
            }
          }
        })
    } else if (key === 'itemsales.tracking.fullcarrier.name') {
      payload['fullcarrier'] = value
      if (cell.row.original.itemsales?.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.itemsales?.tracking?.pk}/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(json => {
            console.log(json)
            if (json.pk) {
              setRefresh(refresh + 1)
            }
          })
      } else {
        fetch(`https://cheapr.my.id/tracking/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(json => {
            if (json.pk) {
              fetch(`https://cheapr.my.id/sales_items/${cell.row.original.itemsales.pk}/`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tracking: json.pk })
              })
                .then(response => response.json())
                .then(json => {
                  if (json.pk) {
                    setRefresh(refresh + 1)
                  }
                })
              setRefresh(refresh + 1)
            }
          })
      }
    } else if (key === 'itemsales.tracking.tracking_number') {
      if (!value) {
        fetch(`https://cheapr.my.id/sales_items/${cell.row.original.itemsales.pk}/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tracking: null })
        })
          .then(response => response.json())
          .then(json => {
            if (json.pk) {
              setRefresh(refresh + 1)
            }
          })
      } else {
        payload['tracking_number'] = value
        fetch(`https://cheapr.my.id/tracking/?tracking_number=${value}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(json => {
            if (json.count == 0) {
              fetch(`https://cheapr.my.id/tracking/`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              })
                .then(response => response.json())
                .then(json => {
                  if (json.pk) {
                    fetch(`https://cheapr.my.id/sales_items/${cell.row.original.itemsales.pk}/`, {
                      method: 'PATCH',
                      headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ tracking: json.pk })
                    })
                      .then(response => response.json())
                      .then(json => {
                        if (json.pk) {
                          setRefresh(refresh + 1)
                        }
                      })
                    setRefresh(refresh + 1)
                  }
                })
            } else {
              fetch(`https://cheapr.my.id/sales_items/${cell.row.original.itemsales.pk}/`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tracking: json.results[0].pk })
              })
                .then(response => response.json())
                .then(json => {
                  if (json.pk) {
                    setRefresh(refresh + 1)
                  }
                })
              setRefresh(refresh + 1)
            }
          })
      }
    } else if (key === 'itemsales.tracking.eta_date') {
      payload['eta_date'] = value
      if (cell.row.original.itemsales?.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.itemsales?.tracking?.pk}/`, {
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
              setRefresh(refresh + 1)
            }
          })
      } else {
        fetch(`https://cheapr.my.id/tracking/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(json => {
            if (json.pk) {
              fetch(`https://cheapr.my.id/sales_items/${cell.row.original.itemsales.pk}/`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tracking: json.pk })
              })
                .then(response => response.json())
                .then(json => {
                  if (json.pk) {
                    setRefresh(refresh + 1)
                  }
                })
              setRefresh(refresh + 1)
            }
          })
      }
    } else if (key === 'itemsales.tracking.status') {
      payload['status'] = value
      if (cell.row.original.itemsales?.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.itemsales?.tracking?.pk}/`, {
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
              setRefresh(refresh + 1)
            }
          })
      }
    }
  }
  const handleAddItem = (values: InventoryPayload) => {
    const newValues = { ...values, room: roomData.find(room => room.name == values.room?.toString())?.pk }
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

  type InventoryItem = {
    [key: string]: any
  }
  const handleSetSKU = (values: InventoryItem) => {
    console.log(values)
    console.log(`https://cheapr.my.id/inventory_items/${itemPk}/`)
    fetch(`https://cheapr.my.id/inventory_items/${itemPk}/`, {
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
          setCreateSKUModalOpen(false) //required to exit editing mode
          setRefresh(refresh + 1)
        }
      })
  }
  const handleUnverify = () => {
    fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
      // note we are going to /1
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ verified: false })
    })
      .then(response => response.status)
      .then(status => {
        if (status == 200) {
          setRefresh(refresh + 1)
          onClose()
        }
      })
  }
  const handleUpdateDestination = (values: string | null) => {
    fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination: values })
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
          setRefresh(refresh + 1)
        }
      })
      .finally(() => {
        setRefresh(refresh + 1)
      })
  }
  const columnsSKU = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'SKU',
        size: 150,
        enableEditing: false
      }
      //end
    ],
    []
  )
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
        header: 'Item Price',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'shipping_cost',
        header: 'IB.Ship (if our label)',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      }
      //end
    ],
    []
  )

  return (
    <Modal
      open={modalOpen}
      onClose={onClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
      sx={{ padding: 10, overflow: 'scroll' }}
    >
      <>
        {/* <Grid item xs={12}>
        <Typography variant='h5'>
          <Link href='https://materialdesignicons.com/' target='_blank'>
            Material Design Icons
          </Link>
        </Typography>
        <Typography variant='body2'>Material Design Icons from the Community</Typography>
      </Grid> */}
        <CardOrder orderData={orderData} type={'buying'} onClose={onClose} />
        <Card sx={{ padding: 3 }}>
          <MaterialReactTable
            columns={columns}
            enableDensityToggle={false}
            initialState={{ showColumnFilters: false, density: 'compact' }}
            enableEditing
            editingMode='cell'
            onEditingRowSave={handleSaveRow}
            muiTableBodyCellEditTextFieldProps={({ cell }) => ({
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
            enableColumnActions={false}
            positionActionsColumn='first'
            renderBottomToolbarCustomActions={() => (
              <Button color='primary' onClick={() => handleUnverify()} variant='contained'>
                Unverify
              </Button>
            )}
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
                <RadioGroup
                  row
                  aria-labelledby='demo-row-radio-buttons-group-label'
                  name='row-radio-buttons-group'
                  value={orderData?.destination}
                  onChange={e => {
                    if (orderData) {
                      setOrderData({ ...orderData, destination: e.target.value })
                      handleUpdateDestination(e.target.value)
                    }
                  }}
                >
                  <FormControlLabel value='H' control={<Radio />} label='HOUSE' />
                  <FormControlLabel value='D' control={<Radio />} label='DROPSHIP' sx={{ marginLeft: 50 }} />
                </RadioGroup>
                {orderData?.destination == 'D' && (
                  <span>
                    SBO.#{'     '}
                    <Link
                      onClick={() => {
                        fetch(`https://cheapr.my.id/buying_order/${pk}/find_matches/`, {
                          method: 'GET',
                          headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => response.json())
                          .then(json => {
                            setMatchesData(json)
                          })
                          .finally(() => {
                            setMatchSalesModalOpen(true)
                          })
                      }}
                    >
                      {orderData?.sales ? `${orderData?.sales.order_id}` : 'Pick'}
                    </Link>
                    {orderData?.sales && (
                      <Tooltip arrow placement='top' title='Remove'>
                        <IconButton
                          color='error'
                          onClick={() => {
                            const oldData = [...tableData]
                            const newData: any = [...tableData]
                            const payload: any = {}

                            payload['sales'] = null

                            const id = orderData.pk
                            fetch(`https://cheapr.my.id/buying_order/${id}/`, {
                              method: 'PATCH',
                              headers: new Headers({
                                Authorization: `Bearer ${session?.accessToken}`,
                                'Content-Type': 'application/json'
                              }),
                              body: JSON.stringify(payload)
                            })
                              .then(response => response.json())
                              .then(json => {
                                console.log(json)
                              })
                              .finally(() => {
                                setRefresh(ref => ref + 1)
                              })
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Tooltip>
                    )}
                  </span>
                )}
                {/* {orderData?.destination == 'D' ? (
                  <>
                    <TextField
                      key='SBO'
                      label='SBO.#:'
                      name='SBO.#:'
                      onChange={e => console.log(e)}
                      onFocus={() => {
                        fetch(`https://cheapr.my.id/buying_order/${pk}/find_matches/`, {
                          method: 'GET',
                          headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => response.json())
                          .then(json => {
                            setMatchesData(json)
                          })
                      }}
                      select
                    >
                      {matchesData?.map(sales => (
                        <MenuItem key={sales.pk} value={sales.pk}>
                          {sales.order_id}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                ) : (
                  <></>
                )} */}
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
                        product: row.original.product ? row.original.product.pk : null,
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
        <PickMacthingSales
          open={matchSalesModalOpen}
          onClose={() => setMatchSalesModalOpen(false)}
          onReset={() => {
            fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sales: null })
            })
              .then(response => response.json())
              .then(json => {
                if (json.pk) {
                  setRefresh(refresh + 1)
                }
              })
              .finally(() => {
                setRefresh(refresh + 1)
              })
          }}
          onSubmit={(sales: number) => {
            fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sales: sales })
            })
              .then(response => response.json())
              .then(json => {
                if (json.pk) {
                  setRefresh(refresh + 1)
                  setMatchSalesModalOpen(false)
                }
              })
              .finally(() => {
                setRefresh(refresh + 1)
                setMatchSalesModalOpen(false)
              })
          }}
          data={matchesData}
          picked={orderData?.sales?.pk}
          session={session}
        />

        <CreateNewAccountModal
          columns={columnsItem}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateNewRow}
          roomData={roomData}
          ratingData={ratingData}
          session={session}
        />
        <CreateItemModal
          columns={columnsSKU}
          open={createSKUModalOpen}
          onClose={() => setCreateSKUModalOpen(false)}
          onSubmit={handleSetSKU}
          purchaseId={pk}
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
    </Modal>
  )
}

export default PurchaseDetailVerified
