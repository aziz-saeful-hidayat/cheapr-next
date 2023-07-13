import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Icons Imports
import Poll from 'mdi-material-ui/Poll'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import Table from 'src/views/dashboard/Table'
import Trophy from 'src/views/dashboard/Trophy'
import TotalEarning from 'src/views/dashboard/TotalEarning'
import StatisticsCard from 'src/views/dashboard/StatisticsCard'
import WeeklyOverview from 'src/views/dashboard/WeeklyOverview'
import DepositWithdraw from 'src/views/dashboard/DepositWithdraw'
import SalesByCountries from 'src/views/dashboard/SalesByCountries'

import { withAuth } from '../../constants/HOCs'
import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import TableBrand from 'src/views/dashboard/TableBrand'
import IncomeStatement from 'src/views/dashboard/IncomeStatement'

const Report = (props: any) => {
  const { session } = props
  const [dashboardData, setDashboardData] = useState([])
  useEffect(() => {
    const fetchURL = new URL('/get_dashboard_data', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setDashboardData(json.data)
        console.log(json)
      })
  }, [session])
  if (session) {
    return (
      <ApexChartWrapper>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <IncomeStatement />
          </Grid>
          {/* <Grid item xs={12} md={8}>
            <Grid container spacing={6}>
              <Grid item xs={3}>
                <CardStatisticsVerticalComponent
                  stats='$25.6k'
                  icon={<Poll />}
                  color='success'
                  trendNumber='+42%'
                  title='Total Order'
                  subtitle='Weekly Profit'
                />
              </Grid>
              <Grid item xs={3}>
                <CardStatisticsVerticalComponent
                  stats='$78'
                  title='Total Revenue'
                  trend='negative'
                  color='secondary'
                  trendNumber='-15%'
                  subtitle='Past Month'
                  icon={<CurrencyUsd />}
                />
              </Grid>
              <Grid item xs={3}>
                <CardStatisticsVerticalComponent
                  stats='862'
                  trend='negative'
                  trendNumber='-18%'
                  title='Total Profit'
                  subtitle='Yearly Project'
                  icon={<BriefcaseVariantOutline />}
                />
              </Grid>
              <Grid item xs={3}>
                <CardStatisticsVerticalComponent
                  stats='15'
                  color='warning'
                  trend='negative'
                  trendNumber='-18%'
                  subtitle='Last Week'
                  title='Profit Margin'
                  icon={<HelpCircleOutline />}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Trophy data={dashboardData} />
          </Grid> */}
          {/* <Grid item xs={12} md={6}>
            <TableBrand />
          </Grid> */}
          {/* <Grid item xs={12} md={6}>
            <WeeklyOverview />
          </Grid> */}

          {/* <Grid item xs={12} md={12} lg={8}>
            <DepositWithdraw />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TotalEarning />
          </Grid> */}

          {/* <Grid item xs={12} md={8}>
            <StatisticsCard data={dashboardData} />
          </Grid>
          <Grid item xs={12}>
            <Table />
          </Grid> */}
        </Grid>
      </ApexChartWrapper>
    )
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
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

export default withAuth(3 * 60)(Report)
