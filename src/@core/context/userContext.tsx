import { createContext, useContext, useState, ReactNode } from 'react'

export type UserData = {
  pk?: number
  firstName?: string
  lastName?: string
  email?: string
  image?: string
}

export type UserDataContextValue = {
  userData: UserData
  saveUserData: (updatedUser: UserData) => void
}

const initialUser: UserData = {
  pk: undefined,
  firstName: '',
  lastName: '',
  email: '',
  image: ''
}

// ** Create Context
export const UserDataContext = createContext<UserDataContextValue>({
  saveUserData: () => null,
  userData: initialUser
})

export const UserDataProvider = ({ children }: { children?: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({ ...initialUser })
  const saveUserData = (updatedUser: UserData) => {
    setUserData(updatedUser)
  }
  return <UserDataContext.Provider value={{ userData, saveUserData }}>{children}</UserDataContext.Provider>
}

export const UserDataConsumer = UserDataContext.Consumer
