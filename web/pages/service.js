import Head from 'next/head'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import ServiceCard from '../components/service-card'
import { useUserPassword, useAdminPassword, getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState } from 'react'
import cn from 'classnames'
import { Typography, Space } from 'antd'
import { getAssetPaths, yamlToPluginConfig } from '../lib/tools'

export default function ServicePage(data) {
  // Variables
  const logo = data.logo
  const children = {}
  const sidebarCSS = ['font-semifont', 'text-lg', 'ml-10', 'mt-10', 'min-h-screen']
  const sidebarCSS2 = ['text-base', 'text-gray-500', 'cursor-pointer', 'hover:text-blue-400']
  const pluginCSS = ['flex', 'flex-wrap', 'justify-between']
  const { Text } = Typography
  // States
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ hostname, setHostname ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ sidebar, setSidebar ] = useState('plugin')
  // Init
  const downflowActions = {
      setPassword: setAdminPassword,
      setShowOverlay: setShowOverlay,
  }

  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)

  // Components
  const cards = []
  for (let key in data.pluginConfigs){
    let com, bg, logo
    const config = data.pluginConfigs[key]
    
    if(data.pluginImgs[key]===undefined){
      bg = undefined
    }
    else{
      bg = {
        src: data.pluginImgs[key]
      }
    }

    logo = {
      text: config.icon?.text||config.name[0],
      size: config.icon?.size||5,
      color: config.icon?.color||'blue',
      src: config.icon?.src||undefined
    }
    com = <ServiceCard config={config} bg={bg} logo={logo}/>
    cards.push(com)

  }

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
          onClick={()=>setSidebar('plugin')}>
            Plugin
          </div>
        </Space>
      </div>
    </>
  )
  const plugin = (
    <div className='p-20'>
      {cards}
    </div>
  )
  let body
  switch (sidebar) {
    case 'plugin': body=plugin; break;
    default: body=plugin; break;
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
  const fs =  require('fs')
  const path = require('path')
  const logo = await getImageByReference('logo', preview)
  const serviceBg = await getImageByReference('service_bg', preview)
  const pluginConfigPaths = getAssetPaths(fs, './public/plugin/config')
  const pluginImgPaths = getAssetPaths(fs, './public/plugin/bg')
  const pluginConfigs = {}
  const pluginImgs = {}

  for (let p of pluginConfigPaths){
    const tmp = yamlToPluginConfig(fs, path.join('./public/plugin/config', p))
    p = path.basename(p, '.yaml')
    pluginConfigs[p] = tmp
  }

  for (let p of pluginImgPaths){
    const key = path.basename(p, '.png')
    const newPath = path.join('/plugin/config', p)
    pluginImgs[key] = p
  }
  const data = {logo, serviceBg, pluginConfigs, pluginImgs}
  return{
    props: data,
  }
}
