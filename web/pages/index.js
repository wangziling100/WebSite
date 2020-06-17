import Link from 'next/link'
import Head from 'next/head'
import Container from '../components/container'
import Button from '../components/button'
import Layout from '../components/layout'
import { getItemList, setItem, getItem, getAllPostsForHome, getImageByReference } from '../lib/api'
import Navigation from '../components/navigation'
import { LinearAppear, Appear, HelloAppear } from '../components/animation'
import cn from 'classnames'
import Hello from '../components/hello'
import { useState } from 'react'

export default function IndexPage(data) {
  const setting = ["fixed"]
  const img = data.indexBg
  const bgImgAndSetting={img, setting}
  // Status
  const [ persistentStates, setPersistentStates ] = useState()
  getItemList('/', setPersistentStates)
  const [ password, setPassword ] = useState()
  const [ showOverlay, setShowOverlay ] = useState()
  const downflowActions = {
      setPassword: setPassword,
      setShowOverlay: setShowOverlay,
  }
  const tmpData = {
      password: password,
  }
  setItem('/', tmpData)
  getItem(persistentStates, setPassword, 'password')
  console.log(showOverlay)


  const main = (
    <>
      <Appear duration="14s">
        <Navigation page="index" password={password} actions={downflowActions}/>
      </Appear>
        {!showOverlay && 
          <Hello/>
        }
    </>
  )

  return (
    <div>
      <Head>
        <title> Welcome to Wang Xingbo's website </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
        <LinearAppear duration="6s">
          <Layout bgImgAndSetting={bgImgAndSetting} index={true}> 
            {main} 
            
          </Layout> 
        </LinearAppear>
    </div>
  )
}

export async function getStaticProps({ preview = false }){
  const indexBg = (await getImageByReference("index_bg", preview))
  const data = {indexBg}
  //console.log(indexBg.image.responsiveImage)
  return{
    props: data,
  }
}
