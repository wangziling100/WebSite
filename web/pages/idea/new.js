import { IdeaEditor } from '../../components/idea-editor'
import { getItem, setItem, getItemList, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'

export default function EditPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    getItemList('/', setPersistentStates)
    const [ password, setPassword ] = useState("")
    const tmpData = {
        password: password,
    }
    setItem('/', tmpData)
    getItem(persistentStates, setPassword, 'password')

    const data = {
        "title": "create new idea",
        "titleNote": "The created ideas will be checked before they are published",

    }
    console.log(password)
    const main = (
      <>
         { (password!==undefined) &&
           <IdeaEditor background={props.data.background} data={data} savedPassword={password} page={'/idea'} />
         }
      </>
    )
    return (
      <>
        {main}
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
