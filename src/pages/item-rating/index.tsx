import Typography from '@mui/material/Typography'
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
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { withAuth } from 'src/constants/HOCs'
import Card from '@mui/material/Card'

type ItemRating = {
  pk: number
  name: string
  color: string
}

type Payload = {
  pk?: number
  name?: string
  color?: string
}

interface CreateModalProps {
  columns: MRT_ColumnDef<ItemRating>[]
  onClose: () => void
  onSubmit: (values: ItemRating) => void
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
      <DialogTitle textAlign='center'>Create New Item Rating</DialogTitle>
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
      const fetchURL = new URL('/item_rating/', 'https://cheapr.my.id')
      fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
      fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
      for (let f = 0; f < columnFilters.length; f++) {
        const filter = columnFilters[f]
        fetchURL.searchParams.set(filter.id, typeof filter.value === 'string' ? filter.value : '')
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
  const [tableData, setTableData] = useState<ItemRating[]>([])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [rowDel, setRowDel] = useState<number>()

  const handleCreateNewRow = (values: ItemRating) => {
    console.log(values)
    fetch(`https://cheapr.my.id/item_rating/`, {
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

  const handleSaveCell = (cell: MRT_Cell<ItemRating>, value: any) => {
    const key = cell.column.id
    const oldData = [...tableData]
    const newData: any = [...tableData]
    newData[cell.row.index][cell.column.id as keyof ItemRating] = value
    const pk = newData[cell.row.index]['pk']
    const payload: Payload = {}
    payload[key as keyof ItemRating] = value
    setTableData([...newData])

    fetch(`https://cheapr.my.id/item_rating/${pk}/`, {
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
  const columns = useMemo<MRT_ColumnDef<ItemRating>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      },
      {
        accessorKey: 'color',
        header: 'Color'
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
    data?.results && setTableData(data?.results ?? [])
  }, [data])

  return (
    <Card sx={{ padding: 3 }}>
      <MaterialReactTable
        columns={columns}
        data={tableData} //data is undefined on first render
        initialState={{ showColumnFilters: true, density: 'compact' }}
        enableEditing
        editingMode='cell'
        muiTableBodyCellEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        renderBottomToolbarCustomActions={() => (
          <Typography sx={{ fontStyle: 'italic', p: '0 1rem' }} variant='body2'>
            Double-Click a Cell to Edit
          </Typography>
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
              Create New Item Rating
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
        data={typeof rowDel == 'number' ? tableData[rowDel]['name'] : ''}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const ItemRating = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)

export default withAuth(3 * 60)(ItemRating)
