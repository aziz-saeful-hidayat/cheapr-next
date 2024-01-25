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
import AutoCompleteTracking from '../autocomplete-tracking'
import { ReplacementSalesItems, ReturnSalesItems } from 'src/@core/types'
import AutoCompleteItem from '../autocomplete-item'

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
  columns: MRT_ColumnDef<ReplacementSalesItems>[]
  onClose: () => void
  onSubmit: (values: ReplacementSalesItems) => void
  open: boolean
  session: any
}
const CreateNewReplacementSalesItems = ({ open, columns, onClose, onSubmit, session }: CreateModalProps) => {
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
      <DialogTitle textAlign='center'>Create New Sales Item Replacement</DialogTitle>
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
            <AutoCompleteItem values={values} setValues={setValues} session={session} />
            <AutoCompleteTracking values={values} setValues={setValues} session={session} />
            <LocalizationProvider dateAdapter={AdapterDayjs} key={'date'}>
              <DatePicker
                onChange={value => setValues({ ...values, date: value ? value.format('YYYY-MM-DD') : null })}
                label={'Date'}
                value={values.date != '' ? dayjs(values.date) : null}
              />
            </LocalizationProvider>
            <TextField
              key={'comment'}
              label={'Comment'}
              name={'comment'}
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

export default CreateNewReplacementSalesItems
