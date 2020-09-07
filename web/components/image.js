import { useRef, useState, useEffect } from 'react'
import cn from 'classnames'
export default function Image({src, alt, css=[], actions}){
    // Functions
    const defalutFunction = ()=>{}
    const defalutActions = {onLoadAction: defalutFunction}
    if (actions===undefined) actions = defalutActions
    // Init
    const imgRef = useRef(null)
    const [ showImage, setShowImage ] = useState(false)
    useEffect(()=>{
        const isComplete = imgRef.current.complete
        console.log(isComplete)
        setShowImage(isComplete)
        if (isComplete) {
            actions.onLoadAction()
        }
    }, [])
    const onLoad = () => {
        setShowImage(true)
        actions.onLoadAction()
    }

    const main = (
        <>
          <img src={src} 
               alt={alt}
               className={cn({'hidden':!showImage}, ...css)} 
               onLoad={onLoad} 
               ref={imgRef}/>
        </>
    )
    return(
        <>
          {main}
        </>
    )
}
