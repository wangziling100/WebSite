import Head from 'next/head'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { toItemFormat, sendData, getHostname, getItem, getItemList, setItem, getImageByReference, getItemByReference } from '../../lib/api'
import { useState, useEffect } from 'react'
import { PlanItem, PlanLayer } from '../../components/plans'
import cn from 'classnames'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faArrowAltCircleRight, faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import { Overlay } from '../../components/overlay'
import { TopPlan } from '../../components/top-plan'
import { compare, getDateDiff, s2Time } from '../../lib/tools'

export default function PlanPage(data) {
  // Variables
  const isTest = false
  const logo = data.logo
  const setting=[]
  let children = {}
  let parents = 'root'
  // CSS
  const flexCSS = ['flex', 'items-center', 'content-center']
  const iconCSS = ['h-10', 'w-10']
  const textCSS = [ 'm-5', 'text-xl', 'hover:text-blue-500', 'text-gray-800', 'cursor-pointer' ]
  // States
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ password, setPassword ] = useState(persistentStates?.password)
  const [ selectedId, setSelectedId ] = useState('')
  const [ selectedLayer, setSelectedLayer ] = useState()
  const [ hostname, setHostname ] = useState()
  const [ refresh, setRefresh ] = useState(false)
  const [ dragSource, setDragSource ] = useState(null)
  const [ dropTarget, setDropTarget ] = useState(null)
  const [ selectedItem, setSelectedItem ] = useState(null)
  const [ overlayOption, setOverlayOption ] = useState()
  const [ sidebar, setSidebar ] = useState('PlanRoute')

  
  const [ showNew, setShowNew ] = useState(false)
  // Persist data
  const tmpData = {
      password: password,
  }
  setItem('/', tmpData)
  getItem(persistentStates, setPassword, 'password')
  getHostname(setHostname)
  // Actions
  const addNewAction = () => {
      setShowNew(!showNew)
  }
  const findChildren = (id, layer) => {
      const allInLayer = data.layers[layer+1]
      let result = []
      if (allInLayer===undefined) return []
      for (let i of allInLayer){
          if (i.parents===id){
              const childrenResult = findChildren(i.id, i.layer)
              const tmp = {
                  id: i.id,
                  layer: i.layer
              }
              result.push(tmp)
              result = result.concat(childrenResult)

          }
      }
      return result
  }
  const findAncestors = (id, layer) => {
      let ancestors = []
      const searchArea = data.layers.slice(0, layer+1)
      let i = searchArea.length - 1
      let pointer = id
      while (i>=0){
          for (let item of searchArea[i]){
              if (item.id === pointer){
                  ancestors.splice(0, 0, pointer)
                  pointer = item.parents
              }
          }

          i = i-1
      }
      return ancestors
  }

  const deleteItemInLayer = (id, layer) => {
      let tmp = data.layers[layer]
      for (let i in tmp){
          if (tmp[i].id===id){
              tmp.splice(i,1)
              break
          } 
      }
  }

  const updateItemInLayer = (id, layer, newData, layerDiff=1) => {
      // layer is privious layer
      let tmp = data.layers[layer]
      for (let i in tmp){
          if (tmp[i].id===id){
              // deleted from provious layer
              tmp.splice(i,1)
              // add into new layer
              data.layers[layer-layerDiff].push(newData)
              break
          }
      }
  }
  const addItemInLayer = (layer, newData) => {
      if (data.layers[layer] === undefined){
          data.layers[layer] = []
      }
      data.layers[layer].push(newData)
  }

  const afterDeleteAction = (newData) => {
      if (newData === undefined || newData === null) return
      newData= newData.data
      if (newData instanceof Array){
          for (let i of newData){
              if (i.option==='delete'){
                  deleteItemInLayer(i.id, i.layer)
                  continue
              }
              if (i.option==='update'){
                  updateItemInLayer(i.id, i.layer+1, toItemFormat(i))
                  continue
              }
          }
      }
      setRefresh(!refresh)
  }
  const afterAddAction = (newData) => {
      newData = newData.data
      addItemInLayer(newData.layer, newData)
      setRefresh(!refresh)
  }

  const afterDragAction = (newData, layerDiff) =>{
      newData = newData.data
      if (newData instanceof Array){
          for (let i of newData){
              if (i.option==='update'){
                  updateItemInLayer(i.id, i.layer+layerDiff, toItemFormat(i), layerDiff)
                  continue

              }
          }
      }
      setRefresh(!refresh)
  }

  const deleteAction = (id, layer, parents) => {
      let children = findChildren(id, layer)
      let allOpt
      const deleteOpt = {
          id: id,
          option: 'delete',
          password: password,
      }
      for (let child of children){
          if (parseInt(child.layer) === layer+1){
              child.parents = parents
          }
          child.option = 'update'
          child.layer = parseInt(child.layer) - 1
          child.password = password
      }
      allOpt = children.concat([deleteOpt])
      sendData(allOpt, isTest, afterDeleteAction, true)
  }
  const dragAction = (source, target) => {
      let children = findChildren(source.id, source.layer)
      const layerDiff = source.layer - (target.layer+1)
      let allOpt = []
      const targetOpt = {
          id: source.id,
          option: 'update',
          password: password,
          layer: source.layer - layerDiff,
          parents: target.id,
      }
      allOpt.push(targetOpt) 
      for (let child of children){
          if (child.id===target.id) return
          const tmpOpt = {
              id: child.id,
              option: 'update',
              password: password,
              layer: child.layer - layerDiff,
          }
          allOpt.push(tmpOpt)
      }
      const afterDragActionWrapper = (newData) => afterDragAction(newData, layerDiff)
      sendData(allOpt, isTest, afterDragActionWrapper, true)
  }

  useEffect(()=>{
      // drag item 
      if (dragSource!==null && dropTarget!==null){
          if (dragSource.id!==dropTarget.id){
              dragAction(dragSource, dropTarget)
          }
          setDragSource(null)
          setDropTarget(null)
      }
  }, [dragSource, dropTarget])

  //data
  let layers = data.layers
  let ancestors
  const actions = {
      setSelectedId: setSelectedId,
      setSelectedLayer: setSelectedLayer,
      afterAddAction: afterAddAction,
      setDragSource: setDragSource,
      setDropTarget: setDropTarget,
      setShowOverlay: setShowOverlay,
      setSelectedItem: setSelectedItem,
      setOption: setOverlayOption,
  }
  const actionsNew = {
      setShowNew: setShowNew,
      afterAddAction: afterAddAction,
  }
  const downflowActions = {
      setPassword: setPassword,
      setShowOverlay: setShowOverlay,
      deleteAction: ()=>deleteAction(selectedItem.id, selectedItem.layer, selectedItem.parents),
      setOption: setOverlayOption,
  }
  // componets
  if (selectedId!==undefined){
      ancestors = findAncestors(selectedId, selectedLayer)
  }

  let allLayers = []
  // construct each layer
  for (let index in layers){
      const layer = layers[index]
      const items = []
      for (let i of layer){
          if (i.parents===parents){
              if (ancestors[index]!==undefined && i.id===ancestors[index]){
                  items.splice(0, 0, i)
              }else{
                  items.push(i)
              }
          }
      }
      if (items[0] !== undefined){
          parents = items[0].id
          allLayers.push(<PlanLayer items={items} actions={actions} layer={index} key={items[0].layer} password={password}/>)
          allLayers.push(<FontAwesomeIcon icon={faArrowAltCircleDown} className="w-5 h-5 ml-5 cursor-pointer" key={index+'arrowdown'}/>) 
      }
      
  }

  allLayers.splice(allLayers.length-1, 1)

  const planRoute = (
    <>
      {allLayers}
      {/*new a child plan*/}
      <FontAwesomeIcon icon={faPlus} className="w-5 h-5 ml-5 cursor-pointer" title={'new a child plan'} onClick={addNewAction} />
      { showNew &&

        <PlanItem editStatus={true} parents={parents} layer={parseInt((allLayers.length+1)/2)} actions={actionsNew} password={password}/>
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
      case 'TopPlan': right=<TopPlan businessPlan={data.businessPlan} privatePlan={data.privatePlan} password={password}/>; break;
      case 'dailySummary': right=dailySummary; break;
  }

  const main = (
    <Navigation page="plan" password={password} actions={downflowActions} logo={logo}/>
  )

  children['top'] = main
  children['right'] = right
  children['left'] = left
  return (
    <div>
      <Head>
        <title> no idea for this title </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'plan'}  hostname={hostname} children={children}/>
      { 
          showOverlay && 
          <Overlay page='plan' option={overlayOption} actions={downflowActions}/>
      }
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const ideaBg = (await getImageByReference("idea_bg", preview))
  const logo = await getImageByReference("logo", preview)
  const allItems = await getItemByReference("plan_item", preview)
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
  let ordered = []
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

  const data = {logo, layers, businessPlan, privatePlan}
  return{
    props: data,
  }
}
