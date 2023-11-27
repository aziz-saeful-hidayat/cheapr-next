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
  TextField,
  Tooltip,
  Autocomplete,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography
} from '@mui/material'
import Chip from '@mui/material/Chip'

//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Delete, Add, TaskAlt } from '@mui/icons-material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Items from 'src/@core/components/inventory-item'
import { withAuth } from 'src/constants/HOCs'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import moment from 'moment-timezone'
import { useRouter } from 'next/router'
import { formatterUSDStrip } from 'src/constants/Utils'
import { getSession } from 'next-auth/react'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import PurchaseDetail from 'src/@core/components/purchase-detail'
import PickSellerModal from 'src/@core/components/pick-seller'
import AutoCompleteSeller from 'src/@core/components/autocomplete-seller'
import AutoCompleteState from 'src/@core/components/autocomplete-state'
import AutoCompleteCity from 'src/@core/components/autocomplete-city'
import AutoCompletePerson from 'src/@core/components/autocomplete-person'

import CloseIcon from '@mui/icons-material/Close'
import PickChannel from '../inputs/channel'

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

type Seller = {
  pk: number
  name: string
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
}
type InventoryItem = {
  [key: string]: any
}
type BuyingOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  channel: {
    pk: number
    name: string
    image: string
  }
  carrier: {
    pk: number
    name: string
    image: string
  }
  seller: {
    pk: number
    name: string
  }
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  num_items: number
  total_sum: number
  shipping_sum: number
}

interface CreateModalProps {
  columns: MRT_ColumnDef<BuyingOrder>[]
  onClose: () => void
  onSubmit: (values: BuyingOrder) => void
  open: boolean
  channelData: Channel[]
  session: any
  carrierData: Carrier[]
}
const CreateNewSales = ({ open, columns, onClose, onSubmit, channelData }: CreateModalProps) => {
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
      <DialogTitle textAlign='center'>Create New Selling Order</DialogTitle>
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
            <LocalizationProvider dateAdapter={AdapterDayjs} key={'order_date'}>
              <DatePicker
                onChange={value => setValues({ ...values, order_date: value ? value.format('YYYY-MM-DD') : null })}
                label={'Order Date'}
                value={values.order_date != '' ? dayjs(values.order_date) : null}
              />
            </LocalizationProvider>
            <TextField
              value={values.channel?.name}
              key={'channel.name'}
              name={'Channel'}
              label='Channel'
              select
              onChange={e => setValues({ ...values, channel: { name: e.target.value } })}
            >
              {channelData?.map(channel => (
                <MenuItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  key={channel.pk}
                  value={channel.name}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <img alt='avatar' height={25} src={channel.image} loading='lazy' style={{ borderRadius: '50%' }} />
                    {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                    <span>{channel.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              key={'seller_name'}
              label={'Seller Name'}
              name={'seller_name'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'channel_order_id'}
              label={'Channel Order ID'}
              name={'channel_order_id'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'tracking_number'}
              label={'Tracking Number'}
              name={'tracking_number'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
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

export default CreateNewSales
