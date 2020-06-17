import { IdeaEditor } from '../../components/idea-editor'
import { getItem, setItem, getItemList, getImageByReference } from '../../lib/api'
import Router, {useRouter} from 'next/router'
import { useState, useEffect } from 'react'

export default function EditPage(props){
    const [ persistentStates, setPersistentStates ] = useState()
    getItemList('/', setPersistentStates)
    const [ password, setPassword ] = useState()
    const [ itemData, setItemData ] = useState()
    /*
    const [ title, setTitle ] = useState()
    const [ content, setContent ] = useState()
    const [ tags, setTags ] = useState()
    const [ priority, setPriority ] = useState()
    const [ owner, setOwner ] = useState()
    */

    const tmpData = {
        password: password,
    }
    setItem('/', tmpData)
    getItem(persistentStates, setPassword, 'password')
    getItem(persistentStates, setItemData, 'itemData')
    console.log('idea/edit', password, itemData)

    const data = {
        "title": "edit idea",
        "titleNote": "The edited ideas will be checked before they are published",

    }
    const main = (
      <>
         { itemData!==undefined &&
           <IdeaEditor background={props.data.background} data={data} item={itemData} savedPassword={password} page={'/idea'} />
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
