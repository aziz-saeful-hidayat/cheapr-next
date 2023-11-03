// ** React Imports
import { ReactNode } from 'react'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { Url } from 'url'

export type CardStatsVerticalProps = {
  link: string
  title: string
  stats: string
  icon: ReactNode
  subtitle?: string
  color?: ThemeColor
  trendNumber?: string
  trend?: 'positive' | 'negative'
}
