import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Loader from 'components/Loader'
import { firestore } from 'lib/firebase'
import TicketImage from 'public/ticket.svg'

import styles from 'styles/Home.module.css'

const Home: React.FC<AppProps> = () => {
  const router = useRouter()
  const { id } = router.query

  const [pdfUrl, setPdfUrl] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (typeof id === 'string') {
        try {
          const ticketRef = firestore.collection('tickets').doc(id)
          const doc = await ticketRef.get()
          if (!doc.exists) {
            setIsLoading(false)
            return
          }
          const data = doc.data()
          if (data.pdfUrl) setPdfUrl(data.pdfUrl)
          setIsLoading(false)
        } catch (error) {
          console.error(error)
          setIsLoading(false)
          setError(true)
        }
      } else setIsLoading(false)
    })()
  }, [id])

  if (error) return <div>Error...</div>

  if (isLoading) return <Loader show type="circle" center />

  if (!id || !pdfUrl)
    return (
      <div className={styles.container_no_ticket}>
        <h1>No ticket!</h1>
        <TicketImage style={{ width: '100%', maxWidth: '600px' }} />
        <p>The ticket you are looking for does not exists or has been removed.</p>
      </div>
    )

  return (
    <div className={styles.container}>
      <Loader show type="circle" center style={{ position: 'absolute', zIndex: -1 }} />
      <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
        <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
      </object>
    </div>
  )
}

export default Home
