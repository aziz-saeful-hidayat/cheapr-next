import React, { useState, useEffect } from 'react'
import { Box, MenuItem, TextField } from '@mui/material'
import { ProductTypes } from 'src/@core/types'
import CreateNewProductTypesModal from './create-product-type'
import { Add } from '@mui/icons-material'

interface PickProductTypesProps {
  values: any
  setValues: (values: { channel: number }) => void
  session: any
}

const PickProductTypes = ({ values, setValues, session }: PickProductTypesProps) => {
  const [ptypesData, setPtypesData] = useState<ProductTypes[]>([])
  useEffect(() => {
    const fetchURL = new URL('/product_types/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setPtypesData(json.results)
      })
  }, [session])
  const [createProductTypesModalOpen, setCreateProductTypesModalOpen] = useState(false)

  return (
    <>
      <TextField
        value={values.types?.name}
        key={'types.name'}
        name={'ProductTypes'}
        label='Select Type'
        select
        SelectProps={{ IconComponent: () => null }}
        onChange={e => setValues({ ...values, types: { name: e.target.value } })}
        InputProps={{
          endAdornment: <Add onClick={() => setCreateProductTypesModalOpen(true)} />
        }}
      >
        {ptypesData?.map(types => (
          <MenuItem
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
            key={types.pk}
            value={types.name}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{types.name}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>
      <CreateNewProductTypesModal
        session={session}
        open={createProductTypesModalOpen}
        onClose={() => setCreateProductTypesModalOpen(false)}
      />
    </>
  )
}

export default PickProductTypes
