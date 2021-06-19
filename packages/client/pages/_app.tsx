import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'
import Loader from 'components/Loader'
import { UserContext } from 'lib/context'
import { useUserData } from 'lib/hooks'

import '../styles/globals.css'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const userData = useUserData()
  const { isAuthLoading } = userData

  if (isAuthLoading) return <Loader show type="hourglass" center />

  return (
    <>
      <Head>
        <title>Mobile Tickets</title>
        <meta name="description" content="Created by Ziyak Jehangir 👯‍♀️" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <UserContext.Provider value={userData}>
        <Component {...pageProps} />
        <Toaster />
      </UserContext.Provider>
    </>
  )
}

export default MyApp
