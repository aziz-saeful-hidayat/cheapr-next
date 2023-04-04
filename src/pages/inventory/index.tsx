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
type Room = {
  pk: number
  name: string
  room_id: string
}
type Rating = {
  pk: number
  name: string
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
      <DialogTitle textAlign='center'>Create New Channel</DialogTitle>
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
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='error' onClick={handleSubmit} variant='contained'>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
const Example = () => {
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
      fetchURL.searchParams.set('ordering', ordering)
      console.log(fetchURL.href)
      const response = await fetch(fetchURL.href)
      const json = await response.json()

      return json
    },
    keepPreviousData: true
  })
  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [rowDel, setRowDel] = useState<number>()

  const handleCreateNewRow = (values: Item) => {
    console.log(values)
    fetch(`https://cheapr.my.id/inventory_items/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
        accessorKey: 'product.sku',
        header: 'SKU',
        enableEditing: false
      },
      {
        accessorKey: 'serial',
        header: 'Serial'
      },
      {
        accessorKey: 'room.name',
        header: 'Room',
        size: 150,
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
        accessorKey: 'rating.name',
        header: 'Rating',
        size: 150,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: ratingData?.map(rating => (
            <MenuItem key={rating.pk} value={rating.name}>
              {rating.name}
            </MenuItem>
          ))
        }
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 200
      },
      {
        accessorKey: 'total_cost',
        header: 'Total',
        size: 100
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 100
      }
    ],
    [roomData, ratingData]
  )
  useEffect(() => {
    const fetchURL = new URL('/room/', 'https://cheapr.my.id')
    fetch(fetchURL.href)
      .then(response => response.json())
      .then(json => {
        setRoomData(json.results)
      })
    const fetchRatingURL = new URL('/item_rating/', 'https://cheapr.my.id')
    fetch(fetchRatingURL.href)
      .then(response => response.json())
      .then(json => {
        setRatingData(json.results)
      })
  }, [])
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
    <>
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
        renderBottomToolbarCustomActions={() => (
          <Box sx={{ display: 'flex' }}>
            <Button
              sx={{ marginRight: 2, padding: 1 }}
              color='primary'
              onClick={() => setColumnFilters([])}
              variant='contained'
            >
              All
            </Button>
            <Button
              sx={{ marginRight: 2 }}
              color='primary'
              onClick={() => setColumnFilters([{ id: 'no_room', value: 'true' }])}
              variant='contained'
            >
              Assessment
            </Button>
            {roomData?.map(room => (
              <Button
                key={room.pk}
                sx={{ marginRight: 2 }}
                color='primary'
                onClick={() => setColumnFilters([{ id: 'room', value: room.name }])}
                variant='contained'
              >
                {room.name}
              </Button>
            ))}
          </Box>
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
        renderTopToolbarCustomActions={() => (
          <>
            {/* <Tooltip arrow title='Refresh Data'>
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip> */}
            <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
              Create New Channel
            </Button>
          </>
        )}
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
    </>
  )
}

const queryClient = new QueryClient()

const Inventory = () => (
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
)

export default withAuth(3 * 60)(Inventory)
