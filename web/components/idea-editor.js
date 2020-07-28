import Background from '../components/background'
import { getImageByReference, sendData } from '../lib/api'
import { useState } from 'react'
import Router, { useRouter } from 'next/router'
import cn from 'classnames'
import Link from 'next/link'
import { isGithubLogin } from '../lib/github'

export function IdeaEditor({background, data, item, savedPassword, page, actions, userPassword}){
  // Variable
  const [ title, setTitle ] = useState(item?.title || "")
  const [ content, setContent ] = useState(item?.originContent || "")
  const [ tags, setTags ] = useState(item?.tag || "")
  const [ priority, setPriority ] = useState(item?.priority || 5)
  const [ owner, setOwner ] = useState(item?.owner || 'Public')
  
  const isTest = false
  const max_title_l = "100"
  const max_content_l = "800"
  const max_tags_l = "100"
  const max_owner_l = "100"
  const router = useRouter()
  const [ password, setPassword ] = useState(savedPassword)
  const [ hideTitleWarning, setTitleWarning ] = useState('hidden')
  const [ hideContentWarning, setContentWarning ] = useState('hidden')
  const [ hideTagsWarning, setTagsWarning ] = useState(true)
  const [ hideFormWarning, setFormWarning ] = useState(true)
  const [ hideOwnerWarning, setOwnerWarning ] = useState(true)
  // Actions
  const checkTitle = e => setTitleWarning((e.target.value.length < max_title_l) ? ((e.target.value.length > 0) ? 'hidden' : 'empty') : 'exceed')
  const checkContent = e => setContentWarning((e.target.value.length < max_content_l) ? ((e.target.value.length > 0) ? 'hidden' : 'empty') : 'exceed')
  const checkTags = e => setTagsWarning(e.target.value.length < max_tags_l)
  const checkOnwer = e => setOwnerWarning(e.target.value.length < max_owner_l)

  // CSS
  const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const itemCSS = ['font-normal', 'text-gray-300', 'mt-8']
  const hintCSS = ['font-light', 'text-xs', 'text-gray-400']
  const warningCSS = ['text-red-500', 'text-xs', 'italic']
  const priorityItemCSS = ['text-center']
  const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
  // Actions
  const getTitle = e => {setTitle(e.target.value)}
  const getContent = e => {setContent(e.target.value)}
  const getTags = e => {setTags(e.target.value)}
  const getPriority = e => {setPriority(e.target.value)}
  const getOwner = e => {setOwner(e.target.value)}
  //console.log(item, 'idea editor')
  const getData = async () => { 
    if(title===undefined || content===undefined || tags==undefined || title==="" || content===""){
        setFormWarning(false)
        return
    }
    
    setFormWarning(true)
    let form = {
        "title": title,
        "content": content,
        "tag": tags,
        "priority": parseInt(priority),
        "completeness": parseFloat(item?.completeness || 0),
        "startTime": null,
        "evaluation": null,
        "allowPriorityChange": false,
        "ref": "idea_new",
        "refId": null,
        "owner": owner,
        "contributor": "",
        "itemStatus": "active",
        "version": new Date(),
        "password" : savedPassword,
        "layer": null,
        "parents": null,
        "target": null,
        "difficulty": null,
        "urgency": null,
        "endDate": null,
        "duration": null,
        "period": null,
        "itemId": item?.itemId || Math.random().toString(),
        "_createdAt": item?._createdAt,
        "originContent": item?.originContent,
        "comments": item?.comments
    }
    if (item && (item.id !== undefined || item.itemId!==undefined)){
        form['refId'] = item.id
        form['option'] = 'edit'
        if(item.number!==undefined) form['number'] = item.number
        if (isGithubLogin()){
            form['url'] = item.url
            form['issueNumber'] = item.issueNumber
        }
        
    } 
    if (userPassword!==''){
        //console.log(form, 'form')
     
        if (isGithubLogin()) {
            const response = await actions.githubAction(form)
            //console.log(response, 'response')
        }
        else{ 
            actions.afterAction(form)
            //Router.push(page)
        }
        return
    }
    else if (userPassword==='' && savedPassword!==''){
        await sendData(form, isTest, actions.afterAction, true)
        return
    }
    else if (userPassword==='' && savedPassword===''){
        Router.push(page)
    }

  }
  // Variables
  const img = background
  const setting = ["h-full"]
  const bgImgAndSetting = {img, setting}
  const main = (
    <>
      <div className="flex justify-between bg-gray-800 h-screen">
        <div className="w-2/5 h-full">
          <Background imgAndSetting={bgImgAndSetting}>
          </Background>
        </div>
        <div className="w-3/5 h-full">
          <div className={cn({'opacity-0': hideFormWarning}, 'text-red-500', 'text-center', 'text-xs')}>
            Please check your form
          </div>
          <div className="h-full mx-32 my-16 text-white font-semibold">
            <div className="text-2xl uppercase">
              { data.title }
            </div>
            <div className={cn(...hintCSS)}>
              { data.titleNote }
            </div>
            <div className="flex">
              <div className="w-2/3">
                <div className={cn(...itemCSS)}>
                  Title
                </div>
                <input className={cn(...inputCSS, {'border-red-500': hideTitleWarning!='hidden',})} id="title" type="text" placeholder="your title" maxLength={max_title_l} value={title} onChange={(e) => {checkTitle(e); getTitle(e)}} />
                <div className={cn(...warningCSS)}>
                  <p className={cn({'hidden': hideTitleWarning!='exceed' ,})}>maximal {max_title_l} letters.</p>
                  <p className={cn({'hidden': hideTitleWarning!='empty' ,})}>empty title.</p>
                </div>
              </div>
              <div className="w-1/3">
                <div className={cn(...itemCSS, 'pl-1')}>
                  Owner
                </div>
                <div className="pl-1">
                  <input className={cn(...inputCSS, {'border-red-500': !hideOwnerWarning,})} id="owner" type="text" placeholder="owner" maxLength={max_owner_l} value={owner} onChange={(e) => {checkOnwer(e); getOwner(e)}} />
                  <p className={cn({'hidden': hideOwnerWarning}, ...warningCSS)}> maximal {max_owner_l} letters. </p>
                </div>
              </div>
            </div>
            
            <div className={cn(...itemCSS)}>
              Content
            </div>
            <textarea className={cn(...inputCSS, 'resize-none', {'border-red-500': hideContentWarning!='hidden',})} id="content" placeholder="your content" maxLength={max_content_l} value={content} onChange={(e) => {checkContent(e); getContent(e)}} />
            <div className={cn(...warningCSS)}>
              <p className={cn({'hidden': hideContentWarning!='exceed' ,})}>maximal {max_content_l} letters.</p>
              <p className={cn({'hidden': hideContentWarning!='empty' ,})}>empty content.</p>
            </div>
            <div className={cn(...hintCSS)}>
              Markdown formate is available, you can edit it <a href="https://stackedit.io/app" target="_blank" className="text-blue-400"> here </a>
            </div>
            <div className="flex">
              <div className="w-2/3">
                <div className={cn(...itemCSS)}>
                  Tags
                </div>
                <input className={cn(...inputCSS)} id="tags" placeholder="your tags" maxLength={max_tags_l} value={tags} onChange={(e) => {checkTags(e); getTags(e)}}/>
                <div className={cn(...warningCSS)}>
                  <p className={cn({'hidden': hideTitleWarning})}> maximal {max_tags_l} letters. </p>
                 
                </div>
                <div className={cn(...hintCSS)}>
                  Different tags should be separated by ",".
                </div>
              </div>
              <div className="w-1/3">
                <div className="pl-8">
                  <div className={cn(...itemCSS)}>
                    Priority
                  </div>
                  <div className={cn('bg-white', ...inputCSS)}>
                    <select className="hover: cursor-pointer border-solid appearance-none h-full w-full text-center" onChange={getPriority}>
                      <option className="" value={priority} aria-selected="true"> {priority || 5} </option>
                      <option className="" > 1 </option>
                      <option className="" > 2 </option>
                      <option className="" > 3 </option>
                      <option className="" > 4 </option>
                      <option className="" > 5 </option>
                      <option className="" > 6 </option>
                      <option className="" > 7 </option>
                      <option className="" > 8 </option>
                      <option className="" > 9 </option>
                      <option className="" > 10 </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className={cn(...itemCSS, 'flex', 'justify-around')}>
                <button className={cn(...buttonCSS)} onClick={()=>Router.push(page)}> back </button>
                <button className={cn(...buttonCSS)} onClick={getData}> create </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
  return (
    <>
      {main}
    </>
  )
}


