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
import InitialDrops from './initial-drop'
import ArchiveDrops from './archive-drop'
import PMKws from './pm-kws'
import PMSpiff from './pm-spiff'
import GlobalSettings from './global-settings'
import PMMake from './pm-make'

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
  const [value, setValue] = useState<string>('pm-kws')

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
              value='pm-kws'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>PMs & KWs</TabName>
                </Box>
              }
            />
            <Tab
              value='pm-make'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Makes</TabName>
                </Box>
              }
            />
            <Tab
              value='archive-drop'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Archive Drop</TabName>
                </Box>
              }
            />
            <Tab
              value='initial-drop'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Initial Drop</TabName>
                </Box>
              }
            />

            <Tab
              value='pm-spiff'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>PMs SPIFF</TabName>
                </Box>
              }
            />
            <Tab
              value='global-settings'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountOutline />
                  <TabName>Global Settings</TabName>
                </Box>
              }
            />
          </TabList>
          <TabPanel sx={{ p: 0 }} value='pm-kws'>
            <PMKws session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='pm-make'>
            <PMMake session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='archive-drop'>
            <ArchiveDrops session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='initial-drop'>
            <InitialDrops session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='pm-spiff'>
            <PMSpiff session={session} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='global-settings'>
            <GlobalSettings session={session} />
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
