import { replaceAttr } from '../lib/tools'
import { updateLocalPlan, deleteLocalPlan, updateItemInLocalLayer, addItemInLocalLayer, updateLocalItem } from '../lib/localData'
import { getMilestoneByNum } from '../lib/github'
export async function processResponse(responseData, sourceData, password){
    //console.log(responseData, sourceData, 'processResponse')
    let option = null
    let itemType = null
    if (sourceData===null){
        option = responseData.option
        itemType = responseData.itemType
    }
    else {
        option = sourceData.option
        itemType = sourceData.itemType
    }

    if(option==='create' && itemType==='issue'){
        sourceData = replaceAttr(responseData, sourceData)
        addItemInLocalLayer(sourceData, password)
    }
    else if (option==='update' && itemType==='issue'){
        updateLocalPlan(sourceData, password)
    }
    else if (option==='delete' && itemType==='issue'){
        deleteLocalPlan(sourceData, password)
    }
    else if(option==='update' && itemType==='milestone'){
        if (sourceData===null){
            const number = responseData.number
            sourceData = getMilestoneByNum(password, number)
        }
        sourceData = replaceAttr(responseData, sourceData)
        await updateLocalItem('idea', password, sourceData)
    }
}

export async function processResponseBatch(responseBatch, sourceDataBatch, password){
    let succeed = true
    for (let index in responseBatch){
        const response = responseBatch[index]
        let sourceData = null
        if (sourceDataBatch[index]!==undefined) sourceData=sourceDataBatch[index]
        const statusText = response.statusText
        if (statusText==='OK' || statusText==='Created') {
            const responseData = response.data
            await processResponse(responseData, sourceData, password)
        }
        else succeed = false
    }
    return succeed
}

export function parseResponseAsBatch(response){
    if (response.list!==undefined){
        return response.list
    }
    else if(response.data instanceof Array){
        let list = response.data
        for (let item of list){
            item['statusText'] = response.statusText
        }
        return list
    }
    return [response]
}

