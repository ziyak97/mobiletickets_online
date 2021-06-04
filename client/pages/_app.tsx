import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { UserContext } from 'lib/context'
import { useUserData } from 'lib/hooks'

import '../styles/globals.css'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const userData = useUserData()
  return (
    <UserContext.Provider value={userData}>
      <Component {...pageProps} />
      <Toaster />
    </UserContext.Provider>
  )
}

export default MyApp
