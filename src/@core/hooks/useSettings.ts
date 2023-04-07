import { useContext } from 'react'
import { SettingsContext, SettingsContextValue } from 'src/@core/context/settingsContext'
import { UserDataContext, UserDataContextValue } from '../context/userContext'

export const useSettings = (): SettingsContextValue => useContext(SettingsContext)
export const useUserData = (): UserDataContextValue => useContext(UserDataContext)
