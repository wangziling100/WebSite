const AWS = require('aws-sdk');
const s3 = new AWS.S3()
const Auth = require('@octokit/auth')
const https = require('https')

const bucketName = process.env.BUCKET_NAME
const axios = require('axios')
const dynamo = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1'})

exports.lambdaHandler = async (event, context) =>{
    const body = JSON.parse(event.body)
    const code = body.githubCode
    const previousCode = body.previousCode
    const hostname = body.hostname
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
    else if (hostname === 'wangxingbo.now.sh'){
        clientId = process.env.CLIENT_ID_VERCEL
        clientSecret = process.env.CLIENT_SECRET_VERCEL
        appId = process.env.APP_ID_VERCEL
        fileName = process.env.FILE_NAME_VERCEL
    }
    else if (hostname === 'wangxingbo.netlify.app'){
        clientId = process.env.CLIENT_ID_NETLIFY
        clientSecret = process.env.CLIENT_SECRET_NETLIFY
        appId = process.env.APP_ID_NETLIFY
        fileName = process.env.FILE_NAME_NETLIFY
    }
    let isReturn = false
    let response
    let latest_token
    let repos = null
    let userData = null
    // check code and get token
    if ( await isExistCodeInDB(code)){
        const options = {
            statusCode: 200,
            message: 'exist',
        }
        const response = setResponse(options)
        return response
    } 
    const auth = Auth.createOAuthAppAuth({
        clientId: clientId,
        clientSecret: clientSecret,
        code: code,
    })
    await auth({type: 'token'})
    .then(async (token) => {
        await storeCodeInDB(code, token.token)
        if (previousCode!==undefined) await deleteCodeInDB(previousCode)
        latest_token = token.token

        
    })
    .catch((err) => {
        const options = {
            statusCode: 400,
            message: 'error',
        }
        response = setResponse(options)
        isReturn = true
    })
    if (isReturn) return response

    // user identity
    
    userData = await requestUserInfo(latest_token)
    const [ registered, installationId ] = await isExistUser(userData.id.toString(), hostname)

    if (!registered) {repos=null}
    else {
	    const key = await getKey(bucketName, fileName)
        const aAuth = Auth.createAppAuth({
            id: appId,
            privateKey: key,
            installationId: installationId,
            clientId: clientId,
            clientSecret: clientSecret,
        })
 	// fetch repo data
        await aAuth({type: 'installation'})
        .then(async (token) => {
            token = token.token
            repos = await requestRepoList(token)
        })
        .catch((err) => {
            console.log(err)
        })

    }

    const options = {
        statusCode: 200,
        message: 'succeed',
        userData: userData,
        repos: repos,
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
    .then( (obj) => {
        if (obj.Item===undefined) result = false
        else result = true
    })
    .catch((err) => {
        console.log(err)
    })
    return result

}

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
    const statusCode = options.statusCode
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
