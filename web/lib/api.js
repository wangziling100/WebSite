import { GraphQLClient } from "graphql-request"; 
const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = process.env.NEXT_EXAMPLE_CMS_DATOCMS_API_TOKEN
import React, { useRef, useState, useEffect } from 'react'

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

async function fetchAPI(query, { variables, preview } = {}) {
  const res = await fetch(API_URL + (preview ? '/preview' : ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }
  return json.data
}

export async function getPreviewPostByLocation(loc) {
  const data = await fetchAPI(
    `
    query PostByLoc($slug: String) {
      post(filter: {loc: {eq: $loc}}) {
        loc
      }
    }`,
    {
      preview: true,
      variables: {
        loc,
      },
    }
  )
  return data?.post
}

export async function getAllPostsWithLocation() {
  const data = fetchAPI(`
    {
      allPosts {
        loc
      }
    }
  `)
  return data?.allPosts
}

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `
    {
      demo {
        name
        pic{
          responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
            ...responsiveImageFragment
          }
          url
        }
      }
    }

    ${responsiveImageFragment}
  `,
    { preview }
  )
  return data?.demo
}

export async function getPostAndMorePosts(loc, preview) {
  const data = await fetchAPI(
    `
  query PostByLocation($loc: String) {
    post(filter: {loc: {eq: $loc}}) {
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
    }

    morePosts: allPosts(orderBy: date_DESC, first: 2, filter: {slug: {neq: $slug}}) {
      title
      slug
      excerpt
      date
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
    }
  }

  ${responsiveImageFragment}
  `,
    {
      preview,
      variables: {
        slug,
      },
    }
  )
  return data
}
export async function sendData(data, isTest, refreshAction, refresh=false){
    if (data instanceof Array){
        data = {data: data}
        console.log(data, 'data')
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
        res.on('data', (chunk) => {
            //console.log('Response: '+chunk)
            if (refresh) {
                //window.location.reload()
                refreshAction && refreshAction(JSON.parse(chunk))
            }
        })
    }).on('error',(e) => {
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
