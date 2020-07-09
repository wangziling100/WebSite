import { GraphQLClient } from "graphql-request"; 
const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = process.env.NEXT_EXAMPLE_CMS_DATOCMS_API_TOKEN
import React, { useRef, useState, useEffect } from 'react'
import { flat } from '../lib/tools'

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
    const existUser = checkUser(password)
    if (existUser) return false
    let [existRecord, localUser] = checkRecord('local user')
    if (!existRecord) localUser = {data: []}
    localUser.data.push(password)
    localStorage.setItem('local user', JSON.stringify(localUser))
    initAccount(password)
    return true
}

export function checkUser(password){
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
    record = JSON.parse(record)
    if (record===undefined||record===null) return [false, null]
    return [true, record]
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

export function useLoadData(page, password, setData){
    useEffect(() => {
        if (password){
            const data = readLocal(page, password)
            setData(data)
        }
    }, [password])
}

export function useUpdateData(page, password, data, dep){
    useEffect(() => {
        if (password){
            writeLocal(page, password, data)
        }
    }, dep)
}

function initAccount(password){
    // idea
    {
        const name = 'idea_' + password
        const [exist, record] = checkRecord(name)
        if (!exist){
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
        if (!exist){
            const tmp = {
                layers: [],
            }
            writeLocal('plan', password, tmp)
        }
    }
}
