import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { useUserPassword, useAdminPassword, getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState } from 'react'
import { Image } from 'react-datocms'
import cn from 'classnames'

export default function ServicePage(data) {
  const img = data.serviceBg
  const setting=[ 'h-full', 'w-full']
  const bgImgAndSetting={img, setting}
  const logo = data.logo
  // States
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ hostname, setHostname ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const downflowActions = {
      setPassword: setAdminPassword,
      setShowOverlay: setShowOverlay,
  }

  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)

  const header = (
    <>
      <Navigation page="service" password={userPassword} actions={downflowActions} logo={logo}/>
    </>
  )
  const body = (
    <>
      <Image data={img.image.responsiveImage} className={cn(...setting)} />
      <div className='flex justify-end'>
        <a href='http://www.freepik.com' target='_blank'>
          Designed by brgfx / Freepik & Xingbo Wang
        </a>
      </div>
    </>
  )
  return (
    <div>
      <Head>
        <title> 
          The best way to find yourself is to lose yourself in the service of others.
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'service'} hostname={hostname} bgImgAndSetting={bgImgAndSetting} curtain={header}>
        {body}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const logo = await getImageByReference('logo', preview)
  const serviceBg = await getImageByReference('service_bg', preview)
  const data = {logo, serviceBg}
  return{
    props: data,
  }
}
