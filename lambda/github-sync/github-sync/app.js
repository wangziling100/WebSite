const AWS = require('aws-sdk');
const Auth = require('@octokit/auth')
const https = require('https')
const axios = require('axios')
const bucketName = process.env.BUCKET_NAME
const dynamo = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1'})
const s3 = new AWS.S3()

exports.lambdaHandler = async (event, context) =>{
    const body = JSON.parse(event.body)
    console.log(body, 'body')
    const hostname = body.hostname
    const userId = body.userId
    let clientId = null
    let clientSecret = null
    let appId = null
    let fileName = null
    let result = null
    if (hostname==='localhost'){
        clientId = process.env.CLIENT_ID
        clientSecret = process.env.CLIENT_SECRET
        appId = process.env.APP_ID
        fileName = process.env.FILE_NAME
    }
    else if (hostname==='wangxingbo.now.sh'){
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
    const [ existUser, installationId ] = await isExistUser(userId.toString(), hostname)
    let auth = null
    if (!existUser) return 
    const key = await getKey(bucketName, fileName)
    //console.log(2)
    auth = Auth.createAppAuth({
        id: appId,
        privateKey: key,
        installationId: installationId,
        clientId: clientId,
        clientSecret: clientSecret,
    })
    //console.log(installationId, 'installationId')
    const token = await getToken(auth)
    //console.log(token, 'installation token')
    const repo = body.repo
    const owner = body.userName
    let [ githubIssues, githubMilestones ] = await queryInLoop(token, repo, owner, 100)
    console.log(githubIssues.length, githubMilestones.length, '# github data1')
    githubIssues = validFilter(githubIssues)
    githubMilestones = validFilter(githubMilestones)
    console.log(githubIssues.length, githubMilestones.length, 'issue, milestone, after valid filter')
    //let local = local2Item(body.list)
    let local = validLocalFilter(body.list)
    console.log(local.length, '# local data')

    //const dataFromGithub = await requestAllGithubData(token, repo, owner)
    //const listFromGithub = allGithubData2List(dataFromGithub, )
    //analyseAllData(dataFromGithub)
    console.log(githubIssues.length, githubMilestones.length, 'data from github')
    //console.log(githubMilestones, 'milestones from github')
    const [uploadCreate, uploadUpdate, downloadCreate, downloadUpdate] = compareData(local, githubIssues, githubMilestones)
    //console.log(download, 'download')
    const returnData = {
        uploadCreate: uploadCreate,
        uploadUpdate: uploadUpdate,
        downloadCreate: downloadCreate,
        downloadUpdate: downloadUpdate,
    }
    //TODO check failures
    
    const options = {
        statusCode: 200,
        statusText: 'OK',
        message: 'succeed',
        data: returnData,
    }
    response = setResponse(options)
    return response

}

async function isExistCodeInDB(code){
    const params = {
        TableName: 'GithubAccount',
        Key:{
            code: code,
        }
    }
    let result
    await dynamo.get(params).promise()
    .then(obj => {
        if (obj.Item===undefined) result = false
        else result = true
    })
    .catch(err => {
        console.log(err)
    })
    return result

}



function setResponse(options){
    statusCode = options.statusCode
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
            hostname: hostname,
        }
    }
    let result = [false, null]
    await dynamo.get(params).promise()
    .then(obj => {
        if (obj.Item===undefined) {
            result = [false, null]
        }
        else {
            const installationId = obj.Item.installationId
            result = [true, installationId]
        }
    })
    .catch(err => {
        console.log(err)
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
    .then((res) => {
        //console.log(res)
        const repos = res.data.repositories
        result = getRepoList(repos)
        //console.log(repos)
    })
    return result
}

function extractItemId(item){
    let ret
    if (item.itemType==='issue') {
        let [attrs, content] = item.body.split('\n')
        //console.log(attrs, 'attrs of issue')
        //console.log(content, 'content of issue')

        attrs = JSON.parse(attrs)
        ret = attrs.itemId

        //ret = JSON.parse(item.body).itemId
    }
    else if (item.itemType==='milestone') {
        //console.log(item, 'milestone')
        ret = JSON.parse(item.description).itemId
    }
    return ret
}

function extractItemVersion(item){
    let ret
    if (item.itemType==='issue'){
        let [attrs, content] = item.body.split('\n')
        ret = JSON.parse(attrs).version
    }
    else if (item.itemType==='milestone'){
        ret = JSON.parse(item.description).version
    }
    return ret
}

async function queryInLoop(token, repo, owner, unit=100){
    let stopSearchIssue = false
    let stopSearchMilestone = false
    let condition 
    let queryTimes = 0
    let returnIssues = []
    let returnMilestones = []
    while (!stopSearchIssue || !stopSearchMilestone){
        const dataFromGithub = await requestAllGithubData(token, repo, owner, condition, unit)
        let issues, milestones
        condition = {}
        //console.log(dataFromGithub, 'data form github')
        const [a, b, c, d] = analyseAllData(dataFromGithub, queryTimes, unit)

        issues = a
        milestones = b
        stopSearchIssue = c
        stopSearchMilestone = d
        console.log('stop search issue milestone', c, d)
        returnIssues = returnIssues.concat(issues)
        returnMilestones = returnMilestones.concat(milestones)

        queryTimes++

        if(!stopSearchIssue){
            const firstCursor = issues[unit-1].cursor
            const secondCursor = issues[unit].cursor
            condition['A'] = 'first: ' + unit + ', after: "'+firstCursor +'"'
            condition['B'] = 'last: ' + unit + ', before: "'+secondCursor +'"'
        }
        else{
            condition['A'] = `first 0`
            condition['B'] = condition.A
        }
        if(!stopSearchMilestone){
            const firstCursor = milestones[unit-1].cursor
            const secondCursor = milestones[unit].cursor
            condition['C'] = 'first: ' + unit + ', after: "'+firstCursor + '"'
            condition['D'] = 'last: ' + unit + ', before: "'+secondCursor + '"'
        }
        else{
            condition['C'] = `first: 0`
            condition['D'] = condition.C
        }


    }
    //console.log(queryTimes, 'query times')
    return [returnIssues, returnMilestones]
}


async function requestAllGithubData(token, repo, owner, condition, unit=100){
    const baseUrl = 'https://api.github.com/graphql'
    defaultCondition = {
        A: 'first: ' + unit,
        B: 'last: ' + unit,
        C: 'first: ' + unit,
        D: 'last: ' + unit,
    }
    condition = condition || defaultCondition
    //console.log(condition, 'condition')
    const query = `
        query ItemQuery($repo: String!, $owner: String!) {
          rateLimit {
            limit
            cost
            remaining
          }
          repository(name: $repo, owner: $owner) {
            id
            A: issues(`+condition.A+`) {
              edges {
                node {
                  id
                  author {
                    login
                  }
                  body
                  title
                  url
                  number
                  state
                  assignees(first: 10) {
                    edges {
                      node {
                        login
                      }
                    }
                  }
                }
                cursor
              }
              totalCount
            }
            B: issues(`+condition.B+`) {
              edges {
                node {
                  id
                  author {
                    login
                  }
                  body
                  title
                  url
                  number
                  state
                  assignees(first: 10) {
                    edges {
                      node {
                        login
                      }
                    }
                  }
                }
                cursor
              }
              totalCount
            }
            C: milestones(`+condition.C+`) {
              edges {
                cursor
                node {
                  description
                  dueOn
                  id
                  number
                  title
                  state
                  creator{
                      login
                  }
                }
              }
              totalCount
            }
            D: milestones(`+condition.D+`) {
              edges {
                cursor
                node {
                  description
                  dueOn
                  id
                  number
                  title
                  state
                  creator {
                      login
                  }
                }
              }
            }
          }
        }
        
    `
    const variables = {
        "repo": repo,
        "owner": owner,
    }
            
    const test = `query($numOfRepos:Int!) { 
        viewer{
            name
            repositories(last:$numOfRepos){
                nodes{
                    name
                }
            }
        } 
    }
    
    `
    let postData = {
        query: query,
        variables: variables
    }
    postData = JSON.stringify(postData)
    result = await sendPostRequest(token, baseUrl, postData) 
    result = result.data
    return result
}

function analyseAllData(all, queryTimes=0, unit=100){
    let stopSearchIssue = true
    let stopSearchMilestone = true
    //const rateLimit = all.data.rateLimit
    let numIssue = all.data.repository.A.totalCount - queryTimes*2*unit
    let numMilestone = all.data.repository.C.totalCount -queryTimes*2*unit
    numIssue = numIssue<0?0:numIssue
    numMilestone = numMilestone<0?0:numMilestone
    console.log(numIssue, numMilestone, 'issue, milestone, count')

    const A = all.data.repository.A.edges
    const B = all.data.repository.B.edges
    const C = all.data.repository.C.edges
    const D = all.data.repository.D.edges
    let issues = []
    let milestones = []
    if (numIssue<=unit) {
        issues = A
        stopSearchIssue = true
    }
    else if (numIssue>unit && numIssue<=2*unit){
        let tmp = null
        if (numIssue===2*unit) tmp = B
        else tmp = B.slice(numIssue-unit)
        issues = A.concat(tmp)
        stopSearchIssue = true
    }
    else {
        issues = A.concat(B)
        stopSearchIssue = false
    }
    issues = githubItem2Item(issues, 'issue')
    issues = [...new Set(issues)]
    if (numMilestone<=unit){
        milestones = C
        stopSearchMilestone = true
    }
    else if (numMilestone>unit && numMilestone<=2*unit){
        let tmp = null
        if (numMilestone===2*unit) tmp = D
        else tmp = D.slice(numMilestone-unit)
        milestones = C.concat(tmp)
        stopSearchMilestone = true
    }
    else {
        milestones = C.concat(D)
        stopSearchMilestone = false
    }
    milestones = githubItem2Item(milestones, 'milestone')
    milestones = [...new Set(milestones)]
    //console.log(milestones.length, numMilestone, '# milestones')
    //console.log(milestones[0], 'milestones format')
    //console.log(issues[0], 'issue format')
    //console.log(stopSearchIssue, stopSearchMilestone, 'stop')
    return [issues, milestones, stopSearchIssue, stopSearchMilestone]

}

function validFilter(list){
    let ret = []
    for (let el of list){
        //console.log(el.creator)
        if (el.creator!=='test-app-wangziling100' &&
            el.creator!=='plan-schedule-system-netlify' &&
            el.creator!=='plan-schedule-system-vercel'){
            continue
        }
        if (el.title.substr(-9)==='(deleted)') continue
        try{
            const itemId = extractItemId(el)
            el['itemId'] = itemId
            if (itemId===undefined) continue
            //console.log(itemId)
        }
        catch (err){
            console.log(err, 'error')
            continue
        }
        ret.push(el)
    }
    return ret
}

function validLocalFilter(list){
    let ret = []
    for (let el of list){
        try{
            const itemId = extractItemId(el)
            el['itemId'] = itemId
            if (itemId===undefined) continue
        }
        catch {continue}
        ret.push(el)
    }
    return ret
}

function copy(data){
    let ret = []
    for (let el of data){ ret.push(el) }
    return ret
}

function compareData(local, githubIssues, githubMilestones){
    let uploadCreate = []
    let uploadUpdate = []
    let downloadCreate = []
    let downloadUpdate = []
    let issueCounter= initGCounter(githubIssues)
    let milestoneCounter = initGCounter(githubMilestones)
    console.log(local.length, githubIssues.length, githubMilestones.length, 'local issue milestone length')
    //console.log(milestoneCounter, 'milestoneCounter')
    for (let l of local){
        const lItemId = l.itemId
        const lVersion = new Date(l.version).getTime()
        let setContinue = false
        let isLInG = true
        if (l.itemType==='issue'){
            for (let index in githubIssues){
                const gItemId = githubIssues[index].itemId
                let gVersion = extractItemVersion(githubIssues[index])
                gVersion = new Date(gVersion).getTime()
                if (lItemId===gItemId && lVersion===gVersion){
                    //console.log('find it', l)
                    setContinue = true
                    delete issueCounter[index]
                    break
                } 
                else if (lItemId===gItemId && lVersion>gVersion){
                    l['option'] = 'update'
                    uploadUpdate.push(l)
                    delete issueCounter[index]
                    setContinue = true
                    break
                }
                else if (lItemId===gItemId && lVersion<gVersion){
                    l['option'] = 'update'
                    downloadUpdate.push(l)
                    delete issueCounter[index]
                    setContinue = true
                    break
                }
                if (lItemId===gItemId && lVersion!==gVersion){
                    console.log(lVersion, gVersion, 'versions')
                }
            }
        }
        
        if (setContinue) continue
        if (l.itemType==='milestone'){
            for (let index in githubMilestones){
                const gItemId = githubMilestones[index].itemId
                let gVersion = extractItemVersion(githubMilestones[index])
                gVersion = new Date(gVersion).getTime()
                if (lItemId===gItemId && lVersion===gVersion){
                    //console.log('find it', l)
                    setContinue = true
                    delete milestoneCounter[index]
                    break
                }
                else if (lItemId===gItemId && lVersion>gVersion){
                    l['option'] = 'update'
                    uploadUpdate.push(l)
                    delete milestoneCounter[index]
                    setContinue = true
                    break
                }
                else if (lItemId===gItemId && lVersion<gVersion){
                    l['option'] = 'update'
                    downloadUpdate.push(l)
                    delete milestoneCounter[index]
                    setContinue = true
                    break
                }
            }
        }
        
        if (setContinue) continue
        else {
            isLInG = false
            l['option'] = 'create'
            uploadCreate.push(l)
        }


    }
    //console.log(issueCounter, 'issueCounter')
    //console.log(milestoneCounter, 'milestoneCounter')

    for (let key in issueCounter){
        downloadCreate.push(issueCounter[key])
    }
    for (let key in milestoneCounter){
        downloadCreate.push(milestoneCounter[key])
    }

    //console.log(download[0], 'download data')
    console.log(uploadCreate.length, uploadUpdate.length, downloadCreate.length, downloadUpdate.length, 'upload download length')
    return [ uploadCreate, uploadUpdate, downloadCreate, downloadUpdate ]

    function initGCounter(items){
        let counter = {}
        for (let index in items){
            counter[index] = items[index]
        }
        return counter
    }
}


function getUserInfo(data){
    const userData = {
        name: data.login,
        id: data.id,
        avatar_url: data.avatar_url,
    }
    return userData
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

async function getToken(auth){
    let ret = null
    await auth({type: 'installation'})
    .then( (token) => {
        ret =token.token
    })
    .catch( (error) => {
        console.log(error)
    })
    return ret
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

function githubItem2Item(items, type){
    let ret = []
    if (type==='issue'){
        for (let item of items){
            const tmp = {
                cursor: item.cursor,
                id: item.node.id,
                creator: item.node.author.login,
                body: item.node.body,
                title: item.node.title,
                url: item.node.url,
                number: item.node.number,
                state: item.node.state,
                assignees: item.node.assignees.edges,
                itemType: 'issue',
            }
            ret.push(tmp)
        }
    }

    else if (type==='milestone'){
        for (let item of items){
            const tmp = {
                cursor: item.cursor,
                id: item.node.id,
                dueOn: item.node.dueOn,
                description: item.node.description,
                number: item.node.number,
                title: item.node.title,
                state: item.node.state,
                itemType: 'milestone',
                creator: item.node.creator.login,
            }
            ret.push(tmp)
        }
    }
    
    return ret
}

function local2Item(local){
    for (let el of local){
        if (local.itemType==='issue'){
            continue
        }
        //console.log(el, 'milestone')
    }
    return local
}

function bin2String(array) {
    var result = ""
    for (let i=0; i<array.length; i++){
        const tmp = String.fromCharCode(parseInt(array[i])) 
        result += tmp
    }
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
