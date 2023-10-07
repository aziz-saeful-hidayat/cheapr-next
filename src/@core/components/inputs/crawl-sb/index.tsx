import React, { useState, useEffect } from 'react'
import { Box, Button, MenuItem, TextField } from '@mui/material'

type Channel = {
  pk: number
  name: string
  image: string
}

interface CrawlSBProps {
  session: any
}
type InventoryItem = {
  [key: string]: any
}
const person = {
  pk: 23,
  name: 'Leigh Ann Peters',
  phone: '+1 207-835-4259 ext. 30141',
  email: null,
  address: {
    pk: 22,
    street_1: '13517 STATESVILLE RD',
    street_2: null,
    zip: '28078-9047',
    city: {
      pk: 24,
      name: 'HUNTERSVILLE',
      state: {
        pk: 13,
        name: '',
        short: 'NC',
        country: {
          pk: 1,
          name: 'United States',
          short: 'US'
        }
      }
    }
  }
}
export type SalesOrder = {
  pk: number
  order_id: string
  order_date: string
  delivery_date: string
  person: typeof person
  channel: {
    pk: number
    name: string
    image: string
  }
  seller: {
    pk: number
    name: string
  }
  status: string
  tracking_number: string
  seller_name: string
  purchase_link: string
  channel_order_id: string
  total_cost: number
  shipping_cost: number
  channel_fee: number
  purchase_cost: number
  inbound_shipping: number
  purchase_items: number
  all_cost: number
  gross_sales: number
  profit: number
  ss_shipping_cost: number
  comment: string
  inventoryitems: InventoryItem[]
  salesitems: InventoryItem[]
  destination: string
  sales: {
    pk: number
    order_id: string
  }
}
const CrawlSB = ({ session }: CrawlSBProps) => {
  const [isopen, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const [choosed, setChoosed] = useState('')
  const [sbId, setSbId] = useState('')
  const [btnText, setBtnText] = useState('Crawl')

  const [options, setOptions] = useState<SalesOrder[]>([])
  const fetchSbId = () => {
    if (sbId) {
      setLoading2(true)
      setBtnText('Loading')
      fetch(`https://cheapr.my.id/get_sellbrite_order`, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ order_id: sbId })
      })
        .then(response => response.json())
        .then(json => {
          console.log(json)
          if (json.pk) {
            setBtnText('Success')
          }
        })
        .finally(() => {
          setTimeout(() => {
            setSbId('')
            setLoading2(false)
            setBtnText('Crawl')
          }, 1000)
        })
    }
  }
  return (
    <Box sx={{ display: 'flex', marginX: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <TextField
        label={'Sellbrite Order ID'}
        name={'sb_order_id'}
        value={sbId}
        onChange={e => setSbId(e.target.value)}
        sx={{ width: 'auto' }}
      />
      <Button color='primary' onClick={fetchSbId} variant='contained' disabled={!sbId}>
        {btnText}
      </Button>
    </Box>
  )
}

export default CrawlSB
