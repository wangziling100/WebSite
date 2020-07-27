import { checkRecord, checkUser, readData, readLocal, writeLocal } from '../lib/api'
import markdownToHtml from '../lib/markdownToHtml'
import { getGithubInfo } from '../lib/github'
import { deleteItem, updateItem, updateItems, deleteElementsFromArray, flat } from '../lib/tools'

const allPages = ['idea', 'plan']
export async function updateLocalItem(page, password, newData){
    const items= readLocal(page, password)
    if (page==='idea'){
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
    else if(page==='plan') updateLocalPlan(newData, password)
    
}

export function collectAllGithubData(){
    const { userPassword } = readData()
    let allData = []
    for (let page of allPages){
        let tmpData = readLocal(page, userPassword)
        tmpData = flatGithubData(tmpData, page)
        allData = allData.concat(tmpData)
    }
    //console.log(allData, 'allData')
    return allData
}

function flatGithubData(data, page){
    let ret = null
    if (page==='idea') {
        ret = data.ideaItem
        ret.map(el => {el['itemType']='milestone'})
        return ret
    }
    if (page==='plan') {
        ret = data.layers
        ret = flat(ret)
        ret.map(el => {el['itemType']='issue'})
        return ret
    }
}

export function addAllToLocal(password, data){
    //console.log('add all locally', data)
    let invalid = []
    const pages = ['idea', 'plan']
    const existUser = checkUser(password)

    for (let page of pages){
        const record = readLocal(page, password)

        if (page==='idea'){
            if (data.ideaItem===undefined) continue
            //console.log('add idea locally')
            record.ideaItem = record.ideaItem.concat(data.ideaItem)
            //console.log(record, password, 'idea record')
            const tmpData = {
                ideaItem: record.ideaItem,
            }
            const tmpResult = writeLocal(page, password, tmpData)
            //console.log(tmpResult, 'result')
        }

        else if (page==='plan'){
            if (data.layers===undefined) continue
            //console.log('add plan locally')
            const layers = record.layers
            if (layers.length===0) layers.push([])
            const unsortedLayers = Object.keys(data.layers)
            const highestLayer = findHighestLayer(unsortedLayers, layers.length)
            let i = layers.length
            while (i<=highestLayer){
                layers.push([])
                i++
            }

            for (let key in data.layers){

                try{
                    layers[parseInt(key)] = layers[parseInt(key)].concat(data.layers[key])
                }
                catch(err){
                    console.log(err, 'error in addAllToLocal')
                    invalid = invalid.concat(data.layers[key])
                }
            }
            const tmpData = {
                layers: layers
            }
            //console.log(tmpData, 'new plan local')
            writeLocal(page, password, tmpData)
        }

    }
    return invalid
}

export function addItemInLocalLayer(data, password){
    const local = readLocal('plan', password)
    const layerNum = data.layer
    const layers = local.layers
    if (layers[layerNum]===undefined) layers.push([])
    layers[layerNum].push(data)
    writeLocal('plan', password, {
        layers: layers
    })
}

export function updateItemInLocalLayer(data, password){
    //console.log(data, 'update item in local layer------')
    const local = readLocal('plan', password)
    const layerNum = data.layer
    const layers = local.layers
    const layer = layers[layerNum]
    const compareFunc = (newData, oldData) => {
        if (newData['itemId'] === oldData['itemId']) return true
        return false
    }
    const newLayer = updateItem(data, layer, compareFunc)
    //console.log(newLayer, 'new layer')
    layers[layerNum] = newLayer
    const tmpData = {
        layers: layers
    }
    writeLocal('plan', password, tmpData)

}

export function updateAllInLocal(password, data){
    let invalid = []
    const pages = ['idea', 'plan']
    const existUser = checkUser(password)
    const compareFunc = (item1, item2) => {
        if(item1.itemId===item2.itemId) return true
        else return false
    }
    for (let page of pages){
        const record = readLocal(page, password)
        if (page==='idea'){
            if (data.ideaItem===undefined) continue
            //console.log('update idea locally')
            let result = []
            let target = record.ideaItem
            let newSet = data.ideaItem
            const updated = updateItems(newSet, target, compareFunc)
            const tmpData = {
                ideaItem: updated
            }
            writeLocal(page, password, tmpData)
        }
        else if (page==='plan'){
            if (data.layers===undefined) continue
            const target = record.layers
            const newSet = data.layers

            for (let index in target){
                target[index] = updateItems(newSet[index], target[index], compareFunc)
            }
            const tmpData = {
                layers: target,
            }
            writeLocal(page, password, tmpData)
        }
        
    }

}

export function checkIsolatedPlan(password){
    let isolatedPlan = []
    let counter = {}
    const record = readLocal('plan', password)
    const layers = record.layers
    //console.log(record, 'checkIsolatedPlan') 
    for (let item of flat(layers)){
        if (counter[item.itemId]!==undefined) continue
        if(!existParents(item, layers)) {
            isolatedPlan.push(item)
            const children = findPlanChildren(item, layers)
            counter[item.itemId] = 1
            isolatedPlan = isolatedPlan.concat(children)
            for (let child of children){
                counter[item.itemId] = 1
            }
        }
    }
    return isolatedPlan
}

function existParents(item, layers){
    const parents = item.parents
    if (parents===undefined) return false
    if (parents==='root') return true
    const layer = layers[item.layer-1]
    let result = false

    for (let el of layer){
        if (el.itemId===parents){
            result = true
            break
        }
    }

    return result
}

function findPlanChildren(item, layers){
    const id = item.itemId
    const layer = item.layer
    const allInLayer = layers[layer+1]
    let result = []
    if (allInLayer === undefined) return []
    for (let i of allInLayer){
        if (i.parents===id){
            result.push(i)
            const childrenResult = findPlanChildren(i, layers)
            result = result.concat(childrenResult)
        }
    }
    return result
}

export function deleteLocalPlans(items, password){
    const record = readLocal('plan', password)
    let layers = record.layers
    //console.log(layers, 'delete local plans')
    const flatLayers = deleteElementsFromArray(items, flat(layers), 'itemId')
    layers = items2Layers(flatLayers)
    const tmpData = {
        layers: layers
    }
    //console.log(layers, 'delete local plans 2')

    writeLocal('plan', password, tmpData)
    return true
}

function items2Layers(items){
    //console.log(items, 'item 2 layers')
    let layers = {}
    for (let i of items){
        if (layers[i.layer] === undefined){
            layers[i.layer] = []
        }
        layers[i.layer].push(i)
    }
    let tmp = []
    let n = 0
    while (n<Object.keys(layers).length){
        tmp.push(layers[n.toString()])
        n++
    }
    layers = tmp
    //console.log(items, 'item 2 layers2')
    return layers
}

function findHighestLayer(itemLayers, existHighest){
    //console.log(itemLayers, existHighest, 'find highest layer')
    itemLayers= itemLayers.sort()
    //console.log(itemLayers, 'sorted layers')
    let start = false
    let cnt = 0
    let highest = existHighest
    for (let numOfLayer of itemLayers){
        try{
            numOfLayer = parseInt(numOfLayer)
        }
        catch{
            continue
        }
        //console.log(numOfLayer, existHighest, 'layer data')
        if (numOfLayer===existHighest) start=true
        if (start){
            if(numOfLayer===existHighest+cnt) {
                cnt++
                highest = numOfLayer
            }
            else break
        }

    }
    //console.log(highest, 'highest layer')
    return highest
}

export function updateGithubCompleteness(page, password, completeness, number){
    const record = readLocal(page, password)
    let result = []
    let ideaItem = record.ideaItem
    for (let item of ideaItem){
        if (item.number === number){
            item.completeness = completeness
        }
        result.push(item)
    }
    const tmpData = {
        ideaItem: result,
    }
    writeLocal(page, password, tmpData)

}

export function deleteLocalIdea(idea, userPassword=""){
    let localData = readLocal('idea', userPassword)
    //console.log('deleteLocalIdea local data', localData)
    const id = idea.itemId
    const ideas = localData.ideaItem
    for (let index in ideas){
        //console.log(id, ideas[index].itemId, 'deleteLocalIdea id')
        if (id===ideas[index].itemId){
            ideas.splice(index, 1)
            break
        }
    }
    localData = {
        ideaItem: ideas
    }
    //console.log('deleteLocalIdea2', localData)
    writeLocal('idea', userPassword, localData)
    return localData
}

export function deleteLocalPlan(plan, password){
    let local = readLocal('plan', password)
    let layerNum = plan.layer
    let layers = local.layers
    const compareFunc = (item1, item2) => {
        if (item1.itemId===item2.itemId) return true
        else return false
    }
    layers[layerNum] = deleteItem(plan, layers[layerNum], compareFunc)
    const tmpData = {
        layers: layers
    }
    writeLocal('plan', password, tmpData)
}

export function updateLocalPlan(plan, userPassword){
    let local = readLocal('plan', userPassword)

    const layers = local.layers
    // find out and delete old plan
    for (let index1 in layers){
        for (let index2 in layers[index1]){
            if (layers[index1][index2].itemId===plan.itemId){
                layers[index1].splice(index2, 1)
                break
            }
        }
    }

    // add new plan in layer
    layers[plan.layer].push(plan)

    local = {
        layers: layers
    }
    writeLocal('plan', userPassword, local)
    return local
}

export function getFlatPlans(password){
    let local = readLocal('plan', password)
    const layers = local.layers
    return flat(layers)
}

export function getLocalItemByAttr(page, password, key, value){
    let local = readLocal(page, password)
    console.log(page, local, password, 'get local item by attr')
    let items = null
    if (page==='idea') items = local.ideaItem
    else if (page==='plan') items = flat(local.layers)
    if (items[0][key]===undefined){
        return {
            succeed: false,
            item: null
        }
    }

    for (let item of items){
        if (item[key]===value ){
            return {
                succeed: true,
                item: item
            }
        }
    }
    return {
        succeed: false,
        item: null
    }
}

export function getLocalItemsByAttr(page, password, key, value){
    let ret = []
    let local = readLocal(page, password)
    let items = null
    if (page==='idea') items = local.ideaItem
    else if (page==='plan') items = flat(local.layers)
    if (items[0][key]===undefined){
        return {
            succeed: false,
            items: null
        }
    }

    for (let item of items){
        if (item[key]===value ){
            ret.push(item)
        }
    }
    return {
        succeed: true,
        items: ret
    }
}

export function processLocalBatch(batch, userPassword){
    for(let item of batch){
        if (item.itemType==='milestone'){
            if(item.option==='delete') deleteLocalIdea(item, userPassword)
        }
        else if (item.itemType==='issue'){
            if(item.option==='update') updateLocalPlan(item, userPassword)
        }
    }
}

export function getLayers(password){
    const record = readLocal('plan', password)
    return record.layers
}
