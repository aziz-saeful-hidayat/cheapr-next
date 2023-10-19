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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
  TextField,
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
import moment from 'moment-timezone'
import CloseIcon from '@mui/icons-material/Close'
import { number } from 'yup'
import { Close } from 'mdi-material-ui'
import { styled } from '@mui/material/styles'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'

type HistoricalData = {
  make: string
  model: string
  mpn: string
  sku: string
  count: number
  order_id: string[]
}
interface CustHistoryModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  pk?: number
  session: any
}
interface SubHistoryModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: HistoricalData[]
  session: any
}
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} placement='right-start' />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 400,
    border: '1px solid #dadde9'
  }
}))
export const CustHistoryModal = ({ open, onClose, onSubmit, pk, session }: CustHistoryModalProps) => {
  const handleSubmit = () => {
    //put your validation logic here
    onClose()
    onSubmit()
  }
  const [data, setData] = useState<SellingOrder[]>([])
  useEffect(() => {
    if (pk) {
      const fetchURL = `https://cheapr.my.id/selling_order/?person=${pk}`
      console.log(fetchURL)
      fetch(fetchURL, {
        method: 'get',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        })
      })
        .then(response => response.json())
        .then(json => {
          setData(json.results)
        })
    }
  }, [pk])

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Customer Order History</DialogTitle>
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
      <Box sx={{ width: 600, bgcolor: 'background.paper' }}>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>ORDER</TableCell>
                <TableCell align='right'>ITEM</TableCell>
                <TableCell align='right'>CARRIER</TableCell>
                <TableCell>TRACKING</TableCell>
                <TableCell align='right'>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(sales => (
                <TableRow key={sales.pk}>
                  <TableCell component='th' scope='row'>
                    {sales.channel_order_id}
                  </TableCell>
                  <TableCell align='right'>
                    {sales.salesitems.map((item, index) => (
                      <span key={index}>{`${item.sku.make ? `${item.sku.make} | ` : ''}${
                        item.sku.model ? `${item.sku.model} | ` : ''
                      }${item.sku.mpn ? `${item.sku.mpn}` : ''}`}</span>
                    ))}
                  </TableCell>
                  <TableCell align='right'>
                    {sales.salesitems.map((item, index) => (
                      <span key={index}>{item.tracking?.fullcarrier.name}</span>
                    ))}
                  </TableCell>
                  <TableCell align='right'>
                    {sales.salesitems.map((item, index) => (
                      <span key={index}>{item.tracking?.tracking_number}</span>
                    ))}
                  </TableCell>
                  <TableCell align='right'>
                    {sales.salesitems.map((item, index) => (
                      <span key={index}>{item.tracking?.status}</span>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export const SubHistoryModal = ({ open, onClose, onSubmit, data }: SubHistoryModalProps) => {
  const handleSubmit = () => {
    //put your validation logic here
    onClose()
    onSubmit()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Sub Order History</DialogTitle>
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
      <Box sx={{ width: 300, bgcolor: 'background.paper' }}>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align='right'>Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(sales => (
                <TableRow key={sales.mpn}>
                  <TableCell component='th' scope='row'>
                    {sales.make ? `${sales.make} | ` : ''} {sales.model ? `${sales.model} | ` : ''} {sales.mpn}
                  </TableCell>
                  <TableCell component='th' scope='row' align='right'>
                    {`(${sales.count})`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

type Channel = {
  pk: number
  name: string
}
type Manager = {
  pk: number
  name: string
}
type ItemOption = {
  pk: number
  name: string
  serial: string
  product: {
    sku: string
    make: string
    model: string
    mpn: string
  }
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
interface ManagerOptionProps {
  session: any
  pk?: number
  modalOpen: boolean
  onClose: () => void
  setRefresh: any
  managerData: Manager[]
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
export const ManagerOptionModal = ({
  session,
  pk,
  modalOpen,
  onClose,
  setRefresh,
  managerData
}: ManagerOptionProps) => {
  const [values, setValues] = useState<any>({})

  const handleSubmit = () => {
    fetch(`https://cheapr.my.id/sales_items/${pk}/`, {
      // note we are going to /1
      method: 'PATCH',
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
          setRefresh((r: number) => r + 1)
        }
      })
    onClose()
  }
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly Manager[]>(managerData)
  const loading = modalOpen && options.length === 0

  return (
    <Dialog open={modalOpen}>
      <DialogTitle textAlign='center'>Assign to</DialogTitle>
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
            <TextField
              label={'Choose a person'}
              name={'manager'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
              select
            >
              {managerData?.map(manager => (
                <MenuItem key={manager.pk} value={manager.pk}>
                  {manager.name}
                </MenuItem>
              ))}
            </TextField>
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
  const [tabActive, setTabActive] = useState('6')
  const [refresh, setRefresh] = useState(0)

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      tabActive,
      refresh
    ],

    queryFn: async () => {
      const fetchURL = new URL('/unfulfilled_order/', 'https://cheapr.my.id')
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
      fetchURL.searchParams.set('manager', tabActive == 'all' ? '' : tabActive)

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
  const [managerData, setManagerData] = useState<Manager[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<SellingOrder>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [salesItemPk, setSalesItemPk] = useState<number | undefined>()
  const [managerModalOpen, setManagerModalOpen] = useState(false)
  const [custHistoryModalOpen, setCustHistoryModalOpen] = useState(false)
  const [subHistoryModalOpen, setSubHistoryModalOpen] = useState(false)
  const [historyData, setHistoryData] = useState<HistoricalData[]>([])
  const [custPk, setCustPk] = useState<number | undefined>()

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
  }
  const handleCreateNewRow = (values: SellingOrder) => {
    console.log(values)
    const channel = channelData.find(channel => channel.name == values['channel']['name'])
    const new_obj = { ...values, channel: channel?.pk }
    console.log(new_obj)
    fetch(`https://cheapr.my.id/unfulfilled_order/`, {
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
  const handleDeleteManager = (salesItemPk: number) => {
    fetch(`https://cheapr.my.id/sales_items/${salesItemPk}/`, {
      // note we are going to /1
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ manager: null })
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
          setRefresh((r: number) => r + 1)
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
    fetch(`https://cheapr.my.id/unfulfilled_order/${order}/`, {
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
      fetch(`https://cheapr.my.id/unfulfilled_order/${row.original.pk}/`, {
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
    fetch(`https://cheapr.my.id/unfulfilled_order/${row.original.pk}/`, {
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
    fetch(`https://cheapr.my.id/unfulfilled_order/${pk}/`, {
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
                      key={index}
                      href={`${tracking?.fullcarrier?.prefix}${tracking.tracking_number}${tracking?.fullcarrier?.suffix}`}
                      target='_blank'
                    >
                      <Box
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
        id: 'asigne',
        header: 'ASIGNEE',
        maxSize: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {row.original.salesitems.map((sales, index) => {
              const manager = sales.manager
              if (manager) {
                return (
                  <div key={index}>
                    <Link
                      href='#'
                      onClick={() => {
                        setSalesItemPk(sales.pk)
                        setManagerModalOpen(true)
                      }}
                    >
                      <span>{`${manager.name}`}</span>
                    </Link>

                    <Tooltip arrow placement='top' title='Remove'>
                      <IconButton
                        color='error'
                        onClick={() => {
                          fetch(`https://cheapr.my.id/sales_items/${sales.pk}/`, {
                            method: 'PATCH',
                            headers: new Headers({
                              Authorization: `Bearer ${session?.accessToken}`,
                              'Content-Type': 'application/json'
                            }),
                            body: JSON.stringify({ manager: null })
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
                  </div>
                )
              } else {
                return (
                  <Link
                    key={index}
                    href='#'
                    onClick={() => {
                      setSalesItemPk(sales.pk)
                      setManagerModalOpen(true)
                    }}
                  >
                    <span>Assign</span>
                  </Link>
                )
              }
            })}
          </Box>
        ),
        enableEditing: false
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
            {row.original.delivery_date
              ? moment(row.original.delivery_date).tz('America/Los_Angeles').format('MM-DD-YY')
              : ''}
          </Box>
        ),
        enableEditing: false
      },
      {
        id: 'make_mpn',
        header: 'ITEM',
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
            {row.original.salesitems.map((sales, index) => {
              const sku = sales.sku
              if (sku) {
                return (
                  <HtmlTooltip
                    title={
                      <React.Fragment>
                        {sales.model_match.length == 0 && <Typography color='inherit'>Not in Inventory</Typography>}
                        {sales.model_match
                          .filter((model: any) => model.mpn == 'Exact')
                          .map((model: any, index: number) => (
                            <Typography color='inherit' key={index}>{`${model.mpn} (${model.count})`}</Typography>
                          ))}

                        {sales.model_match
                          .filter((model: any) => model.mpn != 'Exact')
                          .map((model: any, index: number) => (
                            <Typography color='inherit' key={index}>{`${model.mpn} (${model.count})`}</Typography>
                          ))}
                      </React.Fragment>
                    }
                  >
                    {sku.mpn ? (
                      <span key={index}>{`${sku.make ? `${sku.make} | ` : ''}${sku.model ? `${sku.model} | ` : ''}${
                        sku.mpn ? `${sku.mpn}` : ''
                      }`}</span>
                    ) : (
                      <span key={index}>{sku.sku}</span>
                    )}
                  </HtmlTooltip>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'mm',
        header: 'M.M.',
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
            {row.original.salesitems.map((sales, index) => {
              const sku = sales.sku
              if (sku) {
                return (
                  <HtmlTooltip
                    title={
                      <React.Fragment>
                        {sales.model_match.length == 0 && <Typography color='inherit'>Not in Inventory</Typography>}
                        {sales.model_match
                          .filter((model: any) => model.mpn == 'Exact')
                          .map((model: any, index: number) => (
                            <Typography
                              color={model.count > 0 ? 'inherit' : 'grey'}
                              key={index}
                            >{`${model.mpn} (${model.count})`}</Typography>
                          ))}

                        {sales.model_match
                          .filter((model: any) => model.mpn != 'Exact')
                          .map((model: any, index: number) => (
                            <Typography
                              color={model.count > 0 ? 'inherit' : 'grey'}
                              key={index}
                            >{`${model.mpn} (${model.count})`}</Typography>
                          ))}
                      </React.Fragment>
                    }
                  >
                    {sales.model_match.length > 0 ? (
                      <span>{sales.model_match.reduce((total: number, obj: any) => obj.count + total, 0)}</span>
                    ) : (
                      <span></span>
                    )}
                  </HtmlTooltip>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'historical',
        header: 'HISTORICAL',
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
            {row.original.salesitems.map((sales, index) => {
              const sku = sales.sku
              if (sku) {
                return (
                  <Link
                    href='#'
                    onClick={() => {
                      setHistoryData(sales.historical)
                      setSubHistoryModalOpen(true)
                    }}
                  >
                    {sales.historical.length > 0 ? <span>Click</span> : <span></span>}{' '}
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
        accessorKey: 'comment',
        header: 'COMMENT',
        size: 100
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
              <MenuItem value={'all'}>All</MenuItem>
              {managerData?.map(manager => (
                <MenuItem key={manager.pk} value={manager.pk}>
                  {manager.name}
                </MenuItem>
              ))}

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
      <ManagerOptionModal
        session={session}
        pk={salesItemPk}
        modalOpen={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        setRefresh={setRefresh}
        managerData={managerData}
      />
      <CustHistoryModal
        session={session}
        pk={custPk}
        open={custHistoryModalOpen}
        onSubmit={() => {
          console.log('ok')
        }}
        onClose={() => setCustHistoryModalOpen(false)}
      />
      <SubHistoryModal
        session={session}
        data={historyData}
        open={subHistoryModalOpen}
        onSubmit={() => {
          console.log('ok')
        }}
        onClose={() => setSubHistoryModalOpen(false)}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const Unfulfilled = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default Unfulfilled
