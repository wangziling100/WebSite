import { IdeaEditor } from '../../components/idea-editor'
import { reloadPage, writeLocal, readLocal, readData, useUserPassword, useAdminPassword, getHostname, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'
import Footer from '../../components/footer'
//import markdownToHtml from '../../lib/markdownToHtml'
import Head from 'next/head'
import { isGithubLogin, updateGithubItem } from '../../lib/github'
import { updateLocalItem } from '../../lib/localData'
import { SyncOverlay } from '../../components/sync-overlay'

export default function EditPage(props){
    //const [ persistentStates, setPersistentStates ] = useState()
    const [ itemData, setItemData ] = useState()
    const [ hostname, setHostname ] = useState()
    const [ userPassword, setUserPassword ] = useState()
    const [ adminPassword, setAdminPassword ] = useState()
    const [ pageStatus, setPageStatus ] = useState('normal')

    getHostname(setHostname)
    useUserPassword(userPassword, setUserPassword)
    useAdminPassword(adminPassword, setAdminPassword)
    useEffect(() => {
        if (itemData===undefined){
            const data = readData()
            setItemData(data.editIdea)
        }
    }, [setItemData])
    //console.log(itemData, 'edit page')

    const data = {
        "title": "edit idea",
        "titleNote": "The edited ideas will be checked before they are published",

    }
    // Actions
    const afterEditAction = async (newData, sourceData=null) => {
        //console.log(newData,'edit new data')
        if (newData===null){
            alert('No connection with Server')
            reloadPage()
        }
        if(userPassword!=='' && !isGithubLogin()){
            await updateLocalItem('idea', userPassword, newData)
        }
        else if (userPassword!=='' && isGithubLogin()){
            const statusText = newData.statusText || null
            if (statusText==='OK'){
                await updateLocalItem('idea', userPassword, sourceData)
            }
            else{
                alert("Some unknown error happens")
            }
        }
        else if (userPassword==='' && adminPassword!==''){
        }
        Router.push('/idea')
    }
    const editGithubItem = async (data) => {
        //console.log(data, 'edit action')
        setPageStatus('pending')
        updateGithubItem(data, hostname, afterEditAction, 'milestone')
    }
    const downflowActions = {
        afterAction: afterEditAction,
        githubAction: editGithubItem,
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
         {  pageStatus==='pending' &&
             <SyncOverlay css={['bg-opacity-75']} />
         }
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
