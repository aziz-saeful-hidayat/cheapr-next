import { createContext, useContext, useState, ReactNode } from 'react'

export type GlobalData = {
  isLoading: boolean
  textLoading: string
  isModalOpen: boolean
  textModal: string
}

export type GlobalDataContextValue = {
  globalData: GlobalData
  saveGlobalData: (updatedUser: GlobalData) => void
}

const initialGlobal: GlobalData = {
  isLoading: false,
  textLoading: 'Loading',
  isModalOpen: false,
  textModal: 'Are you sure?'
}

// ** Create Context
export const GlobalDataContext = createContext<GlobalDataContextValue>({
  saveGlobalData: () => null,
  globalData: initialGlobal
})

export const GlobalDataProvider = ({ children }: { children?: ReactNode }) => {
  const [globalData, setGlobalData] = useState<GlobalData>({ ...initialGlobal })
  const saveGlobalData = (updatedGlobal: GlobalData) => {
    setGlobalData(updatedGlobal)
  }
  return <GlobalDataContext.Provider value={{ globalData, saveGlobalData }}>{children}</GlobalDataContext.Provider>
}

export const GlobalDataContextConsumer = GlobalDataContext.Consumer
