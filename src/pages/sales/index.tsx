import React, { useEffect, useMemo, useState, useCallback } from 'react'
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MaterialReactTableProps,
  MRT_Cell
} from 'material-react-table'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Autocomplete,
  CircularProgress
} from '@mui/material'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'

//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Delete, Add } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Items from 'src/@core/components/selling-item'
import { withAuth } from 'src/constants/HOCs'
import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import SalesDetail from 'src/@core/components/sales-detail'
import { formatterUSDStrip } from 'src/constants/Utils'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import moment from 'moment'
import CloseIcon from '@mui/icons-material/Close'

type Channel = {
  pk: number
  name: string
}
type Room = {
  pk: number
  name: string
  room_id: string
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
type InventoryItem = {
  [key: string]: any
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
type SellingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  ship_date: string
  channel: {
    pk: number
    name: string
  }
  subs_status: boolean
  channel_order_id: string
  tracking_number: string
  seller_name: string
  sell_link: string
  total_cost: number
  shipping_cost: number
  ss_shipping_cost: number
  purchase_cost: number
  gross_sales: number
  channel_fee: number
  profit: number
  fulfillment: string
  comment: string
  status: string
  delivery_status: string
  sellingitems: InventoryItem[]
  salesitems: InventoryItem[]
  person: typeof person
}
type Payload = {
  pk?: number
  order_id?: string
  order_date?: string
  channel?: number
  tracking_number?: string
  seller_name?: string
  purchase_link?: string
  total_cost?: number
  shipping_cost?: number
  comment?: string
  sellingitems?: InventoryItem[]
}

type ItemOption = {
  pk: number
  buying: number
  selling: number
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
  room: {
    pk: number
    name: string
    room_id: string
  }
  total_cost: string
  shipping_cost: string
}
interface CreateModalProps {
  columns: MRT_ColumnDef<SellingOrder>[]
  onClose: () => void
  onSubmit: (values: SellingOrder) => void
  open: boolean
  channelData: any[]
}
interface AddItemProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  open: boolean
  rowData: SellingOrder | undefined
  roomData: Room[]
}
interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
}
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, channelData }: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Selling Order</DialogTitle>
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
            <LocalizationProvider dateAdapter={AdapterDayjs} key={'order_date'}>
              <DatePicker
                onChange={value => setValues({ ...values, order_date: value ? value.format('YYYY-MM-DD') : null })}
                label={'Order Date'}
                value={values.order_date != '' ? dayjs(values.order_date) : null}
              />
            </LocalizationProvider>
            <TextField
              value={values.channel?.name}
              key={'channel.name'}
              name={'Channel'}
              label='Channel'
              select
              onChange={e => setValues({ ...values, channel: { name: e.target.value } })}
            >
              {channelData?.map(channel => (
                <MenuItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  key={channel.pk}
                  value={channel.name}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <img alt='avatar' height={25} src={channel.image} loading='lazy' style={{ borderRadius: '50%' }} />
                    {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                    <span>{channel.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              key={'seller_name'}
              label={'Seller Name'}
              name={'seller_name'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'channel_order_id'}
              label={'Channel Order ID'}
              name={'channel_order_id'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'tracking_number'}
              label={'Tracking Number'}
              name={'tracking_number'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
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
export const AddItemModal = ({ open, columns, onClose, onSubmit, rowData, roomData }: AddItemProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit({ ...values, selling: rowData?.pk })
    onClose()
  }
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Add Item</DialogTitle>
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
                  isOptionEqualToValue={(option, value) => option.product.sku === value.product.sku}
                  getOptionLabel={option => `SKU: ${option.product.sku}      SERIAL: ${option.serial}`}
                  options={options}
                  loading={loading}
                  renderInput={params => (
                    <TextField
                      {...params}
                      onChange={e =>
                        fetch(
                          `https://cheapr.my.id/inventory_items/?inventory=true&product=${e.target.value}&ordering=serial`,
                          {
                            // note we are going to /1
                            headers: {
                              'Content-Type': 'application/json'
                            }
                          }
                        )
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
              ) : column.accessorKey === 'room' ? (
                <TextField
                  key={column.accessorKey}
                  label={column.header}
                  name={column.accessorKey}
                  onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                  select
                >
                  {roomData?.map(room => (
                    <MenuItem key={room.pk} value={room.name}>
                      {room.name}
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
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 100
  })
  const [tabActive, setTabActive] = useState('to_monitor')

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      tabActive
    ],
    queryFn: async () => {
      const fetchURL = new URL('/selling_order/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
      for (let f = 0; f < columnFilters.length; f++) {
        const filter = columnFilters[f]
        if (filter.id == 'order_date') {
          console.log(filter)
          fetchURL.searchParams.set('order_date_after', Array.isArray(filter.value) ? filter.value[0] : '')
          fetchURL.searchParams.set('order_date_before', Array.isArray(filter.value) ? filter.value[1] : '')
        } else {
          fetchURL.searchParams.set(filter.id.split('.')[0], typeof filter.value === 'string' ? filter.value : '')
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
      fetchURL.searchParams.set('filter', tabActive)

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
  const [tableData, setTableData] = useState<SellingOrder[]>(() => data?.results ?? [])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<SellingOrder>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
  }
  const handleCreateNewRow = (values: SellingOrder) => {
    console.log(values)
    const channel = channelData.find(channel => channel.name == values['channel']['name'])
    const new_obj = { ...values, channel: channel?.pk }
    console.log(new_obj)
    fetch(`https://cheapr.my.id/selling_order/`, {
      // note we are going to /1
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(new_obj)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
          tableData.unshift(json)
          setTableData([...tableData])
        }
      })
  }

  const update = (idx: number, rowIdx: number, key: string, value: any) => {
    const sellingitems_update = tableData[idx].sellingitems?.map((el, idx) => {
      if (idx == rowIdx) {
        const newEl = { ...el }
        newEl[key] = value

        return newEl
      } else {
        return el
      }
    })
    tableData[idx].sellingitems = sellingitems_update
    setTableData([...tableData])
  }
  const reupdate = (order: number) => {
    fetch(`https://cheapr.my.id/selling_order/${order}/`, {
      // note we are going to /1
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
          console.log(json)
          const objIdx = tableData.findIndex(Selling => Selling.pk == json.pk)
          tableData[objIdx] = json
          setTableData([...tableData])
        }
      })
  }
  const handleAddItem = (values: InventoryPayload) => {
    const newValues = { selling: values.selling }
    console.log(newValues)
    console.log(`https://cheapr.my.id/inventory_items/${values.product}/`)
    fetch(`https://cheapr.my.id/inventory_items/${values.product}/`, {
      // note we are going to /1
      method: 'PATCH',
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
          reupdate(json.selling)
        }
      })
  }

  const handleDeleteRow = useCallback(
    (row: MRT_Row<SellingOrder>) => {
      if (!confirm(`Are you sure you want to delete ${row.original.order_id}`)) {
        return
      }
      fetch(`https://cheapr.my.id/selling_order/${row.original.pk}/`, {
        // note we are going to /1
        method: 'DELETE',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        })
      })
        .then(response => response.status)
        .then(status => {
          if (status == 204) {
            tableData.splice(row.index, 1)
            setTableData([...tableData])
          }
        })
    },
    [tableData, session]
  )
  const handleSaveRow: MaterialReactTableProps<SellingOrder>['onEditingRowSave'] = async ({
    exitEditingMode,
    row,
    values
  }) => {
    const channel = channelData.find(channel => channel.name == values['channel.name'])
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        if (key == 'channel.name') {
          values['channel'] = channel?.pk
          delete values['channel.name']
        }
      }
    }
    console.log(values)
    fetch(`https://cheapr.my.id/selling_order/${row.original.pk}/`, {
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(values)
    })
      .then(response => response.json())
      .then(json => {
        if (json['pk'] !== values.pk) {
          tableData[row.index] = { ...json, channel: channel, sellingitems: row.original.sellingitems }

          setTableData([...tableData])
          exitEditingMode() //required to exit editing mode
        }
      })
  }

  const handleSaveCell = (cell: MRT_Cell<SellingOrder>, value: any) => {
    const key = cell.column.id
    const channel = channelData.find(channel => channel.name == value)
    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: Payload = {}
    if (key === 'channel.name') {
      payload['channel'] = channel?.pk
      newData[cell.row.index]['channel'] = channel
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof SellingOrder] = value
    }
    const pk = newData[cell.row.index]['pk']

    setTableData([...newData])
    console.log(payload)
    fetch(`https://cheapr.my.id/selling_order/${pk}/`, {
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
        if (json[key] !== value) {
          setTableData([...oldData])
        }
      })
  }

  const columns = useMemo<MRT_ColumnDef<SellingOrder>[]>(
    () => [
      {
        accessorKey: 'delivery_status',
        header: 'STS',
        maxSize: 40,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitems
              .map(sales => sales.tracking)
              .map((tracking, index) => {
                if (tracking) {
                  return (
                    <Link
                      href={`${tracking.fullcarrier.prefix}${tracking.tracking_number}${tracking.fullcarrier.suffix}`}
                      target='_blank'
                    >
                      <Box
                        key={index}
                        sx={theme => ({
                          backgroundColor:
                            tracking.status == 'D'
                              ? theme.palette.success.dark
                              : tracking.status == 'T'
                              ? theme.palette.warning.light
                              : tracking.status == 'I'
                              ? 'purple'
                              : theme.palette.error.dark,
                          borderRadius: '0.5rem',
                          color: '#fff',
                          width: 15,
                          height: 15
                        })}
                      ></Box>
                    </Link>
                  )
                } else {
                  return (
                    <Box
                      key={index}
                      sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#a9a9a9',
                        borderRadius: '0.5rem',
                        borderColor: '#000',
                        color: '#fff',
                        width: 12,
                        height: 12
                      })}
                    >
                      <Box
                        sx={theme => ({
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '0.5rem',
                          borderColor: '#000',
                          color: '#fff',
                          width: 9,
                          height: 9
                        })}
                      ></Box>
                    </Box>
                  )
                }
              })}
          </Box>
        )
      },
      {
        accessorKey: 'delivery_date',
        header: 'GET BY',
        maxSize: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original.delivery_date ? moment(row.original.delivery_date).format('MM-DD-YY') : ''}
          </Box>
        ),
        enableEditing: false
      },
      {
        id: 'make_mpn',
        header: 'MAKE-MPN',
        maxSize: 60,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitems
              .map(sales => sales.sku)
              .map((sku, index) => {
                if (sku) {
                  return <span key={index}>{`${sku.make}-${sku.mpn}`}</span>
                } else {
                  return <span key={index}>{` `}</span>
                }
              })}
          </Box>
        )
      },
      {
        id: 'sub_make_mpn',
        header: 'SUB',
        maxSize: 60,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitems
              .map(sales => sales.sub_sku)
              .map((sub_sku, index) => {
                if (sub_sku) {
                  return <span key={index}>{`${sub_sku.make}-${sub_sku.mpn}`}</span>
                } else {
                  return <span key={index}>{` `}</span>
                }
              })}
          </Box>
        )
      },
      {
        accessorKey: 'channel_order_id',
        header: 'ORDER',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Link
              href='#'
              onClick={() => {
                setDetail(row.original.pk)
                setDetailModalOpen(true)
              }}
            >
              <span>{renderedCellValue}</span>
            </Link>
          </Box>
        )
      },
      {
        accessorKey: 'person.name',
        accessorFn: row => row.person?.name?.substr(0, 15),
        header: 'CUST',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        )
      },
      {
        accessorKey: 'person.phone',
        header: 'CUST.CONT',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        )
      },
      {
        accessorKey: 'seller_name',
        accessorFn: row => row.seller_name.substr(0, 15),
        header: 'STORE',
        size: 75,
        enableEditing: false
      },
      {
        accessorKey: 'total_cost',
        id: 'total',
        header: 'ITEM',
        size: 70,
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.total_cost)}</Box>,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        enableEditing: false,
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'shipping_cost',
        id: 'shipping_cost',
        header: 'SHIP',
        size: 70,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_cost)}</Box>
        ),
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'channel_fee',
        id: 'channel_fee',
        header: 'FEES',
        size: 70,
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.channel_fee)}</Box>,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'gross_sales',
        id: 'gross_sales',
        header: 'NET SALE',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.gross_sales)}</Box>,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        id: 'type',
        header: 'TYPE',
        maxSize: 60,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitems
              .map(sales => sales.item)
              .map((item, index) => {
                if (item) {
                  return <span key={index}>{item.buying?.destination == 'D' ? 'DS' : 'HA'}</span>
                } else {
                  return <span key={index}>{` `}</span>
                }
              })}
          </Box>
        )
      },
      {
        id: 'vendor',
        header: 'VENDOR',
        maxSize: 60,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitems
              .map(sales => sales.item)
              .map((item, index) => {
                if (item) {
                  return (
                    <Link
                      href={`https://order.ebay.com/ord/show?orderId=${item.buying.channel_order_id}#/`}
                      target='_blank'
                    >
                      {item?.buying?.seller?.name}
                    </Link>
                  )
                } else {
                  return <span key={index}>{` `}</span>
                }
              })}
          </Box>
        )
      },
      {
        accessorKey: 'purchase_cost',

        id: 'purchase_cost',
        header: 'TTL.COST',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.purchase_cost)}</Box>
        ),
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'ss_shipping_cost',

        id: 'ss_shipping_cost',
        header: 'IB.SHIP',
        size: 70,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.ss_shipping_cost)}</Box>
        ),
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'profit',
        id: 'profit',
        header: 'MRGN',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.profit)}</Box>,
        muiTableBodyCellProps: ({ cell, table }) => {
          if (cell.row.original.profit < 0) {
            return {
              align: 'right',
              sx: { backgroundColor: '#ffcccb', color: '#4e0100' }
            }
          } else {
            return {
              align: 'right'
            }
          }
        },
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'order_date',
        header: 'DATE',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'date'
        },
        filterFn: 'between',
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>{row.original.order_date ? moment(row.original.order_date).format('MM-DD-YY') : ''}</span>
          </Box>
        )
      },
      {
        accessorKey: 'ship_date',
        header: 'SHIP BY',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'date'
        },
        filterFn: 'between',
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>{row.original.ship_date ? moment(row.original.ship_date).format('MM-DD-YY') : ''}</span>
          </Box>
        )
      },
      {
        accessorKey: 'channel.name',
        id: 'channel_name',
        header: 'CHANNEL',
        size: 100,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: channelData?.map(channel => (
            <MenuItem key={channel.pk} value={channel.name}>
              {channel.name}
            </MenuItem>
          ))
        },
        enableEditing: false
      },
      {
        accessorKey: 'order_id',
        header: 'SB.#',
        maxSize: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Link href={`https://app.sellbrite.com/orders?query=${row.original.order_id}`} target='_blank'>
              {renderedCellValue}
            </Link>
          </Box>
        ),
        enableEditing: false
      },
      {
        accessorKey: 'subs_status',
        header: 'Subs',
        size: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) =>
          renderedCellValue ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box
                sx={theme => ({
                  backgroundColor: '#00CCCC',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  width: 15,
                  height: 15,
                  marginLeft: 5
                })}
              ></Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            ></Box>
          ),
        muiTableBodyCellProps: {
          align: 'center'
        }
      },
      {
        accessorKey: 'status',
        header: 'Shipped',
        size: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {renderedCellValue == 'completed' ? (
              <Box
                sx={theme => ({
                  backgroundColor: theme.palette.success.dark,
                  borderRadius: '0.5rem',
                  color: '#fff',
                  width: 12,
                  height: 12
                })}
              ></Box>
            ) : (
              <Box
                sx={theme => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#a9a9a9',
                  borderRadius: '0.5rem',
                  borderColor: '#000',
                  color: '#fff',
                  width: 12,
                  height: 12
                })}
              >
                <Box
                  sx={theme => ({
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '0.5rem',
                    borderColor: '#000',
                    color: '#fff',
                    width: 9,
                    height: 9
                  })}
                ></Box>
              </Box>
            )}

            {/* <Chip
              label={renderedCellValue == 'completed' ? 'Completed' : 'Pending'}
              size='small'
              color={
                renderedCellValue == 'completed'
                  ? row.original.salesitems.filter(function (element) {
                      return element.tracking
                    }).length > 0
                    ? 'success'
                    : 'warning'
                  : 'error'
              }
            /> */}
            {/* <Link href={`/sales/${row.original.pk}`} target='_blank'>
              {renderedCellValue}
            </Link> */}
          </Box>
        ),
        muiTableBodyCellProps: {
          align: 'center'
        }
      }
    ],
    [channelData]
  )
  const columnsAddItem = useMemo<MRT_ColumnDef<InventoryPayload>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'SKU',
        size: 150
      }
    ],
    []
  )
  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 100
    })
  }, [sorting, globalFilter, columnFilters])
  useEffect(() => {
    setTableData(data?.results ?? [])
  }, [data])
  useEffect(() => {
    const fetchURL = new URL('/channel/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setChannelData(json.results)
      })
    const fetchURLRoom = new URL('/room/', 'https://cheapr.my.id')
    fetch(fetchURLRoom.href, {
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
  }, [session])

  return (
    <Card sx={{ padding: 3 }}>
      <MaterialReactTable
        columns={columns}
        data={tableData} //data is undefined on first render
        initialState={{
          showColumnFilters: false,
          density: 'compact',
          columnVisibility: {
            channel_name: false
          }
        }}
        enableEditing
        enableColumnActions={false}
        editingMode='cell'
        muiTableBodyCellEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        onEditingRowSave={handleSaveRow}
        enableStickyHeader
        enableStickyFooter
        manualFiltering
        manualPagination
        manualSorting
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: 'error',
                children: 'Error loading data'
              }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        positionActionsColumn='last'
        renderTopToolbarCustomActions={() => (
          <>
            <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
              Add New Sales
            </Button>
            <Select labelId='demo-select-small-label' id='demo-select-small' value={tabActive} onChange={handleChange}>
              <MenuItem value={'in_transit'}>In-Transit</MenuItem>
              <MenuItem value={'not_moving'}>Not Moving</MenuItem>
              <MenuItem value={'have_issue'}>Have Issue</MenuItem>
              <MenuItem value={'no_tracking'}>No-Tracking</MenuItem>
              <MenuItem value={'potential_delay'}>Potential Delay</MenuItem>
              <MenuItem value={'to_monitor'}>To Monitor</MenuItem>
              <MenuItem value={'delivered'}>Delivered</MenuItem>
              <MenuItem value={'all'}>All</MenuItem>

              {/* <MenuItem value={'canceled'}>Canceled</MenuItem>
              <MenuItem value={'to_pick'}>To Pick</MenuItem> */}
            </Select>
          </>
        )}
        renderBottomToolbarCustomActions={() => (
          <Typography sx={{ fontStyle: 'italic', p: '0 1rem' }} variant='body2'>
            Double-Click a Cell to Edit
          </Typography>
        )}
        rowCount={data?.count ?? 0}
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
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        channelData={channelData}
      />
      <AddItemModal
        columns={columnsAddItem}
        open={addModalOpen !== undefined}
        onClose={() => setAddModalOpen(undefined)}
        onSubmit={handleAddItem}
        rowData={addModalOpen}
        roomData={roomData}
      />
      <SalesDetail
        session={session}
        pk={detail}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const Sold = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export async function getServerSideProps(context: any) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/pages/login',
        permanent: false
      }
    }
  }

  return {
    props: { session }
  }
}

export default withAuth(3 * 60)(Sold)
