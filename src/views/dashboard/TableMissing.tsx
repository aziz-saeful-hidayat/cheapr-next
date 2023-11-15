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

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import moment from 'moment-timezone'
import { useEffect, useState } from 'react'
import { SellingOrder } from 'src/@core/types'

interface RowType {
  status: string
  order_id: string
  store: string
  carrier: string
  tracking: string
  eta: string
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const rows: RowType[] = [
  {
    status: 'Zebra',
    order_id: 'Zebra',
    store: '$19,586.23',
    carrier: '$5,586.23',
    tracking: '%14.7',
    eta: 'Zebra'
  }
]

const statusObj: StatusObj = {
  applied: { color: 'info' },
  rejected: { color: 'error' },
  current: { color: 'primary' },
  resigned: { color: 'warning' },
  professional: { color: 'success' }
}

interface TableMissingProps {
  session: any
}

const TableMissing = ({ session }: TableMissingProps) => {
  const [sales, setSales] = useState<SellingOrder[]>([])
  useEffect(() => {
    fetch('https://cheapr.my.id/selling_order/?limit=50&filter=missing_get_by', {
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setSales(json.results)
        console.log(json.results)
      })
  }, [session])
  return (
    <Card
      sx={{
        minHeight: 480
      }}
    >
      <CardHeader
        title={`Buffers Missing Get By Today ${moment
          .utc(Date.now())
          .tz('America/Denver')
          .format('MM/DD/YYYY')} - To Be Cancelled`}
        titleTypographyProps={{ sx: { lineHeight: '1.2 !important', letterSpacing: '0.31px !important' } }}
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
              <TableCell>Get By</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>Tracking</TableCell>
              <TableCell>ETA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales?.map((row: SellingOrder) => (
              <TableRow
                hover
                key={row.order_id}
                sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 }, height: 35 }}
              >
                <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    {row.salesitems
                      .map(sales => sales.tracking)
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
                <TableCell>{moment(row.delivery_date).tz('America/Los_Angeles').format('MM-DD-YY')}</TableCell>

                <TableCell>{row.channel_order_id}</TableCell>
                <TableCell>{row.seller_name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    {row.salesitems
                      .map(sales => sales.tracking)
                      .map((tracking, index) => {
                        if (tracking) {
                          return <Typography color='inherit'>{tracking?.fullcarrier?.name}</Typography>
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
                    {row.salesitems
                      .map(sales => sales.tracking)
                      .map((tracking, index) => {
                        if (tracking) {
                          return <Typography color='inherit'>{tracking?.tracking_number}</Typography>
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
                    {row.salesitems
                      .map(sales => sales.tracking)
                      .map((tracking, index) => {
                        if (tracking) {
                          return (
                            <Typography color='inherit'>
                              {moment(tracking?.eta_date).tz('America/Los_Angeles').format('MM-DD-YY')}
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

export default TableMissing
