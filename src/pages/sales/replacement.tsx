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
import Correspondence from 'src/@core/components/correspondence'
import { formatterUSDStrip } from 'src/constants/Utils'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import moment from 'moment-timezone'
import CloseIcon from '@mui/icons-material/Close'
import HistoryIcon from '@mui/icons-material/History'
import { styled } from '@mui/material/styles'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import {
  BuyingOrder,
  Channel,
  Carrier,
  Room,
  CAProduct,
  Person,
  InventoryPayload,
  InventoryItem,
  SellingOrder,
  ItemOption2,
  Manager
} from 'src/@core/types'
import AddSalesItemModal from 'src/@core/components/add-sales-item'
import ChatBadge from 'src/@core/components/chat-badge'

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

type HistoricalData = {
  make: string
  model: string
  mpn: string
  sku: string
  count: number
  order_id: string[]
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

const Example = (props: any) => {
  const { session } = props
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50
  })

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting //refetch when sorting changes
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
        } else if (filter.id == 'delivery_date') {
          console.log(filter)
          fetchURL.searchParams.set(
            'delivery_date_after',
            typeof filter.value === 'string' ? moment(filter.value).add(7, 'hours').toISOString() : ''
          )
          fetchURL.searchParams.set(
            'delivery_date_before',
            typeof filter.value === 'string' ? moment(filter.value).add(1, 'days').add(7, 'hours').toISOString() : ''
          )
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
      fetchURL.searchParams.set('replacement', 'true')

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
  const [historyData, setHistoryData] = useState<HistoricalData[]>([])
  const [correspondenceModalOpen, setCorrespondenceModalOpen] = useState(false)
  const [correspondenceId, setCorrespondenceId] = useState<number>()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<SellingOrder>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [custHistoryModalOpen, setCustHistoryModalOpen] = useState(false)
  const [subHistoryModalOpen, setSubHistoryModalOpen] = useState(false)

  const [custPk, setCustPk] = useState<number | undefined>()

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
  const handleSaveRow: MRT_TableOptions<SellingOrder>['onEditingRowSave'] = async ({
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
                      href={`${tracking?.fullcarrier?.prefix}${tracking.tracking_number}${tracking?.fullcarrier?.suffix}`}
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
            {row.original.delivery_date
              ? moment(row.original.delivery_date).tz('America/Los_Angeles').format('MM-DD-YY')
              : ''}
          </Box>
        ),
        enableEditing: false
      },
      {
        id: 'make_mpn',
        header: 'ITEM DETAIL',
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
                        {sales.title == null ? (
                          <Typography color='inherit'>No Title</Typography>
                        ) : (
                          <Typography color='inherit'>{sales.title}</Typography>
                        )}
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

      // {
      //   id: 'mm',
      //   header: 'ERP',
      //   maxSize: 60,
      //   enableEditing: false,
      //   Cell: ({ renderedCellValue, row }) => (
      //     <Box
      //       sx={{
      //         display: 'flex',
      //         flexDirection: 'column',
      //         gap: '1rem'
      //       }}
      //     >
      //       {row.original.salesitems.map((sales, index) => {
      //         const sku = sales.sku
      //         if (sku) {
      //           return (
      //             <HtmlTooltip
      //               title={
      //                 <React.Fragment>
      //                   {sales.model_match.length == 0 && <Typography color='inherit'>Not in Inventory</Typography>}
      //                   {sales.model_match
      //                     .filter((model: any) => model.mpn == 'Exact')
      //                     .map((model: any, index: number) => (
      //                       <Typography
      //                         color={model.count > 0 ? 'inherit' : 'grey'}
      //                         key={index}
      //                       >{`${model.mpn} (${model.count})`}</Typography>
      //                     ))}

      //                   {sales.model_match
      //                     .filter((model: any) => model.mpn != 'Exact')
      //                     .map((model: any, index: number) => (
      //                       <Typography
      //                         color={model.count > 0 ? 'inherit' : 'grey'}
      //                         key={index}
      //                       >{`${model.mpn} (${model.count})`}</Typography>
      //                     ))}
      //                 </React.Fragment>
      //               }
      //             >
      //               {sales.model_match.length > 0 ? (
      //                 <span>{sales.model_match.reduce((total: number, obj: any) => obj.count + total, 0)}</span>
      //               ) : (
      //                 <span></span>
      //               )}
      //             </HtmlTooltip>
      //           )
      //         } else {
      //           return <span key={index}>{` `}</span>
      //         }
      //       })}
      //     </Box>
      //   )
      // },

      {
        id: 'mm2',
        header: 'ERP',
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
            <HtmlTooltip
              title={
                <React.Fragment>
                  {row.original.erp_data &&
                    row.original.erp_data?.data?.split('\n').map((el, index) => (
                      <Typography color='inherit' key={`${index}-${el}`}>
                        {el}
                      </Typography>
                    ))}
                </React.Fragment>
              }
            >
              {row.original.erp_data ? <span>Show</span> : <span></span>}
            </HtmlTooltip>
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
        accessorKey: 'person.name',
        accessorFn: row => row.person?.name?.substr(0, 15),
        header: 'CUSTOMER',
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
                setCustPk(row.original.person.pk)
                setCustHistoryModalOpen(true)
              }}
            >
              <span>{renderedCellValue}</span>
            </Link>
          </Box>
        )
      },
      {
        accessorKey: 'person.phone',
        header: 'CONTACT',
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
        id: 'cs_comment',
        header: 'MESSAGES',
        size: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            {row.original.total_correspondence ? (
              <Link
                href='#'
                onClick={() => {
                  setCorrespondenceId(row.original.pk)
                  setCorrespondenceModalOpen(true)
                }}
              >
                <ChatBadge count={row.original.total_correspondence} />
              </Link>
            ) : (
              <></>
            )}
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
        header: 'PRICE',
        size: 70,
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.total_cost)}</Box>,
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
        accessorKey: 'shipping_cost',
        id: 'shipping_cost',
        header: 'SHIP',
        size: 70,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        muiEditTextFieldProps: {
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
        muiEditTextFieldProps: {
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
        id: 'purchase_id',
        header: 'P.O.#',
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
                  return <span key={index}>{item?.buying?.channel_order_id}</span>
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
        header: 'COST',
        size: 70,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.purchase_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        header: 'LABEL',
        size: 70,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.ss_shipping_cost)}</Box>
        ),
        muiEditTextFieldProps: {
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
        muiEditTextFieldProps: {
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
        muiEditTextFieldProps: {
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
            <span>
              {row.original.order_date
                ? moment(row.original.order_date).tz('America/Los_Angeles').format('MM-DD-YY')
                : ''}
            </span>
          </Box>
        )
      },
      {
        accessorKey: 'ship_date',
        header: 'SHIP BY',
        size: 70,
        muiEditTextFieldProps: {
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
            <span>
              {row.original.ship_date
                ? moment(row.original.ship_date).tz('America/Los_Angeles').format('MM-DD-YY')
                : ''}
            </span>
          </Box>
        )
      },

      {
        accessorKey: 'channel.name',
        id: 'channel_name',
        header: 'CHANNEL',
        size: 100,
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
        id: 'letter_tracking_status',
        header: 'LTSTS',
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
              .map(sales => sales.letter_tracking)
              .map((tracking, index) => {
                if (tracking) {
                  return (
                    <Link
                      href={`${tracking?.fullcarrier?.prefix}${tracking?.tracking_number}${tracking.fullcarrier?.suffix}`}
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
      pageSize: 50
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
      <AddSalesItemModal
        session={session}
        columns={columnsAddItem}
        open={addModalOpen !== undefined}
        onClose={() => setAddModalOpen(undefined)}
        onSubmit={handleAddItem}
        rowData={addModalOpen}
        roomData={roomData}
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
      <SalesDetail
        session={session}
        pk={detail}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      <Correspondence
        onClose={() => setCorrespondenceModalOpen(false)}
        open={correspondenceModalOpen}
        sales={correspondenceId}
        session={session}
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

export default Sold
