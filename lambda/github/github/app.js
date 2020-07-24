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
    //console.log(body, 'body')
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

    //console.log(1)
        
    //console.log(existUser, installation)
    if (body.list===undefined){
        //console.log('single process')
        const option = body.option
        result  = await tmpFunc(option, body, body.userName, body.repo, body.number, itemType)
        const statusCode = result.statusCode
        // generate milestone with comment issue
        if (statusCode<300 && itemType==='milestone' && option==='create'){
            const milestoneNum = result.data.number
            const milestoneUrl = result.data.url
            const milestoneContent = extractContentFromMilestone(body)
            const commentIssue = genCommentIssue(milestoneNum, milestoneUrl, milestoneContent, 'active')
            // create associated issue
            const result2 = await tmpFunc('create', commentIssue, body.userName, body.repo, null, 'issue')
            //console.log(result2, 'result2')
            const tmpData = {
                issueNumber: result2.data.number,
                url: result2.data.url
            }
            newMilestone = updateMilestoneDescription(body, tmpData)
            // update milestone with adding url
            result = await tmpFunc('update', newMilestone, body.userName, body.repo, milestoneNum, 'milestone')
            result = resultFusion(result, result2)
        }

        // update milestone with comment issue
        else if (statusCode<300 && itemType==='milestone' && option==='update'){
            const milestoneNum = result.data.number
            const milestoneUrl = result.data.url
            const milestoneContent = extractContentFromMilestone(body)
            const commentIssue = genCommentIssue(milestoneNum, milestoneUrl, milestoneContent, body.state)
            // update the associated issue
            const result2 = await tmpFunc('update', commentIssue, body.userName, body.repo, body.issueNumber, 'issue')
            //console.log(result2, 'result2')
            result = resultFusion(result, result2)
        }

        // delete milestone with comment issue
        else if (statusCode<300 && itemType==='milestone' && option==='delete'){
            const milestoneNum = body.number
            const milestoneUrl = 'deleted'
            const milestoneContent = extractContentFromMilestone(body)
            const commentIssue = genCommentIssue(milestoneNum, milestoneUrl, milestoneContent, 'completed')
            // update the associated issue
            const result2 = await tmpFunc('delete', commentIssue, body.userName, body.repo, body.issueNumber, 'issue')
            //console.log(result2, 'result2')
        }

        // update milestone completeness
        else if (statusCode<300 && itemType==='issue' && body.milestone!==undefined && body.milestone!==null){
            console.log(result, 'update milestone completeness')
            const milestoneNum = body.milestone
            const tmpBody = {
                option: 'fetch',
            }
            const milestoneData = await tmpFunc('fetch', tmpBody, body.userName, body.repo, milestoneNum, 'milestone')
            const open_issues = milestoneData.data.open_issues
            const closed_issues = milestoneData.data.closed_issues
            console.log(milestoneData, 'fetch milestone')
            const tmpResult1 = result
            const tmpResult2 = {
                statusCode: 200,
                statusText: 'OK',
                data: {
                    completeness: calcCompleteness(open_issues, closed_issues),
                    itemType: 'milestone',
                    number: milestoneNum,
                }
            }
            const tmpResultData = [tmpResult1.data, tmpResult2.data]
            result = {
                StatusCode: tmpResult1.StatusCode,
                statusText: tmpResult1.statusText,
                data: tmpResultData
            }


        }
    }
    else if (body.list!==undefined){
        console.log('list process')
        let list = body.list
        let tmpList = []
        let dataList = []
        let completenessResult = null
        for (let request of list){
            const option = request.option
            const itemType = request.itemType
            const tmp = await tmpFunc(option, request, body.userName, body.repo, request.number, itemType)
            if (tmp.statusCode<300) tmpList.push(tmp)
            else {
                response = setResponse(tmp)
                return response
            }
            if (tmp.statusCode<300 && option==='delete' && itemType==='issue' && request.milestone!==undefined && request.milestone!==null){
                console.log(tmp, 'update milestone completeness')
                const milestoneNum = request.milestone
                const tmpBody = {
                    option: 'fetch',
                }
                const milestoneData = await tmpFunc('fetch', tmpBody, body.userName, body.repo, milestoneNum, 'milestone')
                const open_issues = milestoneData.data.open_issues
                const closed_issues = milestoneData.data.closed_issues
                console.log(milestoneData, 'fetch milestone')
                completenessResult = {
                    statusCode: 200,
                    statusText: 'OK',
                    data: {
                        completeness: calcCompleteness(open_issues, closed_issues),
                        itemType: 'milestone',
                        number: milestoneNum,
                    }
                }
            }
        }
        
        result = {
            statusCode: 200,
            statusText: 'OK',
            list: tmpList,
            completenessResult: completenessResult,
        }
    }
    //console.log(4, result)
    
    response = setResponse(result)
    //console.log(5, response)
    return response

    async function tmpFunc(option, body, userName, repo, number, itemType){
        //console.log(itemType, 'itemType')
        let result = null
        switch (option){
            case 'create':
                if (itemType==='milestone'){
                    //console.log(2)
                    data = {
                        title: body.title,
                        description: body.description
                    }
                    action = (token) => createMilestone(token, data, userName, repo)
                    postProcess = (data) => getMilestone(data)
                }
                if (itemType==='issue'){
                    //console.log(2, '---------------issue')
                    data = {
                        title: body.title,
                        body: body.body,
                        assignees: body.assignees,
                    }
                    if (body.milestone!==undefined && body.milestone!==null) {
                        data['milestone'] = body.milestone
                    }
                    if (body.labels!==undefined && body.labels!==null){
                        data['labels'] = body.labels
                    }
                    action = (token) => createIssue(token, data, userName, repo)
                    postProcess = (data) => getIssue(data, option)
                }

                break;
            case 'fetch':
                if (itemType==='milestone'){
                    action = (token) => fetchMilestone(token, userName, repo, number)
                    postProcess = (data) => getMilestone(data, body.option)
                }
                break;
            case 'delete':
                if (itemType==='milestone'){
                    //console.log(2.2)
                    action = (token) => deleteMilestone(token, userName, repo, number)
                    postProcess = (data) => getMilestone(data, body.option)
                }
                else if (itemType==='issue'){
                    //console.log(2.2)
                    data = {
                        title: body.title+'(deleted)',
                        state: 'closed',
                        body: body.body
                    }
                    //console.log(data, body, 'delete') 
                    //data.body['isDeleted'] = true
                    action = (token) => deleteIssue(token, data, userName, repo, number)
                    postProcess = (data) => getIssue(data, option)
                }
                break
            case 'update':
                if (itemType==='milestone'){
                    //console.log(2.3)
                    data = {
                        title: body.title,
                        state: body.state==='active'? 'open': 'closed',
                        description: body.description,
                    }
                    action = (token) => updateMilestone(token, data, userName, repo, number)
                    postProcess = (data) => getMilestone(data)
                }
                if (itemType==='issue'){
                    //console.log(2.3)
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
                    postProcess = (data) => getIssue(data, option)
                }

        }
        await auth({type: 'installation'})
        .then(async (token) => {
            //console.log(3, token)
            token = token.token
            result = await action(token)
            //console.log('tmp func', result)

            result = postProcess(result)
        })
        .catch((error) => {
            console.log(error, 'error')
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
    //console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function deleteMilestone(token, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl+'/repos/'+owner+'/'+repo+'/milestones/'+number
    //console.log(url)
    const result = await sendDeleteRequest(token, url)
    return result
    
}


async function updateMilestone(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/milestones/'+number
    //console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function fetchMilestone(token, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/milestones/'+number
    const result = await sendGetRequest(token, url)
    return result
}

async function deleteIssue(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl+'/repos/'+owner+'/'+repo+'/issues/'+number
    //console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}
async function createIssue(token, data, owner, repo){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/issues'
    //console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function updateIssue(token, data, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/issues/'+number
    //console.log(url)
    const result = await sendPostRequest(token, url, data)
    return result
}

async function fetchIssue(token, owner, repo, number){
    const baseUrl = 'https://api.github.com'
    const url = baseUrl + '/repos/'+owner+'/'+repo+'/issues/'+number
    const result = await sendGetRequest(token, url)
    return result
}

async function sendGetRequest(token, url){
    let result = null
    await axios.get(url, {
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
    if (option === 'create' || option==='update'){
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
    else if (option==='fetch'){
        tmpData={
            open_issues: data.data.open_issues,
            closed_issues: data.data.closed_issues,
            due_on: data.data.due_on,
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
    if (option === 'create' || option==='update'){
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

function genCommentIssue(milestoneNum, milestoneUrl, milestoneContent, state){
    const body = '## Title: ' + milestoneContent.title + '\n' + milestoneUrl + '\n' + milestoneContent.content

    const commentIssue= {
        title: 'Comment area for idea ' + milestoneNum,
        body: body,
        labels: ['documentation'],
        state: state || 'active',
    }
    //console.log(commentIssue, 'commentIssue')
    return commentIssue
}

function extractContentFromMilestone(milestone){
    //console.log(milestone, 'extract content from milestone')
    const description = JSON.parse(milestone.description)
    const content = {
        title: milestone.title,
        content: description.content,
    }
    //console.log(content, 'milestone content')
    return content
}

function resultFusion(milestone, issue){
    milestone.data['url'] = issue.data.url
    milestone.data['issueNumber'] = issue.data.number
    return milestone
}

function updateMilestoneDescription(milestone, obj){
    let description = JSON.parse(milestone.description)
    for (let index  in obj){
        description[index] = obj[index]
    }
    milestone.description = JSON.stringify(description)
    //console.log(milestone, 'update milestone description')
    return milestone
}

function calcCompleteness(open, closed){
    return(closed/(closed+open))
}
