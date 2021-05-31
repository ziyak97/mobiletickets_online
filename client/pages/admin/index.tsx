import { UserContext, UserRoles } from 'lib/context'
import { auth } from 'lib/firebase'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loader from 'components/Loader'
import Input from 'components/Input'

const Admin: React.FC<AppProps> = () => {
  const { user, roles, isAuthLoading } = useContext(UserContext)
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  useEffect(() => {
    if (user && roles.includes(UserRoles.Admin)) router.push('/admin/dashboard')
  }, [user, roles, router])

  const handleSubmit = async (): Promise<void> => {
    try {
      await auth.signInWithEmailAndPassword(email, password)
      router.push('dashboard')
      toast.success('sign in sucessful')
    } catch (err) {
      console.error(err)
      toast.error('invlid credential')
    }
  }

  // function useRegex() {
  //   const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/
  //   // return regex.test(input);
  // }

  if (isAuthLoading || roles.includes(UserRoles.Admin)) return <Loader show />

  return (
    <div>
      <h1>Welcome! Sign In To Continue...</h1>
      <Input type="email" name="Email" label="Email" value={email} setValue={setEmail} />
      <Input
        type="password"
        name="Password"
        label="Password"
        value={password}
        setValue={setPassword}
      />
      <input type="text" placeholder="enter ticketek url" />
      <button onClick={handleSubmit}>SIGN UP</button>
    </div>
  )
}

export default Admin
