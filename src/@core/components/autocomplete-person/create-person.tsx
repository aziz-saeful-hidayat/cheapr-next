import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AutoCompleteCity from '../autocomplete-city'

type ItemOption = {
  pk: number
  name: string
  phone: string
  email: string
  street_1: string
  street_2: string
  zip: string
  city: number
}

type Person = {
  pk: number
  name: string
  phone: string
  email: string
  history: number
  address: {
    pk: number
    street_1: string
    street_2: string
    zip: string
    city: {
      pk: number
      name: string
      state: {
        pk: number
        name: string
        short: string
        country: {
          pk: number
          name: string
          short: string
        }
      }
    }
  }
}

interface CreatePersonProps {
  session: any
  onClose: () => void
  open: boolean
}

const CreateNewPerson = ({ open, onClose, session }: CreatePersonProps) => {
  const handleCreatePerson = (values: ItemOption) => {
    const address = {
      street_1: values.street_1,
      street_2: values.street_2,
      zip: values.zip,
      city: values.city
    }

    console.log(values)
    fetch(`https://cheapr.my.id/address/`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(address)
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        if (json.pk) {
          const person = {
            name: values.name,
            phone: values.phone,
            email: values.email,
            address: json.pk
          }
          fetch(`https://cheapr.my.id/person/`, {
            method: 'POST',
            headers: new Headers({
              Authorization: `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(person)
          })
            .then(response => response.json())
            .then(json => {
              console.log(json)
              if (json.pk) {
              }
            })
        } else {
          const person = {
            name: values.name,
            phone: values.phone,
            email: values.email
          }
          fetch(`https://cheapr.my.id/person/`, {
            method: 'POST',
            headers: new Headers({
              Authorization: `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(person)
          })
            .then(response => response.json())
            .then(json => {
              console.log(json)
              if (json.pk) {
              }
            })
        }
      })
      .finally(() => onClose())
  }
  const columnsNewPerson = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const [values, setValues] = useState<any>(() =>
    columnsNewPerson.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = ''

      return acc
    }, {} as any)
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const loading = open && options.length === 0
  const handleSubmit = () => {
    //put your validation logic here
    handleCreatePerson(values)
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Create New Person</DialogTitle>
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
              key={'name'}
              label={'Name'}
              name={'name'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'phone'}
              label={'Phone'}
              name={'phone'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'email'}
              label={'Email'}
              name={'email'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'street_1'}
              label={'Street 1'}
              name={'street_1'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'street_2'}
              label={'Street 2'}
              name={'street_2'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <TextField
              key={'zip'}
              label={'Zip Code'}
              name={'zip'}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            <AutoCompleteCity values={values} setValues={setValues} session={session} />
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

export default CreateNewPerson
