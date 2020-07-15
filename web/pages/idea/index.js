import Head from 'next/head'
import Link from 'next/link'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { useRedirect, useGithubLogin, readLocal, writeLocal, useUpdateData, useLoadData, useUserPassword, useAdminPassword, sendData, getHostname, getItemByReference, getImageByReference } from '../../lib/api'
import { IdeaHeader, Ideas } from '../../components/ideas'
import Notice from '../../components/notice'
import Router, { useRouter } from 'next/router'
import markdownToHtml from '../../lib/markdownToHtml'
import { Overlay } from '../../components/overlay'
import { useState, useEffect } from 'react'
import { Image } from 'react-datocms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { RotateType1 } from '../../components/animation'
import { updateGithubItem, sendGithubRequest, isGithubLogin, getGithubInfo } from '../../lib/github'

export default function IdeaPage(props) {
  // Variables
  const [ localData, setLocalData ] = useState()
  const [ sessionData, setSessionData ] = useState()
  const img = props.data.ideaBg
  const noticeTitle = props.data.ideaItemTitle[0].title
  const noticeContent = props.data.ideaItemTitle[0].content
  const setting=["bg-repeat-y"]
  const bgImgAndSetting={img, setting}
  const logo = props.data.logo
  const isTest = false
  const ideaItem = localData?.ideaItem || props.data.ideaItem
  const noContentImg = props.data.noContentImg
  const loginStatus = sessionData?.loginStatus || 'logout'
  const githubUserData = sessionData?.userData || null
  const githubRepos = sessionData?.repos || null
  const redirectPage = sessionData?.redirectPage || null
  const page = 'idea'
  //console.log(ideaItem, 'ideaItem')

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

  // Functions
  function updateFunction(password){
      setUpdateLocal(updateLocal+1)
      if (password!==undefined && password!==null){
          setUserPassword(password)
      }
  }
  function cleanLocalData(){
      setLocalData()
  }
  // Effects
  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)
  useLoadData('idea', userPassword, setLocalData, setSessionData, [updateLocal])
  useUpdateData('idea', userPassword, localData, [localData?.ideaItem?.length, updateLocal])
  useGithubLogin('idea', redirectPage, isTest, updateFunction)
  //useRedirect(redirectPage, page)
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
      if (userPassword!=='' && !isGithubLogin()){
          postData['itemId'] = itemData.itemId
          afterActiveAction(postData, itemData)
          return
      }
      else if (userPassword!=='' && isGithubLogin()){
          itemData['itemStatus'] = 'active'
          await updateGithubItem(itemData, hostname, afterActiveAction)

      }
      else if (userPassword==='' && adminPassword!==''){
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
      if (userPassword!=='' && !isGithubLogin()){
          postData['itemId'] = itemData.itemId
          afterCompleteAction(postData, itemData)
          return
      }
      else if (userPassword!=='' && isGithubLogin()){
          //console.log(postData, 'postData')
          itemData['itemStatus'] = 'completed'
          await updateGithubItem(itemData, hostname, afterCompleteAction)
          
      }
      else if (userPassword==='' && adminPassword!==''){
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
  const afterDeleteAction = (newData) => {
      //console.log(newData, 'new data')
      if (userPassword!=='' && !isGithubLogin()){
          const data = localData
          for (let index in data.ideaItem){
              if (data.ideaItem[index].itemId === itemData.itemId){
                  data.ideaItem.splice(index, 1)
                  break
              }
          }
          setLocalData(data)
      }
      else if (userPassword!=='' && isGithubLogin()){
          const statusText = newData.statusText || null
          if (statusText==='No Content'){
              //console.log(statusText, 'statusText')
              const data = localData
              for (let index in data.ideaItem){
                  if (data.ideaItem[index].itemId === itemData.itemId){
                      data.ideaItem.splice(index, 1)
                      break
                  }
              }
              setLocalData(data)
              updateFunction()
          }
          else {
              alert('Sorry, delete failed')
          }

      }
      else if (userPassword==='' && adminPassword!==''){
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
      if (userPassword!=='' && !isGithubLogin()){
          afterDeleteAction(tmpData)
          setShowOverlay(false)
          return
      }
      else if (userPassword!=='' && isGithubLogin()){
          const githubInfo = getGithubInfo()
          tmpData['itemType'] = 'milestone'
          tmpData['userName'] = githubInfo.userName
          tmpData['userId'] = githubInfo.userId
          tmpData['repo'] = githubInfo.repo
          tmpData['hostname'] = hostname
          tmpData['option'] = 'delete'
          tmpData['version'] = new Date()
          tmpData['number'] = itemData.number
          //console.log('delete action')
          sendGithubRequest(tmpData, afterDeleteAction)
          setShowOverlay(false)
          return
      }
      else if (userPassword==='' && tmpPassword!==''){
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
      updateFunction: updateFunction,
      cleanLocalData: cleanLocalData,
  }
  

  
  const main = (
  
    <>
      <Navigation page="idea" password={userPassword} actions={downflowActions} logo={logo} hostname={hostname} loginStatus={loginStatus} githubUserData={githubUserData} repos={githubRepos}/>
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
    <>
    { loginStatus!=='github_pending' &&
      <div>
        <Head>
          <title>Good ideas are common – what’s uncommon are people who’ll work hard enough to bring them about. </title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Layout page={'idea'} bgImgAndSetting={bgImgAndSetting} hostname={hostname}>
          {main}
        </Layout>
      </div>
    }
    { loginStatus==='github_pending' &&
        <div className='flex justify-center w-screen h-screen items-center bg-gray-100'>
          <RotateType1>
            <FontAwesomeIcon icon={faSpinner} className='h-20 w-20 text-gray-600'/>
          </RotateType1>
        </div>
    }
    </>
  )
}

export async function getStaticProps({ preview=false }){
  let ideaBg = null
  let noContentImg = null
  let ideaItemTitle = null
  let ideaItem = null
  let comments = null
  let logo = null
  try{
      ideaBg = (await getImageByReference("idea_bg", preview))
      noContentImg = await getImageByReference('no_content', preview)
      ideaItemTitle = (await getItemByReference("idea_item_title", preview))
      ideaItem = (await getItemByReference("idea_item", preview))
      comments = (await getItemByReference("idea_comment", preview))
      logo = await getImageByReference('logo', preview)
  }
  catch{
      ideaItem = []
      comments = []
  }
  
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
  if (ideaItemTitle!==null){
      ideaItemTitle[0].content = await markdownToHtml(ideaItemTitle[0].content || '')
  }
  return{
    props: {
        data: data,
    }
  }
}
