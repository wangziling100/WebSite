import { Button } from '../components/button'
import { rebuild } from '../lib/api'
export function PlanSetting({ password }){
  const isTest = false
  // Actions
  const buildAction = () => {
      rebuild(password, isTest)
  }
  
  const main = (
    <>
      <Button bn='Build' onClick={buildAction}/>
    </>
  )
  return (
    <>
      {main}
    </>
  )
}
