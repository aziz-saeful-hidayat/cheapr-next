import React, { useState, useEffect } from 'react'
import { Box, MenuItem, TextField } from '@mui/material'
import { PM } from 'src/@core/types'

interface PickPMProps {
  values: any
  setValues: (values: { channel: number }) => void
  session: any
}

const PickPM = ({ values, setValues, session }: PickPMProps) => {
  const [pmData, setPmData] = useState<PM[]>([])
  useEffect(() => {
    const fetchURL = new URL('/product_manager/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setPmData(json.results)
      })
  }, [session])

  return (
    <TextField
      value={values.channel?.name}
      key={'pm.name'}
      name={'PM'}
      label='PM'
      select
      onChange={e => setValues({ ...values, pm: { name: e.target.value } })}
    >
      {pmData?.map(pm => (
        <MenuItem
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
          key={pm.pk}
          value={pm.name}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{pm.name}</span>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  )
}

export default PickPM
