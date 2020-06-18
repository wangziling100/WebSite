import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState } from 'react'

export default function PlanPage(data) {
  const img = data.ideaBg
  const setting=[]
  const bgImgAndSetting={img, setting}
  // States
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ password, setPassword ] = useState(persistentStates?.password)
  const [ hostname, setHostname ] = useState()
  const downflowActions = {
      setPassword: setPassword,
      setShowOverlay: setShowOverlay,
  }
  // Persist data
  const tmpData = {
      password: password,
  }
  setItem('/', tmpData)
  getItem(persistentStates, setPassword, 'password')
  getHostname(setHostname)

  const main = (
    <Navigation page="about" password={password} actions={downflowActions}/>
  )
  return (
    <div>
      <Head>
        <title> no idea for this title </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout index={false} bgImgAndSetting={bgImgAndSetting} hostname={hostname}>
        {main}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const ideaBg = (await getImageByReference("idea_bg", preview))
  const data = {ideaBg}
  return{
    props: data,
  }
}
