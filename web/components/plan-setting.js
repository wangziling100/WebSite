import { Button } from '../components/button'
import { reloadPage, toItemFormat, sendData, readAllLocalBusiness, readLocal, writeLocal, rebuild } from '../lib/api'
import { Overlay } from '../components/overlay'
import { useState } from 'react'
import { sendPublishRequest, isGithubLogin } from '../lib/github'
import { clearLocal, collectAllGithubData } from '../lib/localData'
export function PlanSetting({ password, actions, userPassword}){
  const isTest = false
  const [showOverlay, setShowOverlay] = useState(false)
  const tmpActions= {
      setPassword: actions.setAdminPassword,
      setShowOverlay: setShowOverlay,
      setUserPassword: actions.setUserPassword,
  }
  const [ downflowActions, setDownflowActions ] = useState(tmpActions)
  const loginTxt = password?'Logout':'Admin Login'
  const [ option, setOption ] = useState()
  // Functions
  const updateItems = (newItems, targetDataSet) => {
      for (let newItem of newItems){
          newItem = toItemFormat(newItem)
          const itemId = newItem.itemId
          for (let item of targetDataSet){
              if (itemId===item.itemId){
                  item = updateAttrs(newItem, item)
                  break
              }
          }
      }

      return  targetDataSet
  }
  const updateAttrs = (newItem, oldItem) => {
      for (let key in newItem){
          oldItem[key] = newItem[key]
      }
      return oldItem
  }
  const updatePlans = (newItems, userPassword) => {
      let pageData = readLocal('plan', userPassword)
      for (let newItem of newItems){
          let isFound = false
          newItem = toItemFormat(newItem)
          const itemId = newItem.itemId
          for (let layer of pageData.layers){
              for (let item of layer){
                  if(item.itemId===itemId){
                      item = updateAttrs(newItem, item)
                      isFound = true
                  }
              }
              if (isFound) break
          }
      }
      return pageData
  }
  // Actions
  
  const afterSyncAction = (newData, page) => {
      newData = newData.data
      if (newData[0] === null) return
      let pageData
      //console.log(newData, 'new data')
      let key
      if (page==='idea') {
          key = 'ideaItem'
          pageData = readLocal('idea', userPassword)
          pageData[key] = updateItems(newData, pageData[key])
      }
      else if (page==='plan') {
          pageData = updatePlans(newData, userPassword)
      }
      writeLocal(page, userPassword, pageData)
  }

  const buildAction = () => {
      rebuild(password, isTest)
  }

  const logoutAction = () => {
      actions.setAdminPassword('')
  }

  const logInOutAction = password?logoutAction:()=>{
      setShowOverlay(true)
      setOption('adminLogin')
  }

  const syncAction = async () => {
      const all = readAllLocalBusiness(userPassword)
      for (let page in all){
          let postItems = []
          for (let el of all[page]){
              if (el.id!==undefined && el.id!==null){
                  el['option'] = 'update'
                  el = toItemFormat(el)
              }
              el['password'] = userPassword
              postItems.push(el)
          }
          const tmpFunc = (newData) => afterSyncAction(newData, page)
          //console.log(postItems, 'page data')
          await sendData(postItems, isTest, tmpFunc, true)
      }
      
  }
  const clearAction = () => {
      console.log('clear')
      if (isGithubLogin()){
          clearLocal(userPassword)
          reloadPage()
      }
  }
  
  const publishAction = () => {
      //console.log('github publish')
      if (isGithubLogin()){
          downflowActions['publish'] = publishGithubData
          setDownflowActions(downflowActions)
          setShowOverlay(true)
          setOption('publish')
      }
  }
  const afterPublishGithubData = (newData) => {
      if (newData===undefined || newData===null ){
          alert('No connection with server')
          return
      }
      const statusText = newData.statusText
      //console.log('after publish github data:', statusText, newData)
      actions.setPageStatus('normal')
      if (statusText!=='OK') alert('Publish failed')
  }

  const publishGithubData = (password) => {
      actions.setPageStatus('pending')
      //console.log(password, 'publish github data')
      const allData = collectAllGithubData()
      //console.log(allData, 'all github data publish')
      const postData = {
          data: allData,
          password: password,
      }
      sendPublishRequest(postData, afterPublishGithubData, isTest)
  }
  //console.log(downflowActions, 'downflowActions')
  
  const main = (
    <>
      <Button bn='Build' onClick={buildAction}/>
      <Button bn={loginTxt} onClick={logInOutAction}/>
      <Button bn='Sync' onClick={syncAction} />
      <Button bn='Publish' onClick={publishAction} />
      <Button bn='Clear' onClick={clearAction} />
      {
          showOverlay &&
          <Overlay page='plan/setting' option={option} actions={downflowActions} />
      }
    </>
  )
  return (
    <>
      {main}
    </>
  )
}
