import { useEffect, useState } from 'react'
import { Worker } from '@react-pdf-viewer/core'

import { Viewer } from '@react-pdf-viewer/core'

import '@react-pdf-viewer/core/lib/styles/index.css'

import type { AppProps } from 'next/app'
import { firestore } from 'lib/firebase'
import TicketImage from 'public/ticket.svg'
// import Loader from 'components/Loader'

import styles from 'styles/Home.module.css'

const Home: React.FC<AppProps> = () => {
  const [pdfUrl, setPdfUrl] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const id = window.location.href.split('?id=')?.[1]
    setIsLoading(true)
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
          if (data.pdfUrl) {
            setPdfUrl(data.pdfUrl)
            //  const a = document.createElement('a')
            //  a.href = data.pdfUrl
            //  a.download = data.pdfUrl.split('/').pop()
            //  document.body.appendChild(a)
            //  a.click()
            //  document.body.removeChild(a)
          }
          setIsLoading(false)
        } catch (error) {
          console.error(error)
          setIsLoading(false)
          setError(true)
        }
      } else setIsLoading(false)
    })()
  }, [])

  if (error) return <div>Error...</div>

  // if (isLoading) return <Loader show type="circle" center />
  if (isLoading) return null

  if (!pdfUrl && !isLoading)
    return (
      <div className={styles.container_no_ticket}>
        <h1>No ticket!</h1>
        <TicketImage style={{ width: '100%', maxWidth: '600px' }} />
        <p>The ticket you are looking for does not exists or has been removed.</p>
      </div>
    )

  return (
    <div className={styles.container}>
      {/* <Loader show type="circle" center style={{ position: 'absolute', zIndex: -1 }} /> */}
      <object className={styles.desktop} data={pdfUrl} type="application/pdf" width="100%">
        <embed className={styles.desktop} src={pdfUrl} type="application/pdf" width="100%" />
      </object>
      <div className={styles.mobile}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
          <Viewer renderLoader={() => null} fileUrl={pdfUrl} />;
        </Worker>
      </div>
    </div>
  )
}

export default Home
