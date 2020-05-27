import { GraphQLClient } from "graphql-request"; 
const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = process.env.NEXT_EXAMPLE_CMS_DATOCMS_API_TOKEN

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

export async function getImageByReference( ref, preview=flase ){
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
        ref
        refId
        title
        content
        owner
        contributor
        priority
        completeness
        itemStatus
        startTime
        evaluation
        allowPriorityChange
      }
    }
  `
  const data = await request({
    query: ITEMS_QUERY, 
    variables: {"ref": ref},
    preview: preview
  });
  //console.log(data)
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
