import { Dispatch, SetStateAction, useState } from 'react'

import styles from 'styles/TagInput.module.css'

interface TagComponentProps {
  text: string
  cullTagFromTags: (tag: string) => void
}

interface TagInputProps {
  label: string
  name: string
  setOutput: Dispatch<SetStateAction<string[]>>
}

const TagComponent: React.FC<TagComponentProps> = ({ text, cullTagFromTags }) => {
  return (
    <div className={styles.tagComponent}>
      <div className={styles.tagComponent__text}>{text}</div>
      <div
        role="none"
        className={styles.tagComponent__close}
        onClick={() => {
          cullTagFromTags(text)
        }}
      >
        X
      </div>
    </div>
  )
}

const TagInput: React.FC<TagInputProps> = ({ label, name, setOutput }) => {
  const [tags, setTags] = useState([])
  const [inputValue, setInputValue] = useState('')

  const arrayIfSpaces = inputValue.split(/[ ]+/)
  if (arrayIfSpaces.length > 1) {
    const allTags: string[] = [...tags, ...arrayIfSpaces]
    setTags(allTags)
    setOutput && setOutput(allTags)
    setInputValue('')
    return
  }

  function inputValueChangeHandler(inputChange: string, type: string, keyCode: string): void {
    setInputValue(inputChange)
    if (inputChange[inputChange.length - 1] === ',' && type === 'comma') {
      const allTags: string[] = [...tags, inputChange.slice(0, inputChange.length - 1)]
      setTags(allTags)
      setOutput && setOutput(allTags)
      setInputValue('')
    } else if (type === 'enter' && keyCode === 'Enter') {
      const allTags: string[] = [...tags, inputChange.slice(0, inputChange.length)]
      setTags(allTags)
      setOutput && setOutput(allTags)
      setInputValue('')
    }
  }
  function cullTagFromTags(tag: string): void {
    setTags([...tags.filter((element) => element !== tag)])
  }

  return (
    <div className={styles.tagArea}>
      <div className={styles.tagArea__displayArea}>
        {tags.map((tag, i) => (
          <TagComponent key={i} text={tag} cullTagFromTags={cullTagFromTags} />
        ))}
      </div>
      <input
        type="text"
        name={name}
        value={inputValue}
        onKeyUp={(event) => inputValueChangeHandler(event.currentTarget.value, 'enter', event.key)}
        onChange={(event) => inputValueChangeHandler(event.currentTarget.value, 'comma', null)}
        placeholder="separated by commas"
        className={`${styles.tagArea__input} ${
          tags.length ? `${styles.tagArea__input__active}` : ''
        }`}
      />
      <label className={styles.tagLabel} htmlFor={name}>
        {label}
      </label>
    </div>
  )
}

export default TagInput
