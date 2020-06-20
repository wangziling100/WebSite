import {useState, useRef} from 'react'
import cn from 'classnames'
export default function Input({value, setValue, placeholder, setState, css=[], type='text'}){
  const [ compose, setCompose ] = useState(false)
  const [ focus, setFocus ] = useState(false)
  const ref = useRef(null)
  const defaultCSS = ['ml-2', 'p-1', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const startCompose = () => setCompose(true)
  const stopCompose = (e) => {
      setCompose(false)
      setValue(e.target.value)
  }
  const onChange = e => setValue && !compose && setValue(e.target.value) 
  const onMouseOver =  () => {
      if (!focus){
          ref.current.focus()
          ref.current.value=value
          setFocus(true)
      }
  }
  const onKeyDown = (e) => {
      if (!compose && e.key==='Enter'){
          setFocus(false)
          setState()
      }
  }
  const onBlur = () => {
      setFocus(false)
      setState()
  }

  const main = (
    <>
      <input className={cn(...defaultCSS, ...css, )} 
             placeholder={placeholder} 
             css={css} 
             type={type}
             onChange={onChange}
             onCompositionStart={startCompose} 
             onCompositionEnd={stopCompose}
             onMouseOver={onMouseOver}
             onKeyDown={onKeyDown}
             onBlur={onBlur}
             ref={ref}
      />
    </>
  )

  return(
    <>
      {main}
    </>
  )
}
