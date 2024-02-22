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
  OpenIssue,
  ItemOption,
  ItemOption2,
  CustomerService,
  SellingOrder
} from 'src/@core/types'
import AddSalesItemModal from 'src/@core/components/add-sales-item'
import { ExtendedSession } from '../api/auth/[...nextauth]'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CxNotes from 'src/@core/components/cx-notes'
import Correspondence from 'src/@core/components/correspondence'
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
  columns: MRT_ColumnDef<OpenIssue>[]
  onClose: () => void
  onSubmit: (values: OpenIssue) => void
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
  rowData: OpenIssue | undefined
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

  const handleOpenIssue = (sales: number | undefined) => {
    if (sales) {
      fetch(`https://cheapr.my.id/open_issue/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sales: sales })
      })
        .then(response => response.json())
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
                  //   handleOpenIssue(newValue.pk)
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
        <Button color='primary' onClick={() => handleOpenIssue(choosed)} variant='contained'>
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
  { key: 'N', name: 'New', color: 'error' },
  { key: 'W', name: 'Working', color: 'warning' },
  { key: 'R', name: 'Resolved', color: 'success' },
  { key: 'G', name: 'Gave Up', color: 'default' }
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
      const fetchURL = new URL('/open_issue/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('status', `W`)
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
      for (let f = 0; f < columnFilters.length; f++) {
        const filter = columnFilters[f]
        if (filter.id == 'order_date') {
          console.log(filter)
          fetchURL.searchParams.set('order_date_after', Array.isArray(filter.value) ? filter.value[0] : '')
          fetchURL.searchParams.set('order_date_before', Array.isArray(filter.value) ? filter.value[1] : '')
        } else {
          fetchURL.searchParams.set(filter.id.split('.')[1], typeof filter.value === 'string' ? filter.value : '')
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
      fetchURL.searchParams.set('fall_off_after', moment(Date.now()).format('YYYY-MM-DD'))

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
  const [tableData, setTableData] = useState<OpenIssue[]>(() => data?.results ?? [])
  const [csData, setCsData] = useState<CustomerService[]>([])

  const [roomData, setRoomData] = useState<Room[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState<OpenIssue>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [custPk, setCustPk] = useState<number | undefined>()

  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [notesId, setNotesId] = useState<number>()
  const [correspondenceModalOpen, setCorrespondenceModalOpen] = useState(false)
  const [correspondenceId, setCorrespondenceId] = useState<number>()

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
  }
  const handleCreateNewRow = (values: OpenIssue) => {
    console.log(values)
    let new_obj: any = { ...values }

    if (values['cs']) {
      const cs = csData.find(cs => cs.name == values['cs']['name'])
      new_obj = { ...values, cs: cs?.pk }
    }

    console.log(new_obj)
    fetch(`https://cheapr.my.id/open_issue/`, {
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

  const handleSaveRow: MRT_TableOptions<OpenIssue>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
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

  const handleSaveCell = (cell: MRT_Cell<OpenIssue>, value: any) => {
    const key = cell.column.id
    const cs = csData.find(cs => cs.name == value)
    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: any = {}
    if (key === 'cs.name') {
      payload['cs'] = cs?.pk
      newData[cell.row.index]['cs'] = cs
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof OpenIssue] = value
    }
    const pk = newData[cell.row.index]['pk']

    console.log(payload)
    fetch(`https://cheapr.my.id/open_issue/${pk}/`, {
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

  const columns = useMemo<MRT_ColumnDef<OpenIssue>[]>(
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
        accessorKey: 'sales.ship_date',
        header: 'SHIPBY',
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
            {row.original.sales?.ship_date
              ? moment(row.original?.sales?.ship_date).tz('America/Los_Angeles').format('MM.DD')
              : ''}
          </Box>
        )
      },
      {
        accessorKey: 'sales.delivery_date',
        header: 'GETBY',
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
            {row.original.sales?.delivery_date
              ? moment(row.original?.sales?.delivery_date).tz('America/Los_Angeles').format('MM.DD')
              : ''}
          </Box>
        )
      },
      {
        id: 'lt_tn',
        header: 'LETTER TRACKING',
        size: 150,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.sales.salesitems.map((sales, index) => {
              const tracking = sales.letter_tracking
              if (tracking) {
                return (
                  <Typography color='inherit' key={index}>
                    {tracking.tracking_number}
                  </Typography>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'lt_eta',
        header: 'ETA',
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
            {row.original.sales.salesitems.map((sales, index) => {
              const tracking = sales.letter_tracking
              if (tracking) {
                return (
                  <Typography
                    color={
                      tracking.status == 'D'
                        ? 'green'
                        : tracking.status == 'T'
                        ? 'yellow'
                        : tracking.status == 'N'
                        ? 'red'
                        : 'purple'
                    }
                    key={index}
                  >
                    {tracking?.eta_date
                      ? moment(tracking?.eta_date).tz('America/Los_Angeles').format('MM.DD')
                      : tracking.status}
                  </Typography>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'ac_tn',
        header: 'ACTUAL TRACKING',
        size: 150,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.sales.salesitems.map((sales, index) => {
              const tracking = sales.tracking
              if (tracking) {
                return (
                  <Typography color='inherit' key={index}>
                    {tracking.tracking_number}
                  </Typography>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'ac_eta',
        header: 'ETA',
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
            {row.original.sales.salesitems.map((sales, index) => {
              const tracking = sales.tracking
              if (tracking) {
                return (
                  <Typography
                    color={
                      tracking.status == 'D'
                        ? 'green'
                        : tracking.status == 'T'
                        ? 'yellow'
                        : tracking.status == 'N'
                        ? 'red'
                        : 'purple'
                    }
                    key={index}
                  >
                    {tracking?.eta_date
                      ? moment(tracking?.eta_date).tz('America/Los_Angeles').format('MM.DD')
                      : tracking.status}
                  </Typography>
                )
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
          </Box>
        )
      },
      {
        id: 'buffer',
        header: 'BUFFER',
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
            {row.original.sales.salesitems.map((sales, index) => {
              const sku = sales?.sku
              if (sku && sku.sku && typeof sku.sku == 'string') {
                if (sku.sku.includes('BUFFERS') || sku.sku.includes('BOOK') || sku.sku.includes('INGRAM')) {
                  return (
                    <Typography color='inherit' key={index}>
                      BUFFER
                    </Typography>
                  )
                } else {
                  return <span key={index}>{` `}</span>
                }
              } else {
                return <span key={index}>{` `}</span>
              }
            })}
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
        accessorKey: 'az',
        header: 'AZ',
        size: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row, cell }) => (
          <Checkbox
            checked={row.original.az ? row.original.az : false}
            onClick={() => handleSaveCell(cell, row.original.az ? !row.original.az : true)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        )
      },
      {
        accessorKey: 'fb',
        header: 'FB',
        size: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row, cell }) => (
          <Checkbox
            checked={row.original.fb ? row.original.fb : false}
            onClick={() => handleSaveCell(cell, row.original.fb ? !row.original.fb : true)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        )
      },
      {
        accessorKey: 'cb',
        header: 'CB',
        size: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row, cell }) => (
          <Checkbox
            checked={row.original.cb ? row.original.cb : false}
            onClick={() => handleSaveCell(cell, row.original.cb ? !row.original.cb : true)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        )
      },
      {
        accessorKey: 'cs_comment',
        header: 'NOTES',
        size: 70,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            <Link
              href='#'
              onClick={() => {
                setNotesId(row.original.pk)
                setNotesModalOpen(true)
              }}
            >
              {row.original.cs_comment ? (
                <NoteAltIcon color={'warning'} />
              ) : (
                <AddCircleOutlineIcon color={'secondary'} />
              )}
            </Link>
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
                  setCorrespondenceId(row.original.sales?.pk)
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
        accessorKey: 'date',
        header: 'DATE',
        maxSize: 60,
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
            {row.original.date ? moment(row.original?.date).format('MM.DD') : ''}
          </Box>
        )
      },
      {
        accessorKey: 'apl_by',
        header: 'APL.BY',
        maxSize: 60,
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
            {row.original.apl_by ? moment(row.original?.apl_by).format('MM.DD') : ''}
          </Box>
        )
      },
      {
        accessorKey: 'appealed',
        header: 'APPEALED',
        maxSize: 60,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: appealedOptions?.map(status => (
            <MenuItem key={status.key} value={status.key}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
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
            <Chip
              sx={{
                fontSize: 12
              }}
              label={appealedOptions.find(e => e.key == row.original?.appealed)?.name}
              color={appealedOptions.find(e => e.key == row.original?.appealed)?.color}
              onDelete={() => {
                table.setEditingCell(cell)
              }}
              onClick={() => {
                table.setEditingCell(cell)
              }}
              deleteIcon={<ArrowDropDown />}
            />
          </Box>
        )
      },
      {
        accessorKey: 'fall_off',
        header: 'FALL OFF',
        maxSize: 60,
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
            {row.original.fall_off ? moment(row.original?.fall_off).tz('America/Los_Angeles').format('MM.DD') : ''}
          </Box>
        )
      },
      {
        accessorKey: 'case_id',
        header: 'CASE.ID',
        maxSize: 60
      },
      {
        accessorKey: 'cs.name',
        header: 'ASSIGNEE',
        maxSize: 60,
        muiEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: csData?.map(cs => (
            <MenuItem key={cs.pk} value={cs.name}>
              {cs.name}
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
            <Chip
              sx={{
                fontSize: 12
              }}
              label={row.original?.cs?.name || 'Pick CS'}
              color='default'
              onDelete={() => {
                table.setEditingCell(cell)
              }}
              onClick={() => {
                table.setEditingCell(cell)
              }}
              deleteIcon={<ArrowDropDown />}
            />
          </Box>
        )
      },
      {
        accessorKey: 'steps_done',
        header: 'STEPS DONE',
        maxSize: 60
      },
      {
        accessorKey: 'next_step',
        header: 'NEXT STEPS',
        maxSize: 60
      },
      {
        accessorKey: 'legal_comment',
        header: 'LEGAL COMMENTS',
        maxSize: 60
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
                  fetch(`https://cheapr.my.id/open_issue/${row.original.pk}/`, {
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
              Add New Issue
            </Button>
            <Select labelId='demo-select-small-label' id='demo-select-small' value={tabActive} onChange={handleChange}>
              {csData?.map(cs => (
                <MenuItem value={cs.pk} key={`menu-${cs.pk}`}>
                  {cs.name}
                </MenuItem>
              ))}
              <MenuItem value={'all'}>All</MenuItem>
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
      <CxNotes
        onClose={() => {
          setNotesModalOpen(false)
          setRefresh(r => r + 1)
        }}
        open={notesModalOpen}
        sales={notesId}
        session={session}
        reload={() => {
          setRefresh(r => r + 1)
        }}
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

const WorkingIssues = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default WorkingIssues
