import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ProductMakes } from 'src/@core/types'

interface CreateProductMakesProps {
  session: any
  onClose: () => void
  open: boolean
}

const CreateNewProductMakesModal = ({ open, onClose, session }: CreateProductMakesProps) => {
  const handleCreateProductMakes = (values: ProductMakes) => {
    console.log(values)
    fetch(`https://cheapr.my.id/make/`, {
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
  const columnsNewProductMakes = useMemo<MRT_ColumnDef<ProductMakes>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const [values, setValues] = useState<any>(() =>
    columnsNewProductMakes.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const handleSubmit = () => {
    //put your validation logic here
    handleCreateProductMakes(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Product's Make</DialogTitle>
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
            {columnsNewProductMakes.map(column => (
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

export default CreateNewProductMakesModal
