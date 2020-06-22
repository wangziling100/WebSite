import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
export default function Select({items, setValue, defaultValue=0, showIcon=true}){
  if (items===undefined){
      items = ['1', '2', '3']
  }
  // CSS
  const selectCSS = ['cursor-pointer border-solide appearance-none h-full w-full']
  const iconCSS = ['mr-2', 'h-5', 'w-5']
  //Action
  const onChange = e => setValue(e.target.value)
  const main = (
    <>
      <div className="flex">
        <select className={cn(...selectCSS)} onChange={onChange}>
          <option value={defaultValue} aria-selected="true"> {items[defaultValue]} </option>
          {items.map((e, index)=>{
              return <option value={index} key={index}> {e} </option>
          })}
        </select>

        {
            showIcon && 
            <FontAwesomeIcon icon={faSortDown} className={cn(...iconCSS)}/>
        }
      </div>
    </>
  ) 
  return (
    <>
      {main}
    </>
  )
}
