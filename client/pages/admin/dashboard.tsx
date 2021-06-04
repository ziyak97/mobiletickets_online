import { UserContext, UserRoles } from 'lib/context'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'

const Dashboard: React.FC<AppProps> = () => {
  const { user, roles } = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if (!user || !roles.includes(UserRoles.Admin)) router.push('/admin')
  }, [user, roles, router])

  return (
    <div>
      <h1>Hey!</h1>
    </div>
  )
}

export default Dashboard
