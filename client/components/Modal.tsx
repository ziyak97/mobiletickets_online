import { MouseEvent, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import styles from 'styles/Modal.module.css'

interface ModalProps {
  open: boolean
  title?: string
  handleClose: () => void
}

const Modal: React.FC<ModalProps> = ({ children, open, title, handleClose }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const rootContainer = document.createElement('div')
    const parentElem = document.querySelector('#__next')
    parentElem?.insertAdjacentElement('afterend', rootContainer)
    if (!containerRef.current) containerRef.current = rootContainer

    return () => rootContainer.remove()
  }, [])

  function handleOverlayClose(event: MouseEvent<HTMLDivElement>): void {
    if (!modalRef.current.contains(event.target as Node)) handleClose()
  }

  if (!open || !containerRef.current) return null

  return createPortal(
    <div className={styles.overlay} role="none" onClick={handleOverlayClose}>
      <dialog ref={modalRef} open={open} className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={handleClose}>
            <span role="img" aria-label="close">
              ❌
            </span>
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </dialog>
    </div>,
    containerRef.current
  )
}

export default Modal
