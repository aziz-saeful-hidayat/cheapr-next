import React, { useEffect, useMemo, useState } from 'react'
import {
  MaterialReactTable,
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
  Link,
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
  AgingSummary
} from 'src/@core/types'
import PurchaseDetailVerified from 'src/@core/components/purchase-detai-verified'

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
  columns: MRT_ColumnDef<AgingSummary>[]
  onClose: () => void
  onSubmit: (values: AgingSummary) => void
  open: boolean
}

interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
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
      const fetchURL = new URL('/aging_summary/', 'https://cheapr.my.id')
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
  const [tableData, setTableData] = useState<AgingSummary[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [managerData, setManagerData] = useState<Manager[]>([])
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [rowDel, setRowDel] = useState<number>()
  const [tabActive, setTabActive] = useState('all')

  const handleChange = (event: SelectChangeEvent) => {
    setTabActive(event.target.value as string)
    if (event.target.value == 'all') {
      setColumnFilters([])
    } else if (event.target.value == 'buffer') {
      setColumnFilters([{ id: 'buffer', value: 'true' }])
    } else {
      setColumnFilters([{ id: 'room', value: event.target.value }])
    }
  }
  const handleCreateNewRow = (values: AgingSummary) => {
    console.log(values)
    fetch(`https://cheapr.my.id/aging_summary/`, {
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

  const handleSaveCell = (cell: MRT_Cell<AgingSummary>, value: any) => {
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
      newData[cell.row.index][cell.column.id as keyof AgingSummary] = value
    }
    const pk = newData[cell.row.index]['pk']

    setTableData([...newData])
    console.log(payload)
    fetch(`https://cheapr.my.id/aging_summary/${pk}/`, {
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
  const columns = useMemo<MRT_ColumnDef<AgingSummary>[]>(
    () => [
      {
        accessorKey: '.pn',
        header: 'MPN',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'make',
        header: 'MAKE',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'model',
        header: 'MODEL',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'under_30_days',
        header: '0 - 30D',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'between_30_60_days',
        header: '31-60D',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'between_60_90_days',
        header: '61-90D',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'between_90_180_days',
        header: '91-180D',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'between_180_365_days',
        header: '181-365D',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'more_365_days',
        header: 'Above 1Y',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'qty',
        header: 'Total Qty',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'sum',
        header: 'Total Value',
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: 'avg',
        header: 'Avg. Rate',
        enableEditing: false,
        size: 75
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
        initialState={{ showColumnFilters: false, density: 'compact' }}
        enableEditing
        editDisplayMode='cell'
        muiEditTextFieldProps={({ cell }) => ({
          //onBlur is more efficient, but could use onChange instead
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        // renderTopToolbarCustomActions={() => (
        //   <>
        //     <Select labelId='room-label' id='room-small' value={tabActive} onChange={handleChange}>
        //       <MenuAgingSummary value={'all'}>All</MenuAgingSummary>
        //       {roomData?.map(room => (
        //         <MenuAgingSummary value={room.name} key={`menu-${room.pk}`}>
        //           {room.name}
        //         </MenuAgingSummary>
        //       ))}
        //     </Select>
        //   </>
        // )}
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
      <PurchaseDetailVerified
        session={session}
        pk={detail}
        modalOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </Card>
  )
}

const queryClient = new QueryClient()

const AgingSummary = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <Example {...props} />
  </QueryClientProvider>
)
export default AgingSummary
