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
import {
  BuyingOrder,
  Channel,
  Carrier,
  Room,
  CAProduct,
  Person,
  InventoryPayload,
  InventoryItem,
  Seller,
  PMKws
} from 'src/@core/types'

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

interface CreateModalProps {
  columns: MRT_ColumnDef<BuyingOrder>[]
  onClose: () => void
  onSubmit: (values: BuyingOrder) => void
  open: boolean
  channelData: Channel[]
  session: any
  carrierData: Carrier[]
}

export const CreateNewPurchase = ({
  open,
  columns,
  onClose,
  onSubmit,
  channelData,
  session,
  carrierData
}: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )

  const handleCreateNewRow = (values: PMKws) => {
    console.log(values)
    const channel = pmData.find(pm => pm.name == values['pm']['name'])

    const new_obj = {
      ...values,
      channel: channel?.pk,
      order_date: values.order_date ? values.order_date : null,
      delivery_date: values.delivery_date ? values.delivery_date : null
    }
    const address = {
      street_1: channel?.pk,
      street_2: values.order_date ? values.order_date : null,
      zip: values.delivery_date ? values.delivery_date : null,
      city: values.delivery_date ? values.delivery_date : null
    }
    const person = {
      street_1: channel?.pk,
      street_2: values.order_date ? values.order_date : null,
      zip: values.delivery_date ? values.delivery_date : null,
      city: values.delivery_date ? values.delivery_date : null
    }
    console.log(new_obj)
    fetch(`https://cheapr.my.id/buying_order/`, {
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
          // setRefresh(refresh + 1)
        }
      })
  }

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly Seller[]>([])
  const loading = open && options.length === 0
  function validURL(str: string) {
    if (str != '' || str != undefined) {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ) // fragment locator

      return !!pattern.test(str)
    } else {
      return false
    }
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Buying Order</DialogTitle>
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
            {/* <RadioGroup
              row
              aria-labelledby='demo-row-radio-buttons-group-label'
              name='row-radio-buttons-group'
              value={values.destination}
              onChange={e => setValues({ ...values, destination: e.target.value })}
            >
              <FormControlLabel value='H' control={<Radio />} label='House' />
              <FormControlLabel value='D' control={<Radio />} label='Dropship' />
            </RadioGroup> */}
            <LocalizationProvider dateAdapter={AdapterDayjs} key={'order_date'}>
              <DatePicker
                onChange={value => setValues({ ...values, order_date: value ? value.format('YYYY-MM-DD') : null })}
                label={'Order Date'}
                value={values.order_date != '' ? dayjs(values.order_date) : null}
              />
            </LocalizationProvider>
            <PickChannel values={values} setValues={setValues} session={session} />
            <AutoCompleteSeller values={values} setValues={setValues} session={session} />
            <TextField
              key={'purchase_link'}
              label={'Purchase Link (optional)'}
              name={'purchase_link'}
              error={values.purchase_link && !validURL(values.purchase_link)}
              helperText={values.purchase_link && !validURL(values.purchase_link) ? 'Must be an URL' : ''}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'channel_order_id'}
              label={'Channel Order ID  (optional)'}
              name={'channel_order_id'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />

            <AutoCompletePerson values={values} setValues={setValues} session={session} placeholder='Customer' />

            {/* <TextField
              value={values.carrier?.name}
              key={'carrier.name'}
              name={'Carrier'}
              label='Carrier'
              select
              onChange={e => setValues({ ...values, carrier: { name: e.target.value } })}
            >
              {carrierData?.map(carrier => (
                <MenuItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  key={carrier.pk}
                  value={carrier.name}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <img alt='avatar' height={25} src={carrier.image} loading='lazy' style={{ borderRadius: '50%' }} />
                    <span>{carrier.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField> */}
            {/* <TextField
              key={'tracking_number'}
              label={'Tracking Number'}
              name={'tracking_number'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            /> */}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color='primary'
          onClick={handleSubmit}
          variant='contained'
          disabled={!values.channel?.name || !values.order_date || !values.seller || !values.person}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default CreateNewPurchase
