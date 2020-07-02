import { IdeaEditor } from '../../components/idea-editor'
import { readLocal, writeLocal, useUserPassword, useAdminPassword, getHostname, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'
import Footer from '../../components/footer'
import markdownToHtml from '../../lib/markdownToHtml'
import Head from 'next/head'

export default function NewPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    const [ hostname, setHostname ] = useState()
    const [ userPassword, setUserPassword ] = useState()
    const [ adminPassword, setAdminPassword ] = useState()
    
    getHostname(setHostname)
    useUserPassword(userPassword, setUserPassword)
    useAdminPassword(adminPassword, setAdminPassword)

    const data = {
        "title": "create new idea",
        "titleNote": "The created ideas will be checked before they are published",

    }
    // Actions
    const afterCreateAction = async (newData) => {
        if(userPassword!==''){
            const data = readLocal('idea', userPassword)
            let createTime = new Date()
            newData['_createdAt'] = createTime
            newData['originContent'] = newData['content']
            newData['comments'] = []
            newData.content = await markdownToHtml(newData.content || '')
            data.ideaItem.push(newData)
            writeLocal('idea', userPassword, data)
        }
        if (userPassword==='' && adminPassword!==''){
            Router.push('/idea')
        }
    }
    const downflowActions = {
        afterAction: afterCreateAction,
    }
    const main = (
      <>
        <Head>
          <title>
            Don’t worry about people stealing your ideas. If your ideas are any good, you’ll have to ram them down people’s throats.
          </title>
        </Head>
         <IdeaEditor background={props.data.background} data={data} savedPassword={adminPassword} page={'/idea'} actions={downflowActions} userPassword={userPassword}/>
         <Footer hostname={hostname} />
      </>
    )
    return (
      <>
        
        {(adminPassword!==undefined) && main}
      </>
    )

}

export async function getStaticProps({ preview=false }){
  const background = (await getImageByReference("idea_new_bg", preview))
  const data = {background}
  return{
    props: {
      data: data,
    }
  }
}
