import { IdeaEditor } from '../../components/idea-editor'
import { writeLocal, readLocal, readData, useUserPassword, useAdminPassword, getHostname, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'
import Footer from '../../components/footer'
import markdownToHtml from '../../lib/markdownToHtml'
import Head from 'next/head'

export default function EditPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    const [ itemData, setItemData ] = useState()
    const [ hostname, setHostname ] = useState()
    const [ userPassword, setUserPassword ] = useState()
    const [ adminPassword, setAdminPassword ] = useState()

    getHostname(setHostname)
    useUserPassword(userPassword, setUserPassword)
    useAdminPassword(adminPassword, setAdminPassword)
    useEffect(() => {
        if (itemData===undefined){
            const data = readData()
            setItemData(data.editIdea)
        }
    }, [setItemData])

    const data = {
        "title": "edit idea",
        "titleNote": "The edited ideas will be checked before they are published",

    }
    // Actions
    const afterEditAction = async (newData) => {
        if(userPassword!==''){
            const data = readLocal('idea', userPassword)
            const itemId = itemData.itemId
            newData.itemId = itemId
            newData['originContent'] = newData['content']
            newData.content = await markdownToHtml(newData.content || '')
            for (let index in data.ideaItem){
                if (data.ideaItem[index].itemId===itemId){
                    data.ideaItem[index] = newData
                    break
                }
            }
            writeLocal('idea', userPassword, data)
        }
        if (userPassword==='' && adminPassword!==''){
            Router.push('/idea')
        }
    }
    const downflowActions = {
        afterAction: afterEditAction,
    }

    const main = (
      <>
        <Head>
         <title>
           Having ideas is like having chessmen moving forward; they may be beaten, but they may start a winning game.
         </title>
        </Head>
         <IdeaEditor background={props.data.background} data={data} item={itemData} savedPassword={adminPassword} page={'/idea'} actions={downflowActions} userPassword={userPassword}/>
         <Footer hostname={hostname}/>
      </>
    )
    return (
      <>
        { itemData!==undefined && main}
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
