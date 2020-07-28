const https = require('https')
const API_TOKEN = process.env.CMS_TOKEN
const PASSWORD = process.env.PASSWORD
const { SiteClient } = require("datocms-client")
const client = new SiteClient(API_TOKEN)

exports.lambdaHandler = async (event, context) =>{
    const body = JSON.parse(event.body)
    console.log(body, 'body')
    let response = null
    if (body.password===undefined || body.data===undefined || !(body.data instanceof Array)){
        response = unimplementedResponse()
        return response
    }
    if (PASSWORD!==body.password){
        response = wrongPasswordResponse()
        return response
    }
    let clientItems = body.data
    clientItems = filterInvalid(clientItems)
    const remoteItems = await getAllItems(client)
    console.log(remoteItems, 'remote data')

    const [createList, updateList] = compare(clientItems, remoteItems)
    console.log(createList, updateList, 'prepared data')
    let responses = []
    response = await createItemBatch(createList)
    responses.push(response)
    response = await updateItemBatch(updateList)
    responses.push(response)
    response = combineResponses(responses)
    //response = normalResponse()
    return response
}

function unimplementedResponse(){
    const options = {
        statusCode: 501,
        statusText: 'Not Implemented',
        message: 'failed',
    }
    const response = setResponse(options)
    return response
}

function normalResponse(){
    const options = {
        statusCode: 200,
        statusText: 'OK',
        message: 'succeed',
    }
    const response = setResponse(options)
    return response
}

function wrongPasswordResponse(){
    const options = {
        statusCode: 401,
        statusText: 'Unauthorized',
        message: 'failed',
    }
    const response = setResponse(options)
    return response
}

function fetchErrorResponse(errors){
    const options = {
        statusCode: 500,
        statusText: 'Internal Server Error',
        errors: errors,
        message: 'failed',
    }
    const response = setResponse(options)
    return response
}

function combineResponses(responses){
    let result = null
    let code = 0
    for (let res of responses){
        if (res.statusCode>code){
            result = res
            code = res.statusCode
        }
    }
    if (code===0) return normalResponse()
    else return result
}

function setResponse(options){
    const statusCode = options.statusCode
    delete options.statusCode
    const response = {
        'statusCode': statusCode,
        'body': JSON.stringify(options),
        'headers': {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers": "Content-Type",},
    }
    return response
}

async function getAllItems(client){
    let res = null
    await client.items.all({
        'filter[type]': '238671',
        version: 'published'
    })
    .then((items)=>{
        res = items
    })
    .catch((error)=>{
        console.error(error)
    })
    return res
}

function compare(client, remote){
    let create = []
    let update = []
    for (let ci of client){
        let hasDuplicate = false
        const itemId = ci.itemId
        const version = ci.version
        
        for (let ri of remote){
            const itemId1= ri.itemId
            const version1 = ri.version
            console.log(itemId, itemId1, version, version1, 'type compare')

            if (itemId===itemId1 &&  version===version1) {
                hasDuplicate = true
                break
            }
            else if (itemId===itemId1 && version!==version1) {
                ci['id'] = ri.id
                update.push(ci)
                hasDuplicate = true
                break
            }
        }
        if (!hasDuplicate){
            create.push(ci)
            continue
        }
    }
    return [create, update]
}

async function createItemBatch(createList){
    let errors = []
    for (let item of createList){
        if (item.itemType==='milestone') ref = 'idea_item'
        else if (item.itemType==='issue') ref = 'plan_item'
        if (item.refId===null || item.refId===undefined) refId = null
        else refId = item.refId.toString()
        await client.items.create({
            itemType: '238671',
            title: item.title,
            content: item.content,
            priority: item.priority,
            completeness: item.completeness,
            startTime: item.startTime,
            evaluation: item.evaluation,
            allowPriorityChange: item.allowPriorityChange,
            ref: ref,
            refId: refId,
            owner: item.owner,
            contributor: item.contributor,
            tag: item.tag,
            itemStatus: item.itemStatus,
            version: item.version.toString(),
            layer: item.layer,
            parents: item.parents,
            target: item.target,
            difficulty: item.difficulty,
            urgency: item.urgency,
            endDate: item.endData,
            duration: item.duration,
            period: item.period,
            planType: item.planType || 0,
            itemId: item.itemId,
            number: item.number,
            issueNumber: item.issueNumber,
            url: item.url,
            createdAt1: item._createdAt || new Date(),
            itemType1: item.itemType,
        })
        .catch( (err) => {
            console.log(err)
            errors.push(err)
        })
    }
    let response = null
    if (errors.length===0){
        response = normalResponse()
    }
    else{
        response = fetchErrorResponse(errors)
    }
    return response
    
}

async function updateItemBatch(updateList){
    let errors = []
    for (let item of updateList){
        if (item.itemType==='milestone') ref = 'idea_item'
        else if (item.itemType==='issue') ref = 'plan_item'
        await client.items.update(item.id, {
            itemType: '238671',
            title: item.title,
            content: item.content,
            priority: item.priority,
            completeness: item.completeness,
            startTime: item.startTime,
            evaluation: item.evaluation,
            allowPriorityChange: item.allowPriorityChange,
            ref: ref,
            refId: item.refId.toString(),
            owner: item.owner,
            contributor: item.contributor,
            tag: item.tag,
            itemStatus: item.itemStatus,
            version: item.version.toString(),
            layer: item.layer,
            parents: item.parents,
            target: item.target,
            difficulty: item.difficulty,
            urgency: item.urgency,
            endDate: item.endData,
            duration: item.duration,
            period: item.period,
            planType: item.planType || 0,
            itemId: item.itemId,
            number: item.number,
            issueNumber: item.issueNumber,
            url: item.url,
            createdAt1: item._createdAt || new Date(),
            itemType1: item.itemType
        })
        .catch((err) => {
            console.log(err)
            errors.push(err)
        })
    }
    let response = null
    if (errors.length===0){
        response = normalResponse()
    }
    else{
        response = fetchErrorResponse(errors)
    }
    return response
}

function filterInvalid(items){
    let result = []
    for (let item of items){
        if (typeof(item.version)!=='string') continue
        result.push(item)
    }
    return result
}
