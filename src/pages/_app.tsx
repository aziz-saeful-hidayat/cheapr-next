// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import '../../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { GlobalDataContextConsumer, GlobalDataProvider } from 'src/@core/context/globalContext'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps }
  } = props

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SessionProvider session={session}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>{`${themeConfig.templateName} - Inventory Management`}</title>
            <meta name='description' content={`${themeConfig.templateName} – Inventory Management`} />
            <meta name='keywords' content='Inventory Management' />
            <meta name='viewport' content='initial-scale=1, width=device-width' />
          </Head>
          <GlobalDataProvider>
            <SettingsProvider>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <GlobalDataContextConsumer>
                        {({ globalData, saveGlobalData }) => (
                          <Backdrop
                            sx={{
                              color: '#fff',
                              zIndex: theme => theme.zIndex.drawer + 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            open={globalData.isLoading}

                            // onClick={() => saveGlobalData({ ...globalData, isLoading: false })}
                          >
                            <CircularProgress color='inherit' />
                            <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'inherit', marginTop: 5 }}>
                              {globalData.textLoading}
                            </Typography>
                          </Backdrop>
                        )}
                      </GlobalDataContextConsumer>
                      {getLayout(<Component {...pageProps} />)}
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </GlobalDataProvider>
        </CacheProvider>
      </SessionProvider>
    </LocalizationProvider>
  )
}

export default App
