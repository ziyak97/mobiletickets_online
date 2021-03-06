import { useContext, useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast from 'react-hot-toast'
import Input from 'components/Input'
import Button from 'components/Button'
import Loader from 'components/Loader'
import { auth } from 'lib/firebase'
import { UserContext, UserRoles } from 'lib/context'

const Admin: React.FC<AppProps> = (props) => {
  const { user, roles, isAuthLoading } = useContext(UserContext)
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && roles.includes(UserRoles.Admin)) router.push('/admin/dashboard')
  }, [user, roles, router])

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true)
    try {
      await auth.signInWithEmailAndPassword(email, password)
      router.push('/admin/dashboard')
      toast.success('sign in sucessful')
    } catch (err) {
      console.error(err)
      toast.error('invalid credentials')
    }
    setIsSubmitting(false)
  }

  if (isAuthLoading) return <Loader show type="circle" center />

  return (
    <>
      <Head>
        <title>Mobile Tickets - Login</title>
      </Head>
      <div style={{ padding: '2%' }}>
        <h1>
          Welcome! Sign In To Continue{' '}
          <span role="img" aria-label="fire">
            🔥
          </span>
        </h1>
        <Input
          type="email"
          name="Email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          name="Password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button title="Login" isLoading={isSubmitting} handleSubmit={handleSubmit} type="button" />
      </div>
    </>
  )
}

export default Admin
