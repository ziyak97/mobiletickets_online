import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Button from 'components/Button'
import Input from 'components/Input'
import CopyText from 'components/CopyText'
import CsvModal from 'components/CsvModal'
import { UserContext, UserRoles } from 'lib/context'
import { isValidTicketekUrl, fetchFromAPI } from 'lib/helpers'

import styles from 'styles/AdminDashboardPage.module.css'

interface TicketCreated {
  id: string
}

const Dashboard: React.FC<AppProps> = () => {
  const { user, roles } = useContext(UserContext)
  const router = useRouter()

  const [ticketUrl, setTicketUrl] = useState('')
  const [isTicketekPdfLoading, setIsTicketekPdfLoading] = useState(false)
  const [id, setId] = useState('')
  const [openModal, setOpenModal] = useState(false)

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

    if (data) {
      setId(data.id)
      toast.success('ticket created sucessfully')
    }

    if (errors) {
      setId('')
      toast.error(errors.errors[0].message)
    }

    setIsTicketekPdfLoading(false)
  }

  function handleModalClose(): void {
    setOpenModal(false)
  }

  return (
    <>
      <Head>
        <title>Mobile Tickets - Dashboard</title>
      </Head>
      <div className={styles.container}>
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
          <Button title="Get All Tickets CSV" emoji="🗃" handleSubmit={() => setOpenModal(true)} />
        </div>
        {id && !isTicketekPdfLoading && (
          <CopyText style={{ marginTop: 40 }} text={`${window.location.origin}?id=${id}`} />
        )}
      </div>

      <CsvModal open={openModal} handleClose={handleModalClose} />
    </>
  )
}

export default Dashboard
