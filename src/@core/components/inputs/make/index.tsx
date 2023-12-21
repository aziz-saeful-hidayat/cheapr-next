import React, { useState, useEffect } from 'react'
import { Box, MenuItem, TextField } from '@mui/material'
import { ProductMakes } from 'src/@core/types'
import { Add } from '@mui/icons-material'
import CreateNewProductMakesModal from './create-make'

interface PickProductMakesProps {
  values: any
  setValues: (values: { channel: number }) => void
  session: any
}

const PickProductMakes = ({ values, setValues, session }: PickProductMakesProps) => {
  const [productData, setProductData] = useState<ProductMakes[]>([])
  useEffect(() => {
    const fetchURL = new URL('/make/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setProductData(json.results)
      })
  }, [session])
  const [createProductMakeModalOpen, setCreateProductMakeModalOpen] = useState(false)

  return (
    <>
      <TextField
        value={values.make?.name}
        key={'make.name'}
        name={'ProductMakes'}
        label='Select Make'
        select
        SelectProps={{ IconComponent: () => null }}
        onChange={e => setValues({ ...values, make: { name: e.target.value } })}
        InputProps={{
          endAdornment: <Add onClick={() => setCreateProductMakeModalOpen(true)} />
        }}
      >
        {productData?.map(make => (
          <MenuItem
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
            key={make.pk}
            value={make.name}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{make.name}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>
      <CreateNewProductMakesModal
        session={session}
        open={createProductMakeModalOpen}
        onClose={() => setCreateProductMakeModalOpen(false)}
      />
    </>
  )
}

export default PickProductMakes
