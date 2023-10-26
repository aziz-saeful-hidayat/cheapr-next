import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Add } from '@mui/icons-material'
import CreateNewState from './create-state'

type State = {
  pk: number
  name: string
  short: string
}

type ItemOption = {
  pk: number
  name: string
  short: string
}
interface AutoCompleteStateProps {
  values: any
  setValues: any
  session: any
}
const AutoCompleteState = ({ values, setValues, session }: AutoCompleteStateProps) => {
  const columnsPickState = useMemo<MRT_ColumnDef<State>[]>(
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
  const [createStateModalOpen, setCreateStateModalOpen] = useState(false)

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
              state: newValue?.pk
            })
          }
        }}
        filterOptions={x => x}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={option => `${option.name}, ${option.short}`}
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            onChange={e => {
              setLoading(true)
              fetch(`https://cheapr.my.id/state/?short=${e.target.value}`, {
                // note we are going to /1
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
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
            label='State'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {loading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : (
                    <Add onClick={() => setCreateStateModalOpen(true)} />
                  )}
                </>
              )
            }}
          />
        )}
      />
      <CreateNewState session={session} open={createStateModalOpen} onClose={() => setCreateStateModalOpen(false)} />
    </>
  )
}

export default AutoCompleteState
