import { Block, FindReplace } from '@mui/icons-material'
import { Box, IconButton, Link, MenuItem, Modal, Typography } from '@mui/material'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { MRT_Row, MRT_TableOptions, MaterialReactTable, type MRT_Cell, type MRT_ColumnDef } from 'material-react-table'
import { Close } from 'mdi-material-ui'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { BuyingOrder, Seller } from 'src/@core/types'
import { formatterUSDStrip } from 'src/constants/Utils'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'

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
type Channel = {
  pk: number
  name: string
  image: string
}

type Carrier = {
  pk: number
  name: string
  image: string
  prefix: string
  suffix: string
  suffix2: string
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
  total_cost: string
  shipping_cost: string
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
type DropshipItemOption = {
  pk: number
  name: string
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
  status: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  ss_shipping_cost: number
  channel_fee: number
  purchase_cost: number
  inbound_shipping: number
  purchase_items: number
  all_cost: number
  gross_sales: number
  profit: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
}

interface CreateModalProps {
  columns: MRT_ColumnDef<InventoryItem>[]
  onClose: () => void
  onSubmit: (values: InventoryItem) => void
  purchaseId: string
  open: boolean
  channelData: Channel[]
  session: ExtendedSession
  mpnToAdd: string
  setCreateSKUModalOpen: (arg0: boolean) => void
}

interface DropshipModalProps {
  columns: MRT_ColumnDef<InventoryItem>[]
  onClose: () => void
  onSubmit: (values: InventoryItem) => void
  purchaseId: string
  open: boolean
  channelData: Channel[]
  carrierData: Carrier[]
  session: ExtendedSession
  mpnToAdd: string
  setCreateSellerModalOpen: (arg0: boolean) => void
}

interface AddModalProps {
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

interface CreateSellerProps {
  columns: MRT_ColumnDef<Seller>[]
  onClose: () => void
  onSubmit: (values: Seller) => void
  open: boolean
  session: ExtendedSession
}

interface CreateSKUProps {
  columns: MRT_ColumnDef<CAProduct>[]
  onClose: () => void
  onSubmit: (values: CAProduct) => void
  open: boolean
  session: ExtendedSession
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 400,
    border: '1px solid #dadde9'
  }
}))

const SellerDetail = (props: any) => {
  const { session, pk, modalOpen, onClose } = props
  const [orderData, setOrderData] = useState<Seller>()
  const statusOptions: any[] = [
    { key: 'D', name: 'Delivered', color: 'success' },
    { key: 'T', name: 'Transit', color: 'warning' },
    { key: 'I', name: 'Issue', color: 'error' },
    { key: 'N', name: 'Not Started', color: 'default' }
  ]
  const [tableData, setTableData] = useState<BuyingOrder[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [itemToEdit, setItemToEdit] = useState('')
  const [buyingToEdit, setBuyingToEdit] = useState('')
  const [mpnToAdd, setMpnToAdd] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [carrierData, setCarrierData] = useState<Carrier[]>([])
  const [detail, setDetail] = useState<number | undefined>()
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

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
        header: 'Shipping',
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
          formatterUSDStrip(parseFloat(row.total_sum.toString()) + parseFloat(row.shipping_sum.toString())), //accessorFn used to join multiple data into a single cell
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
      },
      {
        accessorFn: row => (row.destination == 'H' ? 'HA' : row.destination == 'D' ? 'Dropship' : ''), //accessorFn used to join multiple data into a single cell
        id: 'ha_sbo', //id is still required when using accessorFn instead of accessorKey
        header: 'HA / Order ID',
        maxSize: 150,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {row.original.destination == 'H' ? (
              <span>HA</span>
            ) : row.original.destination == 'D' && row.original.inventoryitems.length > 0 ? (
              <Link
                target='_blank'
                rel='noreferrer'
                href={`https://app.sellbrite.com/orders?query=${row.original.inventoryitems[0].itemsales?.selling.order_id}`}
              >
                {row.original.inventoryitems[0].itemsales?.selling.channel_order_id}
              </Link>
            ) : (
              ''
            )}
          </Box>
        )
      }
    ],
    [channelData]
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
  }, [session])
  useEffect(() => {
    if (!modalOpen) {
      return
    }
    setIsFetching(true)
    fetch(`https://cheapr.my.id/buying_order/?seller_pk=${pk}/`, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setTableData(json.results)
        console.log(tableData)
      })
      .finally(() => setIsFetching(false))
  }, [session, pk, modalOpen, refresh])

  const handleSaveRow: MRT_TableOptions<BuyingOrder>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
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

  const handleSaveCell = (cell: MRT_Cell<BuyingOrder>, value: any) => {
    const key = cell.column.id
    const rowIdx = cell.row.index
    const payload: InventoryItem = {}

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
        console.log
      })

    console.log(payload)
  }

  return (
    <Modal
      open={modalOpen}
      onClose={onClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
      sx={{ padding: 10, overflow: 'scroll' }}
    >
      <>
        {/* <CardSeller
          orderData={orderData}
          type={'sales'}
          tableData={tableData}
          onClose={onClose}
          session={session}
          setRefresh={() => setRefresh(r => r + 1)}
        /> */}
        <Card sx={{ padding: 3 }}>
          <MaterialReactTable
            columns={columns}
            initialState={{ showColumnFilters: false, density: 'compact' }}
            enableEditing={true}
            // enableRowNumbers

            editDisplayMode='cell'
            onEditingRowSave={handleSaveRow}
            muiEditTextFieldProps={({ cell }) => ({
              //onBlur is more efficient, but could use onChange instead
              onBlur: event => {
                handleSaveCell(cell, event.target.value)
              }
            })}
            manualFiltering
            manualPagination
            manualSorting
            data={tableData}
            positionActionsColumn='last'
            state={{
              showProgressBars: isFetching
            }}
          />
        </Card>
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

export default SellerDetail
