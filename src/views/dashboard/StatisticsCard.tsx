// ** React Imports
import { ReactElement } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import TrendingUp from 'mdi-material-ui/TrendingUp'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import CellphoneLink from 'mdi-material-ui/CellphoneLink'
import AccountOutline from 'mdi-material-ui/AccountOutline'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { formatterUSDStrip } from 'src/constants/Utils'

interface DataType {
  link: string
  stats: string
  title: string
  color: ThemeColor
  icon: ReactElement
}

const renderStats = (salesData: DataType[]) => {
  return salesData.map((item: DataType, index: number) => (
    <Grid item xs={12} sm={3} key={index}>
      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          variant='rounded'
          sx={{
            mr: 3,
            width: 44,
            height: 44,
            boxShadow: 3,
            color: 'common.white',
            backgroundColor: `${item.color}.main`
          }}
        >
          {item.icon}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='caption'>{item.title}</Typography>
          <Typography variant='h6'>{item.stats}</Typography>
        </Box>
      </Box>
    </Grid>
  ))
}

const StatisticsCard = (props: {
  data: {
    open: { count: number; data: { all_cost: number; sales_shipping: number; outbound_shipping: number } }
    buffer: { count: number; data: { all_cost: number; sales_shipping: number; outbound_shipping: number } }
    unverified: { direct: number; ebay: number }
  }
}) => {
  const { data } = props
  const salesData: DataType[] = [
    {
      stats: formatterUSDStrip(data?.open?.data?.all_cost),
      title: `${data?.open?.count} Open Orders`,
      color: 'primary',
      icon: <TrendingUp sx={{ fontSize: '1.75rem' }} />,
      link: '/sales/'
    },
    {
      stats: formatterUSDStrip(data?.buffer?.data?.all_cost),
      title: `${data?.buffer?.count} Open Orders (Buffers)`,
      color: 'success',
      icon: <AccountOutline sx={{ fontSize: '1.75rem' }} />,
      link: '/sales/'
    },
    {
      stats: `eBay: ${data?.unverified?.ebay} Direct: ${data?.unverified?.direct}`,
      color: 'warning',
      title: `Unverified Purchase`,
      icon: <CellphoneLink sx={{ fontSize: '1.75rem' }} />,
      link: '/purchase/'
    },
    {
      stats: '$88k',
      color: 'info',
      title: `Total Order`,
      icon: <CurrencyUsd sx={{ fontSize: '1.75rem' }} />,
      link: '/'
    }
  ]

  return (
    <Card>
      <CardHeader
        title='Statistics Card'
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
        subheader={
          <Typography variant='body2'>
            <Box component='span' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Total 48.5% growth
            </Box>{' '}
            😎 last 30 days
          </Typography>
        }
        titleTypographyProps={{
          sx: {
            mb: 2.5,
            lineHeight: '2rem !important',
            letterSpacing: '0.15px !important'
          }
        }}
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(3)} !important` }}>
        <Grid container spacing={[5, 0]}>
          {renderStats(salesData)}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
