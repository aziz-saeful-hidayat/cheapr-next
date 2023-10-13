import React, { useEffect, useMemo, useState } from 'react'
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState
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
  Tooltip
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { withAuth } from 'src/constants/HOCs'
import Card from '@mui/material/Card'
import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import CloseIcon from '@mui/icons-material/Close'
import { formatterUSDStrip } from 'src/constants/Utils'
import {
  BuyingOrder,
  Channel,
  Manager,
  Carrier,
  Room,
  CAProduct,
  Person,
  InventoryPayload,
  InventoryItem,
  Rating,
  Item
} from 'src/@core/types'

type Payload = {
  pk?: number
  buying?: number
  product?: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
  }
  status?: string
  serial?: string
  comment?: string
  room?: number
  rating?: number
  total_cost?: number
  shipping_cost?: number
}

interface CreateModalProps {
  columns: MRT_ColumnDef<Item>[]
  onClose: () => void
  onSubmit: (values: Item) => void
  open: boolean
}

interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
}
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }: CreateModalProps) => {
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
            {columns.map(column => (
              <TextField
                key={column.accessorKey}
                label={column.header}
                name={column.accessorKey}
                onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            ))}
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
      const fetchURL = new URL('/inventory_items/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('inventory', 'true')

      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
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
      console.log(sorting)
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
  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [managerData, setManagerData] = useState<Manager[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [rowDel, setRowDel] = useState<number>()
  const [tabActive, setTabActive] = useState('all')

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
    if (event.target.value == 'all') {
      setColumnFilters([])
    } else {
      setColumnFilters([{ id: 'room', value: event.target.value }])
    }
  }
  const handleCreateNewRow = (values: Item) => {
    console.log(values)
    fetch(`https://cheapr.my.id/inventory_items/`, {
      method: 'POST',
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
          tableData.unshift(json)
          setTableData([...tableData])
        }
      })
  }

  const handleDeleteRow = (row: number) => {
    setRowDel(undefined)
    const newData: any = [...tableData]
    newData.splice(row, 1)
    setTableData([...newData])
  }

  const handleSaveCell = (cell: MRT_Cell<Item>, value: any) => {
    const key = cell.column.id
    const channel = roomData?.find(room => room.name == value)
    const rating = ratingData?.find(rating => rating.name == value)

    console.log(key, value)
    const oldData = [...tableData]
    const newData: any = [...tableData]
    const payload: Payload = {}
    if (key === 'room.name') {
      payload['room'] = channel?.pk
      newData[cell.row.index]['room'] = channel
    } else if (key === 'rating.name') {
      payload['rating'] = rating?.pk
      newData[cell.row.index]['rating'] = rating
    } else {
      payload[key as keyof Payload] = value
      newData[cell.row.index][cell.column.id as keyof Item] = value
    }
    const pk = newData[cell.row.index]['pk']

    setTableData([...newData])
    console.log(payload)
    fetch(`https://cheapr.my.id/inventory_items/${pk}/`, {
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(json => {
        if (json[key] !== value) {
          setTableData([...oldData])
        }
      })
  }
  const columns = useMemo<MRT_ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'product.mpn',
        header: 'MPN',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'product.make',
        header: 'MAKE',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'product.model',
        header: 'MODEL',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        size: 75
      },
      {
        id: 'item',
        accessorFn: row =>
          row.product ? `${row.product?.make} - ${row.product?.model} - ${row.product?.mpn}` : row.title,
        header: 'ITEM',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'buying.sales.order_id',
        header: 'TYPE',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'buying.order_date',
        header: 'P.DATE',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'buying.order_date',
        header: 'R.DATE',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'buying.order_date',
        header: 'RET.WIN',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'buying.order_date',
        header: 'RET.WIN',
        enableEditing: false,
        size: 75
      },
      {
        id: 'source',
        header: 'Source',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: channelData?.map(channel => (
            <MenuItem key={channel.pk} value={channel.name}>
              {channel.name}
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>{channelData.find(c => c.pk == row.original.buying.channel)?.name}</span>
          </Box>
        )
      },
      {
        accessorKey: 'buying.channel_order_id',
        header: 'P.O',
        size: 75
      },
      {
        accessorKey: 'buying.seller.name',
        header: 'VENDOR',
        size: 75
      },
      {
        accessorKey: 'room.name',
        header: 'LOC',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: roomData?.map(room => (
            <MenuItem key={room.pk} value={room.name}>
              {room.name}
            </MenuItem>
          ))
        }
      },
      {
        accessorKey: 'comment',
        header: 'COMMENTS',
        size: 200
      },
      {
        accessorKey: 'itemsales.manager.name',
        accessorFn: row =>
          ['Holding Area', 'Approval'].includes(row.itemsales?.manager?.name) ? '' : row.itemsales?.manager?.name,
        header: 'PURCHASER',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: managerData?.map(manager => (
            <MenuItem key={manager.pk} value={manager.name}>
              {manager.name}
            </MenuItem>
          ))
        }
      },
      {
        accessorKey: 'total_cost',
        header: 'ITM.COST',
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.total_cost)}</Box>,
        size: 75
      },
      {
        accessorKey: 'shipping_cost',
        header: 'LABEL',
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.shipping_cost)}</Box>
        ),
        size: 75
      },
      {
        accessorKey: 'all_cost',
        header: 'TTL.COST',
        Cell: ({ renderedCellValue, row }) => <Box component='span'>{formatterUSDStrip(row.original.all_cost)}</Box>,
        size: 75
      },
      {
        accessorKey: 'itemsales.selling.channel_order_id',
        header: 'S.O',
        size: 75
      },
      {
        accessorKey: 'itemsales.selling.seller_name',
        header: 'STORE',
        size: 75
      },
      {
        accessorKey: 'itemsales.selling.gross_sales',
        header: 'NET.SALE',
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.itemsales?.selling?.gross_sales)}</Box>
        ),
        size: 75
      },
      {
        accessorKey: 'itemsales.selling.ss_shipping_cost',
        header: 'LABEL',
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.itemsales?.selling?.ss_shipping_cost)}</Box>
        ),
        size: 75
      },
      {
        accessorKey: 'itemsales.selling.profit',
        header: 'PROFIT',
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSDStrip(row.original.itemsales?.selling?.profit)}</Box>
        ),
        muiTableBodyCellProps: ({ cell, table }) => {
          if (cell.row?.original?.itemsales?.selling?.profit && cell.row?.original?.itemsales?.selling?.profit < 0) {
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
        size: 75
      }
    ],
    [roomData, ratingData, channelData, managerData]
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
    const fetchChannelURL = new URL('/channel/', 'https://cheapr.my.id')
    fetch(fetchChannelURL.href, {
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

    const fetchManagerlURL = new URL('/manager/', 'https://cheapr.my.id')
    fetch(fetchManagerlURL.href, {
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
  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 100
    })
  }, [sorting, globalFilter, columnFilters])
  useEffect(() => {
    data?.results && setTableData(data?.results ?? [])
  }, [data])

  return (
    <Card sx={{ padding: 3 }}>
      <MaterialReactTable
        columns={columns}
        data={tableData} //data is undefined on first render
        initialState={{ showColumnFilters: false, density: 'compact' }}
        enableEditing
        editingMode='cell'
        muiTableBodyCellEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        renderTopToolbarCustomActions={() => (
          <>
            {/* <Tooltip arrow title='Refresh Data'>
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip> */}
            <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
              Create New Item
            </Button>
            <Select labelId='demo-select-small-label' id='demo-select-small' value={tabActive} onChange={handleChange}>
              <MenuItem value={'all'}>All</MenuItem>
              {roomData?.map(room => (
                <MenuItem value={room.name} key={`menu-${room.pk}`}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
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
        enableRowActions
        positionActionsColumn='last'
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
                  setRowDel(row.index)
                  setDeleteModalOpen(true)
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
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
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSubmit={() => typeof rowDel == 'number' && handleDeleteRow(rowDel)}
        data={typeof rowDel == 'number' ? tableData[rowDel]['serial'] : ''}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const Inventory = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)
export default Inventory
