import Button from 'components/Button'
import Input from 'components/Input'
import { UserContext, UserRoles } from 'lib/context'
import { isValidTicketekUrl, fetchFromAPI } from 'lib/helpers'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import styles from 'styles/admin-dashboard-page.module.css'

interface TicketCreated {
  url: string
}

const Dashboard: React.FC<AppProps> = () => {
  const { user, roles } = useContext(UserContext)
  const router = useRouter()

  const [ticketUrl, setTicketUrl] = useState('')
  const [isTicketekPdfLoading, setIsTicketekPdfLoading] = useState(false)

  useEffect(() => {
    if (!user || !roles.includes(UserRoles.Admin)) router.push('/admin')
  }, [user, roles, router])

  async function handleTicketekPdfClick(): Promise<string> {
    setIsTicketekPdfLoading(true)
    if (!isValidTicketekUrl(ticketUrl)) {
      setIsTicketekPdfLoading(false)
      toast.error('invalid ticketek url')
      return
    }

    const { data, errors } = await fetchFromAPI<TicketCreated>('create-pdf', {
      body: { ticketekUrl: ticketUrl },
    })

    setIsTicketekPdfLoading(false)
  }

  return (
    <div>
      <h2>
        Enter the Ticketek url you wish to convert{' '}
        <span role="img" aria-label="rocket">
          🚀
        </span>
      </h2>
      <Input
        type="text"
        name="ticketekUrl"
        label="Ticketek Url"
        value={ticketUrl}
        onChange={(e) => setTicketUrl(e.target.value)}
      />
      <div className={styles.buttons_container}>
        <Button
          title="Convert"
          isLoading={isTicketekPdfLoading}
          handleSubmit={handleTicketekPdfClick}
          emoji="🤖"
        />
        {/* <Button title="Get All Tickets CSV" isLoading={isTicketekPdfLoading} emoji="🗃" /> */}
      </div>
    </div>
  )
}

export default Dashboard
