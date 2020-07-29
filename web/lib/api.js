import { GraphQLClient } from "graphql-request"; 
const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = process.env.NEXT_EXAMPLE_CMS_DATOCMS_API_TOKEN
import React, { useRef, useState, useEffect } from 'react'
import Router from 'next/router'
import { deleteValueFromArray, flat,getQueryVariable } from '../lib/tools'
import { setPageStatus } from '../lib/sessionData'

// See: https://www.datocms.com/blog/offer-responsive-progressive-lqip-images-in-2020
const responsiveImageFragment = `
  fragment responsiveImageFragment on ResponsiveImage {
  srcSet
    webpSrcSet
    sizes
    src
    width
    height
    aspectRatio
    alt
    title
    bgColor
    base64
  }
`
export function request({ query, variables, preview }){
  const endpoint = API_URL + (preview ? '/preview' : '')
  const client = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${API_TOKEN}`
    }
  });
  return client.request(query, variables)

}

export async function getImageByReference( ref, preview=false ){
  const IMAGE_QUERY = `
    query Image($ref:String){
      picture(filter: {ref: {eq: $ref}}){
        ref
        title
        image{
          responsiveImage{
            ...responsiveImageFragment
          }
        }
      }
    }
  ${responsiveImageFragment}

  `
  const data = await request({
    query: IMAGE_QUERY,
    variables: {"ref": ref},
    preview: preview
  });
  return data.picture
}

export async function getItemByReference( ref, preview=false ){
  const ITEMS_QUERY = `
    query Items($ref:String){
      allItems(filter: {ref: {eq: $ref}}){
        id
        ref
        refId
        title
        content
        tag
        owner
        contributor
        priority
        completeness
        itemStatus
        _createdAt
        evaluation
        allowPriorityChange
        version
        layer
        parents
        target
        difficulty
        endDate
        urgency
        duration
        period
        planType
        itemId
        url
        number
        issueNumber
        createdAt1
        itemType1
      }
    }
  `
  const data = await request({
    query: ITEMS_QUERY, 
    variables: {"ref": ref},
    preview: preview
  });
  return data.allItems
}

export async function getBlogByReference( ref, preview=false ){
  const BLOG_QUERY = `
    query Blog($ref:String){
      blog(filter: {ref: {eq: $ref}}){
        ref
        title
        content
      }
    }
  `
  const data = await request({
    query: BLOG_QUERY, 
    variables: {"ref": ref},
    preview: preview
  });
  return data.blog
}

export async function getVersion(preview=false){
    const VERSION_QUERY = `
        query Version{
            version{
                idea
                plan
                id
            }
        }

    `
    const data = await request({
        query: VERSION_QUERY,
        variables: {},
        preview: preview
    })
    return data.version
}


export function setServerRequestOptions(exHost, exPath, method='POST', isTest=false){
    let host
    let port
    let route
    let https
    if (isTest){
        host = 'localhost'
        port = 4000
        route = '/' + exPath
        https = require('http')
    }
    else{
        host = exHost
        route = '/Prod/'+exPath
        port = null
        https = require('https')
    }
    const options = {
        hostname: host,
        port: port,
        path: route,
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        }
    }
    return [options, https]
}

export async function sendRequest(options, https, postData, afterAction){
    console.log('send request')
    setPageStatus('pending')
    const timerId = setTimeout(setPageStatus('normal'), '5000')
    let req = https.request(options, (res) => {
        res.setEncoding('utf8')
        let body = []
        res.on('data', (chunk) => {
            console.log('chunk', chunk)
            body.push(chunk)
        })
        res.on('end', () => {
            console.log('body', body)
            if (body.length===0) return
            body = body.join('').toString()
            body = JSON.parse(body)
            console.log('response', body)
            afterAction && afterAction(body)
        })
    }).on('error',(e) => {
        console.log('Got error: ', e)
        afterAction && afterAction(null)
    })
    console.log(postData, 'send request')
    await req.write(postData)
    await req.end()
    setPageStatus('normal')
    clearTimeout(timerId)

}

export async function sendGithubCode(code, isTest, updateFunction){
    const host = 'ukp35adj20.execute-api.eu-central-1.amazonaws.com'
    const path = 'auth'
    const postData = JSON.stringify(code)
    const [options, https] = setServerRequestOptions(host, path, 'POST', isTest)
    const afterAction = (newData) => {
        const message = newData?.message
        const userData = newData?.userData
        const repos = newData?.repos
        if (message === undefined || message === null) return
        let password
        if (newData.message!=='error'){
            let repoName = null
            let repoId = null
            if (repos!==null){
                repoName = repos[0]?.repoName|| null
                repoId = repos[0]?.repoId || null
            }
            
            if (repoId!==null) {
                password = 'github_'+userData.id+'_'+repoId
            }
            else password = 'github_'+userData.id
            writeData({
                loginStatus: 'github_login',
                userData: userData,
                repos: repos,
                userPassword: password,
                selectedRepo: 0,
            })
            writeLocalGlobal({
                githubCode: code.githubCode,
            })
            createNewUser(password)
        }
        else {
            writeData({
                loginStatus: 'logout',
                userData: null,
                repos: null,
                selectedRepo: null,
            })
        }
        updateFunction(password)
    }
    const result = await sendRequest(options, https, postData, afterAction)
}

export async function sendGithubRegi(code, isTest, updateFunction){
    const host = '531yewov75.execute-api.eu-central-1.amazonaws.com'
    const path = 'regi'
    const postData = JSON.stringify(code)
    const [options, https] = setServerRequestOptions(host, path, 'POST', isTest)
    const afterAction = (newData) => {
        const message = newData?.message
        const userData = newData?.userData
        const repos = newData?.repos
        if (message === undefined || message === null) return
        let password
        if (newData.message!=='error'){
            const repoId = repos[0]?.repoId || null
            const repoName = repos[0]?.repoName || null
            if (repoId!==null){
                password = 'github_'+userData.id+'_'+repoId
            }
            else password = 'github_'+userData.id
            writeData({
                loginStatus: 'github_login',
                userData: userData,
                repos: repos,
                userPassword: password,
                selectedRepo: 0,
            })
            writeLocalGlobal({
                githubCode: code.githubCode,
            })
            createNewUser(password)
        }
        else {
            writeData({
                loginStatus: 'logout',
                userData: null,
                repos: null,
                selectedRepo: null,
            })
        }
        updateFunction(password)
    }
    const result = await sendRequest(options, https, postData, afterAction)
}

export async function sendData(data, isTest, refreshAction, refresh=false){
    if (data instanceof Array){
        data = {data: data}
    }

    const postData = JSON.stringify(data)
    let host
    let port
    let route
    let https
    if (isTest){
        host = 'localhost'
        port = 4000
        route = '/push'
        https = require('http')
    }else{
        host = '0eaw1uy00c.execute-api.eu-central-1.amazonaws.com'
        route = '/Prod/push'
        port = 443
        https = require('https')
    }
    const options = {
        hostname: host,
        port: port,
        path: route,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        }
    }
    let req = https.request(options, (res) => {
        res.setEncoding('utf8')
        let body = []
        res.on('data', (chunk) => {
            //console.log('Response: '+chunk)
            body.push(chunk)
            /*
            if (refresh) {
                //window.location.reload()
                refreshAction && refreshAction(JSON.parse(chunk))
            }
            */
        })
        res.on('end', () => {
            if (body.length===0) return
            body = body.join('').toString()
            body = JSON.parse(body)
            if (refresh){
                refreshAction && refreshAction(body)
            }
        })
    }).on('error',(e) => {
        console.log('Got error: ', e)
        if( refresh ){
            refreshAction && refreshAction(null)
        }
    })
    await req.write(postData)
    await req.end()

}

export async function rebuild( password, isTest ){
    const data = {password: password}
    const postData = JSON.stringify(data)
    let host
    let port
    let route
    let https
    if (isTest){
        host = 'localhost'
        port = 4000
        route = '/build'
        https = require('http')
    }else{
        host = 'kjpx86xbu1.execute-api.eu-central-1.amazonaws.com'
        route = '/Prod/build'
        port = 443
        https = require('https')
    }
    const options = {
        hostname: host,
        port: port,
        path: route,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        }
    }
    let req = https.request(options, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            // do something 
        })
    }).on('error', (e) => {
        console.log('Got error: ', e)
    })
    await req.write(postData)
    await req.end()
}

export function getItemList(list, setFunction){
    let result
    useEffect(() => {
        result = sessionStorage.getItem(list)
        if (result === "") result = {}
        else result = JSON.parse(result)
        setFunction(result)
    }, [result])
}

export function setItem(list, obj){
    let result
    useEffect(() => {
        result = sessionStorage.getItem(list)
        result = JSON.parse(result) || {}
        for (let key in obj){
            if (obj[key]===undefined) continue
            result[key] = obj[key]
        }
        sessionStorage.setItem(list, JSON.stringify(result))
    }, [obj])
}

export function createNewUser(password){
    //const isIntegrity = checkUserIntegrity(password)
    //console.log(isIntegrity, 'integrity')
    //if (isIntegrity) return false
    let [existRecord, localUser] = checkRecord('local user')
    if (!existRecord) localUser = {data: []}
    const userExist = checkUser(password)
    if (!userExist) {
        localUser.data.push(password)
        localStorage.setItem('local user', JSON.stringify(localUser))
    }
    initAccount(password)
    return true
}

export function checkUser(password){
    //console.log(password, 'checkUser')
    if (password === '') return false
    let localUser = localStorage.getItem('local user')
    localUser = JSON.parse(localUser)
    if (localUser?.data===undefined) return false
    const exist = localUser.data.includes(password)
    return exist

}

function checkRecord(recordName){
    // return [existRecord, record]
    let record = localStorage.getItem(recordName)
    if (record==='') return [false, null]
    record = JSON.parse(record)
    if (record===undefined||record===null) return [false, null]
    return [true, record]
}

function checkUserIntegrity(password){
    const userExist = checkUser(password)
    if (!userExist) return false
    // record means all records in one page
    const recordNames = getAllRecoredNames(password)
    for (let name of recordNames){
        const recordExist = checkRecord(name)
        if (!recordExist) return false
    }
    return true
}

export function writeLocal(page, password, data){
    // data is an Object
    const recordName = page+'_'+password
    const existUser = checkUser(password)

    if (!existUser) return [false, null]

    let [ existRecord, record ] = checkRecord(recordName)

    if (!existRecord){
        record = {}
    } 

    for (let key in data){
        record[key] = data[key]
    }
    //console.log(recordName, record, 'write local')
    localStorage.setItem(recordName, JSON.stringify(record))
    return [true, record]
}

export function writeLocalGlobal(data){
    const recordName = 'global'
    let [ existRecord, record ] = checkRecord(recordName)
    if (!existRecord) record = {}
    for (let key in data){
        record[key] = data[key]
    }
    localStorage.setItem(recordName, JSON.stringify(record))
    return [true, record]
}


export function readLocal(page, password){
    // return [existRecord, record]
    const recordName = page+'_'+password
    const existUser = checkUser(password)
    if (!existUser) return [false, null]
    const [ existRecord, record ] = checkRecord(recordName)
    if (!existRecord) return {}
    return record
}

function readLocalGlobal(){
    const recordName = 'global'
    const [ existRecord, record ] = checkRecord(recordName)
    if (!existRecord) return {}
    return record
}

export function readAllLocalBusiness(password){
    let all = {}
    const ideaItems = readLocal('idea', password)
    all['idea'] = ideaItems.ideaItem
    const planLayers = readLocal('plan', password)
    const tmp = []
    for (let el of flat(planLayers.layers)){
        if (el.planType===0){
            tmp.push(el)
        }
    }
    all['plan'] = tmp
    
    return all

}

export function getItem(persistentData, setFunction, key){
    useEffect(() =>{
        if (persistentData!==undefined && persistentData){
            setFunction(persistentData[key])
        }
    }, [persistentData])
}

export function getHostname(setFunction){
    let hostname 
    useEffect(()=>{
        hostname = window.location.hostname
        setFunction(hostname)
    },[hostname])
}

export function toItemFormat(data){
    if (data.origin_content!==undefined){
        data.content = data.origin_content
    }
    const tmp = {
        id: data.id,
        ref: data.ref,
        refId: data.refId,
        title: data.title,
        content: data.content,
        tag: data.tag,
        owner: data.owner,
        contributor: data.contributor,
        priority: data.priority,
        completeness: data.completeness,
        itemStatus: data.itemStatus,
        _createdAt: data._createdAt,
        createdAt: data.createdAt || null,
        evaluation: data.evaluation,
        allowPriorityChange: data.allowPriorityChange,
        version: data.version,
        layer: data.layer,
        parents: data.parents,
        target: data.target,
        difficulty: data.difficulty,
        urgency: data.urgency,
        endDate: data.endDate,
        duration: data.duration,
        period: data.period,
        planType: data.planType,
        itemId: data.itemId,
        option: data.option,
    }
    return tmp
}

export function useRedirect(redirectPage, page){
    useEffect(() => {
        if (redirectPage!==null && redirectPage!==undefined && redirectPage!==page){
            Router.push('/'+redirectPage)
            writeData({redirectPage: null})
        }
    }, [redirectPage])
}
export function useInterval(callback, delay ){
    const savedCallback = useRef()
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick(){
            savedCallback.current()
        }
        if (delay !== null){
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

export function useUserLocalStorage(password, data){
    useEffect(() => {

    }, [password, data])

}


export function readData(){
    let data = sessionStorage.getItem('data')
    data = JSON.parse(data)
    if (data===undefined || data===null) return {}
    return data
}

export function writeData(data){
    origin = readData()
    for (let key in data){
        origin[key] = data[key]
    }
    sessionStorage.setItem('data', JSON.stringify(origin))
}

export function useGithubLogin(page, redirectPage, isTest, updateFunction){
    function checkTimeout(){
        const data = readData()
        const loginStatus = data.loginStatus
        if (loginStatus === 'github_pending'){
            writeData({loginStatus: 'logout'})
            updateFunction()
        }
    }
    if (redirectPage!==null && redirectPage!==undefined && page!==redirectPage){

        updateFunction = () => {Router.push('/'+redirectPage)}
    }
    let loginStatus
    let code

    let timerId = null
    useEffect(() => {
        if (redirectPage!==null && redirectPage!==undefined){
            const data = readData()
            loginStatus = data.loginStatus
            //loginStatus = 'github_pending'
            if (loginStatus === 'github_pending') {
                timerId = setTimeout(checkTimeout, 30000)
                //let params = window.location.search
                //let result = params.match(/code=(.*)/)
                const code = getQueryVariable('code')
                const installationId = getQueryVariable('installation_id')
                //window.location.href = window.location.host+'/idea'
                //result = null
                if (code!==null && installationId===null){
                    const global = readLocalGlobal()
                    const previousCode = global.githubCode
                    if (code===previousCode){
                        Router.push('/idea')
                    }
                    // send new code
                    let hostname = window.location.host
                    hostname = hostname.split(':')[0]
                    const data = {
                        githubCode: code,
                        previousCode: previousCode,
                        hostname: hostname,
                    }
                    sendGithubCode(data, isTest, updateFunction)
                    Router.push('/idea')
                }
                else if(code!==null && installationId!==null){
                    let hostname = window.location.host
                    hostname = hostname.split(':')[0]
                    const data = {
                        githubCode: code,
                        installationId: installationId,
                        hostname: hostname,
                    }
                    sendGithubRegi(data, isTest, updateFunction)
                    Router.replace('/idea')
                }
                else{
                    writeData({
                        loginStatus: 'logout',
                        userData: null,
                        repos: null,
                    })
                }

            }
        }
    return (()=>{clearTimeout(timerId)})
    }, [loginStatus, code, redirectPage])
}

export function useUserPassword(userPassword, setUserPassword){
    useEffect(() => {
        if (userPassword===undefined){
            const data = readData()
            if (data?.userPassword===undefined){
                setUserPassword('')
            }else{
                setUserPassword(data.userPassword)
            }
        }
    }, [setUserPassword])
    useEffect(() => {
        writeData({userPassword: userPassword})
    }, [userPassword])
}

export function useAdminPassword(adminPassword, setAdminPassword){
    useEffect(() => {
        if (adminPassword===undefined){
            const data = readData()
            if (data?.adminPassword===undefined){
                setAdminPassword('')
            }else{
                setAdminPassword(data.adminPassword)
            }
        }
    }, [setAdminPassword])

    useEffect(() => {
        writeData({adminPassword: adminPassword})
    }, [adminPassword])
}

export function useLoadData(page, password, setData, setSessionData, dep, reload){
    useEffect(() => {
        if (password){
            //console.log('load data')
            const data = readLocal(page, password)
            setData(data)
        }
    }, [password, reload])
    useEffect(() => {
        const sessionData = readData()
        setSessionData(sessionData)
    }, [password].concat(dep))
}


export function useUpdateData(page, password, data, dep){
    
    useEffect(() => {
        //console.log(canUpdateFunc(), 'can update')
        if (!canUpdateFunc()){
            //console.log("can't update")
            setCanUpdate(true)
        }
        else if (password){
            writeLocal(page, password, data)
        }
    }, dep)
}

export function setCanUpdate(value){
    //console.log('set can update:', value)
    writeData({canUpdate: value})
    //console.log(canUpdateFunc(), 'after set can update')
}

function canUpdateFunc(){
    const sessionData = readData()
    //console.log(sessionData, 'can update func')
    if (sessionData.canUpdate===undefined) return true
    const canUpdate = sessionData.canUpdate
    //console.log(canUpdate, sessionData.canUpdate, 'can update after')
    return canUpdate
}
function initAccount(password){
    // idea
    {
        const name = 'idea_' + password
        const [exist, record] = checkRecord(name)
        if (!exist || record.ideaItem===undefined){
            const tmp = {
                ideaItem: [],
            }
            writeLocal('idea', password, tmp)
        }
    }
    
    // plan
    {
        const name = 'plan_' + password
        const [exist, record] = checkRecord(name)
        if (!exist || record.layers===undefined){
            const tmp = {
                layers: [],
            }
            writeLocal('plan', password, tmp)
        }
    }
}

function getAllRecoredNames(password){
    let result = []
    // idea
    let name = 'idea_' + password
    result.push(name)
    // plan
    name = 'plan_' + password
    result.push(name)
    return result
}

export function getLabels(tags){
    let ret = []
    if (tags==='') return []
    const labels= tags.split(',')
    for (let label of labels){
        let tmp = label.replace(/(^\s*)|(\s*$)/g, "")
        tmp = tmp.split(" ").join("")
        ret.push(tmp)
    }
    return ret
}

export function deleteLabel(label, labelArray){
    return deleteValueFromArray(labelArray, label)
}

export function reloadPage(){
    window.location.reload()
}
