import Head from 'next/head'
import Link from 'next/link'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { getItem, getItemList, setItem, getItemByReference, getImageByReference } from '../../lib/api'
import { IdeaHeader, Ideas } from '../../components/ideas'
import Notice from '../../components/notice'
import Router, { useRouter } from 'next/router'
import markdownToHtml from '../../lib/markdownToHtml'
import { Overlay } from '../../components/overlay'
import { useState, useEffect } from 'react'

export default function IdeaPage(props) {
  // Variables
  const img = props.data.ideaBg
  const noticeTitle = props.data.ideaItemTitle[0].title
  const noticeContent = props.data.ideaItemTitle[0].content
  const setting=["bg-repeat-y"]
  const bgImgAndSetting={img, setting}

  // States
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  console.log('1', persistentStates)
  const [ orderBy, setOrderBy ] = useState("priority")
  const [ selectedStatus, setSelectedStatus ] = useState("active")
  const [ option, setOption ] = useState("")
  const [ overlayData, setOverlayData] = useState()
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ itemData, setItemData ] = useState()

  console.log('2', persistentStates?.password)
  const [ password, setPassword ] = useState(persistentStates?.password)
  console.log('3', password)
  const downflowActions = {
      setPassword: setPassword,
      setShowOverlay: setShowOverlay,
      setSelectedStatus: setSelectedStatus,
      setOrderBy: setOrderBy,
      setOption: setOption,
      setOverlayData: setOverlayData,
      setItemData: setItemData,
  }
  //console.log('2', persistentStates, password)
  // Persist data
  const tmpData = {
      password: password,
      itemData: itemData,
  }
  setItem('/', tmpData)
  getItem(persistentStates, setPassword, 'password')
  console.log('idea', password)
  
  // Actions
  const newIdeaOpt = {
      pathname: '/idea/new',
      query: { password: password },
  }

  const main = (
  
    <>
      <Navigation page="idea" password={password} actions={downflowActions}/>
      <Notice title={noticeTitle} content={noticeContent} />
      <div className="mt-6">
        <div className="flex mx-12 mb-2 justify-end">
            <button className="h-8 w-32 bg-red-400 rounded-lg text-white font-semibold hover:shadow-lg hover:bg-blue-400" onClick={()=>Router.push(newIdeaOpt)}> + New Idea </button>
        </div>
        <IdeaHeader actions={downflowActions}/>
        <Ideas data={props.data.ideaItem} orderBy={orderBy} selectedStatus={selectedStatus} savedPassword={password} actions={downflowActions}/>
        { showOverlay && (option!='login') &&
            <Overlay page={'idea'} option={option} overlayData={overlayData} password={password} actions={downflowActions}/>}
      </div>
    </>
  )
  return (
    <div>
      <Head>
        <title> no idea for this title </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout index={false} bgImgAndSetting={bgImgAndSetting}>
        {main}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const ideaBg = (await getImageByReference("idea_bg", preview))
  let ideaItemTitle = (await getItemByReference("idea_item_title", preview))
  let ideaItem = (await getItemByReference("idea_item", preview))
  let comments = (await getItemByReference("idea_comment", preview))
  for (let e of ideaItem){
      e.originContent = e.content
      e.content = await markdownToHtml(e.content || '')
      e.comments = []
      for (let c of comments){
          if (e.id === c.refId){
              e.comments.push(c)
          }
      }
      console.log(e.comments)
  }
  //const orderBy = "priority-reverse"
  const data = {ideaBg, ideaItemTitle, ideaItem}
  ideaItemTitle[0].content = await markdownToHtml(ideaItemTitle[0].content || '')
  return{
    props: {
        data: data,
    }
  }
}
