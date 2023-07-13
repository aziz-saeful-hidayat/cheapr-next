// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'

// ** Icons Imports
import MenuUp from 'mdi-material-ui/MenuUp'
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import Divider from '@mui/material/Divider'

interface DataType {
  title: string
  imgSrc: string
  amount: string
  subtitle: string
  progress: number
  color: ThemeColor
  imgHeight: number
}

const data: DataType[] = [
  {
    progress: 75,
    imgHeight: 20,
    title: 'Zebra',
    color: 'primary',
    amount: '$24,895.65',
    subtitle: 'Vuejs, React & HTML',
    imgSrc: '/images/cards/logo-zipcar.png'
  },
  {
    progress: 50,
    color: 'info',
    imgHeight: 27,
    title: 'Epson',
    amount: '$8,650.20',
    subtitle: 'Sketch, Figma & XD',
    imgSrc: '/images/cards/logo-bitbank.png'
  },
  {
    progress: 20,
    imgHeight: 20,
    title: 'Canon',
    color: 'secondary',
    amount: '$1,245.80',
    subtitle: 'HTML & Angular',
    imgSrc: '/images/cards/logo-aviato.png'
  }
]

const IncomeStatement = () => {
  return (
    <Card sx={{ p: 4 }}>
      <CardHeader
        title='INCOME STATEMENT'
        titleTypographyProps={{ sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' } }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2.25)} !important` }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>Revenue</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              1,351,503
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>COGS</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              289,859
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>GROSS PROFIT</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              1,061,698
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>OPEX</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              913,051
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, pl: 4, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>Sales</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>446,901</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, pl: 4, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>Marketing</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>225,951</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, pl: 4, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>General & Admin</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>240,117</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, pl: 4, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>Other Expenses</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>18,804</Typography>
          </Box>
        </Box>

        <Divider />
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>OPERATING PROFIT (EBIT)</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              137,329
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3, pl: 4, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>Interest and Tax</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1'>58,943</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>NET PROFIT</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              78,386
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default IncomeStatement
