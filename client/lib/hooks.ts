import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { UserRoles } from 'lib/context'
import { auth, firestore } from './firebase'

export function useUserData(): { user: firebase.User; roles: UserRoles[]; isAuthLoading: boolean } {
  const [user, setUser] = useState<firebase.User>(null)
  const [userRoles, setUserRoles] = useState<UserRoles[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: () => void
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        const userRef = firestore.collection('users').doc(user.uid)
        unsubscribe = userRef.onSnapshot((doc) => {
          setUserRoles((doc.data()?.roles as UserRoles[]) || [])
          setIsLoading(false)
        })
      } else {
        setUserRoles([])
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [user])

  return { user, roles: userRoles, isAuthLoading: isLoading }
}
