import React, { useState, useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Add } from '@mui/icons-material'
import { InventoryItem, Tracking } from 'src/@core/types'

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
const AutoCompleteItem = ({ values, setValues, session }: AutoCompleteCityProps) => {
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
  const [options, setOptions] = useState<readonly InventoryItem[]>([])
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
              replacement: newValue?.pk
            })
          }
        }}
        filterOptions={x => x}
        isOptionEqualToValue={(option, value) => option.pk === value.pk}
        getOptionLabel={option => `${option.buying?.order_id} ${option.product?.sku}`}
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            onChange={e => {
              setLoading(true)
              fetch(`https://cheapr.my.id/unconnected_inventory_items/?search=${e.target.value}`, {
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
            label='Find Item'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {loading && <CircularProgress color='inherit' size={20} />}
                </>
              )
            }}
          />
        )}
      />
    </>
  )
}

export default AutoCompleteItem
