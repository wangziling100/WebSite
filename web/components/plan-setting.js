import { Button } from '../components/button'
import { toItemFormat, sendData, readAllLocalBusiness, readLocal, writeLocal, rebuild } from '../lib/api'
import { Overlay } from '../components/overlay'
import { useState } from 'react'
export function PlanSetting({ password, actions, userPassword}){
  const isTest = false
  const [showOverlay, setShowOverlay] = useState(false)
  const downflowActions = {
      setPassword: actions.setAdminPassword,
      setShowOverlay: setShowOverlay,
      setUserPassword: actions.setUserPassword,
  }
  const loginTxt = password?'Logout':'Admin Login'
  const CLIENT_ID = 'Iv1.f70dacffd5b15781'
  const REDIRECT_URL = 'http://localhost:3000/plan'
  const githubURL = 'https://github.com/login/oauth/authorize?client_id='+CLIENT_ID+'&redirect_uri='+REDIRECT_URL
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
      console.log(newData, 'new data')
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

  const logInOutAction = password?logoutAction:()=>setShowOverlay(true)

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
          console.log(postItems, 'page data')
          await sendData(postItems, isTest, tmpFunc, true)
      }
      
  }
  const githubLoginAction = () => {
      console.log('github login')
      
  }
  
  const main = (
    <>
      <Button bn='Build' onClick={buildAction}/>
      <Button bn={loginTxt} onClick={logInOutAction}/>
      <Button bn='Sync' onClick={syncAction} />
      <a href={githubURL}>
        <Button bn='Github' onClick={githubLoginAction}/>
      </a>
      {
          showOverlay &&
          <Overlay page='plan/setting' option='adminLogin' actions={downflowActions} />
      }
    </>
  )
  return (
    <>
      {main}
    </>
  )
}
