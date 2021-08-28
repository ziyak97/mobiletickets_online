import { useEffect, useState } from 'react'
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
    const id = window.location.href.split("?id=")?.[1]
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
            const pdf = data.pdfUrl.replace('&', '%26')
            setPdfUrl(data.pdfUrl)
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
      <iframe src="https://drive.google.com/viewerng/viewer?url=https://storage.googleapis.com/mobiletickets-online.appspot.com/mobiletickets_online%3Fid%3D25208BF2B170140C8F01&s=6069.pdf?
pid=explorer&efh=false&a=v&chrome=false&embedded=true" style={{minHeight: '100%'}} width="100%" ></iframe>
      {/* <Loader show type="circle" center style={{ position: 'absolute', zIndex: -1 }} /> */}
      {/* <object data={pdfUrl} type="application/pdf" width="100%" >
        <embed src={pdfUrl} type="application/pdf" width="100%" />
      </object> */}
    </div>
  )
}

export default Home
