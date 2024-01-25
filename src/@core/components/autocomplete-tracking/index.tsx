import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Add } from '@mui/icons-material'
import CreateNewTracking from './create-tracking'
import { Tracking } from 'src/@core/types'

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
const AutoCompleteTracking = ({ values, setValues, session }: AutoCompleteCityProps) => {
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
  const [options, setOptions] = useState<readonly Tracking[]>([])
  const [loading, setLoading] = useState(false)
  const [createTrackingModalOpen, setCreateTrackingModalOpen] = useState(false)

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
              tracking: newValue?.pk
            })
          }
        }}
        filterOptions={x => x}
        isOptionEqualToValue={(option, value) => option.pk === value.pk}
        getOptionLabel={option => `${option.tracking_number}`}
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            onChange={e => {
              setLoading(true)
              fetch(`https://cheapr.my.id/tracking/?tracking_number=${e.target.value}`, {
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
            label='Tracking'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {loading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : (
                    <Add onClick={() => setCreateTrackingModalOpen(true)} />
                  )}
                </>
              )
            }}
          />
        )}
      />
      <CreateNewTracking
        session={session}
        open={createTrackingModalOpen}
        onClose={() => setCreateTrackingModalOpen(false)}
        setTracking={pk => {
          setValues({
            ...values,
            tracking: pk
          })
        }}
      />
    </>
  )
}

export default AutoCompleteTracking
