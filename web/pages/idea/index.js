import Head from 'next/head'
import Link from 'next/link'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { readLocal, writeLocal, useUpdateData, useLoadData, useUserPassword, useAdminPassword, sendData, getHostname, getItemByReference, getImageByReference } from '../../lib/api'
import { IdeaHeader, Ideas } from '../../components/ideas'
import Notice from '../../components/notice'
import Router, { useRouter } from 'next/router'
import markdownToHtml from '../../lib/markdownToHtml'
import { Overlay } from '../../components/overlay'
import { useState, useEffect } from 'react'
import { Image } from 'react-datocms'

export default function IdeaPage(props) {
  // Variables
  const [ localData, setLocalData ] = useState()
  const img = props.data.ideaBg
  const noticeTitle = props.data.ideaItemTitle[0].title
  const noticeContent = props.data.ideaItemTitle[0].content
  const setting=["bg-repeat-y"]
  const bgImgAndSetting={img, setting}
  const logo = props.data.logo
  const isTest = false
  const ideaItem = localData?.ideaItem || props.data.ideaItem
  const noContentImg = props.data.noContentImg

  // States
  const [ orderBy, setOrderBy ] = useState("priority")
  const [ selectedStatus, setSelectedStatus ] = useState("active")
  const [ option, setOption ] = useState("")
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ itemData, setItemData ] = useState()
  const [ hostname, setHostname ] = useState()
  const [ id, setId ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ updateLocal, setUpdateLocal ] = useState(0)
  const [ refresh, setRefresh ] = useState(false)
  // Actions
  const afterActiveAction = (postData, itemData) => {
      if (userPassword!==''){
          for (let index in localData.ideaItem){
              if (localData.ideaItem[index].itemId === itemData.itemId){
                  localData.ideaItem[index].itemStatus = 'active'
                  setUpdateLocal(updateLocal+1)
                  break
              }
          }
      }
  }
  const activeAction = async (postData, itemData) => {
      if (userPassword!==''){
          postData['itemId'] = itemData.itemId
          afterActiveAction(postData, itemData)
          return
      }
      if (userPassword==='' && adminPassword!==''){
          postData['id'] = itemData.id
          postData['password'] = adminPassword
          await sendData(postData)
          return
      }

  }
  const afterCompleteAction = (postData, itemData) => {
      if (userPassword!==''){
          for (let index in localData.ideaItem){
              if (localData.ideaItem[index].itemId === itemData.itemId){
                  localData.ideaItem[index].itemStatus = 'completed'
                  setUpdateLocal(updateLocal+1)
                  break
              }
          }
      }
  }
  const completeAction = async (postData, itemData) => {
      if (userPassword!==''){
          postData['itemId'] = itemData.itemId
          afterCompleteAction(postData, itemData)
          return
      }
      if (userPassword==='' && adminPassword!==''){
          postData['id'] = itemData.id
          postData['password'] = adminPassword
          await sendData(postData)
          return
      }
  }
  const afterNewCommentAction = (postData) => {
      if (postData.data!==undefined) postData = postData.data
      if (userPassword!==''){
          for (let index in localData.ideaItem){
              if (localData.ideaItem[index].itemId === itemData.itemId){
                  localData.ideaItem[index].comments.push(postData)
                  setUpdateLocal(updateLocal+1)
                  break
              }
          }
      }
      if (userPassword===''){
          for (let index in ideaItem){
              if(ideaItem[index].id === itemData.id){
                  ideaItem[index].comments.splice(0, 0, postData)
                  setRefresh(!refresh)
                  break
              }
          }
      }
  }
  const newCommentAction = async (postData) => {
      if (userPassword!==''){
          postData['commentId'] = Math.random()
          postData['_createdAt'] = new Date()
          afterNewCommentAction(postData)
      }
      if (userPassword===''){
          postData["refId"] = itemData.id
          await sendData(postData, isTest, afterNewCommentAction, true)
      }
  }
  const afterDeleteAction = () => {
      if (userPassword!==''){
          const data = localData
          for (let index in data.ideaItem){
              if (data.ideaItem[index].itemId === itemData.itemId){
                  data.ideaItem.splice(index, 1)
                  break
              }
          }
          setLocalData(data)
      }
      if (userPassword==='' && adminPassword!==''){
          for (let index in ideaItem){
              if (ideaItem[index].id === itemData.id){
                  ideaItem.splice(index, 1)
                  break
              }
          }
          setRefresh(!refresh)
      }
  }
  const deleteAction = async (savedPassword) => {
      const tmpPassword = adminPassword?adminPassword:savedPassword
      let tmpData = {
          "id": id,
          "option": "delete",
          "password": tmpPassword,
      }
      if (userPassword!==''){
          afterDeleteAction(tmpData)
          setShowOverlay(false)
          return
      }
      if (userPassword==='' && tmpPassword!==''){
          await sendData(tmpData, isTest, afterDeleteAction, true)
          setShowOverlay(false)
          return
      }
      
  }
  const downflowActions = {
      setPassword: setUserPassword,
      setShowOverlay: setShowOverlay,
      setSelectedStatus: setSelectedStatus,
      setOrderBy: setOrderBy,
      setOption: setOption,
      setItemData: setItemData,
      deleteAction: deleteAction,
      setId: setId,
      newCommentAction: newCommentAction,
      completeAction: completeAction,
      activeAction: activeAction,
  }
  
  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)
  useLoadData('idea', userPassword, setLocalData)
  
  useUpdateData('idea', userPassword, localData, [localData?.ideaItem.length, updateLocal])
  
  const main = (
  
    <>
      <Navigation page="idea" password={userPassword} actions={downflowActions} logo={logo}/>
      <Notice title={noticeTitle} content={noticeContent} />
      <div className="mt-6">
        <div className="flex mx-12 mb-2 justify-end">
            <button className="h-8 w-32 bg-red-400 rounded-lg text-white font-semibold hover:shadow-lg hover:bg-blue-400" onClick={()=>Router.push('/idea/new')}> + New Idea </button>
        </div>
        <IdeaHeader actions={downflowActions}/>
        <Ideas data={ideaItem} orderBy={orderBy} selectedStatus={selectedStatus} savedPassword={adminPassword} actions={downflowActions}/>
        { showOverlay && (option!='login') &&
            <Overlay page={'idea'} option={option} password={userPassword} actions={downflowActions}/>}
        { ideaItem.length===0 && 
          <div className='bg-white mx-10 my-4 py-4 flex justify-center'>
            <div className='text-6xl tracking-widest text-green-400 italic '>
              No Idea
            </div>
            <Image className='w-20 h-20' data={noContentImg.image.responsiveImage} /> 
          </div>

        }
      </div>
    </>
  )
  return (
    <div>
      <Head>
        <title>Good ideas are common – what’s uncommon are people who’ll work hard enough to bring them about. </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'idea'} bgImgAndSetting={bgImgAndSetting} hostname={hostname}>
        {main}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const ideaBg = (await getImageByReference("idea_bg", preview))
  const noContentImg = await getImageByReference('no_content', preview)
  let ideaItemTitle = (await getItemByReference("idea_item_title", preview))
  let ideaItem = (await getItemByReference("idea_item", preview))
  let comments = (await getItemByReference("idea_comment", preview))
  let logo = await getImageByReference('logo', preview)
  for (let e of ideaItem){
      e.originContent = e.content
      e.content = await markdownToHtml(e.content || '')
      e.comments = []
      for (let c of comments){
          if (e.id === c.refId){
              e.comments.push(c)
          }
      }
  }
  const data = {ideaBg, ideaItemTitle, ideaItem, logo, noContentImg}
  ideaItemTitle[0].content = await markdownToHtml(ideaItemTitle[0].content || '')
  return{
    props: {
        data: data,
    }
  }
}
