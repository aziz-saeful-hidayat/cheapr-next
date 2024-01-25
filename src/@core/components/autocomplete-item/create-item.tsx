import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  IconButton,
  MenuItem,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Carrier } from 'src/@core/types'

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

type Tracking = {
  tracking_number: string
  fullcarrier: number
}

interface CreateTrackingProps {
  session: any
  onClose: () => void
  open: boolean
  setTracking: (pk: number) => void
}

const CreateNewTracking = ({ open, onClose, session, setTracking }: CreateTrackingProps) => {
  const handleCreateTracking = (values: Tracking) => {
    console.log(values)
    fetch(`https://cheapr.my.id/tracking/?tracking_number=${values.tracking_number}`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.count > 0) {
        } else {
          fetch(`https://cheapr.my.id/tracking/`, {
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
                setTracking(json.pk)
              }
            })
        }
      })
      .finally(() => {
        setValues({ tracking_number: '' })
        onClose()
      })
  }
  const columnsNewTracking = useMemo<MRT_ColumnDef<Tracking>[]>(
    () => [
      {
        accessorKey: 'fullcarrier',
        header: 'Carrier'
      },
      {
        accessorKey: 'tracking_number',
        header: 'Tracking Number'
      }
    ],
    []
  )
  const [values, setValues] = useState<any>(() =>
    columnsNewTracking.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [carrierData, setCarrierData] = useState<Carrier[]>([])
  useEffect(() => {
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
  }, [session])
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0
  const handleSubmit = () => {
    //put your validation logic here
    handleCreateTracking(values)
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Tracking</DialogTitle>
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
            <TextField
              value={values.tracking_number}
              key={'tracking_number'}
              name={'Tracking Number'}
              label='Tracking Number'
              onChange={e => setValues({ ...values, tracking_number: e.target.value })}
            ></TextField>
            <TextField
              value={carrierData.find(e => e.pk == values.fullcarrier)?.name}
              key={'fullcarrier.name'}
              name={'Carrier'}
              label='Carrier'
              select
              onChange={e => setValues({ ...values, fullcarrier: e.target.value })}
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
                    <img alt='avatar' height={25} src={carrier.image} loading='lazy' style={{ borderRadius: '50%' }} />
                    <span>{carrier.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
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

export default CreateNewTracking
