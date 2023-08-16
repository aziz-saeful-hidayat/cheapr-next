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
import { BuyingOrder, SalesOrder } from 'src/pages/purchase/[purchaseId]'
import { formatterUSD } from 'src/constants/Utils'
import { useEffect, useState } from 'react'

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
  tableData
}: {
  orderData: SalesOrder | undefined
  type: 'sales'
  tableData: Item[]
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
    console.log(tableData)
    setSalesData({
      sales_items: orderData ? orderData?.salesitems?.length : 0,
      sales_item_revenue: orderData?.total_cost ? orderData?.total_cost : 0,
      sales_shipping: orderData && !isNaN(orderData?.shipping_cost) ? orderData?.shipping_cost : 0,
      sales_fee: orderData && !isNaN(orderData?.channel_fee) ? orderData?.channel_fee : 0,
      gross_sales: orderData && !isNaN(orderData?.gross_sales) ? orderData?.gross_sales : 0,
      purchase_cost: orderData && !isNaN(orderData?.purchase_cost) ? orderData?.purchase_cost : 0,
      profit: orderData && !isNaN(orderData?.profit) ? orderData?.profit : 0,
      outbound_shipping: orderData?.ss_shipping_cost ? orderData?.ss_shipping_cost : 0,
      purchase_items: tableData?.filter(item => !!item.pk).reduce((prev, next) => prev + 1, 0),
      purchase_items_cost: tableData
        ?.filter(item => !!item.pk)
        .reduce((prev, next) => prev + parseFloat(next.total_cost), 0),
      inbound_shipping: tableData
        ?.filter(item => !!item.pk)
        .reduce((prev, next) => prev + parseFloat(next.shipping_cost), 0)
    })
    console.log(salesData)
  }, [orderData, tableData])
  const getTotal = () =>
    parseFloat(salesData.sales_item_revenue) +
    parseFloat(salesData.sales_shipping) -
    parseFloat(salesData.outbound_shipping) -
    parseFloat(salesData.purchase_items_cost) -
    parseFloat(salesData.inbound_shipping)
  return (
    <Card sx={{ marginBottom: 5 }}>
      <CardContent sx={{ padding: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}>
        <Typography variant='h6' sx={{ marginBottom: 3.5 }}>
          Order / {orderData?.order_id}
        </Typography>
        {/* <Typography variant='body2'>
          Here, I focus on a range of items and features that we use in life without giving them a second thought such
          as Coca Cola, body muscles and holding ones own breath. Though, most of these notes are not fundamentally
          necessary, they are such that you can use them for a good laugh, at a drinks party or for picking up women or
          men.
        </Typography> */}
        <Divider sx={{ marginTop: 6.5, marginBottom: 6.75 }} />
        <Grid container spacing={20}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />{' '}
              <Typography variant='body1'>Channel: </Typography>
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
                    <Typography variant='body1'>{orderData?.channel?.name}</Typography>
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Order ID: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.channel_order_id}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Seller: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.seller_name}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Order Date: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.order_date.slice(0, 10)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Status: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.status}
              </Typography>
            </Box>
            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Tracking Number: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
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
              <Typography variant='body1'>Num of Item: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {salesData.sales_items} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Item: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.sales_item_revenue)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Shipping: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.sales_shipping)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Channel Fee: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto', color: 'red' }}>
                {formatterUSD.format(salesData.sales_fee)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Outbound Shipping: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto', color: 'red' }}>
                {formatterUSD.format(salesData.outbound_shipping)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Total: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.gross_sales)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Purchase Cost: </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Num of Item: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {salesData.purchase_items} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Item: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(parseFloat(salesData.purchase_items_cost))}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Inbound Shipping: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(parseFloat(salesData.inbound_shipping))}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Total: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.purchase_cost)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Profit : </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Revenue: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.gross_sales)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Cost: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {formatterUSD.format(salesData.purchase_cost)}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Gross Profit: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto', color: salesData.profit > 0 ? 'black' : 'red' }}>
                {formatterUSD.format(salesData.profit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardSales
