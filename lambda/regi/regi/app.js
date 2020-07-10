const AWS = require('aws-sdk');
const Auth = require('@octokit/auth')
const https = require('https')
const axios = require('axios')
const bucketName = process.env.BUCKET_NAME
const dynamo = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1'})
const s3 = new AWS.S3()

exports.lambdaHandler = async (event, context) =>{
    const body = JSON.parse(event.body)
    const code = body.githubCode
    const hostname = body.hostname
    const installationId= body.installationId
    let clientId = null
    let clientSecret = null
    let appId = null
    let fileName = null
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
    console.log(code, installationId, 'code')
    let isReturn = false
    let response
    let latest_token
    let repos
    // check code and get token
    const key = await getKey(bucketName, fileName)
    console.log(2)
    const auth = Auth.createAppAuth({
        id: appId,
        privateKey: key,
        installationId: installationId,
        clientId: clientId,
        clientSecret: clientSecret,
    })
    const oAuth = await Auth.createOAuthAppAuth({
        clientId: clientId,
        clientSecret: clientSecret,
        code: code,
    })
    await oAuth({type: 'token'})
    .then( async (token) => {
        console.log(3, token)
        latest_token = token.token
    } )
    .catch( err => {
        console.log(err)
    } )
    const userData = await requestUserInfo(latest_token)
    console.log(typeof(userData))
    console.log(userData.id)
    console.log(4, userData)
    await storeRegiInDB(userData.id.toString(), installationId, hostname)

    await auth({type: 'installation'})
    .then(async (token) => {
        console.log(token, 'token')
        token = token.token
        repos = await requestRepoList(token)
        console.log(5, repos)
    })
    .catch((err) => {
        console.log(6)
        console.log(err)
    })
    
    const options = {
        statusCode: 200,
        message: 'succeed',
        userData: userData,
        repos: repos
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

/*
async function storeCodeInDB(code, token){
    const params = {
        TableName: 'GithubAccount',
        Item: {
            code: code,
            token: token,
        }
    }
    await dynamo.put(params).promise()
}
*/

async function storeRegiInDB(id, installationId, hostname){
    const params = {
        TableName: 'GithubInfo',
        Item: {
            id: id,
            hostname: hostname,
            installationId: installationId,
        }
    }
    await dynamo.put(params).promise()
}

async function deleteCodeInDB(code){
    const params = {
        TableName: 'GithubAccount',
        Key:{
            code: code,
        }
    }
    await dynamo.delete(params).promise()
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

async function isExistUser(id){
    const params = {
        TableName: 'GithubInfo',
        Key:{
            id: id,
            hostname: hostname,
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
        console.log(repos)
    })
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

