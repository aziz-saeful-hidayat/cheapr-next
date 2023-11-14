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

import AllSales from './all'
import AllIssues from './all'
import NewIssues from './new'
import WorkingIssues from './working'
import ResolvedIssues from './resolved'
import GaveUpIssues from './gaveup'

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

const Sales = (props: any) => {
  const { session } = props

  // ** State
  const [value, setValue] = useState<string>('all')

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
                  <AccountOutline />
                  <TabName>All</TabName>
                </Box>
              }
            />
            <Tab
              value='N'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>New</TabName>
                </Box>
              }
            />
            <Tab
              value='W'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Working</TabName>
                </Box>
              }
            />
            <Tab
              value='R'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Resolved</TabName>
                </Box>
              }
            />
            <Tab
              value='G'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Gave Up</TabName>
                </Box>
              }
            />
          </TabList>
          <TabPanel sx={{ p: 0 }} value='all'>
            <AllIssues session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='N'>
            <NewIssues session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='W'>
            <WorkingIssues session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='R'>
            <ResolvedIssues session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='G'>
            <GaveUpIssues session={session} />
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
