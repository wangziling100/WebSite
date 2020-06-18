import { IdeaEditor } from '../../components/idea-editor'
import { getHostname, getItem, setItem, getItemList, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'
import Footer from '../../components/footer'

export default function EditPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    const [ hostname, setHostname ] = useState()
    getItemList('/', setPersistentStates)
    const [ password, setPassword ] = useState("")
    const tmpData = {
        password: password,
    }
    setItem('/', tmpData)
    getItem(persistentStates, setPassword, 'password')
    getHostname(setHostname)

    const data = {
        "title": "create new idea",
        "titleNote": "The created ideas will be checked before they are published",

    }
    const main = (
      <>
         <IdeaEditor background={props.data.background} data={data} savedPassword={password} page={'/idea'} />
         <Footer hostname={hostname} />
      </>
    )
    return (
      <>
        
        {(password!==undefined) && main}
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
