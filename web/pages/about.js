import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { useUpdateData, useLoadData, getBlogByReference, useUserPassword, useAdminPassword, getHostname, getItem, getItemList, setItem, getImageByReference } from '../lib/api'
import { useState } from 'react'
import markdownToHtml from '../lib/markdownToHtml'
import Markdown from '../components/markdown'

export default function PlanPage(data) {
  const logo = data.logo
  const [ sessionData, setSessionData ] = useState()
  const [ localData, setLocalData ] = useState()
  const [ showOverlay, setShowOverlay ] = useState(false)
  const [ hostname, setHostname ] = useState()
  const [ userPassword, setUserPassword ] = useState()
  const [ adminPassword, setAdminPassword ] = useState()
  const [ updateCount, setUpdateCount ] = useState(0)
  const [ reload, setReload ] = useState(false)
  const downflowActions = {
      setPassword: setUserPassword,
      setShowOverlay: setShowOverlay,
  }

  // Variables
  const loginStatus = sessionData?.loginStatus || 'logout'
  const githubUserData = sessionData?.userData || null
  const githubRepos = sessionData?.repos || null
  
  getHostname(setHostname)
  useUserPassword(userPassword, setUserPassword)
  useAdminPassword(adminPassword, setAdminPassword)
  useLoadData('service', userPassword, setLocalData, setSessionData, [updateCount], reload)
  useUpdateData('service', userPassword, localData, [localData?.layers?.length, updateCount])

  const header = (
    <Navigation page="about" password={userPassword} actions={downflowActions} logo={logo} hostname={hostname} loginStatus={loginStatus} githubUserData={githubUserData} repos={githubRepos}/>
  )
  const body = (
    <>
      <div className='mx-16 mt-5'>
        <Markdown content={data.blog.content} />
      </div>
    </>
  )
  return (
    <div>
      <Head>
        <title>
          Don't compromise yourself - you're all you have.
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout page='about' hostname={hostname} curtain={header}>
        {body}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  let blog = await getBlogByReference('about', preview )
  blog.content = await markdownToHtml(blog.content)
  const logo = await getImageByReference('logo', preview)
  const data = {blog, logo}
  return{
    props: data,
  }
}
