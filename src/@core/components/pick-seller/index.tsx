import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField
} from '@mui/material'
import { Add } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'

type Seller = {
  pk: number
  name: string
}

type ItemOption = {
  pk: number
  name: string
}
interface PickSellerModalProps {
  onClose: () => void
  onSubmit: (values: { seller: number }) => void
  open: boolean
  setCreateSellerModalOpen: (arg0: boolean) => void
}

const PickSellerModal = ({ open, onClose, onSubmit, setCreateSellerModalOpen }: PickSellerModalProps) => {
  const columnsPickSeller = useMemo<MRT_ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const [values, setValues] = useState<any>(() =>
    columnsPickSeller.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const [loading, setLoading] = useState(false)
  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Choose Seller</DialogTitle>
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

export default PickSellerModal
