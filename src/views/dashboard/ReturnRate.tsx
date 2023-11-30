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

interface DataType {
  title: string
  imgSrc: string
  amount: string
  amount7: string
  amount14: string
  subtitle: string
  progress: number
  color: ThemeColor
  imgHeight: number
}

const data: DataType[] = [
  {
    progress: 75,
    imgHeight: 20,
    title: 'FlyFishing',
    color: 'primary',
    amount: '0/0 (0%)',
    amount7: '0/0 (0%)',
    amount14: '0/0 (0%)',
    subtitle: 'Vuejs, React & HTML',
    imgSrc: 'https://storage.googleapis.com/cheapr/channel/6F7GTRJXC7QTESEG.png'
  },
  {
    progress: 75,
    imgHeight: 20,
    title: 'FlyFishing CA',
    color: 'primary',
    amount: '0/0 (0%)',
    amount7: '0/0 (0%)',
    amount14: '0/0 (0%)',
    subtitle: 'Vuejs, React & HTML',
    imgSrc: 'https://storage.googleapis.com/cheapr/channel/6F7GTRJXC7QTESEG.png'
  },
  {
    progress: 75,
    imgHeight: 20,
    title: 'C&H',
    color: 'primary',
    amount: '0/0 (0%)',
    amount7: '0/0 (0%)',
    amount14: '0/0 (0%)',
    subtitle: 'Vuejs, React & HTML',
    imgSrc: 'https://storage.googleapis.com/cheapr/channel/6F7GTRJXC7QTESEG.png'
  },
  {
    progress: 75,
    imgHeight: 20,
    title: 'C&H CA',
    color: 'primary',
    amount: '0/0 (0%)',
    amount7: '0/0 (0%)',
    amount14: '0/0 (0%)',
    subtitle: 'Vuejs, React & HTML',
    imgSrc: 'https://storage.googleapis.com/cheapr/channel/6F7GTRJXC7QTESEG.png'
  }
]

const ReturnRate = () => {
  return (
    <Card>
      <CardHeader
        title='Return Rate'
        titleTypographyProps={{ sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' } }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2.25)} !important` }}>
        {/* <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Typography variant='h4' sx={{ fontWeight: 600, fontSize: '2.125rem !important' }}>
            $24,895
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <MenuUp sx={{ fontSize: '1.875rem', verticalAlign: 'middle' }} />
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>
              10%
            </Typography>
          </Box>
        </Box>

        <Typography component='p' variant='caption' sx={{ mb: 10 }}>
          Compared to $84,325 last week
        </Typography> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column', width: 120 }}>
              <Typography variant='body2' sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                STORE
              </Typography>
              {/* <Typography variant='caption'>{item.subtitle}</Typography> */}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', width: 45 }}>
              <Typography variant='body2' sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                7 Days
              </Typography>
              {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 45 }}>
              <Typography variant='body2' sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                14 Days
              </Typography>
              {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 45 }}>
              <Typography variant='body2' sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                30 Days
              </Typography>
              {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
            </Box>
          </Box>
        </Box>
        {data.map((item: DataType, index: number) => {
          return (
            <Box
              key={item.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                ...(index !== data.length - 1 ? { mb: 3 } : {})
              }}
            >
              <Avatar
                variant='rounded'
                sx={{
                  mr: 3,
                  width: 40,
                  height: 40,
                  backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
                }}
              >
                <img src={item.imgSrc} alt={item.title} height={item.imgHeight} />
              </Avatar>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column', width: 85 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  {/* <Typography variant='caption'>{item.subtitle}</Typography> */}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {item.amount7}
                  </Typography>
                  {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {item.amount14}
                  </Typography>
                  {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {item.amount}
                  </Typography>
                  {/* <LinearProgress color={item.color} value={item.progress} variant='determinate' /> */}
                </Box>
              </Box>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default ReturnRate
