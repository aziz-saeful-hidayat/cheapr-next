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
import CreateNewSellerModal from './create-seller'

type Seller = {
  pk: number
  name: string
}

type ItemOption = {
  pk: number
  name: string
}
interface AutoCompleteSellerProps {
  values: any
  setValues: any
  session: any
}
const AutoCompleteSeller = ({ values, setValues, session }: AutoCompleteSellerProps) => {
  const columnsPickSeller = useMemo<MRT_ColumnDef<Seller>[]>(
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
  const [createSellerModalOpen, setCreateSellerModalOpen] = useState(false)

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
      <CreateNewSellerModal
        session={session}
        open={createSellerModalOpen}
        onClose={() => setCreateSellerModalOpen(false)}
      />
    </>
  )
}

export default AutoCompleteSeller
