import { createContext } from 'react'
import firebase from 'firebase/app'

export enum UserRoles {
  Admin = 'admin',
}

interface User {
  user: firebase.User
  roles: UserRoles[]
  isAuthLoading: boolean
}

export const UserContext = createContext<User>({ user: null, roles: [], isAuthLoading: true })
