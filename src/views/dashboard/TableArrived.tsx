// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Link from '@mui/material/Link'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import moment from 'moment-timezone'
import { useEffect, useState } from 'react'
import { BuyingOrder, SellingOrder } from 'src/@core/types'

interface TableArrivedProps {
  session: any
}

const TableArrived = ({ session }: TableArrivedProps) => {
  const [buying, setBuying] = useState<BuyingOrder[]>([])
  const [arrived, setArrived] = useState(moment(Date.now()).format('YYYY-MM-DD'))

  useEffect(() => {
    fetch(`https://cheapr.my.id/buying_order/?arrived=${arrived}`, {
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setBuying(json.results)
        console.log(json.results)
      })
  }, [session, arrived])
  return (
    <Card
      sx={{
        minHeight: 480
      }}
    >
      <CardHeader
        title={`HA Purchase Delivered by ${moment(arrived).format('MM/DD/YYYY')} - To Be Checked`}
        titleTypographyProps={{ sx: { lineHeight: '1.2 !important', letterSpacing: '0.31px !important' } }}
        subheader={
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              sx={{ marginTop: 5 }}
              onChange={value => setArrived(value ? value.format('YYYY-MM-DD') : '')}
              label={'Pick Date'}
              value={arrived ? dayjs(arrived) : null}
            />
          </LocalizationProvider>
        }
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />

      <TableContainer>
        <Table aria-label='table in dashboard'>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Sales ID</TableCell>
              <TableCell>Get By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buying?.map((row: BuyingOrder) => (
              <TableRow hover key={row.pk} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 }, height: 35 }}>
                <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    {row.inventoryitems
                      .map(item => item.tracking)
                      .map((tracking, index) => {
                        if (tracking) {
                          return (
                            <Link
                              href={`${tracking?.fullcarrier?.prefix}${tracking?.tracking_number}${tracking.fullcarrier?.suffix}`}
                              target='_blank'
                            >
                              <Box
                                key={index}
                                sx={theme => ({
                                  backgroundColor:
                                    tracking.status == 'D'
                                      ? theme.palette.success.dark
                                      : tracking.status == 'T'
                                      ? theme.palette.warning.light
                                      : tracking.status == 'I'
                                      ? 'purple'
                                      : theme.palette.error.dark,
                                  borderRadius: '0.5rem',
                                  color: '#fff',
                                  width: 15,
                                  height: 15
                                })}
                              ></Box>
                            </Link>
                          )
                        } else {
                          return (
                            <Box
                              key={index}
                              sx={theme => ({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#a9a9a9',
                                borderRadius: '0.5rem',
                                borderColor: '#000',
                                color: '#fff',
                                width: 12,
                                height: 12
                              })}
                            >
                              <Box
                                sx={theme => ({
                                  backgroundColor: theme.palette.background.paper,
                                  borderRadius: '0.5rem',
                                  borderColor: '#000',
                                  color: '#fff',
                                  width: 9,
                                  height: 9
                                })}
                              ></Box>
                            </Box>
                          )
                        }
                      })}
                  </Box>
                </TableCell>

                <TableCell>{row.channel_order_id}</TableCell>
                <TableCell>{row.channel.name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    {row.inventoryitems
                      .map(item => item.itemsales)
                      .map((salesitem, index) => {
                        if (salesitem) {
                          return <Typography color='inherit'>{salesitem?.selling?.channel_order_id}</Typography>
                        } else {
                          return <Typography color='inherit'></Typography>
                        }
                      })}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    {row.inventoryitems
                      .map(item => item.itemsales)
                      .map((salesitem, index) => {
                        if (salesitem) {
                          return (
                            <Typography color='inherit'>
                              {moment(salesitem?.selling?.delivery_date).format('MM-DD-YY')}
                            </Typography>
                          )
                        } else {
                          return <Typography color='inherit'></Typography>
                        }
                      })}
                  </Box>
                </TableCell>

                {/* <TableCell>
                  <Chip
                    label={row.status}
                    color={statusObj[row.status].color}
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      '& .MuiChip-label': { fontWeight: 500 }
                    }}
                  />
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default TableArrived
