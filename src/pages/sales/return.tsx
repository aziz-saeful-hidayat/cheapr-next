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
  CircularProgress,
  Checkbox
} from '@mui/material'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'

//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Delete, Add, ArrowDropDownCircleOutlined, ArrowDropDown } from '@mui/icons-material'
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
  ReturnSales,
  ItemOption,
  ItemOption2,
  CustomerService,
  SellingOrder
} from 'src/@core/types'
import AddSalesItemModal from 'src/@core/components/add-sales-item'
import { ExtendedSession } from '../api/auth/[...nextauth]'

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
  columns: MRT_ColumnDef<ReturnSales>[]
  onClose: () => void
  onSubmit: (values: ReturnSales) => void
  open: boolean
  channelData: any[]
  session: ExtendedSession
  reload: () => void
}
interface AddItemProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  open: boolean
  rowData: ReturnSales | undefined
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

export const CreateNewAccountModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  channelData,
  session,
  reload
}: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [choosed, setChoosed] = useState<number>()
  const [options, setOptions] = useState<SellingOrder[]>([])

  const handleReturnSales = (sales: number | undefined) => {
    console.log(sales)
    if (sales) {
      fetch(`https://cheapr.my.id/return_sales/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sales: sales })
      })
        .then(response => response.json())
        .then(json => console.log(json))
        .finally(() => {
          onClose()
          reload()
        })
    }
  }
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Open Issue</DialogTitle>
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
            <Autocomplete
              id='search-sales'
              sx={{ margin: 10 }}
              open={isopen}
              onOpen={() => {
                setOpen(true)
              }}
              onClose={() => {
                setOpen(false)
              }}
              onChange={(event, newValue) => {
                console.log(newValue)
                if (newValue) {
                  setChoosed(newValue.pk)

                  // if (newValue.salesitems.filter(s => !s.item).length == 0) {
                  //   setChoosed(newValue.pk.toString())
                  //   setConfirmOpen(true)
                  // } else if (newValue.status == 'canceled') {
                  //   setConfirmCanceledOpen(true)
                  // } else {
                  //   setChoosed(newValue.pk.toString())
                  //   handleReturnSales(newValue.pk)
                  // }
                }
              }}
              isOptionEqualToValue={(option, value) => option.pk === value.pk}
              getOptionLabel={option =>
                `${option.order_id} ${option.channel_order_id ? option.channel_order_id : '------'} ${
                  option.person?.name ? option.person?.name : '------'
                } ${option.person?.address?.street_1 ? option.person?.address?.street_1 : '------'} ${
                  option.person?.address?.zip ? option.person?.address?.zip : '------'
                } ${option.person?.address?.zip ? option.person?.address?.zip : '------'}`
              }
              options={options}
              loading={loading}
              renderInput={params => (
                <TextField
                  {...params}
                  onChange={e =>
                    fetch(`https://cheapr.my.id/selling_order/?search=${e.target.value}`, {
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
                  label='Search Sales'
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
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='primary' onClick={() => handleReturnSales(choosed)} variant='contained'>
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

const statusOptions: any[] = [
  { key: 'N', name: 'Not Completed', color: 'error' },
  { key: 'S', name: 'Successful', color: 'success' },
  { key: 'R', name: 'Returned Back', color: 'warning' },
  { key: 'I', name: 'Issue', color: 'default' }
]

const trackingStatusOptions: any[] = [
  { key: 'D', name: 'Delivered', color: 'success' },
  { key: 'T', name: 'Transit', color: 'warning' },
  { key: 'I', name: 'Issue', color: 'error' },
  { key: 'N', name: 'Not Started', color: 'default' }
]
const appealedOptions: any[] = [
  { key: true, name: 'Yes', color: 'success' },
  { key: false, name: 'No', color: 'error' },
  { key: null, name: 'Unknown', color: 'default' }
]
const Example = (props: any) => {
  const { session } = props
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50
  })
  const [tabActive, setTabActive] = useState('all')
  const [refresh, setRefresh] = useState(0)
  const [carrierData, setCarrierData] = useState<Carrier[]>([])

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [
      'table-data',
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      refresh,
      tabActive
    ],
    queryFn: async () => {
      const fetchURL = new URL('/return_sales/', 'https://cheapr.my.id')
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

      fetchURL.searchParams.set('cs', tabActive != 'all' ? tabActive : '')

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
  const [tableData, setTableData] = useState<ReturnSales[]>(() => data?.results ?? [])
  const [csData, setCsData] = useState<CustomerService[]>([])

  const [roomData, setRoomData] = useState<Room[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<ReturnSales>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [custPk, setCustPk] = useState<number | undefined>()

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
  }
  const handleCreateNewRow = (values: ReturnSales) => {
    console.log(values)
    let new_obj: any = { ...values }
    console.log(new_obj)
    fetch(`https://cheapr.my.id/return_sales/`, {
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

  const handleSaveRow: MRT_TableOptions<ReturnSales>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
    const cs = csData.find(cs => cs.name == values['cs']['name'])
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        if (key == 'cs.name') {
          values['cs'] = cs?.pk
          delete values['cs.name']
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
          tableData[row.index] = { ...json, cs: cs }

          setTableData([...tableData])
          exitEditingMode() //required to exit editing mode
        }
      })
  }

  const handleSaveCell = (cell: MRT_Cell<ReturnSales>, value: any) => {
    const key = cell.column.id
    const cs = csData.find(cs => cs.name == value)
    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: any = {}
    if (key === 'tracking.fullcarrier.name') {
      payload['fullcarrier'] = value
      if (cell.row.original.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.tracking?.pk}/`, {
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
              fetch(`https://cheapr.my.id/return_sales/${cell.row.original.pk}/`, {
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
    } else if (key === 'tracking.tracking_number') {
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
                  console.log(`https://cheapr.my.id/return_sales/${cell.row.original.pk}/`)

                  fetch(`https://cheapr.my.id/return_sales/${cell.row.original.pk}/`, {
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
            fetch(`https://cheapr.my.id/return_sales/${cell.row.original.pk}/`, {
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
    } else if (key === 'tracking.eta_date') {
      payload['eta_date'] = value
      if (cell.row.original.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.tracking?.pk}/`, {
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
              fetch(`https://cheapr.my.id/return_sales/${cell.row.original.pk}/`, {
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
    } else if (key === 'tracking.status') {
      payload['status'] = value
      if (cell.row.original.tracking?.pk) {
        fetch(`https://cheapr.my.id/tracking/${cell.row.original.tracking?.pk}/`, {
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
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof ReturnSales] = value
    }
    const pk = newData[cell.row.index]['pk']

    console.log(payload)
    fetch(`https://cheapr.my.id/return_sales/${pk}/`, {
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
        }
      })
      .finally(() => setRefresh(r => r + 1))
  }

  const columns = useMemo<MRT_ColumnDef<ReturnSales>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'STATUS',
        maxSize: 40,
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
        Cell: ({ renderedCellValue, row, table, cell }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original?.status ? (
              <Chip
                sx={{
                  fontSize: 12
                }}
                label={statusOptions.find(e => e.key == renderedCellValue)?.name}
                color={statusOptions.find(e => e.key == renderedCellValue)?.color}
                onDelete={() => {
                  table.setEditingCell(cell)
                }}
                onClick={() => {
                  table.setEditingCell(cell)
                }}
                deleteIcon={<ArrowDropDown />}
              />
            ) : null}
          </Box>
        )
      },
      {
        accessorKey: 'sales.channel_order_id',
        header: 'ORDER',
        maxSize: 50,
        enableEditing: false
      },
      {
        accessorKey: 'sales.seller_name',
        header: 'STORE',
        maxSize: 50,
        enableEditing: false
      },
      {
        accessorKey: 'sales.order_date',
        header: 'DATE',
        maxSize: 60,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original.sales?.order_date
              ? moment(row.original?.sales?.order_date).tz('America/Los_Angeles').format('MM.DD')
              : ''}
          </Box>
        )
      },
      {
        accessorKey: 'sales.person.name',
        header: 'CUSTOMER',
        size: 100,
        enableEditing: false
      },
      {
        accessorKey: 'sales.person.phone',
        header: 'CONTACT',
        size: 100,
        enableEditing: false
      },
      {
        accessorKey: 'label',
        header: 'LABEL',
        minSize: 100, //min size enforced during resizing
        maxSize: 150, //max size enforced during resizing
        size: 150, //medium column,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{renderedCellValue && formatterUSDStrip(row.original.label)}</Box>
        ),
        muiEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'comment',
        header: 'COMMENT',
        minSize: 100, //min size enforced during resizing
        maxSize: 150, //max size enforced during resizing
        size: 150 //medium column,
      },
      {
        accessorKey: 'tracking.fullcarrier.name',
        header: 'Carrier',
        size: 100,
        muiEditTextFieldProps: {
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
          row.original.tracking?.fullcarrier ? (
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
                src={row.original.tracking?.fullcarrier.image}
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
        accessorKey: 'tracking.tracking_number',
        header: 'Tracking',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            <Link
              target='_blank'
              rel='noreferrer'
              href={`${row.original.tracking?.fullcarrier?.prefix}${row.original.tracking?.tracking_number}${row.original.tracking?.fullcarrier?.suffix}`}
              underline='hover'
            >
              {row.original.tracking?.tracking_number}
            </Link>
          </Box>
        )
      },
      {
        accessorKey: 'tracking.eta_date',
        header: 'ETA',
        size: 120,
        muiEditTextFieldProps: {
          type: 'date'
        }
      },
      {
        accessorKey: 'tracking.status',
        header: 'Status',
        size: 100,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: trackingStatusOptions?.map(status => (
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
            {row.original.tracking?.status ? (
              <Chip
                sx={{
                  fontSize: 12
                }}
                label={trackingStatusOptions.find(e => e.key == renderedCellValue)?.name}
                color={trackingStatusOptions.find(e => e.key == renderedCellValue)?.color}
              />
            ) : null}
          </Box>
        )
      }
    ],
    [csData, tableData]
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
    const fetchURL = new URL('/customer_service/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setCsData(json.results)
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
        enableRowActions
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            {/* <Tooltip arrow placement='left' title='Edit'>
              <IconButton onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip> */}
            <Tooltip arrow placement='right' title='Delete'>
              <IconButton
                color='error'
                onClick={() => {
                  if (
                    !confirm(`Are you sure you want to delete this issue #${row.original?.sales?.channel_order_id}`)
                  ) {
                    return
                  }
                  fetch(`https://cheapr.my.id/return_sales/${row.original.pk}/`, {
                    method: 'DELETE',
                    headers: new Headers({
                      Authorization: `Bearer ${session?.accessToken}`,
                      'Content-Type': 'application/json'
                    })
                  })
                    .then(response => response.status)
                    .then(status => {
                      if (status == 204) {
                      }
                    })
                    .finally(() => setRefresh(r => r + 1))
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
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
              Add New Return
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
        channelData={csData}
        session={session}
        reload={() => setRefresh(r => r + 1)}
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

const ReturnSales = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default ReturnSales
