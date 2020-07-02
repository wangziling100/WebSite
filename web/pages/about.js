import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { useUserPassword, useAdminPassword, getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState } from 'react'

export default function PlanPage(data) {
  const img = data.ideaBg
  const setting=[]
  const bgImgAndSetting={img, setting}
  // States
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  const [ showOverlay, setShowOverlay ] = useState(false)
  //const [ password, setPassword ] = useState(persistentStates?.password)
  const [ hostname, setHostname ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const downflowActions = {
      setPassword: setUserPassword,
      setShowOverlay: setShowOverlay,
  }
  // Persist data
  /*
  const tmpData = {
      password: password,
  }
  setItem('/', tmpData)
  getItem(persistentStates, setPassword, 'password')
  */
  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)

  const main = (
    <Navigation page="about" password={userPassword} actions={downflowActions}/>
  )
  return (
    <div>
      <Head>
        <title>
          Don't compromise yourself - you're all you have.
        </title>
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
