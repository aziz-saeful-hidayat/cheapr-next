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
  PMKws,
  PM
} from 'src/@core/types'
import PickPM from '../inputs/pm'
import PickProductMakes from '../inputs/make'
import PickProductTypes from '../inputs/product-type'
import PickProductCondition from '../inputs/product-condition'

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
  columns: MRT_ColumnDef<PMKws>[]
  onClose: () => void
  onSubmit: (values: PMKws) => void
  open: boolean
  pmData: PM[]
  session: any
}

export const CreateNewPMKw = ({ open, columns, onClose, onSubmit, pmData, session }: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      if (column.accessorKey == 'condition') {
        acc[column.accessorKey] = []
      } else {
        acc[column.accessorKey ?? ''] = ''
      }

      return acc
    }, {} as any)
  )

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
      <DialogTitle textAlign='center'>Create New</DialogTitle>
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
            <PickPM values={values} setValues={setValues} session={session} />

            <PickProductMakes values={values} setValues={setValues} session={session} />
            <PickProductTypes values={values} setValues={setValues} session={session} />
            <PickProductCondition values={values} setValues={setValues} session={session} />
            {/* <TextField
              key={'keyword'}
              label={'Keyword'}
              name={'keyword'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'makers'}
              label={'Make'}
              name={'makers'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            /> */}

            <TextField
              key={'condition'}
              label={'Condition'}
              name={'condition'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'buying_format'}
              label={'Buying Format'}
              name={'buying_format'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'item_location'}
              label={'Item Location'}
              name={'item_location'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'exclude'}
              label={'Exclude'}
              name={'exclude'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'target_url'}
              label={'Target URL'}
              name={'target_url'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color='primary'
          onClick={handleSubmit}
          variant='contained'
          disabled={!values.pm?.name || !values.keyword}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default CreateNewPMKw
