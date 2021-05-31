import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import styles from '../styles/Home.module.css'

const Home: React.FC<AppProps> = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id) return <div>Illegal</div>

  return <div className={styles.container}></div>
}

export default Home
