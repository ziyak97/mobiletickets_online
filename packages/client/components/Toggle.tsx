import { MouseEventHandler } from 'react'
import styles from 'styles/Toggle.module.css'

interface ToggleProps {
  toggled: boolean
  onClick: MouseEventHandler<HTMLInputElement>
  helperUnchecked: string
  helperChecked: string
}

const Toggle: React.FC<ToggleProps> = ({ toggled, onClick, helperUnchecked, helperChecked }) => {
  return (
    <div className={styles.container}>
      <div className={styles.helper}>{helperUnchecked}</div>
      <label className={styles.switch}>
        <input type="checkbox" checked={toggled} onClick={onClick} />
        <span className={`${styles.slider} ${styles.round}`} />
      </label>
      <div className={styles.helper}>{helperChecked}</div>
    </div>
  )
}

export default Toggle
