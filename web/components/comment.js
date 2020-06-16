import Router, { useRouter } from 'next/router'
import { sendData } from '../lib/api'
import { useState } from 'react'

export function NewCommentItem({id, page, onSubmit}){
    const isTest = false
    const max_comment_l = 600
    let [ comment, setComment ] = useState("")
    let [ name, setName ] = useState("")
    const getComment = (e) => { 
        setComment(e.target.value)
    }
    const getName = (e) => {
        setName(e.target.value)
    }
    const submitRequest = async () => {
        if (comment!==""){
            const postData = {
                "title": "comment",
                "content": comment,
                "ref": "idea_comment",
                "refId": id,
                "owner": name,
            }
            await sendData(postData, isTest)
        }
        onSubmit()
    }
    const newCommentItem = (
    
      <>
      <div className="w-full bg-white">
        <div className="flex flex-wrap w-full justify-between content-start">
          <textarea className="w-full p-2 resize-none shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:border-red-500" placeholder="your comment" id="comment" maxLength={max_comment_l} onChange={getComment}>
          </textarea>
          <div className="flex justify-start w-full">
            <input className="w-1/5 px-2 border rounded text-gray-700 leading-tight focus:outline-none focus:border-red-500 " placeholder="your name" onChange={getName}/>
              
            <button className="h-full mx-2 p-2 bg-blue-400 rounded-lg hover:shadow hover:bg-red-400" onClick={submitRequest}>
              submit
            </button>
          </div>

        </div>
      </div>
      </> 
    )

    return(
      <>
        { newCommentItem }
      </>
   
    )

}

function CommentItem({ data }){
  // Attributes
  const startTime = new Date(data._createdAt).toGMTString()
  const content = data.content
  const time = new Date(data._createdAt).toGMTString()
  const owner = data.owner || "unknown"
  const item = (
    <>
      <div className="w-full p-2 bg-white border-blue-300 border-l-2 border-b-2 border-r-2">
        <div>
        { content }
        </div>
        <div className="text-right">
        ---- {owner} at {time}
        </div>
      </div>
      <div>
        
      </div>
    </>
  )
  
  return(
    <>
    {item}
    </>
  )
}

export function Comment({ data }){
  const comments = []
  for (const comment of data){
    comments.push(<CommentItem data={comment} key={comment.id}/>)
  }
  return (
    <>
      {comments}
    </>
  )
}
