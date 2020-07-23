import Router from 'next/router'
import Markdown from '../components/markdown'
import { useState } from 'react'
import cn from 'classnames'
import { Overlay } from '../components/overlay'
import { writeData, setItem, getItemList, sendData } from '../lib/api'
import { NewCommentItem, Comment } from '../components/comment'

export function IdeaHeader({ actions }){
  const [ selectedStatus, setSelectedStatus ] = useState("active")
  const newestAction = () => actions.setOrderBy("newest")
  const oldestAction = () => actions.setOrderBy("oldest")
  const mostImportantAction = () => actions.setOrderBy("priority")
  const leastImportantAction = () => actions.setOrderBy("priority-reverse")
  const activeAction = () => {
      actions.setSelectedStatus("active")
      setSelectedStatus("active")
  }
  const completedAction = () => {
      actions.setSelectedStatus("completed")
      setSelectedStatus("completed")
  }
  
  return(
    <>
    <div className="flex mx-10 p-4 bg-white">
      <div className="w-1/2 flex">
        <div className="mx-2" >
          <div onClick={activeAction} className={cn({'underline':selectedStatus=="active"}, {'text-blue-800':selectedStatus=="active"}, "hover:text-blue-600", "cursor-pointer")} > Active </div>
        </div>
        <div className="mx-2">
          <div onClick={completedAction} className={cn({'underline':selectedStatus=="completed"}, {'text-blue-800':selectedStatus=="completed"}, "hover:text-blue-600", "cursor-pointer")}> Completed </div>
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
          
            <option value="default" aria-selected="true" onClick={mostImportantAction}> Default Sort</option>
            <option onClick={newestAction}> Newest </option>
            <option onClick={oldestAction}> Oldest </option>
            <option onClick={mostImportantAction}> Most Import </option>
            <option onClick={leastImportantAction}> Least Import </option>
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
export function IdeaItem({ data, password, actions, orderBy="priority", selectedStatus="active"}){
  // Variables
  const commentUrl = data.url
  let [ showAddComment, setShowAddComment ] = useState(false)
  const [ hideContent, setHideContent ] = useState(true)
  const [ showComment, setShowComment ] = useState(false)
  const isTest = false
  const path = '/idea'

  // Actions
  const switchContentState = () => {
      setHideContent(!hideContent)
  }
  const deleteAction = () =>{
      actions.setOption("delete")
      actions.setShowOverlay(true)
      actions.setId(data.id)
      actions.setItemData(data)
  }

  const completedRequest = () => {
      const postData = {
          "id": data.id,
          "option": "completed",
          "password": password,
      }
      actions.completeAction(postData, data)
      setItemStatus('completed')
  }
  const activeRequest = () => {
      actions.setItemData(data)
      const postData = {
          "id": data.id,
          "option": "active",
          "password": password,
      }
      actions.activeAction(postData, data)
      setItemStatus('active')
  }
  
  const activeCompletedAction = (selectedStatus==='active')?
      completedRequest: activeRequest

  const newCommentAction = () => {
      actions.setItemData(data)
      setShowAddComment(!showAddComment)
  }
  const editAction = () => {
      //actions.setItemData({data: data})
      writeData({editIdea: data})
      Router.push('/idea/edit')
  }

   
  // CSS
  const optionCSS = ['pr-1', 'hover:text-blue-500', 'cursor-pointer']
  // Attributes
  const startTime = new Date(data._createdAt||data.createdAt).toGMTString()
  const title = data.title
  const content = data.content
  const owner = data.owner || "Public"
  const contributor = data.contributor || "Nobody"
  let tags = null
  if (data.number!==undefined) tags = '#'+data.number + ' ' +data.tag 
  else tags = data.tag
  const priority = data.priority
  const comments = data.comments || []
  const [ itemStatus, setItemStatus] = useState(data.itemStatus)
  const evaluation = data.evaluation
  const icon = owner.substring(0,1) || "P"
  const startTimestamp = new Date(data._createdAt).getTime()-Date.now()
  var orderNum
  //var selectedStatus
  switch ( orderBy ){
    case "priority": orderNum = -priority; break;
    case "priority-reverse": orderNum = priority; break;
    case "oldest":  orderNum = startTimestamp; break;
    case "newest": orderNum = -startTimestamp; break;
    default: orderNum = -priority; break;
  }
  
  const item = (
    <>
    <div className="order w-full mx-10">
    <div className="mt-1 flex  bg-white divide-x border-gray-500 border-2 w-full hover:shadow-xl">
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
        <div className='text-sm text-gray-600'>
          {tags}
        </div>
        <div className="text-sm flex justify-between text-gray-500">
          <div>
            owner: {owner}
          </div>
          <div>
            contributors: {contributor}
          </div>
          <div className="flex">
            <div className={cn(...optionCSS)} onClick={editAction}>
              edit
            </div >
            <div className={cn(...optionCSS)} onClick={deleteAction}>
              delete
            </div>
            
            <a href={commentUrl} className={cn(...optionCSS)} target='_blank'>
              comment
            </a>
            <div className={cn(...optionCSS)} onClick={activeCompletedAction}>
              {(selectedStatus==='active')?'completed':'undo'}
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/6 flex items-center">
        <div className="w-full text-center text-6xl justify-center"> {priority} </div>
      </div>
    </div>
      { showAddComment &&  <NewCommentItem itemData={data} page={'idea'} onSubmit={newCommentAction} actions={actions}/>}
      { showComment && <Comment data={comments} /> }
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
export function Ideas({ data, savedPassword, actions, orderBy="priority", selectedStatus="active"}){
  const items = []
  const testAction = () => { console.log('here') }
  for (let item of data){
    items.push(<IdeaItem data={item} key={item.id||item.itemId} orderBy={orderBy}  selectedStatus={selectedStatus} onClick={testAction} password={savedPassword} actions={actions}/>)
  }
  return (
    <div className="flex flex-wrap">
      {items} 
    </div>
  )
}
