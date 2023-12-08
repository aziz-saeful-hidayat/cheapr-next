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
import { FormControl, IconButton, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { BuyingOrder } from 'src/@core/types'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'

// Styled Box component
const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const CardOrder = ({
  orderData,
  type,
  onClose,
  setRefresh,
  session
}: {
  orderData: BuyingOrder | undefined
  type: 'buying' | 'sales'
  onClose?: () => void
  setRefresh: () => void
  session: ExtendedSession
}) => {
  return (
    <Card sx={{ marginBottom: 5 }}>
      <CardContent sx={{ padding: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}>
        <Grid container spacing={20}>
          {/* <Grid item xs={12} sm={2}>
            <Typography variant='h6'>ID.#: </Typography>
            <Typography variant='body2'>{orderData?.order_id}</Typography>
          </Grid> */}
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
              {orderData?.seller?.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='h6'>Order Date: </Typography>
            <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
              {orderData?.order_date.slice(0, 10)}
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
                value={orderData?.status ? orderData?.status : 'none'}
                autoWidth
                onChange={(event: SelectChangeEvent) => {
                  if (
                    !confirm(
                      `Are you sure you want to change this Order #${orderData?.pk} to ${event.target.value as string}`
                    )
                  ) {
                    return
                  }
                  console.log(`https://cheapr.my.id/buying_order/${orderData?.pk}/`)
                  console.log(session?.accessToken)
                  console.log(event.target.value)
                  fetch(`https://cheapr.my.id/buying_order/${orderData?.pk}/`, {
                    // note we are going to /1
                    method: 'PATCH',
                    headers: {
                      Authorization: `Bearer ${session?.accessToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: event.target.value == 'none' ? '' : event.target.value })
                  })
                    .then(response => {
                      console.log('status', response.status)
                      return response.json()
                    })
                    .then(json => console.log('data', json))
                    .finally(() => setRefresh())
                }}
              >
                <MenuItem value={'Active'}>Active</MenuItem>
                <MenuItem value={'Cancelled'}>Canceled</MenuItem>
                <MenuItem value={'Completed'}>Completed</MenuItem>
                <MenuItem value={'Refunded'}>Refunded</MenuItem>
                <MenuItem value={'Returned'}>Returned</MenuItem>
                <MenuItem value={'Refund Awaited'}>Refund Awaited</MenuItem>
                <MenuItem value={'none'}>No Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'red'
          }}
        >
          <CloseIcon />
        </IconButton>
        {/* <Typography variant='body2'>
          Here, I focus on a range of items and features that we use in life without giving them a second thought such
          as Coca Cola, body muscles and holding ones own breath. Though, most of these notes are not fundamentally
          necessary, they are such that you can use them for a good laugh, at a drinks party or for picking up women or
          men.
        </Typography> */}
        <Divider sx={{ marginTop: 6.5, marginBottom: 6.75 }} />
        <Grid container spacing={20}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Buyer </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Phone: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.person?.phone}
              </Typography>
            </Box>
            {orderData?.person?.email && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>Email: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.email}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Street 1: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.person?.address?.street_1}
              </Typography>
            </Box>
            {orderData?.person?.address?.street_2 && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>Street 2: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.address?.street_2}
                </Typography>
              </Box>
            )}
            {orderData?.person?.address?.zip && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
                <Typography variant='body2'>ZIP: </Typography>
                <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                  {orderData?.person?.address?.zip}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Detail </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Order Date: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.order_date}
              </Typography>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AccountOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Order ID: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {orderData?.channel_order_id}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>Financial </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Num of Item: </Typography>
              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {type == 'buying' && orderData?.inventoryitems?.length} Item
              </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Total: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {type == 'buying'
                  ? formatterUSDStrip(
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
                  : formatterUSDStrip(orderData?.total_cost ? orderData?.total_cost : 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarOutline sx={{ color: 'primary.main', marginRight: 2.75 }} fontSize='small' />
              <Typography variant='body2'>Shipping: </Typography>

              <Typography variant='body2' sx={{ marginLeft: 'auto' }}>
                {type == 'buying'
                  ? formatterUSDStrip(
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
                  : formatterUSDStrip(orderData?.shipping_cost ? orderData?.shipping_cost : 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardOrder
