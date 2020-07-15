import { readLocal, writeLocal } from '../lib/api'
import markdownToHtml from '../lib/markdownToHtml'
export async function updateLocalItem(page, password, newData){
    const items= readLocal(page, password)
    const itemId =  newData.itemId
    newData['originContent'] = newData['content']
    newData.content = await markdownToHtml(newData.content || '')
    for (let index in items.ideaItem){
        if(items.ideaItem[index].itemId===itemId){
            items.ideaItem[index] = newData
            break
        }
    }
    writeLocal(page, password, items)
}
