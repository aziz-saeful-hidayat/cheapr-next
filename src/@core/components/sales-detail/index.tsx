import React, { useEffect, useMemo, useState, useCallback } from 'react'
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MaterialReactTableProps,
  MRT_Row
} from 'material-react-table'
import Chip from '@mui/material/Chip'
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
  MenuItem,
  Modal,
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import Card from '@mui/material/Card'
import Popover from '@mui/material/Popover'
import { Delete, ContentCopy } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import { formatterUSD } from 'src/constants/Utils'
import CardOrder from 'src/views/cards/CardOrder'
import Select, { SelectChangeEvent } from '@mui/material/Select'

type InventoryItem = {
  [key: string]: any
}
type Payload = {
  pk?: number
  selling?: number
  product?: CAProduct
  status?: string
  serial?: string
  comment?: string
  room?: number
  total_cost?: number
  shipping_cost?: number
}
type CAProduct = {
  pk: number
  sku: string
  mpn: string
  make: string
  model: string
  asin: string
}
type InventoryPayload = {
  item: number
  selling: number
}
type Room = {
  pk: number
  name: string
  room_id: string
}
type Rating = {
  pk: number
  name: string
  color: string
}
type Item = {
  pk: number
  selling: number
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
type ItemOption = {
  pk: number
  buying: number
  selling: number
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
  room: {
    pk: number
    name: string
    room_id: string
  }
  total_cost: string
  shipping_cost: string
}

export type SellingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  channel: {
    pk: number
    name: string
    image: string
  }
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
}

interface CreateModalProps {
  columns: MRT_ColumnDef<InventoryPayload>[]
  onClose: () => void
  onSubmit: (values: InventoryPayload) => void
  purchaseId: string
  open: boolean
  roomData: Room[]
  ratingData: Rating[]
  session: ExtendedSession
  mpnToAdd: string
}

interface DeleteModalProps {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  data: any
}
export const AddItemModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  purchaseId,
  roomData,
  session,
  mpnToAdd
}: CreateModalProps) => {
  const [values, setValues] = useState<any>()
  const handleChange = (event: SelectChangeEvent) => {
    setValues(event.target.value as string)
  }
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit({ item: values, selling: parseInt(purchaseId) })

    onClose()
  }
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0
  useEffect(() => {
    fetch(
      `https://cheapr.my.id/inventory_items/?inventory=true&incoming=false&product_mpn=${mpnToAdd}&ordering=serial`,
      {
        // note we are going to /1
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => response.json())
      .then(json => {
        setOptions(json.results)
      })
  }, [mpnToAdd, session])
  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Add Item</DialogTitle>
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
            <Select labelId='demo-select-small-label' id='demo-select-small' value={values} onChange={handleChange}>
              {options.length > 0 ? (
                options.map(item => (
                  <MenuItem value={item.pk}>
                    {item.product.sku} {item.serial}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={''}>No Macthing MPN in Inventory</MenuItem>
              )}
            </Select>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='primary' onClick={handleSubmit} variant='contained'>
          Add
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
const SalesDetail = (props: any) => {
  const { session, pk, modalOpen, onClose } = props
  // const { data, isError, isFetching, isLoading } = useQuery({
  //   queryKey: [
  //     'table-data',
  //     columnFilters, //refetch when columnFilters changes
  //     globalFilter, //refetch when globalFilter changes
  //     pagination.pageIndex, //refetch when pagination.pageIndex changes
  //     pagination.pageSize, //refetch when pagination.pageSize changes
  //     sorting //refetch when sorting changes
  //   ],
  //   queryFn: async () => {
  //     const fetchURL = new URL('/inventory_items/', 'https://cheapr.my.id')
  //     fetchURL.searchParams.set('limit', `${pagination.pageSize}`)
  //     fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`)
  //     fetchURL.searchParams.set('selling_pk', typeof purchaseId == 'string' ? purchaseId : '')
  //     for (let f = 0; f < columnFilters.length; f++) {
  //       const filter = columnFilters[f]
  //       if (filter.id == 'product.sku') {
  //         fetchURL.searchParams.set('product', typeof filter.value === 'string' ? filter.value : '')
  //       } else {
  //         fetchURL.searchParams.set(filter.id, typeof filter.value === 'string' ? filter.value : '')
  //       }
  //     }
  //     fetchURL.searchParams.set('search', globalFilter ?? '')
  //     let ordering = ''
  //     for (let s = 0; s < sorting.length; s++) {
  //       const sort = sorting[s]
  //       if (s !== 0) {
  //         ordering = ordering + ','
  //       }
  //       if (sort.desc) {
  //         ordering = ordering + '-'
  //       }
  //       ordering = ordering + sort.id
  //     }
  //     fetchURL.searchParams.set('ordering', ordering)
  //     console.log(fetchURL.href)
  //     const response = await fetch(fetchURL.href, {
  //       method: 'get',
  //       headers: new Headers({
  //         Authorization: `Bearer ${session?.accessToken}`,
  //         'Content-Type': 'application/json'
  //       })
  //     })
  //     const json = await response.json()

  //     return json
  //   },
  //   keepPreviousData: true
  // })
  const [orderData, setOrderData] = useState<SellingOrder>()

  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [itemToEdit, setItemToEdit] = useState('')
  const [mpnToAdd, setMpnToAdd] = useState('')

  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'sku.sku',
        header: 'SKU',
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) =>
          row.original.sku ? (
            <div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                {/* <img
                  aria-owns={open ? 'mouse-over-popover' : undefined}
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  alt='avatar'
                  height={30}
                  src={'/images/no_image.png'}
                  loading='lazy'
                /> */}
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            </div>
          ) : (
            <></>
          )
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        maxSize: 100,
        Cell: ({ renderedCellValue, row }) =>
          row.original.serial ? (
            <div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onClick={() => {
                  setItemToEdit(row.original.salesitem_pk)
                  setMpnToAdd(row.original.sku.mpn)
                  console.log(row.original.sku.mpn)
                  setCreateModalOpen(true)
                }}
              >
                {/* <img
                aria-owns={open ? 'mouse-over-popover' : undefined}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                alt='avatar'
                height={30}
                src={'/images/no_image.png'}
                loading='lazy'
              /> */}
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            </div>
          ) : row.original.inventory ? (
            <Chip
              sx={{
                fontSize: 10
              }}
              label='Pick Item'
              onClick={() => {
                setItemToEdit(row.original.salesitem_pk)
                setMpnToAdd(row.original.sku.mpn)
                console.log(row.original.sku.mpn)
                setCreateModalOpen(true)
              }}
            />
          ) : (
            <Chip
              sx={{
                fontSize: 10
              }}
              label='Not in Inventory'
            />
          )
      },
      {
        accessorKey: 'room.name',
        header: 'Room',
        size: 200,
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
        maxSize: 70,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: ratingData?.map(rating => (
            <MenuItem key={rating.pk} value={rating.name}>
              <Box
                component='span'
                sx={theme => ({
                  backgroundColor: rating.color ?? theme.palette.success.dark,
                  borderRadius: '0.25rem',
                  color: '#fff',
                  maxWidth: '9ch',
                  p: '0.25rem'
                })}
              >
                {rating.name}
              </Box>
            </MenuItem>
          ))
        },
        Cell: ({ renderedCellValue, row }) => {
          if (row.original.rating) {
            return (
              <Box
                component='span'
                sx={theme => ({
                  backgroundColor: row.original.rating.color ?? theme.palette.success.dark,
                  borderRadius: '0.25rem',
                  color: '#fff',
                  maxWidth: '9ch',
                  p: '0.25rem'
                })}
              >
                {renderedCellValue}
              </Box>
            )
          } else {
            return <></>
          }
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
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{renderedCellValue && formatterUSD.format(row.original.total_cost)}</Box>
        )
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{formatterUSD.format(row.original.shipping_cost)}</Box>
        )
      }
    ],
    [roomData, ratingData, open]
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
  }, [session])
  useEffect(() => {
    if (!modalOpen) {
      return
    }
    fetch(`https://cheapr.my.id/selling_order/${pk}/`, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setOrderData(json)
        json?.salesitems &&
          setTableData(
            json?.salesitems.map((item: any) => {
              return { ...item.item, salesitem_pk: item.pk, sku: item.sku, inventory: item.inventory }
            })
          )
        console.log(tableData)
      })
  }, [session, pk, modalOpen])
  // useEffect(() => {
  //   if (modalOpen == false) {
  //     setTableData([])
  //   }
  // }, [modalOpen])
  const handleSaveRow: MaterialReactTableProps<InventoryItem>['onEditingRowSave'] = async ({
    exitEditingMode,
    row,
    values
  }) => {
    delete values['product.sku']
    fetch(`https://cheapr.my.id/inventory_items/${row.original.pk}/`, {
      // note we are going to /1
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
          exitEditingMode() //required to exit editing mode
        }
      })
  }
  const handleDeleteRow = useCallback(
    (row: MRT_Row<InventoryItem>) => {
      if (!confirm(`Are you sure you want to delete Item #${row.index + 1} ${row.original.product.sku}`)) {
        return
      }
      const newValues = { item: null }
      console.log(tableData)
      fetch(`https://cheapr.my.id/sales_items/${row.original.salesitem_pk}/`, {
        // note we are going to /1
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newValues)
      })
        .then(response => response.status)
        .then(status => {
          if (status == 204) {
            console.log(tableData)
            tableData.splice(row.index, 1)
            console.log(tableData)
            setTableData([...tableData])
          }
        })
    },
    [tableData]
  )
  const handleSaveCell = (cell: MRT_Cell<InventoryItem>, value: any) => {
    const key = cell.column.id
    const rowIdx = cell.row.index
    const payload: InventoryItem = {}
    const oldData = [...tableData]
    const newData: any = [...tableData]
    payload[key] = value
    if (key === 'room.name') {
      const room = roomData.find(room => room.name == value)
      payload['room'] = room?.pk
      newData[cell.row.index]['room'] = room
    } else if (key === 'rating.name') {
      const rating = ratingData.find(rating => rating.name == value)
      payload['rating'] = rating?.pk
      newData[cell.row.index]['rating'] = rating
    } else {
      payload[key as keyof Payload] = value === '' ? null : value
      newData[cell.row.index][cell.column.id as keyof InventoryItem] = value
    }

    newData[cell.row.index][cell.column.id as keyof Item] = value
    setTableData([...newData])
    fetch(`https://cheapr.my.id/inventory_items/${cell.row.original.pk}/`, {
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
        }
      })
  }
  const handleAddItem = (values: InventoryPayload) => {
    const newValues = { item: values.item }
    console.log(newValues)
    fetch(`https://cheapr.my.id/sales_items/${itemToEdit}`, {
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
          let newTable = tableData.map(item => (item.selling.toString() === itemToEdit ? { ...json } : item))
          // if (orderData) {
          //   setOrderData({
          //     ...orderData,
          //     salesitems: [json, ...orderData?.salesitems]
          //   } as SellingOrder)
          // }
          setTableData(newTable)
          console.log(newTable)
        }
      })
  }
  const columnsItem = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product.sku',
        header: 'SKU',
        size: 150,
        enableEditing: false
      },
      {
        accessorKey: 'serial',
        header: 'Serial',
        size: 70
      },

      {
        accessorKey: 'total_cost',
        header: 'Total',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 70,
        muiTableBodyCellEditTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 250
      }

      //end
    ],
    []
  )
  const columnsAddItem = useMemo<MRT_ColumnDef<InventoryPayload>[]>(
    () => [
      {
        accessorKey: 'item',
        header: 'SKU',
        size: 150
      }
    ],
    []
  )

  return (
    <Modal
      open={modalOpen}
      onClose={onClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
      sx={{ padding: 10, overflow: 'scroll' }}
    >
      <>
        <CardOrder orderData={orderData} type={'sales'} />
        <Card sx={{ padding: 3 }}>
          <MaterialReactTable
            columns={columns}
            initialState={{ showColumnFilters: false }}
            enableEditing={false}
            enableRowNumbers
            editingMode='cell'
            onEditingRowSave={handleSaveRow}
            muiTableBodyCellEditTextFieldProps={({ cell }) => ({
              //onBlur is more efficient, but could use onChange instead
              onBlur: event => {
                handleSaveCell(cell, event.target.value)
              }
            })}
            manualFiltering
            manualPagination
            manualSorting
            data={tableData}
            enableRowActions
            positionActionsColumn='last'
            renderTopToolbarCustomActions={() => (
              <>
                {/* <Tooltip arrow title='Refresh Data'>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip> */}
                <Button color='primary' onClick={() => setCreateModalOpen(true)} variant='contained'>
                  Add Item
                </Button>
              </>
            )}
            renderRowActions={({ row, table }) => (
              <Box sx={{ display: 'flex' }}>
                <Tooltip arrow placement='top' title='Delete'>
                  <IconButton color='error' onClick={() => handleDeleteRow(row)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          />
        </Card>
        <AddItemModal
          columns={columnsAddItem}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleAddItem}
          purchaseId={pk}
          roomData={roomData}
          ratingData={ratingData}
          session={session}
          mpnToAdd={mpnToAdd}
        />
        <Popover
          id='mouse-over-popover'
          sx={{
            pointerEvents: 'none'
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <img alt='avatar' height={250} src={'/images/no_image.png'} loading='lazy' />
        </Popover>
      </>
    </Modal>
  )
}

export default SalesDetail
