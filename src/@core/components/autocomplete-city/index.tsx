import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Add } from '@mui/icons-material'
import CreateNewCity from './create-city'

type City = {
  pk: number
  name: string
  short: string
}

type ItemOption = {
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
interface AutoCompleteCityProps {
  values: any
  setValues: any
  session: any
}
const AutoCompleteCity = ({ values, setValues, session }: AutoCompleteCityProps) => {
  const columnsPickCity = useMemo<MRT_ColumnDef<City>[]>(
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
  const [createCityModalOpen, setCreateCityModalOpen] = useState(false)

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
              city: newValue?.pk
            })
          }
        }}
        filterOptions={x => x}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={option => `${option.name}, ${option.state.short}, ${option.state.country.short}`}
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            onChange={e => {
              setLoading(true)
              fetch(`https://cheapr.my.id/city/?name=${e.target.value}`, {
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
            label='City'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {loading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : (
                    <Add onClick={() => setCreateCityModalOpen(true)} />
                  )}
                </>
              )
            }}
          />
        )}
      />
      <CreateNewCity session={session} open={createCityModalOpen} onClose={() => setCreateCityModalOpen(false)} />
    </>
  )
}

export default AutoCompleteCity
