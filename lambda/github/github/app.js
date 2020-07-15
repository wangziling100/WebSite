const AWS = require('aws-sdk');
const s3 = new AWS.S3()
const Auth = require('@octokit/auth')
const https = require('https')

const bucketName = process.env.BUCKET_NAME
const axios = require('axios')
const dynamo = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1'})

exports.lambdaHandler = async (event, context) =>{
    const body = JSON.parse(event.body)
    //const option = body.option
    const userId = body.userId
    const hostname = body.hostname
    const itemType = body.itemType
    console.log(body, 'body')
    let result = null
    let clientId = null
    let clientSecret = null
    let appId = null
    let action = null
    let data = null
    let postProcess = null
    let response = null

    if (hostname==='localhost'){
        clientId = process.env.CLIENT_ID
        clientSecret = process.env.CLIENT_SECRET
        appId = process.env.APP_ID 
        fileName = process.env.FILE_NAME
    }
    else if(hostname==='wangxingbo.now.sh'){
        clientId = process.env.CLIENT_ID_VERCEL
        clientSecret = process.env.CLIENT_SECRET_VERCEL
        appId = process.env.APP_ID_VERCEL 
        fileName = process.env.FILE_NAME_VERCEL
    }
    else if (hostname==='wangxingbo.netlify.app'){
        clientId = process.env.CLIENT_ID_NETLIFY
        clientSecret = process.env.CLIENT_SECRET_NETLIFY
        appId = process.env.APP_ID_NETLIFY 
        fileName = process.env.FILE_NAME_NETLIFY
    }
    const [existUser, installation] = await isExistUser(userId.toString(), hostname)
    let auth = null
    if (!existUser) return //TODO
    const key = await getKey(bucketName, fileName)
    auth = Auth.createAppAuth({
        id: appId,
        privateKey: key,
        installationId: installationId,
        clientId: clientId,
        clientSecret: clientSecret,
    })

    console.log(1)
        
    console.log(existUser, installation)
    if (body.list===undefined){
        const option = body.option
        result  = await tmpFunc(option, body, body.userName, body.repo, body.number)
    }
    else if (body.list!==undefined){
        list = body.list
        tmpList = []
        for (let request of list){
            const option = request.option
            tmp = await tmpFunc(option, request, body.userName, body.repo, request.number)
            if (tmp.statusCode<300) tmpList.push(tmp)
            else {
                response = setResponse(tmp)
                return response
            }
        }
        result = {
            statusCode: 200,
            statusText: 'OK',
            list: tmpList,
        }
    }
    console.log(4, result)
    
    response = setResponse(result)
    console.log(5, response)
    return response

    async function tmpFunc(option, body, userName, repo, number){
        let result = null
        switch (option){
            case 'create':
                if (itemType==='milestone'){
                    console.log(2)
                    data = {
                        title: body.title,
                        description: body.description
                    }
                    action = (token) => createMilestone(token, data, userName, repo)
                    postProcess = (data) => getMilestone(data)
                }
                if (itemType==='issue'){
                    console.log(2)
                    data = {
                        title: body.title,
                        body: body.body,
                        assignees: body.assignees,
                    }
                    if (body.milestone!==null) {
                        data['milestone'] = body.milestone
                    }
                    if (body.labels!==null){
                        data['labels'] = body.labels
                    }
                    action = (token) => createIssue(token, data, userName, repo)
                    postProcess = (data) => getIssue(data, body.option)
                }

                break;
            case 'select':
                if (itemType==='milestone'){
                    const query = {

                    }
                }
                break
            case 'delete':
                if (itemType==='milestone'){
                    console.log(2.2)
                    action = (token) => deleteMilestone(token, userName, repo, number)
                    postProcess = (data) => getMilestone(data, body.option)
                }
                if (itemType==='issue'){
                    console.log(2.2)
                    data = {
                        title: body.title+'(deleted)',
                        state: 'closed',
                        body: body.body
                    }
                    console.log(data, body, 'delete') 
                    //data.body['isDeleted'] = true
                    action = (token) => deleteIssue(token, data, userName, repo, number)
                    postProcess = (data) => getIssue(data)
                }
                break
            case 'update':
                if (itemType==='milestone'){
                    console.log(2.3)
                    data = {
                        title: body.title,
                        state: body.state==='active'? 'open': 'closed',
                        description: body.description,
                    }
                    action = (token) => updateMilestone(token, data, userName, repo, number)
                    postProcess = (data) => getMilestone(data)
                }
                if (itemType==='issue'){
                    console.log(2.3)
                    if (body.state===undefined) tmpState = body.itemStatus
                    else tmpState = body.state
                    data = {
                        title: body.title,
                        state: tmpState==='active'? 'open': 'closed',
                        body: body.body,
                        assignees: body.assignees,
                    }
                    if (body.milestone!==null) {
                        data['milestone'] = body.milestone
                    }
                    if (body.labels!==null){
                        data['labels'] = body.labels
                    }
                    action = (token) => updateIssue(token, data, userName, repo, number)
                    postProcess = (data) => getIssue(data)
                }

        }
        await auth({type: 'installation'})
        .then(async (token) => {
            console.log(3, token)
            token = token.token
            result = await action(token)
            result = postProcess(result)
        })
        .catch((error) => {
            //console.log(error)
            result = getError(error)
        })
        return result
    }
    

    
}


function setResponse(options){
    let statusCode = options.statusCode
    if (statusCode<300) statusCode=200
    delete options.statusCode
    const response = {
        'statusCode': statusCode,
        'body': JSON.stringify(options),
        'headers': {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers": "Content-Type",},
    }
    return response
}

async function isExistUser(id, hostname){
    const params = {
        TableName: 'GithubInfo',
        Key:{
            id: id,
            hostname:hostname,
        }
    }
    let result = [false, null]
    await dynamo.get(params).promise()
    .then((obj) => {
        if (obj.Item===undefined) {
            result = [false, null]
        }
        else {
            installationId = obj.Item.installationId
            result = [true, installationId]
        }
    })
    .catch((err) => {
        console.log(err)
    })
    return result
}
async function sendRequestWrapper(someFunc){
    let result
    await aAuth({type: 'installation'})
    .then(async (token) => {
        token = token.token
        result = await someFunc(token)
    })
    .catch((err) => {
        console.log(err)
    })
    return result
}

async function createMilestone(token, data, owner, repo){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/milestones'
    console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function deleteMilestone(token, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl+'/repos/'+owner+'/'+repo+'/milestones/'+number
    console.log(url)
    const result = await sendDeleteRequest(token, url)
    return result
    
}


async function updateMilestone(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/milestones/'+number
    console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function deleteIssue(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl+'/repos/'+owner+'/'+repo+'/issues/'+number
    console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}
async function createIssue(token, data, owner, repo){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/issues'
    console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function updateIssue(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/issues/'+number
    console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function sendPostRequest(token, url, data){
    let result = null
    await axios.post(url, data, {
        headers:{
            'content-type': 'application/json',
            authorization: 'Bearer ' + token
        }
    })
    .then((res) => {
        result = res
    })
    .catch((error) => {
        result = error
    })
    return result

}
async function sendDeleteRequest(token, url,data=null){
    let result = null
    await axios.delete(url, {
        headers:{
            'content-type': 'application/json',
            authorization: 'Bearer ' + token
        },
        data: data
    })
    .then((res) => {
        result = res
    })
    .catch((error) => {
        result = error
    })
    return result
}
async function requestUserInfo(token){
    let result
    await axios.get('https://api.github.com/user', {
            headers:{
                'content-type': 'application/json',
                authorization: 'Bearer ' + token
            }
    })
    .then((res) => {
        result = getUserInfo(res.data)

    })
    .catch((error) => {
        console.error(error)
    })
    return result
}

async function requestRepoList(token){
    let result
    await axios.get('https://api.github.com/installation/repositories',{
        headers:{
            Accept: 'application/vnd.github.machine-man-preview+json',
            authorization: 'Bearer ' + token
        }
    })
    .then( (res) => {
        const repos = res.data.repositories
        result = getRepoList(repos)
    } )
    return result
}

function getRepoList(repos){
    let result = []
    for (let repo of repos){
        const tmp = {
            repoId: repo.id,
            repoName: repo.name
        }
        result.push(tmp)
    }
    return result
}


function getUserInfo(data){
    const userData = {
        name: data.login,
        id: data.id,
        avatar_url: data.avatar_url,
    }
    return userData
}

function getMilestone(data, option='create'){
    if (data.status===undefined){
        return {
            statusCode: data.response.status,
            statusText: data.response.statusText,
        }
    }
    let tmpData
    if (option === 'create'){
        tmpData = {
            number: data.data.number,
            url: data.data.html_url,
            id: data.data.id,
        }
    }
    else if (option==='delete') {
        tmpData={
            message: 'succeed',
        }
    }
    
    return {
        statusCode: data.status,
        statusText: data.statusText,
        data: tmpData,
    }
}

function getIssue(data, option){
    if (data.status===undefined){
        return {
            statusCode: data.response.status,
            statusText: data.response.statusText,
        }
    }
    let tmpData
    if (option === 'create'){
        tmpData = {
            number: data.data.number,
            url: data.data.html_url,
            id: data.data.id,
        }
    }
    else if (option==='delete') {
        tmpData={
            message: 'succeed',
        }
    }
    
    return {
        statusCode: data.status,
        statusText: data.statusText,
        data: tmpData,
    }
}


function getError(data){
    console.log('get error', data)
    return {
        statusCode: data.response.status,
        statusText: data.response.statusText,
    }
}

async function getKey(bucket, file){
    let key
    const params = { 
        Bucket: bucket, 
        Key: file
    }
    key = await s3.getObject(params).promise()
    key = JSON.stringify(key.Body)
    key = JSON.parse(key).data
    key = bin2String(key)
    return key
}

function bin2String(array) {
    var result = ""
    for (let i=0; i<array.length; i++){
        const tmp = String.fromCharCode(parseInt(array[i])) 
        result += tmp
    }
    return result
}
