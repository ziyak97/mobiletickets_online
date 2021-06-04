interface LoaderProps {
  show: boolean
  style?: React.CSSProperties
  type: 'circle' | 'hourglass'
}

const Loader: React.FC<LoaderProps> = ({ show, style, type }) => {
  function renderLoader(type: LoaderProps['type']): JSX.Element {
    if (type === 'circle') return <div style={style} className="loader" />
    if (type === 'hourglass') return <div style={style} className="hourglass" />
  }

  return show ? renderLoader(type) : null
}

export default Loader
