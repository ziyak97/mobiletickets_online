import { ChangeEvent } from 'react'
import styles from 'styles/Toggle.module.css'

interface ToggleProps {
  toggled: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  helperUnchecked: string
  helperChecked: string
}

const Toggle: React.FC<ToggleProps> = ({ toggled, onChange, helperUnchecked, helperChecked }) => {
  return (
    <div className={styles.container}>
      <div className={styles.helper}>{helperUnchecked}</div>
      <label className={styles.switch}>
        <input type="checkbox" checked={toggled} onChange={onChange} />
        <span className={`${styles.slider} ${styles.round}`} />
      </label>
      <div className={styles.helper}>{helperChecked}</div>
    </div>
  )
}

export default Toggle
