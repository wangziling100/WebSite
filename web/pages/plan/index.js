import Head from 'next/head'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { useGithubLogin, useGithubCode, useLoadData, useUpdateData, useAdminPassword, useUserPassword, getVersion, toItemFormat, sendData, getHostname, getImageByReference, getItemByReference } from '../../lib/api'
import { useState, useEffect } from 'react'
import { PlanItem, PlanLayer } from '../../components/plans'
import cn from 'classnames'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faArrowAltCircleRight, faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import { Overlay } from '../../components/overlay'
import { TopPlan } from '../../components/top-plan'
import { isEqual, flat, compare, getDateDiff, s2Time } from '../../lib/tools'
import { PlanSetting } from '../../components/plan-setting'
import { deleteGithubItem, updateGithubItem, createGithubItem, isGithubLogin } from '../../lib/github'
import markdownToHtml from '../../lib/markdownToHtml'
import { SyncOverlay } from '../../components/sync-overlay'
import { updateGithubCompleteness } from '../../lib/localData'

export default function PlanPage(data) {
  // Variables
  const isTest = false
  const logo = data.logo
  const setting=[]
  let children = {}
  let parents = 'root'
  let ancestors
  // CSS
  const flexCSS = ['flex', 'items-center', 'content-center']
  const iconCSS = ['h-10', 'w-10']
  const textCSS = [ 'm-5', 'text-xl', 'hover:text-blue-500', 'text-gray-800', 'cursor-pointer' ]
  // States
  const [ localData, setLocalData ] = useState()
  const [ sessionData, setSessionData ] = useState()
  const [ reload, setReload ] = useState(false)
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ selectedId, setSelectedId ] = useState('')
  const [ selectedLayer, setSelectedLayer ] = useState()
  const [ hostname, setHostname ] = useState()
  const [ refresh, setRefresh ] = useState(false)
  const [ dragSource, setDragSource ] = useState(null)
  const [ dropTarget, setDropTarget ] = useState(null)
  const [ selectedItem, setSelectedItem ] = useState(null)
  const [ overlayOption, setOverlayOption ] = useState()
  const [ sidebar, setSidebar ] = useState('PlanRoute')
  const [ version, setVersion ] = useState(data.version)
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ showNew, setShowNew ] = useState(false)
  const [ updateCount, setUpdateCount ] = useState(0)
  const [ adminData, setAdminData ] = useState(data)
  const [ githubCode, setGithubCode ] = useState()
  const [ pageStatus, setPageStatus ] = useState('normal')
  const layers = localData?.layers || data.layers
  const [ firstItems, setFirstItems ] = useState([])
  // Variables
  const loginStatus = sessionData?.loginStatus || 'logout'
  const githubUserData = sessionData?.userData || null
  const githubRepos = sessionData?.repos || null
  //console.log(sessionData, 'sessionData')
  //console.log(layers, 'layers')
  //console.log(localData, 'localData')
  //console.log(updateCount, 'updateCount')
  // Function 
  function updateFunction(){
      setUpdateCount(updateCount+1)
  }
  function reloadFunction(){
      setReload(!reload)
  }
  function cleanLocalData(){
      setLocalData({})
  }
  // Effects
  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)
  useLoadData('plan', userPassword, setLocalData, setSessionData, [updateCount], reload)
  useUpdateData('plan', userPassword, localData, [localData?.layers?.length, updateCount])
  //useGithubLogin('plan', isTest, updateFunction)
  // Actions
  const addNewAction = () => {
      setShowNew(!showNew)
  }
  const findChildren = (id, layer) => {
      //const allInLayer = localData.layers[layer+1]
      const allInLayer = layers[layer+1]
      let result = []
      if (allInLayer===undefined) return []
      for (let i of allInLayer){
          if (i.parents===id){
              let tmpId
              let tmp
              if (userPassword!=='') {
                  tmpId = i.itemId
                  tmp = i
              }
              if (userPassword==='') {
                  tmpId = i.id
                  tmp = {
                      id: i.id,
                      layer: i.layer
                  }
              }
              result.push(tmp)
              const childrenResult = findChildren(tmpId, i.layer)
              result = result.concat(childrenResult)
          }
      }
      return result
  }
  const findAncestors = (id, layer) => {
      let ancestors = []
      //const searchArea = localData.layers.slice(0, layer+1)
      const searchArea = layers.slice(0, layer+1)
      let i = searchArea.length - 1
      let pointer = id
      while (i>=0){
          for (let item of searchArea[i]){
              let tmpId
              if (userPassword!==''){
                  tmpId = item.itemId
              }
              if (userPassword===''){
                  tmpId = item.id
              }
              if (tmpId === pointer){
                  ancestors.splice(0, 0, pointer)
                  pointer = item.parents
              }
          }

          i = i-1
      }
      return ancestors
  }

  const deleteItemInLayer = (id, layer) => {
      let tmp
      if (userPassword!==''){
          tmp = localData.layers[layer]
      }
      if (userPassword==='' && adminPassword!==''){
          tmp = layers[layer]
      }

      
      for (let i in tmp){
          let tmpId
          if (userPassword!==''){
              tmpId = tmp[i].itemId
          }
          if (userPassword==='' && adminPassword!==''){
              tmpId = tmp[i].id
          }
          if (tmpId===id){
              tmp.splice(i,1)
              break
          } 
      }
  }

  const updateItemInLayer = (id, layer, newData, layerDiff=1) => {
      // layer is privious layer
      let tmp
      if (userPassword!==''){
          tmp = localData.layers[layer]
      }
      if (userPassword==='' && adminPassword!==''){
          tmp = layers[layer]
      }
      for (let i in tmp){
          let tmpId
          if (userPassword!==''){
              tmpId = tmp[i].itemId
          }
          if (userPassword==='' && adminPassword!==''){
              tmpId = tmp[i].id
          }
          if (tmpId===id){
              // deleted from provious layer
              tmp.splice(i,1)
              // add into new layer
              if (userPassword!==''){
                  localData.layers[layer-layerDiff].push(newData)
              }
              if (userPassword==='' && adminPassword!==''){
                  layers[layer-layerDiff].push(newData)
              }
              break
          }
      }
  }
  const addItemInLayer = (layer, newData) => {
      if (userPassword!==''){
          if (localData.layers[layer]===undefined){
              localData.layers[layer] = []
          }
          localData.layers[layer].push(newData)
          return
      }
      if (userPassword==='' && adminPassword!==''){
          if (layers[layer]===undefined){
              layers[layer] = []
          }
          layers[layer].push(newData)
          return
      }
      
  }

  const afterDeleteAction = (newData, sourceData=null) => {
      console.log('after delete action', newData, sourceData)
      if (newData === undefined || newData === null) {
          setPageStatus('normal')
          alert('No response from server')
          return
      }
      if (newData.data !== undefined) newData = newData.data
      if (newData instanceof Array){
          for (let i of newData){
              if (i===null) return
              let tmpId

              if (userPassword!==''){
                  tmpId = i.itemId
              }
              if (userPassword==='' && adminPassword!==''){
                  tmpId = i.id
              }

              if (i.option==='delete'){
                  deleteItemInLayer(tmpId, i.layer)
                  continue
              }

              if (i.option==='update'){
                  updateItemInLayer(tmpId, i.layer+1, i)
                  continue
              }
          }
      }
      else if(userPassword!=='' && isGithubLogin()){
          //console.log(sourceData, newData, 'after delete')
          const statusText = newData.statusText
          if (statusText==='OK'){
              for (let i of sourceData){
                  if (i===null) return
                  const id = i.itemId
                  const layer = i.layer
                  const option = i.option
                  if (option==='delete'){
                      deleteItemInLayer(id, layer)
                      continue
                  }
                  else if (option==='update'){
                      updateItemInLayer(id, layer+1, i)
                      continue
                  }
              }
              if (newData.completenessResult!==undefined && newData.completenessResult!==null){
                  const result = newData.completenessResult
                  const completeness = result.data.completeness
                  const number = result.data.number
                  updateGithubCompleteness('idea', userPassword, completeness, number)

              }
          }
          else {
              alert('Something wrong happens')
          }
      }
      setPageStatus('normal')
      setUpdateCount(updateCount+1)
  }
  const afterCreateAction = (newData, sourceData=null) => {
      //newData = newData.data
      if (newData===null){
          alert('Something wrong')
          return
      }
      if (userPassword==='' && adminPassword!==''){
          newData = newData.data
      }
      else if( isGithubLogin() ){
          console.log(newData, sourceData, 'after create action')
          const statusText = newData.statusText
          if (statusText==='Created'){
              // add new plan
              if (newData.data instanceof Array){
                  let tmpData = newData.data[0]
                  sourceData['number'] = tmpData.number
                  sourceData['url'] = tmpData.url
                  sourceData['id'] = tmpData.id
                  // update 
                  tmpData = newData.data[1]
                  const number = tmpData.number
                  const completeness = tmpData.completeness
                  updateGithubCompleteness('idea', userPassword, completeness, number)
                  newData = sourceData
              }
              else{
                  sourceData['number'] = newData.data.number
                  sourceData['url'] = newData.data.url
                  sourceData['id'] = newData.data.id
                  newData = sourceData
              }
              
          }
          else {
              alert('Something wrong happens')
          }
          setPageStatus('normal')
      }
      addItemInLayer(newData.layer, newData)
      setUpdateCount(updateCount+1)
  }
  const afterEditAction = (newData, sourceData=null) => {
      if (userPassword!=='' && !isGithubLogin()){
          updateItemInLayer(newData.itemId, newData.layer, newData,0)
      }
      else if (userPassword!=='' && isGithubLogin()){
          //console.log(newData, sourceData, 'after edit action')
          const statusText = newData.statusText
          if (statusText==='OK'){
              updateItemInLayer(sourceData.itemId, sourceData.layer, sourceData, 0)
              if (newData.data instanceof Array){
                  //update completeness of milestone  
                  const tmpData = newData.data[1]
                  const number = tmpData.number
                  const completeness = tmpData.completeness
                  updateGithubCompleteness('idea', userPassword, completeness, number)
              }
             
          }
          else {
              alert('Something wrong happens')
          }
      }
      else if (userPassword==='' && adminPassword!==''){
          updateItemInLayer(newData.id, newData.layer, newData, 0)
      }
      setUpdateCount(updateCount+1)
      setPageStatus('normal')
  }

  const afterDragAction = (newData, layerDiff) =>{
      if (newData.data!==undefined) newData = newData.data
      if (newData instanceof Array){
          for (let i of newData){
              if (i===null) return
              if (i.option==='update'){
                  let tmpId
                  if (userPassword!==''){
                      tmpId = i.itemId
                  }
                  if (userPassword==='' && adminPassword!==''){
                      tmpId = i.id
                  }
                  updateItemInLayer(tmpId, i.layer+layerDiff, i, layerDiff)
                  continue

              }
          }
      }
      setPageStatus('normal')
      setUpdateCount(updateCount+1)
  }
  const createAction = async (form) => {
      form['contentPerformance'] = await markdownToHtml(form.content)
      if (userPassword!=='' && !isGithubLogin()){
          form['itemId'] = Math.random().toString()
          afterCreateAction(form)
      }
      else if (userPassword!=='' && isGithubLogin()){
          setPageStatus('pending')
          form['option'] = 'create'
          await createGithubItem(form, hostname, afterCreateAction, 'issue')

      }
      else if (userPassword==='' && adminPassword!==''){
          await sendData(form, isTest, afterCreateAction, true)
      }
  }
  const editAction = async (form, data) => {
      //console.log('edit', data, form)
      for (let key in form){
          data[key] = form[key]
      }
      if (userPassword!=='' && !isGithubLogin()) {
          afterEditAction(data)
          setUpdateCount(updateCount+1)
      }
      else if (userPassword!=='' && isGithubLogin()){
          data['option'] = 'update'
          data['version'] = new Date()
          await updateGithubItem(data, hostname, afterEditAction, 'issue')
      }

      if (userPassword==='' && adminPassword!==''){
          await sendData(form, isTest)
          afterEditAction(data)
      }
  }
  
  const completeAction = async (form, newData) => {
      for (let key in form){
          newData[key] = form[key]
      }
      newData['startTime'] = null
      newData['totalUsedTime'] = 0
      newData['stopCount'] = true
      if (userPassword!=='' && !isGithubLogin()) {
          afterEditAction(newData)
          setUpdateCount(updateCount+1)
      }
      else if (userPassword!=='' && isGithubLogin()){
          setPageStatus('pending')
          newData['option'] = 'update'
          await updateGithubItem(newData, hostname, afterEditAction, 'issue')

      }
      if (userPassword==='' && adminPassword!==''){
          form['password'] = adminPassword
          await sendData(form, isTest)
          afterEditAction(newData)
      }

  }
  const activeAction = async (form, newData) => {
      for (let key in form){
          newData[key] = form[key]
      }
      if (userPassword!=='' && !isGithubLogin()) {
          afterEditAction(newData)
          setUpdateCount(updateCount+1)
      }
      else if (userPassword!=='' && isGithubLogin()){
          newData['option'] = 'update'
          setPageStatus('pending')
          await updateGithubItem(newData, hostname, afterEditAction, 'issue')
      }
      else if (userPassword==='' && adminPassword!==''){
          form['password'] = adminPassword
          await sendData(form, isTest)
          afterEditAction(newData)
      }

  }
  const updateOneAction = (form, newData) => {
      for (let key in form){
          newData[key] = form[key]
      }
      // it works only under local mode
      if (userPassword!=='') {
          afterEditAction(newData)
          setUpdateCount(updateCount+1)
      }
  }

  const deleteAction = async (data, password) => {
      let id
      let pwd
      const layer = data.layer
      const parents = data.parents
      let allOpt

      if (userPassword!==''){
          id = data.itemId
          let children = findChildren(id, layer)
          data.option = 'delete'
          for (let child of children){
              if (parseInt(child.layer) === layer+1){
                  child.parents = parents
              }
              child.option = 'update'
              child.layer = parseInt(child.layer) - 1
              child.password = pwd
          }
          allOpt = children.concat([data])
          if (!isGithubLogin()){
              afterDeleteAction(allOpt)
              return
          }
          else if (isGithubLogin()){
              console.log(allOpt, 'delete action')
              setPageStatus('pending')
              await deleteGithubItem(allOpt, hostname, afterDeleteAction, 'issue')
          }
          
      }

      else if (userPassword==='' && adminPassword!==''){
          id = data.id
          let children = findChildren(id, layer)
          if (password===''){
              pwd = adminPassword
          }
          if (password!==''){
              pwd = password
          }
          const deleteOpt = {
              id: id,
              option: 'delete',
              password: pwd,
          }
          for (let child of children){
              if (parseInt(child.layer) === layer+1){
                  child.parents = parents
              }
              child.option = 'update'
              child.layer = parseInt(child.layer) - 1
              child.password = pwd
          }
          allOpt = children.concat([deleteOpt])
          await sendData(allOpt, isTest, afterDeleteAction, true)
          ancestors = undefined
          setSelectedItem()
          return
      }
  }
  const cancelAction = () => {
  }
  const dragAction = async (source, target) => {
      let sourceId
      let targetId
      if (userPassword!==''){
          sourceId = source.itemId
          targetId = target.itemId
      }
      if (userPassword==='' && adminPassword!==''){
          sourceId = source.id
          targetId = target.id
      }
      let children = findChildren(sourceId, source.layer)
      const layerDiff = source.layer - (target.layer+1)
      let allOpt = []
      if (userPassword!==''){
          source.option = 'update'
          source.layer = source.layer - layerDiff
          source.parents = target.itemId
          allOpt.push(source)
          for (let child of children){
              child.option = 'update'
              child.layer = child.layer - layerDiff
              allOpt.push(child)
          }

          if (!isGithubLogin()){
              afterDragAction(allOpt, layerDiff)
              setRefresh(!refresh)
              setUpdateCount(updateCount+1)
              return
          }
          else if (isGithubLogin()){
              //console.log(allOpt, 'drag action')
              setPageStatus('pending')
              const tmpAfterAction = (newData, sourceData) => afterDragAction(allOpt, layerDiff)
              await updateGithubItem(allOpt, hostname, tmpAfterAction, 'issue')
          }
          
      }
      else if (userPassword==='' && adminPassword!==''){
          const targetOpt = {
              id: source.id,
              option: 'update',
              password: adminPassword,
              layer: source.layer - layerDiff,
              parents: target.id,
          }
          allOpt.push(targetOpt) 
          for (let child of children){
              if (child.id===target.id) return
              const tmpOpt = {
                  id: child.id,
                  option: 'update',
                  password: adminPassword,
                  layer: child.layer - layerDiff,
              }
              allOpt.push(tmpOpt)
          }
          const afterDragActionWrapper = (newData) => afterDragAction(newData, layerDiff)
          sendData(allOpt, isTest, afterDragActionWrapper, true)
          return
      }
      
  }

  // Effects
  useEffect(()=>{
      // drag item 
      if (dragSource?.itemId!==undefined && dropTarget?.itemId!==undefined && dragSource!==null && dropTarget!==null){
          let sourceId
          let targetId
          if (userPassword!==''){
              sourceId = dragSource.itemId
              targetId = dropTarget.itemId
          }
          if (userPassword==='' && adminPassword!==''){
              sourceId = dragSource.id
              targetId = dropTarget.id
          }
          if (sourceId!==targetId){
              dragAction(dragSource, dropTarget)
          }
          setDragSource(null)
          setDropTarget(null)
      }
  }, [dragSource, dropTarget])
  

  //data
  const actions = {
      setSelectedId: setSelectedId,
      setSelectedLayer: setSelectedLayer,
      afterAddAction: afterCreateAction,
      setDragSource: setDragSource,
      setDropTarget: setDropTarget,
      setShowOverlay: setShowOverlay,
      setSelectedItem: setSelectedItem,
      setOption: setOverlayOption,
      createAction: createAction,
      editAction: editAction,
      completeAction: completeAction,
      activeAction: activeAction,
      cancelAction: cancelAction,
  }
  const actionsNew = {
      setShowNew: setShowNew,
      createAction: createAction,
  }
  const downflowActions = {
      setPassword: setUserPassword,
      setShowOverlay: setShowOverlay,
      deleteAction: (password)=>deleteAction(selectedItem, password),
      setOption: setOverlayOption,
      updateFunction: updateFunction,
      cleanLocalData: cleanLocalData,
      setPageStatus: setPageStatus,
      reloadFunction: reloadFunction,
  }

  const settingActions = {
      setAdminPassword: setAdminPassword,
      setUserPassword: setUserPassword,
      setPageStatus: setPageStatus,
  }
  const topActions = {
      completeAction: completeAction,
      updateOneAction: updateOneAction,
  }
  // componets
  if (selectedItem!==undefined && selectedItem!==null){
      /*
      if (userPassword!==''){
          ancestors = findAncestors(selectedItem.itemId, selectedItem.layer)
      }
      if (userPassword===''){
          ancestors = findAncestors(selectedItem.id, selectedItem.layer)
      }
      */
      ancestors = findAncestors(selectedItem.itemId, selectedItem.layer)
  }

  let allLayers = []
  let tmpFirstItems = []
  // construct each layer
  for (let index in layers){
      const layer = layers[index]
      const items = []
      for (let i of layer){
          if (i.parents===parents){
              let tmpId = i.itemId
              /*
              if (userPassword!==''){
                  tmpId = i.itemId
              }
              if (userPassword===''){
                  tmpId = i.id
              }
              */
              if (ancestors!==undefined && ancestors[index]!==undefined){
                  //console.log('ancestors exist')
                  if (tmpId===ancestors[index]) items.splice(0, 0, i)
                  else items.push(i)
              }
              else if (firstItems.length!==0 && firstItems[index]!==undefined && firstItems[index].itemId===tmpId){
                  items.splice(0, 0, i)
              }
              else{
                  items.push(i)
              }
          }
      }
      if (items[0] !== undefined){
          /*
          if (userPassword!==''){
              parents = items[0].itemId
          }
          if (userPassword===''){
              parents = items[0].id
          }
          */
          parents = items[0].itemId
          allLayers.push(<PlanLayer items={items} actions={actions} layer={index} key={index} password={adminPassword} update={index+'_'+items.length}/>)
          allLayers.push(<FontAwesomeIcon icon={faArrowAltCircleDown} className="w-5 h-5 ml-5 cursor-pointer" key={index+'arrowdown'}/>) 
          tmpFirstItems.push(items[0])
      }
  }
  //console.log(tmpFirstItems, 'tmp first items')
  if (!isEqual(tmpFirstItems, firstItems)){
      setFirstItems(tmpFirstItems)
  }

  allLayers.splice(allLayers.length-1, 1)

  // construct top plan
  const coeff = 0.8
  //let allItems = layers.flat()
  let allItems = flat(layers)
  for (let i of allItems){
      const stdPriority = i.priority/4
      const endDate = i.endDate
      const diffDate = getDateDiff(endDate)
      const layer = i.layer/20
      let timePriority = (24-(diffDate/3600 - i.duration))/24
      i['order'] = timePriority*coeff+stdPriority*(1-coeff)-layer
  }
  let businessPlan = []
  let privatePlan = []
  let runBusinessPlan = []
  let runPrivatePlan = []
  for (let i of allItems){
      if (i.itemStatus === 'completed') continue
      if (i.planType === 0 || i.planType==='business'){
          if (i.stopCount!==undefined && !i.stopCount){
              runBusinessPlan.push(i)
          }
          else businessPlan.push(i)
          continue
      }
      if (i.planType === 1 || i.planType==='private') {
          if (i.stopCount!==undefined && !i.stopCount){
              runPrivatePlan.push(i)
          }
          else privatePlan.push(i)
          continue
      }
  }
  businessPlan = businessPlan.sort(compare('order'))
  privatePlan = privatePlan.sort(compare('order'))
  businessPlan = runBusinessPlan.concat(businessPlan)
  privatePlan = runPrivatePlan.concat(privatePlan)

  //components
  const planRoute = (
    <>
      {allLayers}
      {/*new a child plan*/}
      <FontAwesomeIcon icon={faPlus} className="w-5 h-5 ml-5 cursor-pointer" title={'new a child plan'} onClick={addNewAction} />
      { showNew &&

        <PlanItem editStatus={true} parents={parents} layer={parseInt((allLayers.length+1)/2)} actions={actionsNew} password={adminPassword}/>
      }
    </>
  )
  
  const dailySummary= (
    <>
    </>
  )
  const left = (
    <>
      <div className={cn(...textCSS)} onClick={()=>setSidebar('PlanRoute')}>
        Plan Road
      </div>
      <div className={cn(...textCSS)} onClick={()=>setSidebar('TopPlan')}>
        Top Plan
      </div>
      <div className={cn(...textCSS)} onClick={()=>setSidebar('DailySummary')}>
        Daily Summary
      </div>
      <div className={cn(...textCSS)} onClick={()=>setSidebar('Setting')}>
        Setting
      </div>
    </>
  )
  let right
  switch (sidebar){
      case 'PlanRoute': right=planRoute; break;
      case 'TopPlan': right=<TopPlan businessPlan={businessPlan} privatePlan={privatePlan} password={adminPassword} actions={topActions}/>; break;
      case 'dailySummary': right=dailySummary; break;
      case 'Setting': right=<PlanSetting password={adminPassword} actions={settingActions} userPassword={userPassword}/>; break;
  }

  const main = (
    <Navigation page="plan" password={userPassword} actions={downflowActions} logo={logo} hostname={hostname} loginStatus={loginStatus} githubUserData={githubUserData} repos={githubRepos}/>
  )

  children['top'] = main
  children['right'] = right
  children['left'] = left
  return (
    <div>
      <Head>
        <title> 
          By failing to prepare, you are preparing to fail.
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'plan'}  hostname={hostname} children={children}/>
      { 
          showOverlay && 
          <Overlay page='plan' option={overlayOption} actions={downflowActions}/>
      }
      {
          pageStatus==='pending' &&
          <SyncOverlay css={['bg-opacity-75']} />

      }
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  let data = null
  let ideaBg = null
  let logo = null
  let allItems = null
  try{
      ideaBg = (await getImageByReference("idea_bg", preview))
      logo = await getImageByReference("logo", preview)
      allItems = await getItemByReference("plan_item", preview)
      //let versionData = await getVersion()
      //const versionId = versionData.id
      //const version = versionData.plan
  }
  catch{
      allItems = []
  }
  // seperate items in layer
  let layers = {}
  for (let i of allItems){
      if (layers[i.layer]===undefined) {
          layers[i.layer] = []
      }
      layers[i.layer].push(i)
  }

  let tmp = []
  let n=0
  while (n<Object.keys(layers).length){
      tmp.push(layers[n.toString()])
      n++
  }
  layers = tmp
  // set order
  const coeff = 0.8
  for (let i of allItems){
      const stdPriority = i.priority/4
      const endDate = i.endDate
      const diffDate = getDateDiff(endDate)
      const layer = i.layer/20
      let timePriority = (24-(diffDate/1000/3600 - i.duration))/24
      i['order'] = timePriority*coeff+stdPriority*(1-coeff) + layer
  }
  // business and private plan
  let businessPlan = []
  let privatePlan = []

  for (let i of allItems){
      if (i.itemStatus==='completed'){
          continue
      }
      if (i.planType === 'business'){
          businessPlan.push(i)
          continue
      }
      if (i.planType === 'private'){
          privatePlan.push(i)
          continue
      }
  }
  businessPlan = businessPlan.sort(compare('order'))
  privatePlan = privatePlan.sort(compare('order'))

  data = {logo, layers, businessPlan, privatePlan}
  
  return{
    props: data,
  }
}
