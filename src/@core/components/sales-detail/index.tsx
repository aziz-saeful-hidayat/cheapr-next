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
  Link,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import Card from '@mui/material/Card'
import Popover from '@mui/material/Popover'
import { Delete, ContentCopy, Add, DisabledByDefault, FindReplace, Block } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import { formatterUSDStrip } from 'src/constants/Utils'
import CardOrder from 'src/views/cards/CardOrder'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import CardSales from 'src/views/cards/CardSales'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { Cross } from 'mdi-material-ui'
import { styled } from '@mui/material/styles'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'

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
type Seller = {
  pk: number
  name: string
}
interface CreateSellerProps {
  columns: MRT_ColumnDef<Seller>[]
  onClose: () => void
  onSubmit: (values: Seller) => void
  open: boolean
}

interface CreateSKUProps {
  columns: MRT_ColumnDef<CAProduct>[]
  onClose: () => void
  onSubmit: (values: CAProduct) => void
  open: boolean
}

interface PickSellerModalProps {
  columns: MRT_ColumnDef<Seller>[]
  onClose: () => void
  onSubmit: (values: { seller: number }) => void
  open: boolean
  setCreateSellerModalOpen: (arg0: boolean) => void
}

interface SubItemModalProps {
  columns: MRT_ColumnDef<CAProduct>[]
  onClose: () => void
  onSubmit: (values: { sku: number }) => void
  open: boolean
  setCreateSKUModalOpen: (arg0: boolean) => void
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

export const CreateNewSellerModal = ({ open, columns, onClose, onSubmit }: CreateSellerProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Seller</DialogTitle>
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

export const CreateNewSKUModal = ({ open, columns, onClose, onSubmit }: CreateSKUProps) => {
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
      <DialogTitle textAlign='center'>Create New SKU</DialogTitle>
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

export const CreateItemModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  channelData,
  setCreateSKUModalOpen
}: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly CAProduct[]>([])
  const [loading, setLoading] = useState(false)
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Pick SKU</DialogTitle>
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
                        sku: newValue?.pk
                      })
                    }
                  }}
                  filterOptions={x => x}
                  isOptionEqualToValue={(option, value) => option.sku === value.sku}
                  getOptionLabel={option => `${option.sku}`}
                  options={options}
                  loading={loading}
                  renderInput={params => (
                    <TextField
                      {...params}
                      onChange={e => {
                        setLoading(true)
                        fetch(`https://cheapr.my.id/caproduct/?sku=${e.target.value}`, {
                          // note we are going to /1
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => response.json())
                          .then(json => {
                            setOptions(json.results)
                          })
                          .finally(() => {
                            setLoading(false)
                          })
                      }}
                      label='SKU'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            {loading ? (
                              <CircularProgress color='inherit' size={20} />
                            ) : (
                              <Add onClick={() => setCreateSKUModalOpen(true)} />
                            )}
                          </>
                        )
                      }}
                    />
                  )}
                />
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

export const CreateDropshipModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  channelData,
  carrierData,
  setCreateSellerModalOpen
}: DropshipModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = column.accessorKey == 'seller' ? null : ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly DropshipItemOption[]>([])
  const [loading, setLoading] = useState(false)
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Add Droship Item</DialogTitle>
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
            {columns.map(column =>
              column.accessorKey === 'order_date' ? (
                <LocalizationProvider dateAdapter={AdapterDayjs} key={'order_date'}>
                  <DatePicker
                    onChange={value => setValues({ ...values, order_date: value ? value.format('YYYY-MM-DD') : null })}
                    label={column.header}
                    value={values.order_date != '' ? dayjs(values.order_date) : null}
                  />
                </LocalizationProvider>
              ) : column.accessorKey === 'return_up_to_date' ? (
                <LocalizationProvider dateAdapter={AdapterDayjs} key={'return_up_to_date'}>
                  <DatePicker
                    onChange={value =>
                      setValues({ ...values, return_up_to_date: value ? value.format('YYYY-MM-DD') : null })
                    }
                    label={column.header}
                    value={values.return_up_to_date != '' ? dayjs(values.return_up_to_date) : null}
                  />
                </LocalizationProvider>
              ) : column.accessorKey === 'seller' ? (
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
                        seller: newValue?.pk
                      })
                    }
                  }}
                  filterOptions={x => x}
                  isOptionEqualToValue={(option, value) => option.name === value.name}
                  getOptionLabel={option => `${option.name}`}
                  options={options}
                  loading={loading}
                  renderInput={params => (
                    <TextField
                      {...params}
                      onChange={e => {
                        setLoading(true)
                        fetch(`https://cheapr.my.id/seller/?name=${e.target.value}`, {
                          // note we are going to /1
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => response.json())
                          .then(json => {
                            setOptions(json.results)
                          })
                          .finally(() => {
                            setLoading(false)
                          })
                      }}
                      label='Seller'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            {loading ? (
                              <CircularProgress color='inherit' size={20} />
                            ) : (
                              <Add onClick={() => setCreateSellerModalOpen(true)} />
                            )}
                          </>
                        )
                      }}
                    />
                  )}
                />
              ) : column.accessorKey === 'channel' ? (
                <TextField
                  value={values.channel}
                  key={'channel.name'}
                  name={'Channel'}
                  label='Channel'
                  select
                  onChange={e => setValues({ ...values, channel: e.target.value })}
                >
                  {channelData?.map(channel => (
                    <MenuItem
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                      key={channel.pk}
                      value={channel.pk}
                    >
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
                          src={channel.image}
                          loading='lazy'
                          style={{ borderRadius: '50%' }}
                        />
                        {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                        <span>{channel.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              ) : column.accessorKey === 'carrier' ? (
                <TextField
                  value={values.carrier}
                  key={'carrier.name'}
                  name={'Carrier'}
                  label='Carrier'
                  select
                  onChange={e => setValues({ ...values, carrier: e.target.value })}
                >
                  {carrierData?.map(carrier => (
                    <MenuItem
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                      key={carrier.pk}
                      value={carrier.pk}
                    >
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
                          src={carrier.image}
                          loading='lazy'
                          style={{ borderRadius: '50%' }}
                        />
                        {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                        <span>{carrier.name}</span>
                      </Box>
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

export const PickSellerModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  setCreateSellerModalOpen
}: PickSellerModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly DropshipItemOption[]>([])
  const [loading, setLoading] = useState(false)
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Choose Seller</DialogTitle>
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
              key={'name'}
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
                    seller: newValue?.pk
                  })
                }
              }}
              filterOptions={x => x}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              getOptionLabel={option => `${option.name}`}
              options={options}
              loading={loading}
              renderInput={params => (
                <TextField
                  {...params}
                  onChange={e => {
                    setLoading(true)
                    fetch(`https://cheapr.my.id/seller/?name=${e.target.value}`, {
                      // note we are going to /1
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    })
                      .then(response => response.json())
                      .then(json => {
                        setOptions(json.results)
                      })
                      .finally(() => {
                        setLoading(false)
                      })
                  }}
                  label='Seller'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        {loading ? (
                          <CircularProgress color='inherit' size={20} />
                        ) : (
                          <Add onClick={() => setCreateSellerModalOpen(true)} />
                        )}
                      </>
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
        <Button color='primary' onClick={handleSubmit} variant='contained'>
          Choose
        </Button>
      </DialogActions>
    </Dialog>
  )
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
}: AddModalProps) => {
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
    console.log(
      `https://cheapr.my.id/inventory_items/?inventory=true&incoming=false&product_mpn=${mpnToAdd}&ordering=serial`
    )
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
                    {item.product ? item.product.sku : ''} {item.serial}{' '}
                    {formatterUSDStrip(parseFloat(item.total_cost))}
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

export const SubItemModal = ({ open, columns, onClose, onSubmit, setCreateSKUModalOpen }: SubItemModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly CAProduct[]>([])
  const [loading, setLoading] = useState(false)
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Choose Sub SKU</DialogTitle>
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
              key={'name'}
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
                    sku: newValue?.pk
                  })
                }
              }}
              filterOptions={x => x}
              isOptionEqualToValue={(option, value) => option.sku === value.sku}
              getOptionLabel={option => `${option.sku}`}
              options={options}
              loading={loading}
              renderInput={params => (
                <TextField
                  {...params}
                  onChange={e => {
                    setLoading(true)
                    fetch(`https://cheapr.my.id/caproduct/?sku=${e.target.value}`, {
                      // note we are going to /1
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    })
                      .then(response => response.json())
                      .then(json => {
                        setOptions(json.results)
                      })
                      .finally(() => {
                        setLoading(false)
                      })
                  }}
                  label='SKU'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        {loading ? (
                          <CircularProgress color='inherit' size={20} />
                        ) : (
                          <Add onClick={() => setCreateSKUModalOpen(true)} />
                        )}
                      </>
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
        <Button color='primary' onClick={handleSubmit} variant='contained'>
          Choose
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
  const statusOptions: any[] = [
    { key: 'D', name: 'Delivered', color: 'success' },
    { key: 'T', name: 'Transit', color: 'warning' },
    { key: 'I', name: 'Issue', color: 'error' },
    { key: 'N', name: 'Not Started', color: 'default' }
  ]
  const [tableData, setTableData] = useState<Item[]>([])
  const [roomData, setRoomData] = useState<Room[]>([])
  const [itemToEdit, setItemToEdit] = useState('')
  const [buyingToEdit, setBuyingToEdit] = useState('')
  const [mpnToAdd, setMpnToAdd] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const [ratingData, setRatingData] = useState<Rating[]>([])
  const [channelData, setChannelData] = useState<Channel[]>([])
  const [carrierData, setCarrierData] = useState<Carrier[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [dropshipModalOpen, setDropshipModalOpen] = useState(false)
  const [pickSellerModalOpen, setPickSellerModalOpen] = useState(false)
  const [createSellerModalOpen, setCreateSellerModalOpen] = useState(false)
  const [createSKUModalOpen, setCreateSKUModalOpen] = useState(false)

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
        accessorKey: 'serial',
        header: 'Serial',
        maxSize: 100,
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) =>
          row.original.dropship ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Chip
                sx={{
                  fontSize: 10
                }}
                label='Dropship'
              />
            </Box>
          ) : row.original.item_null ? (
            row.original.inventory ? (
              <>
                <Chip
                  sx={{
                    fontSize: 10
                  }}
                  label='Pick Item'
                  onClick={() => {
                    setItemToEdit(row.original.salesitem_pk)
                    setMpnToAdd(row.original.sub_sku ? row.original.sub_sku.mpn : row.original.sku.mpn)
                    setAddModalOpen(true)
                  }}
                />
                <Chip
                  sx={{
                    fontSize: 10
                  }}
                  label='Use Dropship'
                  onClick={() => {
                    setItemToEdit(row.original.salesitem_pk)
                    setMpnToAdd(row.original.sub_sku ? row.original.sub_sku.mpn : row.original.sku.mpn)
                    setDropshipModalOpen(true)
                  }}
                />
              </>
            ) : (
              <Chip
                sx={{
                  fontSize: 10
                }}
                label='Use Dropship'
                onClick={() => {
                  setItemToEdit(row.original.salesitem_pk)
                  setMpnToAdd(row.original.sub_sku ? row.original.sub_sku.mpn : row.original.sku.mpn)
                  setDropshipModalOpen(true)
                }}
              />
            )
          ) : (
            <div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <Chip
                  sx={{
                    fontSize: 10
                  }}
                  label='Inventory'
                />
              </Box>
            </div>
          )
      },
      {
        accessorKey: 'sku.sku',
        header: 'SKU',
        enableEditing: false
      },
      {
        accessorKey: 'sub_sku.sku',
        header: 'Sub SKU',
        enableEditing: false,
        Cell: ({ renderedCellValue, row }) =>
          row.original.sub_sku ? (
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
                <Tooltip arrow placement='top' title='Unsub SKU'>
                  <IconButton
                    color='error'
                    onClick={() => {
                      setItemToEdit(row.original.salesitem_pk)
                      setTimeout(function () {
                        handleSubItem({ sku: null, pk: row.original.salesitem_pk })
                      }, 1000)
                    }}
                  >
                    <Block />
                  </IconButton>
                </Tooltip>
              </Box>
            </div>
          ) : (
            <div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onClick={() => {
                  setItemToEdit(row.original.salesitem_pk)
                  setSubModalOpen(true)
                }}
              >
                <span>{renderedCellValue}</span>
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
                <Tooltip arrow placement='top' title='Sub SKU'>
                  <IconButton
                    color='error'
                    onClick={() => {
                      setItemToEdit(row.original.salesitem_pk)
                      setSubModalOpen(true)
                    }}
                  >
                    <FindReplace />
                  </IconButton>
                </Tooltip>
              </Box>
            </div>
          )
      },
      {
        accessorKey: 'buying.seller.name',
        header: 'Seller',
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            {row.original.buying ? (
              <Chip
                sx={{
                  fontSize: 10
                }}
                label={renderedCellValue ? renderedCellValue : 'Pick Seller'}
                onClick={() => {
                  setBuyingToEdit(row.original.buying?.pk)
                  setPickSellerModalOpen(true)
                }}
              />
            ) : null}
          </Box>
        ),
        enableEditing: false
      },
      {
        accessorKey: 'buying.purchase_link',
        header: 'Purchase Link',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            {row.original.buying?.purchase_link && (
              <Link target='_blank' rel='noreferrer' href={`${row.original.buying.purchase_link}`} underline='hover'>
                Open
              </Link>
            )}
          </Box>
        ),
        enableEditing: row => !row.original.item_null
      },
      {
        accessorKey: 'buying.order_date',
        header: 'Purchase Date',
        size: 75,
        muiTableBodyCellEditTextFieldProps: {
          type: 'date'
        },
        enableEditing: row => !row.original.item_null
      },

      {
        accessorKey: 'total_cost',
        header: 'Unit Price',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>{renderedCellValue && formatterUSDStrip(row.original.total_cost)}</Box>
        ),
        enableEditing: row => !row.original.item_null
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 75,
        Cell: ({ renderedCellValue, row }) => (
          <Box component='span'>
            {!isNaN(row.original.shipping_cost) && formatterUSDStrip(row.original.shipping_cost)}
          </Box>
        ),
        enableEditing: row => !row.original.item_null
      },
      {
        accessorKey: 'tracking.fullcarrier.name',
        header: 'Carrier',
        size: 100,
        muiTableBodyCellEditTextFieldProps: {
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
        muiTableBodyCellEditTextFieldProps: {
          type: 'date'
        }
      },
      {
        accessorKey: 'tracking.status',
        header: 'Status',
        size: 100,
        muiTableBodyCellEditTextFieldProps: {
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
                label={statusOptions.find(e => e.key == renderedCellValue)?.name}
                color={statusOptions.find(e => e.key == renderedCellValue)?.color}
              />
            ) : null}
          </Box>
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
              return {
                ...item.item,
                salesitem_pk: item.pk,
                sku: item.sku,
                sub_sku: item.sub_sku,
                inventory: item.inventory,
                item_null: item.item == null,
                tracking: item.tracking
              }
            })
          )
        console.log(tableData)
      })
      .finally(() => setIsFetching(false))
  }, [session, pk, modalOpen, refresh])
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
  const handleDeleteRow = (row: MRT_Row<InventoryItem>) => {
    if (!confirm(`Are you sure you want to delete Item #${row.index + 1}`)) {
      return
    }
    setIsFetching(true)
    const newValues = { item: null }
    console.log(tableData)
    fetch(`https://cheapr.my.id/sales_items/${row.original.salesitem_pk}/`, {
      // note we are going to /1
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.status)
      .then(status => {
        if (status == 204) {
          setRefresh(refresh + 1)
        }
      })
  }

  const handleUnassignRow = (row: MRT_Row<InventoryItem>) => {
    if (!confirm(`Are you sure you want to unassign Item #${row.index + 1}`)) {
      return
    }
    setIsFetching(true)
    const newValues = { item: null, tracking: null }
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
          setRefresh(refresh + 1)
        }
      })
  }

  const handleSaveCell = (cell: MRT_Cell<InventoryItem>, value: any) => {
    const key = cell.column.id
    const rowIdx = cell.row.index
    const payload: InventoryItem = {}
    if (key === 'buying.purchase_link') {
      payload['purchase_link'] = value
      fetch(`https://cheapr.my.id/buying_order/${cell.row.original.buying?.pk}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(json => {
          console.log(json)
          if (json.pk) {
            setRefresh(refresh + 1)
          }
        })
    } else if (key === 'buying.order_date') {
      payload['order_date'] = value
      fetch(`https://cheapr.my.id/buying_order/${cell.row.original.buying?.pk}/`, {
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
    } else if (key === 'total_cost' || key === 'shipping_cost') {
      payload[key as keyof Payload] = value
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
          console.log(json)
          if (json.pk) {
            setRefresh(refresh + 1)
          }
        })
    } else if (key === 'tracking.fullcarrier.name') {
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
              fetch(`https://cheapr.my.id/sales_items/${cell.row.original.salesitem_pk}/`, {
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
                  fetch(`https://cheapr.my.id/sales_items/${cell.row.original.salesitem_pk}/`, {
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
            fetch(`https://cheapr.my.id/sales_items/${cell.row.original.salesitem_pk}/`, {
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
              fetch(`https://cheapr.my.id/sales_items/${cell.row.original.salesitem_pk}/`, {
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
            fetch(`https://cheapr.my.id/sales_items/${cell.row.original.salesitem_pk}/`, {
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
    console.log(payload)
  }
  const handleAddItem = (values: InventoryPayload) => {
    const newValues = { item: values.item }
    console.log(newValues)
    console.log(`https://cheapr.my.id/sales_items/${itemToEdit}`)
    setIsFetching(true)
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
        }
      })
      .finally(() => {
        setRefresh(refresh + 1)
      })
  }

  const handleSubItem = (values: any) => {
    const newValues = { sub_sku: values.sku }
    console.log(newValues)
    console.log(`https://cheapr.my.id/sales_items/${values.pk ? values.pk : itemToEdit}`)
    setIsFetching(true)
    fetch(`https://cheapr.my.id/sales_items/${values.pk ? values.pk : itemToEdit}`, {
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
        }
      })
      .finally(() => {
        setRefresh(refresh + 1)
      })
  }

  const handleCreateNewRow = (values: InventoryItem) => {
    console.log(values)
    let new_values = { ...values, selling: pk }
    fetch(`https://cheapr.my.id/sales_items/`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(new_values)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        setRefresh(refresh + 1)
      })
  }
  const handleCreateSeller = (values: Seller) => {
    console.log(values)
    fetch(`https://cheapr.my.id/seller/`, {
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
        }
      })
  }

  const handleCreateSKU = (values: CAProduct) => {
    console.log(values)
    fetch(`https://cheapr.my.id/caproduct/`, {
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
        }
      })
  }

  const handleUseDropship = (values: InventoryItem) => {
    const newValues: {
      [key: string]: number | string
    } = { ...values, sales: itemToEdit, mpn: mpnToAdd }
    Object.keys(newValues).forEach(k => newValues[k] == null || (newValues[k] == '' && delete newValues[k]))
    console.log(newValues)
    setIsFetching(true)
    fetch(`https://cheapr.my.id/use_dropship`, {
      method: 'POST',
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
  const handlePickSeller = (values: { seller: number }) => {
    const newValues = { seller: values.seller }
    console.log(`https://cheapr.my.id/buying_order/${buyingToEdit}/`)
    console.log(newValues)
    setIsFetching(true)
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

  const columnsItem = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'SKU',
        size: 150,
        enableEditing: false
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
  const columnsDropshipItem = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'seller',
        header: 'Seller'
      },
      {
        accessorKey: 'channel',
        header: 'Channel'
      },
      {
        accessorKey: 'purchase_link',
        header: 'Purchase Link'
      },
      {
        accessorKey: 'order_date',
        header: 'Order Date'
      },

      {
        accessorKey: 'return_up_to_date',
        header: 'Return Up To Date'
      },
      {
        accessorKey: 'carrier',
        header: 'Carrier'
      },
      {
        accessorKey: 'tracking_number',
        header: 'Tracking Number'
      },
      {
        accessorKey: 'total_cost',
        header: 'Price',
        size: 100
      },
      {
        accessorKey: 'shipping_cost',
        header: 'Shipping',
        size: 100
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 200
      }
    ],
    [roomData, ratingData]
  )
  const columnsPickSeller = useMemo<MRT_ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const columnsPickSKU = useMemo<MRT_ColumnDef<CAProduct>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU'
      }
    ],
    []
  )
  const columnsNewSeller = useMemo<MRT_ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const columnsNewSKU = useMemo<MRT_ColumnDef<CAProduct>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU'
      },
      {
        accessorKey: 'make',
        header: 'Make'
      },
      {
        accessorKey: 'model',
        header: 'Model'
      },
      {
        accessorKey: 'mpn',
        header: 'MPN'
      },
      {
        accessorKey: 'asin',
        header: 'ASIN'
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
        <CardSales orderData={orderData} type={'sales'} tableData={tableData} />
        <Card sx={{ padding: 3 }}>
          <MaterialReactTable
            columns={columns}
            initialState={{ showColumnFilters: false, density: 'compact' }}
            enableEditing={true}
            // enableRowNumbers

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
                {row.original.item_null ? (
                  <Tooltip arrow placement='top' title='Delete'>
                    <IconButton color='error' onClick={() => handleDeleteRow(row)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip arrow placement='top' title='Unassign'>
                    <IconButton color='secondary' onClick={() => handleUnassignRow(row)}>
                      <DisabledByDefault />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
            state={{
              showProgressBars: isFetching
            }}
          />
        </Card>
        <AddItemModal
          columns={columnsAddItem}
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddItem}
          purchaseId={pk}
          roomData={roomData}
          ratingData={ratingData}
          session={session}
          mpnToAdd={mpnToAdd}
        />
        <CreateItemModal
          columns={columnsItem}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateNewRow}
          purchaseId={pk}
          channelData={channelData}
          session={session}
          mpnToAdd={mpnToAdd}
          setCreateSKUModalOpen={setCreateSKUModalOpen}
        />
        <PickSellerModal
          columns={columnsPickSeller}
          open={pickSellerModalOpen}
          onClose={() => setPickSellerModalOpen(false)}
          onSubmit={handlePickSeller}
          setCreateSellerModalOpen={setCreateSellerModalOpen}
        />
        <SubItemModal
          columns={columnsPickSKU}
          open={subModalOpen}
          onClose={() => setSubModalOpen(false)}
          onSubmit={handleSubItem}
          setCreateSKUModalOpen={setCreateSKUModalOpen}
        />
        <CreateDropshipModal
          columns={columnsDropshipItem}
          open={dropshipModalOpen}
          onClose={() => setDropshipModalOpen(false)}
          onSubmit={handleUseDropship}
          purchaseId={pk}
          channelData={channelData}
          carrierData={carrierData}
          session={session}
          mpnToAdd={mpnToAdd}
          setCreateSellerModalOpen={setCreateSellerModalOpen}
        />
        <CreateNewSellerModal
          columns={columnsNewSeller}
          open={createSellerModalOpen}
          onClose={() => setCreateSellerModalOpen(false)}
          onSubmit={handleCreateSeller}
        />
        <CreateNewSKUModal
          columns={columnsNewSKU}
          open={createSKUModalOpen}
          onClose={() => setCreateSKUModalOpen(false)}
          onSubmit={handleCreateSKU}
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
