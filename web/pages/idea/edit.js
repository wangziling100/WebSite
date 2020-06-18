import { IdeaEditor } from '../../components/idea-editor'
import { getHostname, getItem, setItem, getItemList, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'
import Footer from '../../components/footer'

export default function EditPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    getItemList('/', setPersistentStates)
    const [ password, setPassword ] = useState()
    const [ itemData, setItemData ] = useState()
    const [ hostname, setHostname ] = useState()
    const tmpData = {
        password: password,
    }
    setItem('/', tmpData)
    getItem(persistentStates, setPassword, 'password')
    getItem(persistentStates, setItemData, 'itemData')
    getHostname(setHostname)

    const data = {
        "title": "edit idea",
        "titleNote": "The edited ideas will be checked before they are published",

    }
    const main = (
      <>
         <IdeaEditor background={props.data.background} data={data} item={itemData} savedPassword={password} page={'/idea'} />
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
