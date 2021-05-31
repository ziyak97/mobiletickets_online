import Loader from 'components/Loader'
import { UserContext, UserRoles } from 'lib/context'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'

const Dashboard: React.FC<AppProps> = () => {
  const { user, roles, isAuthLoading } = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if ((!user || !roles.includes(UserRoles.Admin)) && !isAuthLoading) router.push('/admin')
  }, [user, roles, router, isAuthLoading])

  if (isAuthLoading || !roles.includes(UserRoles.Admin)) return <Loader show />

  return (
    <div>
      <h1>Hey!</h1>
    </div>
  )
}

export default Dashboard
