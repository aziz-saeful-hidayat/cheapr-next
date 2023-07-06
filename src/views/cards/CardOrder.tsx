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

// Styled Box component
const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const CardOrder = ({
  orderData,
  type
}: {
  orderData: BuyingOrder | SalesOrder | undefined
  type: 'buying' | 'sales'
}) => {
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
          <Grid item xs={12} sm={4}>
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Seller: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.seller_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Order Date: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.order_date}
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Status: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.delivery_date ? 'Received' : 'Incoming'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Tracking Number: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {orderData?.tracking_number}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Num of Item: </Typography>
              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {type == 'buying' ? orderData?.inventoryitems?.length : orderData?.salesitems?.length} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Total: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {type == 'buying'
                  ? formatterUSD.format(
                      orderData?.inventoryitems
                        ? orderData?.inventoryitems.reduce((accumulator, object) => {
                            if (object.total_cost) {
                              return accumulator + parseFloat(object.total_cost)
                            } else {
                              return accumulator
                            }
                          }, 0)
                        : 0
                    )
                  : formatterUSD.format(orderData?.total_cost ? orderData?.total_cost : 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body1'>Shipping: </Typography>

              <Typography variant='body1' sx={{ marginLeft: 'auto' }}>
                {type == 'buying'
                  ? formatterUSD.format(
                      orderData?.inventoryitems
                        ? orderData?.inventoryitems.reduce((accumulator, object) => {
                            if (object.shipping_cost) {
                              return accumulator + parseFloat(object.shipping_cost)
                            } else {
                              return accumulator
                            }
                          }, 0)
                        : 0
                    )
                  : formatterUSD.format(orderData?.shipping_cost ? orderData?.shipping_cost : 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardOrder
