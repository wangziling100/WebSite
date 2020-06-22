import Head from 'next/head'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { sendData, getHostname, getItem, getItemList, setItem, getImageByReference, getItemByReference } from '../../lib/api'
import { useState } from 'react'
import { PlanItem, PlanLayer } from '../../components/plans'
import cn from 'classnames'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faArrowAltCircleRight, faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons'
import {faPlus} from '@fortawesome/free-solid-svg-icons'

export default function PlanPage(data) {
  // Variables
  const isTest = true
  const logo = data.logo
  const setting=[]
  let children = {}
  let parents = 'root'
  // CSS
  const flexCSS = ['flex', 'items-center', 'content-center']
  const iconCSS = ['h-10', 'w-10']
  // States
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ password, setPassword ] = useState(persistentStates?.password)
  const [ selectedId, setSelectedId ] = useState('')
  const [ selectedLayer, setSelectedLayer ] = useState()
  const [ hostname, setHostname ] = useState()
  const downflowActions = {
      setPassword: setPassword,
      setShowOverlay: setShowOverlay,
  }
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
  const deleteAction = (id, layer) => {
      console.log(id, data.layers[layer])
      postData = {
          option: 'test',
      }
      sendData(postData, isTest)

  }
  //data
  let layers = data.layers
  // dummy data
  let testData = {}
  testData['title'] = 'test'
  testData['target'] =  'target target..............'
  testData['id'] = 'test1'
  testData['parents'] = 'root'
  testData['layer'] = 0
  
  let testData2 = {}
  testData2['title'] = 'test2'
  testData2['target'] = 'target'
  testData2['id'] = 'test2'
  testData2['parents'] = 'root'
  testData2['layer'] = 0

  let testData3 = {}
  testData3['title'] = 'test3'
  testData3['target'] = 'target'
  testData3['id'] = 'test3'
  testData3['parents'] = 'test1'
  testData3['layer'] = 1

  let testData4 = {}
  testData4['title'] = 'test4'
  testData4['target'] = 'target'
  testData4['id'] = 'test4'
  testData4['parents'] = 'test1'
  testData4['layer'] = 1

  let testData5 = {}
  testData5['title'] = 'test5'
  testData5['target'] = 'target'
  testData5['id'] = 'test5'
  testData5['parents'] = 'test2'
  testData5['layer'] = 1

  let testData6 = {}
  testData6['title'] = 'test6'
  testData6['target'] = 'target'
  testData6['id'] = 'test6'
  testData6['parents'] = 'test3'
  testData6['layer'] = 2


  let testData7 = {}
  testData7['title'] = 'test7'
  testData7['target'] = 'target'
  testData7['id'] = 'test7'
  testData7['parents'] = 'test3'
  testData7['layer'] = 2

  let testData8 = {}
  testData8['title'] = 'test8'
  testData8['target'] = 'target'
  testData8['id'] = 'test8'
  testData8['parents'] = 'test5'
  testData8['layer'] = 2

  let testData9 = {}
  testData9['title'] = 'test9'
  testData9['target'] = 'target'
  testData9['id'] = 'test9'
  testData9['parents'] = 'test5'
  testData9['layer'] = 2


  const layer1 = [testData, testData2]
  const layer2 = [testData3, testData4, testData5]
  const layer3 = [testData6, testData7, testData8, testData9]
  //const layers = [layer1, layer2, layer3]
  const actions = {
      setSelectedId: setSelectedId,
      deleteAction: deleteAction,
  }
  const actionsNew = {
      setShowNew: setShowNew,
  }
  // componets
  let allLayers = []
  for (let index in layers){
      const layer = layers[index]
      const items = []
      for (let i of layer ){
          if (i.parents===parents){
              if (i.id===selectedId){
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

  const right = (
    <>
      {allLayers}
      {/*new a child plan*/}
      <FontAwesomeIcon icon={faPlus} className="w-5 h-5 ml-5 cursor-pointer" title={'new a child plan'} onClick={addNewAction} />
      { showNew &&

        <PlanItem editStatus={true} parents={parents} layer={parseInt((allLayers.length+1)/2)} actions={actionsNew}/>
      }
    </>
  )

  const main = (
    <Navigation page="plan" password={password} actions={downflowActions} logo={logo}/>
  )
  children['top'] = main
  children['right'] = right
  return (
    <div>
      <Head>
        <title> no idea for this title </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'plan'}  hostname={hostname} children={children}/>
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
  const data = {logo, layers}
  return{
    props: data,
  }
}
