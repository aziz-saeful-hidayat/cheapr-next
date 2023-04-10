// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { ReactNode } from 'react'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeOutline as unknown as ReactNode,
      path: '/'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline as unknown as ReactNode,
      path: '/account-settings'
    },
    // {
    //   sectionTitle: 'Pages'
    // },
    // {
    //   title: 'Login',
    //   icon: Login,
    //   path: '/pages/login',
    //   openInNewTab: true
    // },
    // {
    //   title: 'Register',
    //   icon: AccountPlusOutline,
    //   path: '/pages/register',
    //   openInNewTab: true
    // },
    // {
    //   title: 'Error',
    //   icon: AlertCircleOutline,
    //   path: '/pages/error',
    //   openInNewTab: true
    // },
    {
      sectionTitle: 'ADMINISTRATION'
    },
    {
      title: 'Secured',
      icon: Table as unknown as ReactNode,
      path: '/secured'
    },
    {
      title: 'Sold',
      icon: Table as unknown as ReactNode,
      path: '/sold'
    },
    {
      title: 'Inventory',
      icon: Table as unknown as ReactNode,
      path: '/inventory'
    },
    {
      title: 'Channel',
      icon: Table as unknown as ReactNode,
      path: '/channel'
    },
    {
      title: 'Room',
      icon: Table as unknown as ReactNode,
      path: '/room'
    },
    {
      title: 'Item Rating',
      icon: Table as unknown as ReactNode,
      path: '/item-rating'
    },
    {
      title: 'SKU',
      icon: Table as unknown as ReactNode,
      path: '/sku'
    },
   
    // {
    //   title: 'Typography',
    //   icon: FormatLetterCase,
    //   path: '/typography'
    // },
    // {
    //   title: 'Icons',
    //   path: '/icons',
    //   icon: GoogleCirclesExtended
    // },
    // {
    //   title: 'Cards',
    //   icon: CreditCardOutline,
    //   path: '/cards'
    // },
    // {
    //   title: 'Tables',
    //   icon: Table,
    //   path: '/tables'
    // },
    // {
    //   icon: CubeOutline,
    //   title: 'Form Layouts',
    //   path: '/form-layouts'
    // }
  ]
}

export default navigation
