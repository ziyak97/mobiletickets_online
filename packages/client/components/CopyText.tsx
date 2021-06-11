import Button from 'components/Button'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import styles from 'styles/CopyText.module.css'

interface CopyText {
  text: string
  style?: React.CSSProperties
}

const CopyText: React.FC<CopyText> = ({ text, style }) => {
  const containerRef = useRef<HTMLDivElement>()

  useEffect(() => {
    containerRef.current?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(text)
      toast.success('copied sucessfully')
    })
  }, [containerRef, text])
  return (
    <div ref={containerRef} className={styles.container} style={style}>
      <input type="text" value={text} disabled />
      <Button title="Copy" emoji="💅" />
    </div>
  )
}

export default CopyText
