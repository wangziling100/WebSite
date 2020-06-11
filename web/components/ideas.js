import Router from 'next/router'
import markdownToHtml from '../lib/markdownToHtml'
import Markdown from '../components/markdown'
import { useState } from 'react'
import cn from 'classnames'

export function IdeaHeader(){
  const active = {
    pathname: "/idea",
    query: { selectedStatus: "active" },
  }
  const completed = {
    pathname: "/idea",
    query: { selectedStatus: "completed" }
  }

  const most_important = {
    pathname: "/idea",
    query: { orderBy: "priority" },
  }
  const least_important = {
    pathname: "/idea",
    query: { orderBy: "priority-reverse" },
  }
  const oldest = {
    pathname: "/idea",
    query: { orderBy: "oldest" },
  }
  const newest = {
    pathname: "/idea",
    query: { orderBy: "newest" },
  }
  //console.log(router.query)
  return(
    <>
    <div className="flex mx-10 p-4 bg-white">
      <div className="w-1/2 flex">
        <div className="mx-2" >
          <input className="hidden" type="radio" name="status" id="active" value="active" defaultChecked /> 
          <label onClick={()=> Router.push(active)} htmlFor={"active"} className="hover:text-blue-600" > Active </label>
        </div>
        <div className="mx-2">
          <input className="hidden" type="radio" name="status" id="completed" value="completed" /> 
          <label onClick={()=> Router.push(completed)} htmlFor={"completed"} className="hover:text-blue-600"> Completed </label>
        </div>
      </div>
      <div className="w-1/2 flex justify-end">
        <div className="flex mx-2 items-center text-gray-600"> 
          <select className=" hover: cursor-pointer border-solid appearance-none"> 
            <option value="default" aria-selected="true">
              All Tags 
            </option>
          </select>
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 3">
            <path d="M0 1.5  L1.5 2.5 L3 1.5" fill="transparent" stroke="gray" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex mx-2 pr-4 items-center text-gray-600">
          <select className=" hover: cursor-pointer border-solid  appearance-none"> 
          
            <option value="default" aria-selected="true" onClick={()=> Router.push(most_important)}> Default Sort</option>
            <option onClick={()=> Router.push(newest)}> Newest </option>
            <option onClick={()=> Router.push(oldest)}> Oldest </option>
            <option onClick={()=> Router.push(most_important)}> Most Import </option>
            <option onClick={()=> Router.push(least_important)}> Least Import </option>
          </select>
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 3">
            <path d="M0 1.5  L1.5 2.5 L3 1.5" fill="transparent" stroke="gray" strokeWidth="1" className="bg-red-500"/>
          </svg>
        </div>

      </div>
    </div>
    <style jsx>{`
      input:checked + label{
        color: blue;
        text-decoration: underline;
      }
      :hover + label{
        cursor: pointer;
      }
    `}
    </style>
    </>
  )
}
export function IdeaItem({ data, orderBy="priority", selectedStatus="active" }){
  const [ hideContent, setHideContent ] = useState(true)
  const [ hiddenOverlay, setHideOverlay ] = useState(true)
  const switchContentState = () => {
      console.log('clicked')
      setHideContent(!hideContent)
  }
  const switchOverlayState = () => {
      setHideOverlay(!hiddenOverlay)
  }
  const optionCSS = ['pr-1', 'hover:text-blue-500', 'cursor-pointer']
  const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
  const overlayCSS = ['bg-gray-800', 'opacity-25']
  const startTime = new Date(data._createdAt).toGMTString()
  const title = data.title
  const content = data.content
  const owner = data.owner || "Public"
  const contributor = data.contributor || "Nobody"
  const tags = data.tags
  const priority = data.priority
  const itemStatus = data.itemStatus
  const evaluation = data.evaluation
  const icon = owner.substring(0,1) || "P"
  const startTimestamp = new Date(data._createdAt).getTime()-Date.now()
  var orderNum
  var selectedStatus
  switch ( orderBy ){
    case "priority": orderNum = -priority; break;
    case "priority-reverse": orderNum = priority; break;
    case "oldest":  orderNum = startTimestamp; break;
    case "newest": orderNum = -startTimestamp; break;
    default: orderNum = -priority; break;
  }
  const item = (
    <>
    <div className="order mt-1 flex mx-10 bg-white divide-x border-gray-400 border-2 w-full hover:shadow-xl">
      <div className="w-1/10 flex items-center mx-3">
        <div className="w-10 h-10 bg-blue-600 text-blue-200 text-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="pl-2 w-4/5 flex.col">
        <div className="flex justify-between cursor-pointer" onClick={switchContentState}>
          <div className="text-3xl font-semibold">
            {title}
          </div>
          <div className="mr-2 text-sm text-gray-800">
            {startTime}
          </div>
        </div>
        <div className={cn('text-lg', {'hidden': !hideContent}, )}>
          <Markdown content={content}/>
        </div>
        <div className="text-sm flex justify-between text-gray-500">
          <div>
            owner: {owner}
          </div>
          <div>
            contributors: {contributor}
          </div>
          <div className="flex">
            <div className={cn(...optionCSS)}>
              edit
            </div >
            <div className={cn(...optionCSS)} onClick={switchOverlayState}>
              delete
            </div>
            <div className={cn(...optionCSS)}>
              comment
            </div>
            <div className={cn(...optionCSS)}>
              complete
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/6 flex items-center">
        <div className="w-full text-center text-6xl justify-center"> {priority} </div>
      </div>
    </div>
    {/* overlay */}
    <div className={cn('fixed', 'top-0', 'left-0', 'flex', 'flex-wrap', 'w-screen', 'h-screen', {'hidden':hiddenOverlay})}>
      <div className={cn(...overlayCSS, 'w-full', 'h-1/5')} onClick={switchOverlayState}>
      </div>
      <div className={cn(...overlayCSS, 'w-full', 'h-1/5')} onClick={switchOverlayState}>
      </div>

      <div className="w-full flex">
        <div className={cn(...overlayCSS, 'w-1/3')} onClick={switchOverlayState}> </div>
        <div className="w-1/3 bg-orange-200 border-2 border-red-400 ">
          <div className="text-center">

            <div className="w-full mt-2 font-semibold text-red-600 text-xl">Do you want to delete the idea?</div>
            <div className="flex mt-5 w-full">
              <div className={cn('mt-2', 'p-2', 'ml-4')}> Password: </div>
              <input className={cn(...inputCSS, 'mr-10')} id='password' type='text' placeholder='your passwoard'/>
            </div>
            <div className="flex justify-around h-full mt-5 bg-yellow-500">
              <button className={cn(...buttonCSS)}>
                yes
              </button>
              <button className={cn(...buttonCSS)}>
                no
              </button>
            </div>
          </div>
        </div>
        <div className={cn(...overlayCSS, 'w-1/3')} onClick={switchOverlayState}> </div>
        
      </div>
      <div className={cn(...overlayCSS, 'w-full', 'h-1/5')} onClick={switchOverlayState}></div>
      <div className={cn(...overlayCSS, 'w-full', 'h-1/5')} onClick={switchOverlayState}></div>
    </div>


    <style jsx>{`
      .order{
        order: ${orderNum}
      }
    `}
    </style>
    </>
     
  )


  return( 
    <>
      { (selectedStatus==itemStatus) && item}
    </>
  )
}
export function Ideas({ data, orderBy="priority", selectedStatus="active"}){
  const items = []
  //console.log(router, "ideas router")
  for (const item of data){
    items.push(<IdeaItem data={item} key={item.id} orderBy={orderBy}  selectedStatus={selectedStatus} />)
  }
  return (
    <div className="flex flex-wrap">
      {items} 
    </div>
  )
  
}
