import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Add } from '@mui/icons-material'
import CreateNewPerson from './create-person'

type Person = {
  pk: number
  name: string
  short: string
}

type ItemOption = {
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
interface AutoCompletePersonProps {
  values: any
  setValues: any
  session: any
  placeholder: string
}
const AutoCompletePerson = ({ values, setValues, session, placeholder }: AutoCompletePersonProps) => {
  const columnsPickPerson = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name'
      }
    ],
    []
  )
  const [isopen, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly ItemOption[]>([])
  const [loading, setLoading] = useState(false)
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false)

  return (
    <>
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
              person: newValue?.pk
            })
          }
        }}
        filterOptions={x => x}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={option =>
          `${option.name}${option.email ? `, ${option.email}` : ''}${
            option.address?.street_1 ? `, ${option.address?.street_1}` : ''
          }${option.address?.street_2 ? `, ${option.address?.street_2}` : ''}${
            option.address?.zip ? `, ${option.address?.zip}` : ''
          }${option.address?.city?.name ? `, ${option.address?.city.name}` : ''}${
            option.address?.city?.state?.short ? `, ${option.address?.city?.state?.short}` : ''
          }${option.address?.city?.state?.country?.short ? `, ${option.address?.city?.state?.country?.short}` : ''}`
        }
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            onChange={e => {
              setLoading(true)
              fetch(`https://cheapr.my.id/person/?name=${e.target.value}`, {
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
            label={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {loading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : (
                    <Add onClick={() => setCreatePersonModalOpen(true)} />
                  )}
                </>
              )
            }}
          />
        )}
      />
      <CreateNewPerson session={session} open={createPersonModalOpen} onClose={() => setCreatePersonModalOpen(false)} />
    </>
  )
}

export default AutoCompletePerson
