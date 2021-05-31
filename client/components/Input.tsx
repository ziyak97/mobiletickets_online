import { Dispatch, SetStateAction } from 'react'

import styles from '../styles/Input.module.css'

interface InputProps {
  isTextArea?: boolean
  type: string
  name: string
  label: string
  value: string
  step?: string
  setValue: Dispatch<SetStateAction<string>>
}

const Input: React.FC<InputProps> = ({ type, name, label, value, setValue, step, isTextArea }) => {
  return (
    <>
      {isTextArea ? (
        <div className={`${styles.field} ${styles.textarea_field}`}>
          <textarea
            className={`${styles.input} ${styles.textarea_input}`}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="dummy"
            rows={10}
          />
          <label className={`${styles.label} ${styles.textarea_label}`} htmlFor={name}>
            {label}
          </label>
        </div>
      ) : (
        <div className={styles.field}>
          <input
            className={styles.input}
            type={type}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="dummy"
            min="0"
            step={step}
          />
          <label className={styles.label} htmlFor={name}>
            {label}
          </label>
        </div>
      )}
    </>
  )
}

export default Input
