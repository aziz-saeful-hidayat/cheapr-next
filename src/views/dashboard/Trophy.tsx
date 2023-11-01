// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import { formatterUSDStrip } from 'src/constants/Utils'

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')({
  right: 0,
  bottom: 0,
  height: 170,
  position: 'absolute'
})

// Styled component for the trophy image
const TrophyImg = styled('img')({
  right: 36,
  bottom: 20,
  height: 98,
  position: 'absolute'
})

const Trophy = (props: {
  data: {
    open: { count: number; data: { all_cost: number; sales_shipping: number; outbound_shipping: number } }
    buffer: { count: number; data: { all_cost: number; sales_shipping: number; outbound_shipping: number } }
    unverified: { direct: number; ebay: number }
  }
}) => {
  const { data } = props
  // ** Hook
  const theme = useTheme()

  const imageSrc = theme.palette.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png'

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h6'>Good Job! 🥳</Typography>
        <Typography variant='body2' sx={{ letterSpacing: '0.25px' }}>
          {data?.open?.count} Open Orders
        </Typography>
        <Typography variant='h5' sx={{ my: 4, color: 'primary.main' }}>
          {formatterUSDStrip(data?.open?.data?.all_cost)}
        </Typography>
        <Button size='small' variant='contained'>
          View Orders
        </Button>
        <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
        <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
      </CardContent>
    </Card>
  )
}

export default Trophy
