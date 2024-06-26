// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import TrendingUp from 'mdi-material-ui/TrendingUp'
import StarOutline from 'mdi-material-ui/StarOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import { SalesOrder } from 'src/pages/purchase/[purchaseId]'
import { formatterUSDStrip } from 'src/constants/Utils'
import { useEffect, useState } from 'react'
import { Chip, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'

type Room = {
  pk: number
  name: string
  room_id: string
}
type Rating = {
  pk: number
  name: string
  color: string
}
type Item = {
  pk: number
  selling: number
  product: {
    pk: number
    sku: string
    mpn: string
    make: string
    model: string
    asin: string
  }
  status: string
  serial: string
  comment: string
  room: Room
  rating: Rating
  total_cost: string
  shipping_cost: string
}

// Styled Box component
const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const CardSales = ({
  orderData,
  type,
  tableData,
  onClose,
  session,
  setRefresh
}: {
  orderData: SalesOrder | undefined
  type: 'sales'
  tableData: Item[]
  onClose: () => void
  setRefresh: () => void
  session: ExtendedSession
}) => {
  const [salesData, setSalesData] = useState<any>({
    sales_items: 0,
    sales_item_revenue: 0,
    sales_shipping: 0,
    outbound_shipping: 0,
    purchase_items: 0,
    purchase_items_cost: 0,
    inbound_shipping: 0
  })
  useEffect(() => {
    setSalesData({
      sales_items: orderData ? orderData?.salesitems?.length : 0,
      sales_item_revenue: orderData && !isNaN(orderData?.total_cost) ? orderData?.total_cost : 0,
      sales_shipping: orderData && !isNaN(orderData?.shipping_cost) ? orderData?.shipping_cost : 0,
      sales_fee: orderData && !isNaN(orderData?.channel_fee) ? orderData?.channel_fee : 0,
      gross_sales: orderData && !isNaN(orderData?.gross_sales) ? orderData?.gross_sales : 0,
      purchase_cost: orderData && !isNaN(orderData?.purchase_cost) ? orderData?.purchase_cost : 0,
      all_cost: orderData && !isNaN(orderData?.all_cost) ? orderData?.all_cost : 0,
      profit: orderData && !isNaN(orderData?.profit) ? orderData?.profit : 0,
      outbound_shipping: orderData && !isNaN(orderData?.ss_shipping_cost) ? orderData?.ss_shipping_cost : 0,
      purchase_items: tableData?.filter(item => !!item.pk).reduce((prev, next) => prev + 1, 0),
      purchase_items_cost: orderData && !isNaN(orderData?.purchase_items) ? orderData?.purchase_items : 0,
      inbound_shipping: orderData && !isNaN(orderData?.inbound_shipping) ? orderData?.inbound_shipping : 0,
      refunded: orderData && !isNaN(orderData?.refunded) ? orderData?.refunded : 0,
      returned: orderData && !isNaN(orderData?.returned) ? orderData?.returned : 0
    })
  }, [orderData, tableData])
  return (
    <Card sx={{ marginBottom: 5, bgcolor: orderData?.status == 'canceled' ? '#ffe3e3' : 'white' }}>
      <CardContent sx={{ padding: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}>
        <Grid container spacing={20}>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>SBO.#: </Typography>
            <Typography variant='body2'>{orderData?.order_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Order Id: </Typography>

            <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
              {orderData?.channel_order_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Channel: </Typography>

            <Typography variant='body2'>{orderData?.channel?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Seller: </Typography>
            <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
              {orderData?.seller_name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Order Date: </Typography>
            <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
              {orderData?.order_date?.slice(0, 10)}
            </Typography>
          </Grid>
          {/* <Grid item xs={12} sm={1}>
            <Typography variant='h6'>Status: </Typography>
            <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
              {orderData?.status}
            </Typography>
          </Grid> */}
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Status: </Typography>

            <FormControl sx={{ mt: 1, minWidth: 50 }} size='small'>
              <Select
                value={orderData?.status ? orderData?.status : ''}
                autoWidth
                onChange={(event: SelectChangeEvent) => {
                  if (
                    !confirm(
                      `Are you sure you want to change this Order #${orderData?.pk} to ${event.target.value as string}`
                    )
                  ) {
                    return
                  }
                  fetch(`https://cheapr.my.id/selling_order/${orderData?.pk}/`, {
                    // note we are going to /1
                    method: 'PATCH',
                    headers: {
                      Authorization: `Bearer ${session?.accessToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: event.target.value as string })
                  }).finally(() => setRefresh())
                }}
              >
                <MenuItem value={'open'}>Open</MenuItem>
                <MenuItem value={'canceled'}>Canceled</MenuItem>
                <MenuItem value={'completed'}>Completed</MenuItem>
                <MenuItem value={'replaced'}>Replaced</MenuItem>
                <MenuItem value={'refunded'}>Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* <Typography variant='body2'>
          Here, I focus on a range of items and features that we use in life without giving them a second thought such
          as Coca Cola, body muscles and holding ones own breath. Though, most of these notes are not fundamentally
          necessary, they are such that you can use them for a good laugh, at a drinks party or for picking up women or
          men.
        </Typography> */}

        <Divider sx={{ marginTop: 6.5, marginBottom: 6.75 }} />
        <Grid container spacing={20}>
          {/* <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />{' '}
              <Typography variant='body2'>Channel: </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                {orderData?.channel?.image && (
                  <>
                    <img
                      alt='avatar'
                      height={20}
                      src={orderData?.channel?.image}
                      loading='lazy'
                      style={{ borderRadius: '50%', marginRight: 2.75 }}
                    />
                    <Typography variant='body2'>{orderData?.channel?.name}</Typography>
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Order ID: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.channel_order_id}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Seller: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.seller_name}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Order Date: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.order_date?.slice(0, 10)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Status: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.status}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Tracking Number: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.tracking_number}
              </Typography>
            </Box>
          </Grid> */}
          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Buyer </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Name: </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                {orderData?.person?.name && (
                  <>
                    <Typography variant='body2'>{orderData?.person?.name}</Typography>
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Phone: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.person?.phone}
              </Typography>
            </Box>
            {orderData?.person?.email && (
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>Email: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.email}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Street 1: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.person?.address?.street_1}
              </Typography>
            </Box>
            {orderData?.person?.address?.street_2 && (
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>Street 2: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.address?.street_2}
                </Typography>
              </Box>
            )}
            {orderData?.person?.address?.zip && (
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>ZIP: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.address?.zip}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>City: </Typography>
              {orderData?.person?.address?.city?.name && (
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.address?.city?.name}, {orderData?.person?.address?.city?.state?.short},{' '}
                  {orderData?.person?.address?.city?.state?.country?.short}
                </Typography>
              )}
            </Box>
            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Tracking Number: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.tracking_number}
              </Typography>
            </Box> */}
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Sales: </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Num of Item: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {salesData.sales_items} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Item: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.sales_item_revenue)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Shipping: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.sales_shipping)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Channel Fee: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto', color: 'red' }}>
                {formatterUSDStrip(salesData.sales_fee)}
              </Typography>
            </Box>

            {/* <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Total: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.gross_sales)}
              </Typography>
            </Box> */}
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Purchase Cost: </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Num of Item: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {salesData.purchase_items} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Item: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(parseFloat(salesData.purchase_items_cost))}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Inbound Shipping: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(parseFloat(salesData.inbound_shipping))}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Outbound Shipping: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.outbound_shipping)}
              </Typography>
            </Box>
            {/* <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Total: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.purchase_cost)}
              </Typography>
            </Box> */}
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Profit : </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Revenue: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.gross_sales)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Cost: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.all_cost)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Refunded: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.refunded)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Returned: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {formatterUSDStrip(salesData.returned)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Gross Profit: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto', color: salesData.profit > 0 ? 'black' : 'red' }}>
                {formatterUSDStrip(salesData.profit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardSales
