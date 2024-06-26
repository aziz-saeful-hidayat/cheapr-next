import React, { useEffect, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Paper,
  TableBody,
  Chip
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import CrawlSB from '../inputs/crawl-sb'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import { SalesItem } from 'src/@core/types'

type InventoryItem = {
  [key: string]: any
}
type Seller = {
  pk: number
  name: string
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
interface PickSalesModalProps {
  onClose: () => void
  onRefresh: () => void
  open: boolean
  pk: number
  picked: number[] | undefined
  session: ExtendedSession
}

interface ConfirmationModalProps {
  onClose: () => void
  onSubmit: (salesItem: number) => void
  open: boolean
  pk: string | number
  session: ExtendedSession
}

interface ConfirmationCanceledModalProps {
  onClose: () => void
  open: boolean
}

export const ConfirmationModal = ({ open, onClose, onSubmit, pk, session }: ConfirmationModalProps) => {
  const [salesItemData, setSalesItemData] = useState<SalesItem[]>([])
  const handleSubmit = (salesItem: number) => {
    //put your validation logic here
    onSubmit(salesItem)
    onClose()
  }
  const fetchSalesItems = () => {
    fetch(`https://cheapr.my.id/sales_items/?item=&no_item=false&selling=${pk}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => {
        setSalesItemData(json.results)
      })
  }
  useEffect(() => {
    if (pk) {
      fetchSalesItems()
    }
  }, [pk, session])
  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>
        This Order has no unlinked sales item, do you want to send a replacement?
      </DialogTitle>
      <TableContainer component={Paper}>
        <Table aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell align='right'>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesItemData.map(salesItem => (
              <TableRow key={salesItem.pk}>
                <TableCell component='th' scope='row'>
                  {salesItem.sku.sku}
                </TableCell>

                <TableCell align='right'>
                  <Chip
                    sx={{
                      fontSize: 10
                    }}
                    label='Replace'
                    onClick={() => {
                      handleSubmit(salesItem.pk)
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export const ConfirmationCanceledModal = ({ open, onClose }: ConfirmationCanceledModalProps) => {
  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>
        This Order has been canceled, you can not link the purchase to this order?
      </DialogTitle>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export const PickMacthingSales = ({ open, onClose, pk, picked, session, onRefresh }: PickSalesModalProps) => {
  const [isopen, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const [choosed, setChoosed] = useState('')
  const [sbId, setSbId] = useState('')
  const [btnText, setBtnText] = useState('Crawl')
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [isConfirmCanceledOpen, setConfirmCanceledOpen] = useState(false)

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
  const [matchesData, setMatchesData] = useState<{ best: SalesOrder[]; other: SalesOrder[] }>({ best: [], other: [] })

  const fetchPickSales = () => {
    fetch(`https://cheapr.my.id/buying_order/${pk}/find_matches/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => {
        setMatchesData(json)
      })
  }
  useEffect(() => {
    fetchPickSales()
  }, [pk, session])

  const handlePickSelling = (sales: number) => {
    fetch(`https://cheapr.my.id/create_selling_buying/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sales: sales, purchase: pk })
    })
      .then(response => response.json())
      .then(json => {})
      .finally(() => {
        onRefresh()
        onClose()
      })
  }
  const handleRemoveSelling = (sales: number) => {
    fetch(`https://cheapr.my.id/delete_selling_buying/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sales: sales, purchase: pk })
    })
      .then(response => response.json())
      .then(json => {
        if (json.pk) {
        }
      })
      .finally(() => {
        onRefresh()
        onClose()
      })
  }
  const createReplacement = (salesItem: number) => {
    if (salesItem) {
      fetch(`https://cheapr.my.id/sales_items/${salesItem}/create_replacement/`, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        })
      })
        .then(response => response.json())
        .then(json => {
          console.log(json)
          if (json.status == 'OK') {
            handlePickSelling(json.selling)
          }
        })
    }
  }
  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Pick Sales</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ width: 600, bgcolor: 'background.paper' }}>
        <CrawlSB session={session} />
        <Autocomplete
          id='search-sales'
          sx={{ margin: 10 }}
          open={isopen}
          onOpen={() => {
            setOpen(true)
          }}
          onClose={() => {
            setOpen(false)
          }}
          onChange={(event, newValue) => {
            console.log(newValue)
            if (newValue) {
              if (newValue.salesitems.filter(s => !s.item).length == 0) {
                setChoosed(newValue.pk.toString())
                setConfirmOpen(true)
              } else if (newValue.status == 'canceled') {
                setConfirmCanceledOpen(true)
              } else {
                setChoosed(newValue.pk.toString())
                handlePickSelling(newValue.pk)
              }
            }
          }}
          isOptionEqualToValue={(option, value) => option.pk === value.pk}
          getOptionLabel={option =>
            `${option.order_id} ${option.channel_order_id ? option.channel_order_id : '------'} ${
              option.person?.name ? option.person?.name : '------'
            } ${option.person?.address?.street_1 ? option.person?.address?.street_1 : '------'} ${
              option.person?.address?.zip ? option.person?.address?.zip : '------'
            } ${option.person?.address?.zip ? option.person?.address?.zip : '------'}`
          }
          options={options}
          loading={loading}
          renderInput={params => (
            <TextField
              {...params}
              onChange={e =>
                fetch(`https://cheapr.my.id/selling_order/?search=${e.target.value}`, {
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
              }
              label='Search Sales'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                )
              }}
            />
          )}
        />
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>CHANNEL ORDER ID</TableCell>
                <TableCell align='right'>CUSTOMER</TableCell>
                <TableCell align='right'>ADDRESS</TableCell>
                <TableCell align='right'>ZIP</TableCell>
                <TableCell align='right'>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key='best' sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component='th' scope='row'>
                  <span style={{ fontWeight: 500 }}>Matching Names:</span>
                </TableCell>
                <TableCell align='right'></TableCell>
                <TableCell align='right'></TableCell>
                <TableCell align='right'></TableCell>
              </TableRow>
              {matchesData.best?.map(sales => (
                <TableRow key={sales.pk}>
                  <TableCell component='th' scope='row'>
                    {sales.channel_order_id}
                  </TableCell>

                  <TableCell align='right'>{sales.person?.name}</TableCell>
                  <TableCell align='right'>
                    {sales.person?.address?.street_1} {sales.person?.address?.city?.name}{' '}
                    {sales.person?.address?.city?.state?.name}
                  </TableCell>
                  <TableCell align='right'>{sales.person?.address?.zip}</TableCell>
                  <TableCell align='right'>
                    {picked?.includes(sales.pk) ? (
                      <Chip
                        sx={{
                          fontSize: 10
                        }}
                        label='Remove'
                        onClick={() => {
                          handleRemoveSelling(sales.pk)
                        }}
                      />
                    ) : (
                      <Chip
                        sx={{
                          fontSize: 10
                        }}
                        label='Pick'
                        onClick={() => {
                          handlePickSelling(sales.pk)
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow key='other' sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component='th' scope='row'>
                  <span style={{ fontWeight: 500 }}>Matching ZIP</span>
                </TableCell>
                <TableCell align='right'></TableCell>
                <TableCell align='right'></TableCell>
                <TableCell align='right'></TableCell>
              </TableRow>

              {matchesData.other?.map(sales => (
                <TableRow key={sales.pk}>
                  <TableCell component='th' scope='row'>
                    {sales.channel_order_id}
                  </TableCell>
                  <TableCell align='right'>{sales.person?.name}</TableCell>
                  <TableCell align='right'>
                    {sales.person?.address?.street_1} {sales.person?.address?.city?.name}{' '}
                    {sales.person?.address?.city?.state?.name}
                  </TableCell>
                  <TableCell align='right'>{sales.person?.address?.zip}</TableCell>
                  <TableCell align='right'>
                    {picked?.includes(sales.pk) ? (
                      <Chip
                        sx={{
                          fontSize: 10
                        }}
                        label='Remove'
                        onClick={() => {
                          handleRemoveSelling(sales.pk)
                        }}
                      />
                    ) : (
                      <Chip
                        sx={{
                          fontSize: 10
                        }}
                        label='Pick'
                        onClick={() => {
                          handlePickSelling(sales.pk)
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <nav aria-label='main mailbox folders'>

        <List>
          {data.map(sales => (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary={sales.order_id} />
                <ListItemText primary={sales.seller_name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </nav> */}
      </Box>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <ConfirmationModal
        session={session}
        pk={choosed}
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onSubmit={salesItem => createReplacement(salesItem)}
      />
      <ConfirmationCanceledModal open={isConfirmCanceledOpen} onClose={() => setConfirmCanceledOpen(false)} />
    </Dialog>
  )
}

export default PickMacthingSales
