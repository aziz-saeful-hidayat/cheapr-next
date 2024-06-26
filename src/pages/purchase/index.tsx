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
import Unverified from './unverified'
import Verified from './verified'
import Replacement from './replacement'
import Return from './return'
import AllPurchase from './all'
import { useRouter } from 'next/router'
import ChangedPurchase from './changed'
import CanceledPurchase from './canceled'
import RefundedPurchase from './refunded'
import RefundAwaitedPurchase from './refund-awaited'

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

const AllTabs = ['all', 'unverified', 'verified', 'replacement', 'return']

const Purchase = (props: any) => {
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
            <Tab
              value='unverified'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Unverified</TabName>
                </Box>
              }
            />

            <Tab
              value='verified'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Verified</TabName>
                </Box>
              }
            />
            <Tab
              value='replacement'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Replacements</TabName>
                </Box>
              }
            />
            <Tab
              value='canceled'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Canceled</TabName>
                </Box>
              }
            />
            <Tab
              value='refunded'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Refunded</TabName>
                </Box>
              }
            />
            <Tab
              value='return'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Returned</TabName>
                </Box>
              }
            />
            <Tab
              value='refund-awaited'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>Refund Awaited</TabName>
                </Box>
              }
            />
            <Tab
              value='changed'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabName>ID CHANGED</TabName>
                </Box>
              }
            />
            {/* <Tab
              value='info'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InformationOutline />
                  <TabName>Info</TabName>
                </Box>
              }
            /> */}
          </TabList>
          <TabPanel sx={{ p: 0 }} value='all'>
            <AllPurchase session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='unverified'>
            <Unverified session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='verified'>
            <Verified session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='replacement'>
            <Replacement session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='canceled'>
            <CanceledPurchase session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='refunded'>
            <RefundedPurchase session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='return'>
            <Return session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='refund-awaited'>
            <RefundAwaitedPurchase session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='changed'>
            <ChangedPurchase session={session} />
          </TabPanel>
          {/* <TabPanel sx={{ p: 0 }} value='info'>
            <TabInfo />
          </TabPanel> */}
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

export default withAuth(3 * 60)(Purchase)
