import { ChangeEventHandler } from 'react'

import styles from 'styles/Input.module.css'

interface InputProps {
  isTextArea?: boolean
  type: string
  name: string
  label: string
  value: string
  step?: string
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
}

const Input: React.FC<InputProps> = ({ type, name, label, value, onChange, step, isTextArea }) => {
  return (
    <>
      {isTextArea ? (
        <div className={`${styles.field} ${styles.textarea_field}`}>
          <textarea
            className={`${styles.input} ${styles.textarea_input}`}
            name={name}
            value={value}
            onChange={onChange}
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
            onChange={onChange}
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
