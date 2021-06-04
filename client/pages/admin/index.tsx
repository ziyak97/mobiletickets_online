import { UserContext, UserRoles } from 'lib/context'
import { auth } from 'lib/firebase'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loader from 'components/Loader'
import Input from 'components/Input'
import Button from 'components/Button'

const Admin: React.FC<AppProps> = () => {
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
      router.push('dashboard')
      toast.success('sign in sucessful')
    } catch (err) {
      console.error(err)
      toast.error('invalid credentials')
    }
    setIsSubmitting(false)
  }

  // function useRegex() {
  //   const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/
  //   // return regex.test(input);
  // }

  if (isAuthLoading || roles.includes(UserRoles.Admin)) return <Loader show type="hourglass" />

  return (
    <div>
      <h1>
        Welcome! Sign In To Continue{' '}
        <span role="img" aria-label="fire">
          🔥
        </span>
      </h1>
      <Input type="email" name="Email" label="Email" value={email} setValue={setEmail} />
      <Input
        type="password"
        name="Password"
        label="Password"
        value={password}
        setValue={setPassword}
      />
      <Button title="Login" isLoading={isSubmitting} handleSubmit={handleSubmit} type="button" />
    </div>
  )
}

export default Admin
