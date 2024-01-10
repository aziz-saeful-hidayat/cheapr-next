import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MRT_TableOptions,
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
import { Close } from 'mdi-material-ui'
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

type SalesItemsFull = {
  pk: number
  item: null
  selling: {
    pk: number
    order_id: string
    order_date: string
    delivery_date: string
    channel: {
      pk: number
      name: string
      image: string
    }
    seller_name: string
    purchase_items: number
    inbound_shipping: number
    purchase_cost: number
    gross_sales: number
    profit: number
    all_cost: number
    channel_order_id: string
    sell_link: string
    total_cost: number
    shipping_cost: number
    ss_shipping_cost: number
    channel_fee: number
  }
  sku: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
    in_database: boolean
  }
  sub_sku: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
    in_database: boolean
  }
  inventory: boolean
  tracking: string
  status: string
  manager: {
    name: string
  }
  comment: string
}
type Payload = {
  pk?: number
  status?: string
  comment?: string
  manager?: number | null
  tracking?: string
  sub?: string
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
  columns: MRT_ColumnDef<SalesItemsFull>[]
  onClose: () => void
  onSubmit: (values: SalesItemsFull) => void
  open: boolean
  channelData: any[]
}
interface AddItemProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  open: boolean
  rowData: SalesItemsFull | undefined
  roomData: Room[]
  session: any
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
export const AddItemModal = ({ open, columns, onClose, onSubmit, rowData, roomData, session }: AddItemProps) => {
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
                              Authorization: `Bearer ${session?.accessToken}`,
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
  const [refresh, setRefresh] = useState(0)

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      refresh //refetch when sorting changes
    ],
    queryFn: async () => {
      const fetchURL = new URL('/sales_items/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('no_sub', `false`)
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
      for (let f = 0; f < columnFilters.length; f++) {
        const filter = columnFilters[f]
        if (filter.id == 'sku') {
          console.log(filter)
          fetchURL.searchParams.set('sku', typeof filter.value === 'string' ? filter.value : '')
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
  const [tableData, setTableData] = useState<SalesItemsFull[]>(() => data?.results ?? [])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [managerData, setManagerData] = useState<Room[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<SalesItemsFull>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [tabActive, setTabActive] = useState('all')
  const statusOptions: any[] = [
    { key: 'S', name: 'Successful', color: 'success' },
    { key: 'R', name: 'Returned', color: 'error' },
    { key: 'N', name: 'Not Completed', color: 'default' }
  ]
  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
    if (event.target.value == 'to_pick') {
      setColumnFilters([{ id: 'to_pick', value: 'yes' }])
    } else {
      setColumnFilters([{ id: 'status', value: event.target.value != 'all' ? event.target.value : '' }])
    }
  }
  const handleCreateNewRow = (values: SalesItemsFull) => {
    console.log(values)
    const channel = channelData.find(channel => channel.name == values['selling']['channel']['name'])
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
    (row: MRT_Row<SalesItemsFull>) => {
      if (!confirm(`Are you sure you want to delete ${row.original.pk}`)) {
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
  const handleSaveRow: MRT_TableOptions<SalesItemsFull>['onEditingRowSave'] = async ({
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
          tableData[row.index] = { ...json, channel: channel }

          setTableData([...tableData])
          exitEditingMode() //required to exit editing mode
        }
      })
  }

  const handleSaveCell = (cell: MRT_Cell<SalesItemsFull>, value: any) => {
    const key = cell.column.id
    const manager = managerData.find(manager => manager.name == value)
    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: Payload = {}
    if (key === 'manager.name') {
      payload['manager'] = manager?.pk
      newData[cell.row.index]['manager'] = manager
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof SalesItemsFull] = value
    }
    const pk = newData[cell.row.index]['pk']

    setTableData([...newData])
    console.log(payload)
    fetch(`https://cheapr.my.id/sales_items/${pk}/`, {
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

  const columns = useMemo<MRT_ColumnDef<SalesItemsFull>[]>(
    () => [
      {
        accessorKey: 'sku.make',
        header: 'Make',
        maxSize: 75,
        enableEditing: false
      },
      {
        accessorKey: 'sku.model',
        header: 'Model',
        maxSize: 75,
        enableEditing: false
      },
      {
        accessorKey: 'sku.mpn',
        header: 'MPN',
        maxSize: 100,
        enableEditing: false
      },
      {
        accessorKey: 'sub_sku.make',
        header: 'Sub-Make',
        maxSize: 75,
        enableEditing: false
      },
      {
        accessorKey: 'sub_sku.model',
        header: 'Sub-Model',
        maxSize: 75,
        enableEditing: false
      },
      {
        accessorKey: 'sub_sku.mpn',
        header: 'Sub-MPN',
        maxSize: 100,
        enableEditing: false
      },
      {
        accessorKey: 'manager.name',
        header: 'Sub-By',
        maxSize: 100,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: managerData?.map(manager => (
            <MenuItem key={manager.pk} value={manager.name}>
              {manager.name}
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            <span>{renderedCellValue}</span>
            {row.original.manager && (
              <Tooltip arrow placement='top' title='Remove'>
                <IconButton
                  color='error'
                  onClick={() => {
                    const oldData = [...tableData]
                    const newData: any = [...tableData]
                    const payload: Payload = {}

                    payload['manager'] = null

                    const pk = row.original.pk
                    fetch(`https://cheapr.my.id/sales_items/${pk}/`, {
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
        accessorKey: 'selling.total_cost',
        id: 'item_price',
        header: 'Item Price',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.total_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.shipping_cost',
        id: 'shipping_cost',
        header: 'Shipping',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.shipping_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.channel_fee',
        id: 'channel_fee',
        header: 'Fees',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.channel_fee)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.gross_sales',
        id: 'gross_sales',
        header: 'Net Sales',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.gross_sales)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.purchase_items',
        id: 'purchase_items',
        header: 'Item Cost',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.purchase_items)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.inbound_shipping',
        id: 'inbound_shipping',
        header: 'Shipping',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.inbound_shipping)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.purchase_cost',
        id: 'purchase_cost',
        header: 'Total Cost',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.purchase_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.profit',
        id: 'profit',
        header: 'Margin',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.selling.profit)}</Box>
        ),
        muiEditTextFieldProps: {
          type: 'number'
        },
        enableEditing: false,
        muiTableBodyCellProps: ({ cell, table }) => {
          if (cell.row.original.selling?.profit < 0) {
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
        muiTableHeadCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'selling.order_id',
        header: 'SBO.#',
        maxSize: 75,
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
                setDetail(row.original.selling.pk)
                setDetailModalOpen(true)
              }}
            >
              {renderedCellValue}
            </Link>
          </Box>
        ),
        enableEditing: false
      },
      {
        accessorKey: 'selling.channel_order_id',
        id: 'channel_order_id',
        header: 'Order ID',
        maxSize: 75,
        enableEditing: false
      },
      {
        accessorKey: 'selling.order_date',
        accessorFn: row => row.selling.order_date?.toString()?.substr(0, 10),
        header: 'Date',
        maxSize: 100,
        muiEditTextFieldProps: {
          type: 'date'
        },
        filterFn: 'between',
        enableEditing: false
      },
      {
        accessorKey: 'selling.channel.name',
        id: 'channel_name',
        header: 'Channel',
        maxSize: 100,
        muiEditTextFieldProps: {
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
        accessorKey: 'selling.seller_name',
        header: 'Sold at',
        maxSize: 125,
        enableEditing: false
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        muiEditTextFieldProps: {
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
            {row.original.status ? (
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
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        maxSize: 125
      }
    ],
    [managerData]
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
    const fetchURLManager = new URL('/manager/', 'https://cheapr.my.id')
    fetch(fetchURLManager.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setManagerData(json.results)
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
            item_price: false,
            shipping_cost: false,
            channel_fee: false,
            purchase_items: false,
            inbound_shipping: false,
            channel_order_id: false,
            channel_name: false
          }
        }}
        enableEditing
        enableColumnActions={false}
        editDisplayMode='cell'
        muiEditTextFieldProps={({ cell }) => ({
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
              <MenuItem value={'all'}>All</MenuItem>
              <MenuItem value={'open'}>Open</MenuItem>
              <MenuItem value={'completed'}>Completed</MenuItem>
              <MenuItem value={'canceled'}>Canceled</MenuItem>
              <MenuItem value={'to_pick'}>To Pick</MenuItem>
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
        muiTableHeadProps={{
          sx: {
            //stripe the rows, make odd rows a darker color
            '& td:nth-child(1)': {
              backgroundColor: '#ADD8E6'
            },
            '& td:nth-child(2)': {
              backgroundColor: '#ADD8E6'
            },
            '& td:nth-child(3)': {
              backgroundColor: '#ADD8E6'
            },
            '& td:nth-child(4)': {
              backgroundColor: '#FFD580'
            },
            '& td:nth-child(5)': {
              backgroundColor: '#FFD580'
            },
            '& td:nth-child(6)': {
              backgroundColor: '#FFD580'
            }
          }
        }}
        muiTableBodyProps={{
          sx: {
            //stripe the rows, make odd rows a darker color
            '& td:nth-child(1)': {
              backgroundColor: '#e8f4f8'
            },
            '& td:nth-child(2)': {
              backgroundColor: '#e8f4f8'
            },
            '& td:nth-child(3)': {
              backgroundColor: '#e8f4f8'
            },
            '& td:nth-child(4)': {
              backgroundColor: '#ffedcd'
            },
            '& td:nth-child(5)': {
              backgroundColor: '#ffedcd'
            },
            '& td:nth-child(6)': {
              backgroundColor: '#ffedcd'
            }
          }
        }}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        channelData={channelData}
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
