// ** React Imports
import { SyntheticEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'

// ** Demo Tabs Imports
import TabInfo from 'src/views/account-settings/TabInfo'
import TabAccount from 'src/views/account-settings/TabAccount'
import TabSecurity from 'src/views/account-settings/TabSecurity'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

import { withAuth } from '../../constants/HOCs'
import { getSession } from 'next-auth/react'

import AllSeller from './all'
import { useRouter } from 'next/router'

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const AllTabs = [
  'all',
  'unfulfilled',
  'unfulfilled-buffers',
  'fulfilled',
  'ha-unlinked',
  'canceled',
  'replacement',
  'return'
]

const Sales = (props: any) => {
  const { session } = props

  // ** State
  const { query } = useRouter()
  const [value, setValue] = useState<string>(
    typeof query.tab == 'string' && AllTabs.includes(query.tab) ? query.tab : 'all'
  )

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }
  if (session) {
    return (
      <Card>
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label='purchase tabs'
            sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Tab
              value='all'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>All</TabName>
                </Box>
              }
            />
          </TabList>
          <TabPanel sx={{ p: 0 }} value='all'>
            <AllSeller session={session} />
          </TabPanel>
        </TabContext>
      </Card>
    )
  }

  return <></>
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/pages/login',
        permanent: false
      }
    }
  }

  return {
    props: { session }
  }
}

export default withAuth(3 * 60)(Sales)
