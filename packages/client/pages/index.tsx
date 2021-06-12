import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import styles from 'styles/Home.module.css'

const Home: React.FC<AppProps> = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id)
    return (
      <div className={styles.container}>
        <object
          data="https://firebasestorage.googleapis.com/v0/b/mobiletickets-online.appspot.com/o/test.pdf?alt=media&token=79e434f3-913f-46c7-b457-57b2eb14bbc5"
          type="application/pdf"
          width="100%"
          height="100%"
        >
          <embed
            src="https://firebasestorage.googleapis.com/v0/b/mobiletickets-online.appspot.com/o/test.pdf?alt=media&token=79e434f3-913f-46c7-b457-57b2eb14bbc5"
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </object>
      </div>
    )

  return <div className={styles.container}></div>
}

export default Home
