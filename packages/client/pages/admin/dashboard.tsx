import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Button from 'components/Button'
import Input from 'components/Input'
import CopyText from 'components/CopyText'
import CsvModal from 'components/CsvModal'
import TagInput from 'components/TagInput'
import Toggle from 'components/Toggle'
import { UserContext, UserRoles } from 'lib/context'
import { isValidTicketekUrl, fetchFromAPI } from 'lib/helpers'

import styles from 'styles/AdminDashboardPage.module.css'

interface TicketCreated {
  id: string
  ticketekUrl: string
}

interface TicketsCreated {
  id: string
  ticketekUrl: string
}

const Dashboard: React.FC<AppProps> = () => {
  const { user, roles } = useContext(UserContext)
  const router = useRouter()

  const [ticketUrl, setTicketUrl] = useState('')
  const [isTicketekPdfLoading, setIsTicketekPdfLoading] = useState(false)
  const [ticketData, setTicketData] = useState<TicketCreated>(null)
  const [openModal, setOpenModal] = useState(false)
  const [ticketUrls, setTicketUrls] = useState<string[]>([])
  const [manyUrls, setManyUrls] = useState(false)
  const [multipleTicketsData, setMultipleTicketsData] = useState<TicketsCreated[]>([])

  useEffect(() => {
    if (!user || !roles.includes(UserRoles.Admin)) router.push('/admin')
  }, [user, roles, router])

  async function handleTicketekPdfClick(): Promise<string> {
    setIsTicketekPdfLoading(true)
    if (!manyUrls) {
      if (!isValidTicketekUrl(ticketUrl)) {
        setIsTicketekPdfLoading(false)
        toast.error('invalid ticketek url')
        return
      }

      const { data, errors } = await fetchFromAPI<TicketCreated>('create-pdf', {
        body: { ticketekUrl: ticketUrl },
      })

      if (data) {
        setTicketData(data)
        toast.success('ticket created sucessfully')
      }

      if (errors) {
        setTicketData(null)
        toast.error(errors.errors[0].message)
      }
    } else {
      const { data, errors } = await fetchFromAPI<TicketsCreated[]>('create-pdfs', {
        body: { ticketekUrls: ticketUrls },
      })

      if (data) {
        setMultipleTicketsData(data)
        toast.success('tickets created sucessfully')
      }

      if (errors) {
        setMultipleTicketsData([])
        toast.error(errors.errors[0].message)
      }
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
        {manyUrls ? (
          <TagInput
            label="Ticketek Urls (seperate by commas or enter)"
            name="ticketekUrls"
            setOutput={setTicketUrls}
          />
        ) : (
          <Input
            type="text"
            name="ticketekUrl"
            label="Ticketek Url"
            value={ticketUrl}
            onChange={(e) => setTicketUrl(e.target.value)}
          />
        )}
        <Toggle
          toggled={manyUrls}
          onClick={() => setManyUrls((prev) => !prev)}
          helperUnchecked="One Url"
          helperChecked="Many Urls"
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
        {!manyUrls && ticketData && !isTicketekPdfLoading && (
          <div className={styles.container_copy_urls}>
            <h4>Ticketek Url - {ticketData.ticketekUrl}</h4>
            <CopyText
              style={{ marginTop: 40 }}
              text={`${window.location.origin}?id=${ticketData.id}`}
            />
          </div>
        )}
        {manyUrls &&
          multipleTicketsData?.length > 0 &&
          !isTicketekPdfLoading &&
          multipleTicketsData.map((ticketData) => (
            <div key={ticketData.id} className={styles.container_copy_urls}>
              <h4>Ticketek Url - {ticketData.ticketekUrl}</h4>
              <CopyText
                style={{ marginTop: 40 }}
                text={`${window.location.origin}?id=${ticketData.id}`}
              />
            </div>
          ))}
      </div>

      <CsvModal open={openModal} handleClose={handleModalClose} />
    </>
  )
}

export default Dashboard
