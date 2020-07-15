import cn from 'classnames'
import { useState, useRef } from 'react'
import markdownToHtml from '../lib/markdownToHtml'

export default function TextArea({value, setValue, setState, setHtml, placeholder='write something...', css=[]}){
    // CSS
    const textAreaCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500', 'resize-none' ]
    // Variables
    const [ focus, setFocus ] = useState(false)
    const ref = useRef(null)
    // Actions
    const onChange = e => setValue && setValue(e.target.value)
    const onMouseOver = () => {
        if (!focus){
            ref.current.focus()
            ref.current.value = value
            setFocus(true)
        }
    }
    const onKeyDown = async (e) => {
        if (e.key==='Enter'){
            setFocus(false)
            const html = await markdownToHtml(value)
            html && setHtml(html)
            setState()
        }
    }

    const onBlur = async () => {
        setFocus(false)
        const html = await markdownToHtml(value)
        html && setHtml(html)
        setState()
    }

    const main = (
        <>  
          <textarea className={cn(...textAreaCSS, ...css,)} 
                    placeholder={placeholder}
                    onChange={onChange}
                    onMouseOver={onMouseOver}
                    onBlur={onBlur}
                    ref={ref}
          />
        </>
    )
    return (
        <>
          {main}
        </>
    )
}
