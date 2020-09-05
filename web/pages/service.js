import Head from 'next/head'
//import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { useUserPassword, useAdminPassword, getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState, Children } from 'react'
//import { Image } from 'react-datocms'
import cn from 'classnames'
import { Typography, Space } from 'antd'

export default function ServicePage(data) {
  // Variables
  const logo = data.logo
  const children = {}
  const sidebarCSS = ['font-semifont', 'text-lg', 'ml-10', 'mt-10', 'min-h-screen']
  const sidebarCSS2 = ['text-base', 'text-gray-500', 'cursor-pointer', 'hover:text-blue-400']
  const { Text } = Typography
  // States
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ hostname, setHostname ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ sidebar, setSidebar ] = useState('customer')
  // Init
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
  
  const itemList = (
    <>
      <div className={cn(...sidebarCSS)}>
        <Space direction='vertical'>
          <Text>Type</Text>
          <div className={cn(...sidebarCSS2)}
          onClick={()=>setSidebar('customer')}>
            Customer
          </div>
          <div className={cn(...sidebarCSS2)}
          onClick={()=>setSidebar('bussiness')}>
            Bussiness
          </div>
        </Space>
      </div>
    </>
  )
  let body
  switch (sidebar) {
    case 'customer': body=<>customer</>; break;
    case 'bussiness': body=<>bussiness</>;break
    default:
      break;
  }
  children['top'] = header
  children['right'] = body
  children['left'] = itemList
  
  return (
    <div>
      <Head>
        <title> 
          The best way to find yourself is to lose yourself in the service of others.
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page={'service'} hostname={hostname}  children={children}/>
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
