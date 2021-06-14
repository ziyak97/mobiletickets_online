import Modal from 'components/Modal'
import Button from 'components/Button'

import styles from 'styles/CsvModal.module.css'
import { API } from 'lib/helpers'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface CsvModalProps {
  open: boolean
  handleClose: () => void
}

const CsvModal: React.FC<CsvModalProps> = ({ open, handleClose }) => {
  const [isCsvDownloading, setIsCsvDownloading] = useState(false)

  async function handleCsvDownload(): Promise<void> {
    setIsCsvDownloading(true)

    try {
      const resp = await fetch(`${API}/create-csv`)
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      // the filename you want
      a.download = 'mobiletickets_online.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('starting download')
      handleClose()
    } catch (error) {
      toast.error('something went wrong')
    }

    setIsCsvDownloading(false)
  }
  return (
    <Modal title="Just Checking..." open={open} handleClose={handleClose}>
      <div className={styles.contaier}>
        <section className={styles.header}>
          <h1>Are you sure you want to download a CSV file of all your tickets?</h1>
        </section>
        <section className={styles.footer}>
          <Button title="Cancel" emoji="❌" handleSubmit={handleClose} />
          <Button
            title="Download CSV"
            emoji="✅"
            handleSubmit={handleCsvDownload}
            isLoading={isCsvDownloading}
          />
        </section>
      </div>
    </Modal>
  )
}

export default CsvModal
