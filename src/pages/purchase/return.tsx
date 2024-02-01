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
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import Chip from '@mui/material/Chip'

//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Delete, Add, TaskAlt } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Items from 'src/@core/components/inventory-item'
import { withAuth } from 'src/constants/HOCs'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import { ExtendedSession } from '../api/auth/[...nextauth]'
import moment from 'moment-timezone'
import { useRouter } from 'next/router'
import { formatterUSDStrip } from 'src/constants/Utils'
import { getSession } from 'next-auth/react'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import PurchaseDetail from 'src/@core/components/purchase-detail'
import PickSellerModal from 'src/@core/components/pick-seller'
import CreateNewSellerModal from 'src/@core/components/create-seller'
import CloseIcon from '@mui/icons-material/Close'
import CreateNewPurchase from 'src/@core/components/create-purchase'
import {
  BuyingOrder,
  Channel,
  Carrier,
  Room,
  CAProduct,
  Person,
  InventoryPayload,
  InventoryItem
} from 'src/@core/types'

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
  inventoryitems?: InventoryItem[]
}

interface CreateModalProps {
  columns: MRT_ColumnDef<BuyingOrder>[]
  onClose: () => void
  onSubmit: (values: BuyingOrder) => void
  open: boolean
  channelData: Channel[]
  session: any
  carrierData: Carrier[]
}
interface AddItemProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  open: boolean
  rowData: BuyingOrder | undefined
  roomData: Room[]
  session: ExtendedSession
}
interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
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
    onSubmit({ ...values, buying: rowData?.pk })
    onClose()
  }
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly CAProduct[]>([])
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
              gap: '1.5rem'
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
  const router = useRouter()

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
      refresh
    ],
    queryFn: async () => {
      const fetchURL = new URL('/buying_order/', 'https://cheapr.my.id')
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
        ordering = ordering + sort.id.split('.')[0]
      }
      fetchURL.searchParams.set('ordering', ordering)
      fetchURL.searchParams.set('returned', 'true')
      fetchURL.searchParams.set('canceled', 'false')

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
  const [tableData, setTableData] = useState<BuyingOrder[]>(() => data?.results ?? [])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [carrierData, setCarrierData] = useState<Carrier[]>([])

  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [tabActive, setTabActive] = useState('all')
  const [buyingToEdit, setBuyingToEdit] = useState('')
  const [pickSellerModalOpen, setPickSellerModalOpen] = useState(false)
  const [createSellerModalOpen, setCreateSellerModalOpen] = useState(false)

  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleCreateNewRow = (values: BuyingOrder) => {
    console.log(values)
    const channel = channelData.find(channel => channel.name == values['channel']['name'])

    const new_obj = {
      ...values,
      channel: channel?.pk,
      order_date: values.order_date ? values.order_date : null,
      delivery_date: values.delivery_date ? values.delivery_date : null
    }
    console.log(new_obj)
    fetch(`https://cheapr.my.id/buying_order/`, {
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
          setRefresh(refresh + 1)
        }
      })
  }

  const handleDeleteRow = useCallback(
    (row: MRT_Row<BuyingOrder>) => {
      if (!confirm(`Are you sure you want to delete ${row.original.order_id}`)) {
        return
      }
      fetch(`https://cheapr.my.id/buying_order/${row.original.pk}/`, {
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
            setRefresh(refresh + 1)
          }
        })
    },
    [tableData, session]
  )

  const handleVerifyRow = useCallback(
    (row: MRT_Row<BuyingOrder>) => {
      if (!confirm(`Are you sure you want to verify ${row.original.order_id}`)) {
        return
      }
      fetch(`https://cheapr.my.id/buying_order/${row.original.pk}/`, {
        // note we are going to /1
        method: 'PATCH',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ verified: true })
      })
        .then(response => response.status)
        .then(status => {
          if (status == 204) {
            setRefresh(refresh + 1)
          }
        })
    },
    [tableData, session]
  )

  const handleSaveRow: MRT_TableOptions<BuyingOrder>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
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
    fetch(`https://cheapr.my.id/buying_order/${row.original.pk}/`, {
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
          tableData[row.index] = { ...json, channel: channel, inventoryitems: row.original.inventoryitems }

          setTableData([...tableData])
          exitEditingMode() //required to exit editing mode
        }
      })
  }

  const handleSaveCell = (cell: MRT_Cell<BuyingOrder>, value: any) => {
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
      payload[key as keyof Payload] = value === '' ? null : value
      newData[cell.row.index][cell.column.id as keyof BuyingOrder] = value
    }
    const pk = newData[cell.row.index]['pk']

    setTableData([...newData])
    console.log(payload)
    fetch(`https://cheapr.my.id/buying_order/${pk}/`, {
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
          newData[cell.row.index] = json
          setTableData([...newData])
        }
      })
  }
  const handlePickSeller = (values: { seller: number }) => {
    const newValues = { seller: values.seller }
    console.log(`https://cheapr.my.id/buying_order/${buyingToEdit}/`)
    console.log(newValues)
    fetch(`https://cheapr.my.id/buying_order/${buyingToEdit}/`, {
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
        }
      })
      .finally(() => {
        setRefresh(refresh + 1)
      })
  }
  const columns = useMemo<MRT_ColumnDef<BuyingOrder>[]>(
    () => [
      {
        id: 'delivery_status',
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
            {row.original.inventoryitems
              .map(item => item.tracking)
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
        id: 'get_by',
        header: 'GET BY',
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
            {row.original.inventoryitems
              .map(item => item?.itemsales?.selling)
              .map((selling, index) => {
                if (selling) {
                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <span>
                        {selling?.delivery_date
                          ? moment(selling?.delivery_date).tz('America/Los_Angeles').format('MM-DD-YY')
                          : ''}
                      </span>
                    </Box>
                  )
                } else {
                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <span></span>
                    </Box>
                  )
                }
              })}
          </Box>
        )
      },
      {
        accessorKey: 'order_date',
        header: 'Date',
        maxSize: 100,
        muiEditTextFieldProps: {
          type: 'date'
        },
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>
              {renderedCellValue
                ? moment(renderedCellValue?.toString()).tz('America/Los_Angeles').format('MM-DD-YY')
                : ''}
            </span>
          </Box>
        )
      },
      {
        accessorKey: 'channel.name',
        header: 'Source',
        maxSize: 100,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: channelData?.map(channel => (
            <MenuItem key={channel.pk} value={channel.name}>
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
          ))
        },
        Cell: ({ renderedCellValue, row }) =>
          row.original.channel ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <img
                alt='avatar'
                height={20}
                src={row.original.channel.image}
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
        accessorKey: 'channel_order_id',
        header: 'P.O.#',
        maxSize: 150,
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
              {row.original.channel_order_id || row.original.order_id}
            </Link>
          </Box>
        )
      },

      {
        accessorKey: 'seller.name',
        header: 'Seller',
        maxSize: 150,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            {row.original.seller ? (
              <Link
                href=''
                onClick={() => {
                  setBuyingToEdit(row.original?.pk.toString())
                  setPickSellerModalOpen(true)
                }}
              >
                {renderedCellValue ? renderedCellValue : 'Pick Seller'}
              </Link>
            ) : null}
          </Box>
        )
      },
      {
        accessorKey: 'person.name',
        header: 'Ship To',
        maxSize: 120,
        enableEditing: false
      },
      {
        accessorKey: 'purchase_link',
        header: 'URL',
        maxSize: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Link target='_blank' rel='noreferrer' href={row.original.purchase_link}>
              {renderedCellValue && 'Open'}
            </Link>
          </Box>
        )
      },

      // {
      //   accessorKey: 'delivery_date',
      //   header: 'Received',
      //   maxSize: 100,
      //   muiEditTextFieldProps: {
      //     type: 'date'
      //   },
      //   Cell: ({ renderedCellValue, row }) =>
      //     renderedCellValue ? (
      //       <Box
      //         sx={{
      //           display: 'flex',
      //           alignItems: 'center'
      //         }}
      //       >
      //         <Box
      //           sx={theme => ({
      //             backgroundColor: theme.palette.success.dark,
      //             borderRadius: '0.5rem',
      //             color: '#fff',
      //             width: 12,
      //             height: 12,
      //             marginLeft: 5
      //           })}
      //         ></Box>
      //       </Box>
      //     ) : (
      //       <Box
      //         sx={{
      //           display: 'flex',
      //           alignItems: 'center'
      //         }}
      //       >
      //         <Box
      //           sx={theme => ({
      //             backgroundColor: theme.palette.error.dark,
      //             borderRadius: '0.5rem',
      //             color: '#fff',
      //             width: 12,
      //             height: 12,
      //             marginLeft: 5
      //           })}
      //         ></Box>
      //       </Box>
      //     )
      // },
      // {
      //   accessorKey: 'tracking_number',
      //   header: 'Tracking',
      //   maxSize: 175
      // },
      {
        accessorKey: 'num_items',
        header: 'Item(s) Qty',
        maxSize: 120,
        enableEditing: false,
        muiTableBodyCellProps: {
          align: 'center'
        },
        muiTableHeadCellProps: {
          align: 'center'
        }
      },
      {
        accessorKey: 'total_sum',
        header: 'Item(s) Cost',
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.total_sum)}</Box>,
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
        accessorKey: 'shipping_sum',
        header: 'Our Label',
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_sum)}</Box>
        ),
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
        accessorFn: row =>
          formatterUSDStrip(parseFloat(row.total_sum?.toString()) + parseFloat(row.shipping_sum?.toString())), //accessorFn used to join multiple data into a single cell
        id: 'all_cost', //id is still required when using accessorFn instead of accessorKey
        header: 'Total Cost',
        maxSize: 100,
        enableEditing: false,
        muiTableBodyCellProps: {
          align: 'right'
        },
        muiTableHeadCellProps: {
          align: 'right'
        }
      }
    ],
    [channelData]
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
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setChannelData(json.results)
      })
    const fetchURLCarrier = new URL('/carrier/', 'https://cheapr.my.id')
    fetch(fetchURLCarrier.href, {
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

  return (
    <Card sx={{ padding: 3 }}>
      <MaterialReactTable
        columns={columns}
        data={tableData} //data is undefined on first render
        // enableDensityToggle={false}
        initialState={{ showColumnFilters: false, density: 'compact' }}
        enableEditing
        editDisplayMode='cell'
        muiEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        muiTableProps={{
          sx: {
            tableLayout: 'fixed'
          }
        }}
        onEditingRowSave={handleSaveRow}
        enableColumnActions={false}
        enableStickyHeader
        enableStickyFooter
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: 'error',
                children: 'Error loading data'
              }
            : undefined
        }
        manualFiltering
        manualPagination
        manualSorting
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        enableRowActions
        positionActionsColumn='last'
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', width: 100 }}>
            {/* <Tooltip arrow placement='top' title='Edit'>
              <IconButton color='primary' onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip> */}
            {/* <Tooltip arrow placement='top' title='Verify'>
              <IconButton color='primary' onClick={() => handleVerifyRow(row)}>
                <TaskAlt />
              </IconButton>
            </Tooltip> */}
            <Tooltip arrow placement='top' title='Delete'>
              <IconButton color='error' onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <>
            {/* <Tooltip arrow title='Refresh Data'>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip> */}
            <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
              Add New Purchase
            </Button>
          </>
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
      <CreateNewPurchase
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        channelData={channelData}
        session={session}
        carrierData={carrierData}
      />
      <PurchaseDetail
        session={session}
        pk={detail}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      <PickSellerModal
        session={session}
        open={pickSellerModalOpen}
        onClose={() => setPickSellerModalOpen(false)}
        onSubmit={handlePickSeller}
        setCreateSellerModalOpen={setCreateSellerModalOpen}
      />
      <CreateNewSellerModal
        session={session}
        open={createSellerModalOpen}
        onClose={() => setCreateSellerModalOpen(false)}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const Return = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default Return
