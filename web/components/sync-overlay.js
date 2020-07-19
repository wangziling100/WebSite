import { RotateType1 } from '../components/animation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'
export function SyncOverlay({css=[]}){
    const divCSS = ['fixed', 'inset-0', 'flex', 'justify-center', 'w-screen', 'h-screen', 'items-center', 'bg-gray-100']
    const main = (
      <>
        <div className={cn(...divCSS, ...css)}>
          <RotateType1>
            <FontAwesomeIcon icon={faSpinner} className='h-20 w-20 text-gray-600'/>
          </RotateType1>
        </div>
      </>
    )
    return (
      <>
        {main}
      </>
    )
}
