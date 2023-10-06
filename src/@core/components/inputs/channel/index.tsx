import React, { useState, useEffect } from 'react'
import { Box, MenuItem, TextField } from '@mui/material'

type Channel = {
  pk: number
  name: string
  image: string
}

interface PickChannelProps {
  values: any
  setValues: (values: { channel: number }) => void
  session: any
}

const PickChannel = ({ values, setValues, session }: PickChannelProps) => {
  const [channelData, setChannelData] = useState<Channel[]>([])
  useEffect(() => {
    const fetchURL = new URL('/channel/', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setChannelData(json.results)
      })
  }, [session])

  return (
    <TextField
      value={values.channel?.name}
      key={'channel.name'}
      name={'Channel'}
      label='Channel'
      select
      onChange={e => setValues({ ...values, channel: { name: e.target.value } })}
    >
      {channelData?.map(channel => (
        <MenuItem
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
          key={channel.pk}
          value={channel.name}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <img alt='avatar' height={25} src={channel.image} loading='lazy' style={{ borderRadius: '50%' }} />
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{channel.name}</span>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  )
}

export default PickChannel
