import Background from '../../components/background'
import { getImageByReference } from '../../lib/api'
import { useState } from 'react'
import Router, { useRouter } from 'next/router'
import cn from 'classnames'
import Link from 'next/link'

export default function NewIdea(props){
  let [ title, setTitle ] = useState("")
  let [ content, setContent ] = useState("")
  let [ tags, setTags ] = useState("")
  let [ priority, setPriority ] = useState(5)
  let [ owner, setOwner ] = useState('Public')
  const isTest = false
  const max_title_l = "100"
  const max_content_l = "800"
  const max_tags_l = "100"
  const max_owner_l = "100"
  const router = useRouter()
  const [ hideTitleWarning, setTitleWarning ] = useState('hidden')
  const [ hideContentWarning, setContentWarning ] = useState('hidden')
  const [ hideTagsWarning, setTagsWarning ] = useState(true)
  const [ hideFormWarning, setFormWarning ] = useState(true)
  const [ hideOwnerWarning, setOwnerWarning ] = useState(true)
  const checkTitle = e => setTitleWarning((e.target.value.length < max_title_l) ? ((e.target.value.length > 0) ? 'hidden' : 'empty') : 'exceed')
  const checkContent = e => setContentWarning((e.target.value.length < max_content_l) ? ((e.target.value.length > 0) ? 'hidden' : 'empty') : 'exceed')
  const checkTags = e => setTagsWarning(e.target.value.length < max_tags_l)
  const checkOnwer = e => setOwnerWarning(e.target.value.length < max_owner_l)

  const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const itemCSS = ['font-normal', 'text-gray-300', 'mt-8']
  const hintCSS = ['font-light', 'text-xs', 'text-gray-400']
  const warningCSS = ['text-red-500', 'text-xs', 'italic']
  const priorityItemCSS = ['text-center']
  const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
  const getTitle = e => {setTitle(e.target.value)}
  const getContent = e => {setContent(e.target.value)}
  const getTags = e => {setTags(tags=e.target.value)}
  const getPriority = e => {setPriority(priority=e.target.value)}
  const getOwner = e => {setOwner(e.target.value)}
  const getData = () => { 
    console.log(title, content, tags, priority, owner)
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
        "completeness": 0,
        "startTime": null,
        "evaluation": null,
        "allowPriorityChange": false,
        "ref": "idea_new",
        "refId": null,
        "owner": owner,
        "contributor": "",
        "itemStatus": "active"

    }
    const postData = JSON.stringify(form)
    let host
    let port
    let route
    let https
    if (isTest){
        host = 'localhost'
        port = 4000
        route = '/push'
        https = require('http')
    } else{
        host = '0eaw1uy00c.execute-api.eu-central-1.amazonaws.com'
        route = '/Prod/push'
        port = 443
        https = require('https')
    }
    const options = {
        hostname: host,
        port: port,
        path: route,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        },
    }
    var req = https.request(options, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            console.log('Response: '+chunk)
        })
        res.on('end', () => {
            console.log('Got error: ' )
        })
    })

    req.write(postData)
    req.end()
    Router.push('/idea')
  }
  const img = props.data.background
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
              create new idea
            </div>
            <div className={cn(...hintCSS)}>
              The created ideas will be checked before they are published
            </div>
            <div className="flex">
              <div className="w-2/3">
                <div className={cn(...itemCSS)}>
                  Title
                </div>
                <input className={cn(...inputCSS, {'border-red-500': hideTitleWarning!='hidden',})} id="title" type="text" placeholder="your title" maxLength={max_title_l} onChange={(e) => {checkTitle(e); getTitle(e)}} />
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
                  <input className={cn(...inputCSS, {'border-red-500': !hideOwnerWarning,})} id="owner" type="text" placeholder="owner" maxLength={max_owner_l} onChange={(e) => {checkOnwer(e); getOwner(e)}} />
                  <p className={cn({'hidden': hideOwnerWarning}, ...warningCSS)}> maximal {max_owner_l} letters. </p>
                </div>
              </div>
            </div>
            
            <div className={cn(...itemCSS)}>
              Content
            </div>
            <textarea className={cn(...inputCSS, 'resize-none', {'border-red-500': hideContentWarning!='hidden',})} id="content" placeholder="your content" maxLength={max_content_l} onChange={(e) => {checkContent(e); getContent(e)}} />
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
                <input className={cn(...inputCSS)} id="tags" placeholder="your tags" maxLength={max_tags_l} onChange={(e) => {checkTags(e); getTags(e)}}/>
                <div className={cn(...warningCSS)}>
                  <p className={cn({'hidden': hideTitleWarning})}> maximal {max_tags_l} letters. </p>
                 
                </div>
                <div className={cn(...hintCSS)}>
                  Different tags should be separated by ";".
                </div>
              </div>
              <div className="w-1/3">
                <div className="pl-8">
                  <div className={cn(...itemCSS)}>
                    Priority
                  </div>
                  <div className={cn('bg-white', ...inputCSS)}>
                    <select className="hover: cursor-pointer border-solid appearance-none h-full w-full text-center" onChange={getPriority}>
                      <option className="" value="5" aria-selected="true"> Default (5) </option>
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
              <Link href='/idea'>
                <button className={cn(...buttonCSS)}> back </button>
              </Link>
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

export async function getStaticProps({ preview=false }){
  const background = (await getImageByReference("idea_new_bg", preview))
  const data = {background}
  return{
    props: {
      data: data,
    }
  }
}