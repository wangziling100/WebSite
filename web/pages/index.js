import Link from 'next/link'
import Head from 'next/head'
import Container from '../components/container'
import Button from '../components/button'
import Layout from '../components/layout'
import { useAdminPassword, useUserPassword, getItemList, setItem, getItem, getAllPostsForHome, getImageByReference } from '../lib/api'
import Navigation from '../components/navigation'
import { LinearAppear, Appear, HelloAppear } from '../components/animation'
import cn from 'classnames'
import Hello from '../components/hello'
import { useState } from 'react'
import Image from '../components/image'

export default function IndexPage(data) {
  //const setting = ["fixed"]
  const setting = ['object-cover', 'max-h-screen', 'w-full', 'absolute', 'inset-0', 'z-0']
  const settingNone = ['w-0', 'h-0']
  const img = data.indexBg
  const url = img.image.responsiveImage.src
  const bgImgAndSetting={img, setting}
  // Status
  const [ showOverlay, setShowOverlay ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ start, setStart ] = useState(false)
  // Actions
  const onLoadAction = () => {
      console.log('index bg', url)
      setStart(true)
  }
  const doNothing = () => {}
  
  const downflowActions = {
      setPassword: setUserPassword,
      setShowOverlay: setShowOverlay,
      onLoadAction: onLoadAction,
  }
  const actions = {
      onLoadAction: doNothing,
  }
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)
  const onLoad = () => {
      console.log('hello loaded')
  }


  /*
  const main = (
    <>
      {/*
      
      <Appear duration="14s">
        <Navigation page="index" password={userPassword} actions={downflowActions}/>
      </Appear>
        {!showOverlay && 
          <Hello />
        }
        }

        <Appear duration="14s">
            <Navigation page="index" password={userPassword} actions={downflowActions}/>
        </Appear>
        <Hello />
    </>
  )
  */
  const main = (
    <>
      <Head>
        <title> Welcome to Wang Xingbo's website </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={cn('relative', 'max-h-screen', )} >
          <Image src={url} actions={downflowActions} css={settingNone}/>
        { start &&
          <>
            <LinearAppear duration="6s">
              <Image src={url} actions={actions} css={setting}/>
            </LinearAppear>
            <Appear duration="10s">
              <Navigation page="index" password={userPassword} actions={downflowActions}/>
            </Appear>
            <Hello />
          </>
        }
      </div>
    </>
  )

  /*
  return (
    <div>
      <Head>
        <title> Welcome to Wang Xingbo's website </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
        {/*
        <LinearAppear duration="6s">
          <Layout bgImgAndSetting={bgImgAndSetting} page={'index'}> 
            {main} 
            
          </Layout> 
        </LinearAppear>
        }
        <div className={cn('relative', 'max-h-screen', )} >
          <LinearAppear duration="6s">
            <Image src={url} actions={downflowActions} css={setting}/>
          </LinearAppear>
          {main}
        </div>
    </div>
  )
  */
  return (
    <>
      {main}
    </>
  )
}

export async function getStaticProps({ preview = false }){
  const indexBg = (await getImageByReference("index_bg", preview))
  const data = {indexBg}
  return{
    props: data,
  }
}
