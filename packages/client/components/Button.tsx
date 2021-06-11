import Loader from 'components/Loader'

import styles from 'styles/Button.module.css'

interface ButtonProps {
  isLoading?: boolean
  title: string
  handleSubmit?: () => void
  type?: 'submit' | 'reset' | 'button'
  emoji?: string
}

const Button: React.FC<ButtonProps> = ({ title, isLoading, handleSubmit, type, emoji = '→' }) => {
  return (
    <button type={type} className={styles.button} disabled={isLoading} onClick={handleSubmit}>
      <div className={styles.title}>{title}</div>
      <div className={styles.emoji}>
        {isLoading ? (
          <Loader
            show
            style={{ width: '25px', height: '25px', borderWidth: '5px' }}
            type="circle"
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>
    </button>
  )
}

export default Button
