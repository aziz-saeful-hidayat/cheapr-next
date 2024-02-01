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
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Paper,
  TableBody,
  MenuItem
} from '@mui/material'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import {
  MRT_Cell,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState
} from 'material-react-table'
import React, { useEffect, useMemo, useState } from 'react'
import Select, { SelectChangeEvent } from '@mui/material/Select'

//Date Picker Imports
import { Delete } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import ArchiveIcon from '@mui/icons-material/Archive'
import AttributionIcon from '@mui/icons-material/Attribution'

import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import moment from 'moment-timezone'
import SalesDetail from 'src/@core/components/sales-detail'
import {
  BuyingOrder,
  CustomerService,
  InventoryItem,
  InventoryPayload,
  LeadsSalesItems,
  Room,
  SellingOrder,
  Tracking
} from 'src/@core/types'
import { ExtendedSession } from '../api/auth/[...nextauth]'
import Correspondence from 'src/@core/components/correspondence'
import sales from '../sales'
import PurchaseDetail from 'src/@core/components/purchase-detail'
import PurchaseDetailVerified from 'src/@core/components/purchase-detai-verified'

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
  columns: MRT_ColumnDef<LeadsSalesItems>[]
  onClose: () => void
  onSubmit: (values: LeadsSalesItems) => void
  open: boolean
  session: ExtendedSession
  reload: () => void
}
interface AddItemProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  open: boolean
  rowData: LeadsSalesItems | undefined
  roomData: Room[]
}
interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
}
interface PurchaseDetailModalProps {
  onClose: () => void
  open: boolean
  data: { buying: BuyingOrder; tracking: Tracking } | undefined
  session: any
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

export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, session, reload }: CreateModalProps) => {
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

  const handleLeadsSalesItems = (sales: number | undefined) => {
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
                  //   handleLeadsSalesItems(newValue.pk)
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
        <Button color='primary' onClick={() => handleLeadsSalesItems(choosed)} variant='contained'>
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
export const PurchaseDetailModal = ({ open, onClose, data, session }: PurchaseDetailModalProps) => {
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false)

  return (
    <Dialog open={open} maxWidth={'xl'}>
      <DialogTitle textAlign='center'>Purchase Info</DialogTitle>
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
      <TableContainer component={Paper}>
        <Table aria-label='simple table'>
          <TableBody>
            {data?.buying && (
              <>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    P.O #:
                  </TableCell>

                  <TableCell align='right'>
                    <Link
                      href={`#`}
                      onClick={() => {
                        setDetailModalOpen(true)
                      }}
                    >
                      {data?.buying?.channel_order_id}
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    Date:
                  </TableCell>

                  <TableCell align='right'>{data?.buying?.order_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    Seller Name:
                  </TableCell>

                  <TableCell align='right'>{data?.buying?.seller_name}</TableCell>
                </TableRow>
              </>
            )}
            {data?.tracking && (
              <>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    Carrier Name:
                  </TableCell>

                  <TableCell align='right'>{data?.tracking?.fullcarrier?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    Tracking No:
                  </TableCell>

                  <TableCell align='right'>
                    <Link
                      href={`${data?.tracking?.fullcarrier?.prefix}${data?.tracking?.tracking_number}${data?.tracking?.fullcarrier?.suffix}`}
                      target='_blank'
                    >
                      {data?.tracking?.tracking_number}
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    Received by:
                  </TableCell>
                  <TableCell align='right'>{data?.tracking?.signed}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row'>
                    ETA:
                  </TableCell>

                  <TableCell align='right'>{data?.tracking?.eta_date}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <PurchaseDetailVerified
        session={session}
        pk={data?.buying?.pk}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
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
    pageSize: 100
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
      const fetchURL = new URL('/leads_sales_items/', 'https://cheapr.my.id')
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
      fetchURL.searchParams.set('returned', 'true')
      fetchURL.searchParams.set('refunded', 'false')
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

      {
        tabActive == 'no_tracking' && fetchURL.searchParams.set('no_return_tracking', 'true')
      }
      {
        tabActive == 'not_moving' && fetchURL.searchParams.set('return_tracking_status', 'N')
      }
      {
        tabActive == 'delivered' && fetchURL.searchParams.set('return_tracking_status', 'D')
      }
      {
        tabActive == 'in_transit' && fetchURL.searchParams.set('return_tracking_status', 'T')
      }
      {
        tabActive == 'issue' && fetchURL.searchParams.set('return_tracking_status', 'I')
      }

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
  const [tableData, setTableData] = useState<LeadsSalesItems[]>(() => data?.results ?? [])
  const [csData, setCsData] = useState<CustomerService[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [purchaseInfoModalOpen, setPurchaseInfoModalOpen] = useState(false)
  const [pInfo, setpInfo] = useState<{ buying: BuyingOrder; tracking: Tracking }>()
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [correspondenceModalOpen, setCorrespondenceModalOpen] = useState(false)
  const [correspondenceId, setCorrespondenceId] = useState<number>()
  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
  }
  const handleCreateNewRow = (values: LeadsSalesItems) => {
    console.log(values)
    const new_obj: any = { ...values }

    console.log(new_obj)
    fetch(`https://cheapr.my.id/leads_sales_items/`, {
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

  const handleSaveCell = (cell: MRT_Cell<LeadsSalesItems>, value: any) => {
    const key = cell.column.id
    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: any = {}
    if (key === 'selling.person.phone') {
      payload['phone'] = value
      const pk = newData[cell.row.index]['selling']['person']['pk']

      console.log(payload)
      fetch(`https://cheapr.my.id/person/${pk}/`, {
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
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof LeadsSalesItems] = value
      const pk = newData[cell.row.index]['pk']

      console.log(payload)
      fetch(`https://cheapr.my.id/leads_sales_items/${pk}/`, {
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
  }

  const columns = useMemo<MRT_ColumnDef<LeadsSalesItems>[]>(
    () => [
      {
        accessorKey: 'tracking.status',
        header: 'SHIPPED',
        maxSize: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.tracking ? (
              <Link
                href='#'
                onClick={() => {
                  setpInfo({ buying: row.original.item?.buying, tracking: row.original.tracking })
                  setPurchaseInfoModalOpen(true)
                }}
              >
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color='inherit'>Carrier: {row.original.tracking?.fullcarrier?.name}</Typography>
                      <Typography color='inherit'>Trx No: {row.original.tracking?.tracking_number}</Typography>
                      <Typography color='inherit'>ETA: {row.original.tracking?.eta_date}</Typography>
                      <Typography color='inherit'>Received by: {row.original.tracking?.signed}</Typography>
                    </React.Fragment>
                  }
                >
                  <Box
                    sx={theme => ({
                      backgroundColor:
                        row.original.tracking.status == 'D'
                          ? theme.palette.success.dark
                          : row.original.tracking.status == 'T'
                          ? theme.palette.warning.light
                          : row.original.tracking.status == 'I'
                          ? 'purple'
                          : theme.palette.error.dark,
                      borderRadius: '0.5rem',
                      color: '#fff',
                      width: 15,
                      height: 15
                    })}
                  ></Box>
                </HtmlTooltip>
              </Link>
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
            {row.original.salesitem_replaced?.tracking ? (
              <Link
                href='#'
                onClick={() => {
                  setpInfo({ buying: row.original.item?.buying, tracking: row.original.salesitem_replaced?.tracking })
                  setPurchaseInfoModalOpen(true)
                }}
              >
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color='inherit'>
                        Carrier: {row.original.salesitem_replaced?.tracking?.fullcarrier?.name}
                      </Typography>
                      <Typography color='inherit'>
                        Trx No: {row.original.salesitem_replaced?.tracking?.tracking_number}
                      </Typography>
                      <Typography color='inherit'>
                        ETA: {row.original.salesitem_replaced?.tracking?.eta_date}
                      </Typography>
                    </React.Fragment>
                  }
                >
                  <Box
                    sx={theme => ({
                      backgroundColor:
                        row.original.salesitem_replaced?.tracking.status == 'D'
                          ? theme.palette.success.dark
                          : row.original.tracking.status == 'T'
                          ? theme.palette.warning.light
                          : row.original.tracking.status == 'I'
                          ? 'purple'
                          : theme.palette.error.dark,
                      borderRadius: '0.5rem',
                      color: '#fff',
                      width: 15,
                      height: 15
                    })}
                  ></Box>
                </HtmlTooltip>
              </Link>
            ) : (
              <></>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'selling.seller_name',
        header: 'STORE',
        maxSize: 50,
        enableEditing: false
      },
      {
        accessorKey: 'selling.channel_order_id',
        header: 'ORDER',
        maxSize: 50,
        enableEditing: false,
        Cell: ({ row }) => (
          <Link
            href='#'
            onClick={() => {
              setDetail(row.original.selling.pk)
              setDetailModalOpen(true)
            }}
          >
            {row.original.selling?.channel_order_id}
          </Link>
        )
      },

      {
        accessorKey: 'sku.sku',
        header: 'ITEM INFO',
        maxSize: 50,
        enableEditing: false
      },
      {
        accessorKey: 'sub_sku.sku',
        header: 'SUBBED',
        maxSize: 50,
        enableEditing: false
      },

      {
        accessorKey: 'selling.person.name',
        header: 'CUSTOMER',
        size: 100,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {row.original.selling?.person?.name && (
              <Typography variant='body2'>{row.original.selling?.person?.name}</Typography>
            )}
            {row.original.selling?.person?.address?.street_1 && (
              <Typography variant='body2'>{row.original.selling?.person?.address?.street_1}</Typography>
            )}

            <Typography variant='body2'>{`${
              row.original.selling?.person?.address?.city?.name ? row.original.selling?.person?.address?.city?.name : ''
            } ${
              row.original.selling?.person?.address?.city?.state?.name
                ? row.original.selling?.person?.address?.city?.state?.name
                : ''
            } ${
              row.original.selling?.person?.address?.zip ? row.original.selling?.person?.address?.zip : ''
            }`}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'selling.person.phone',
        header: 'CONTACT',
        size: 100
      },
      {
        accessorKey: 'total_cost',
        header: 'GROSS SALE',
        maxSize: 50,
        enableEditing: false
      },
      {
        accessorKey: 'rma_date',
        header: 'RMA DATE',
        maxSize: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original.rma_date ? moment(row.original.rma_date).tz('America/Los_Angeles').format('MM-DD-YY') : ''}
          </Box>
        )
      },
      {
        accessorKey: 'salesitem_return',
        header: 'RETURNED',
        maxSize: 50,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {row.original.salesitem_return?.tracking ? (
              <Link
                href={`${row.original.salesitem_return?.tracking?.fullcarrier?.prefix}${row.original.salesitem_return?.tracking?.tracking_number}${row.original.salesitem_return?.tracking?.fullcarrier?.suffix}`}
                target='_blank'
              >
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color='inherit'>
                        Carrier: {row.original.salesitem_return?.tracking?.fullcarrier?.name}
                      </Typography>
                      <Typography color='inherit'>
                        Trx No: {row.original.salesitem_return?.tracking?.tracking_number}
                      </Typography>
                      <Typography color='inherit'>ETA: {row.original.salesitem_return?.tracking?.eta_date}</Typography>
                    </React.Fragment>
                  }
                >
                  <Box
                    sx={theme => ({
                      backgroundColor:
                        row.original.salesitem_return?.tracking?.status == 'D'
                          ? theme.palette.success.dark
                          : row.original.salesitem_return?.tracking?.status == 'T'
                          ? theme.palette.warning.light
                          : row.original.salesitem_return?.tracking?.status == 'I'
                          ? 'purple'
                          : theme.palette.error.dark,
                      borderRadius: '0.5rem',
                      color: '#fff',
                      width: 15,
                      height: 15
                    })}
                  ></Box>
                </HtmlTooltip>
              </Link>
            ) : (
              <Box
                sx={theme => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 12,
                  height: 12
                })}
              ></Box>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'refunded',
        header: 'REFUNDED',
        size: 70
      },

      {
        accessorKey: 'comment',
        header: 'NOTES',
        size: 70
      },
      {
        id: 'cs_comment',
        header: 'CORRESPONDENCE',
        size: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Link
            href='#'
            onClick={() => {
              setCorrespondenceId(row.original.pk)
              setCorrespondenceModalOpen(true)
            }}
          >
            Show
          </Link>
        )
      }
    ],
    [tableData]
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
        enableSorting={false}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement='right' title='Copy to Leads'>
              <IconButton
                color='primary'
                onClick={() => {
                  if (
                    !confirm(`Are you sure you copy this item to leads #${row.original?.selling?.channel_order_id}`)
                  ) {
                    return
                  }
                  fetch(`https://cheapr.my.id/sales_items/${row.original.pk}/`, {
                    method: 'PATCH',
                    headers: new Headers({
                      Authorization: `Bearer ${session?.accessToken}`,
                      'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify({ leads: true })
                  })
                    .then(response => response.json())
                    .then(json => {
                      console.log(json)
                    })
                    .finally(() => setRefresh(r => r + 1))
                }}
              >
                <AttributionIcon />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='right' title='Archive'>
              <IconButton
                color='error'
                onClick={() => {
                  if (!confirm(`Are you sure you archive this item #${row.original?.selling?.channel_order_id}`)) {
                    return
                  }
                  fetch(`https://cheapr.my.id/sales_items/${row.original.pk}/`, {
                    method: 'PATCH',
                    headers: new Headers({
                      Authorization: `Bearer ${session?.accessToken}`,
                      'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify({ leads: false })
                  })
                    .then(response => response.json())
                    .then(json => {
                      console.log(json)
                    })
                    .finally(() => setRefresh(r => r + 1))
                }}
              >
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Select labelId='demo-select-small-label' id='demo-select-small' value={tabActive} onChange={handleChange}>
            <MenuItem value={'all'}>All</MenuItem>
            <MenuItem value={'not_moving'}>Not Moving</MenuItem>
            <MenuItem value={'no_tracking'}>No-Tracking</MenuItem>
            <MenuItem value={'in_transit'}>In Transit</MenuItem>
            <MenuItem value={'delivered'}>Delivered</MenuItem>
            <MenuItem value={'issue'}>Issue</MenuItem>
          </Select>
        )}
        editDisplayMode='cell'
        muiEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        enableStickyHeader
        enableStickyFooter
        manualFiltering
        manualPagination
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
        positionActionsColumn='last'
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
          showProgressBars: isFetching
        }}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        session={session}
        reload={() => setRefresh(r => r + 1)}
      />
      <SalesDetail
        session={session}
        pk={detail}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      <PurchaseDetailModal
        open={purchaseInfoModalOpen}
        onClose={() => {
          setPurchaseInfoModalOpen(false)
          setpInfo(undefined)
        }}
        data={pInfo}
        session={session}
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

const ReturnedNotRefundedLeads = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default ReturnedNotRefundedLeads
