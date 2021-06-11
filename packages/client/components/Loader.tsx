import styles from 'styles/Loader.module.css'

interface LoaderProps {
  show: boolean
  style?: React.CSSProperties
  type: 'circle' | 'hourglass'
  center?: boolean
}

const Loader: React.FC<LoaderProps> = ({ show, style, type, center }) => {
  const styleWithCeter: React.CSSProperties = {
    ...style,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
  }

  const finalStyles = center ? styleWithCeter : style

  function renderLoader(type: LoaderProps['type']): JSX.Element {
    if (type === 'circle') return <div style={finalStyles} className={styles.loader} />
    if (type === 'hourglass') return <div style={finalStyles} className={styles.hourglass} />
  }

  return show ? renderLoader(type) : null
}

export default Loader
