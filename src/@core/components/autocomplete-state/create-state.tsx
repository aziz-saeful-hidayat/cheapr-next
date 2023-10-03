import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

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

type State = {
  pk: number
  name: string
}

interface CreateStateProps {
  session: any
  onClose: () => void
  open: boolean
}

const CreateNewState = ({ open, onClose, session }: CreateStateProps) => {
  const handleCreateState = (values: State) => {
    console.log(values)
    fetch(`https://cheapr.my.id/city/`, {
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
  const columnsNewState = useMemo<MRT_ColumnDef<State>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const [values, setValues] = useState<any>(() =>
    columnsNewState.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0
  const handleSubmit = () => {
    //put your validation logic here
    handleCreateState(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New State</DialogTitle>
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
            {columnsNewState.map(column => (
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

export default CreateNewState
