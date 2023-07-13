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

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import DotsVertical from 'mdi-material-ui/DotsVertical'

interface RowType {
  name: string
  volume: number
  revenue: string
  profit: string
  margin: string
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const rows: RowType[] = [
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  },
  {
    name: 'Zebra',
    volume: 21,
    revenue: '$19,586.23',
    profit: '$5,586.23',
    margin: '%14.7'
  }
]

const statusObj: StatusObj = {
  applied: { color: 'info' },
  rejected: { color: 'error' },
  current: { color: 'primary' },
  resigned: { color: 'warning' },
  professional: { color: 'success' }
}

const TableBrand = () => {
  return (
    <Card>
      <CardHeader
        title='Top 10 Brands by Revenue'
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
              <TableCell>Brand</TableCell>
              <TableCell>Volume</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>% Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: RowType) => (
              <TableRow hover key={row.name} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 }, height: 35 }}>
                <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.name}</Typography>
                </TableCell>
                <TableCell>{row.volume}</TableCell>
                <TableCell>{row.revenue}</TableCell>
                <TableCell>{row.profit}</TableCell>
                <TableCell>{row.margin}</TableCell>
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

export default TableBrand
