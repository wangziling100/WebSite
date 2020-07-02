import { Button } from '../components/button'
import { rebuild } from '../lib/api'
import { Overlay } from '../components/overlay'
import { useState } from 'react'
export function PlanSetting({ password, actions }){
  const isTest = false
  const [showOverlay, setShowOverlay] = useState(false)
  const downflowActions = {
      setPassword: actions.setAdminPassword,
      setShowOverlay: setShowOverlay,
      setUserPassword: actions.setUserPassword,
  }
  const loginTxt = password?'Logout':'Admin Login'
  // Actions
  const buildAction = () => {
      rebuild(password, isTest)
  }
  const logoutAction = () => {
      actions.setAdminPassword('')
  }
  const logInOutAction = password?logoutAction:()=>setShowOverlay(true)
  
  const main = (
    <>
      <Button bn='Build' onClick={buildAction}/>
      <Button bn={loginTxt} onClick={logInOutAction}/>
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
