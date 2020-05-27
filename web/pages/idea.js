import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { getItemByReference, getImageByReference } from '../lib/api'
import { IdeaHeader, Ideas } from '../components/ideas'
import Notice from '../components/notice'

export default function IdeaPage(data) {
  const img = data.ideaBg
  const noticeTitle = data.ideaItemTitle[0].title
  const noticeContent = data.ideaItemTitle[0].content
  const setting=[]
  const bgImgAndSetting={img, setting}
  const main = (
    <>
      <Navigation page="idea"/>
      <Notice title={noticeTitle} content={noticeContent} />
      <div className="mt-6">
        <IdeaHeader />
      </div>
    </>
  )
  return (
    <div>
      <Head>
        <title> no idea for this title </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout index={false} bgImgAndSetting={bgImgAndSetting}>
        {main}
      </Layout>
    </div>
  )
}

export async function getStaticProps({ preview=false }){
  const ideaBg = (await getImageByReference("idea_bg", preview))
  const ideaItemTitle = (await getItemByReference("idea_item_title", preview))
  const ideaItem = (await getItemByReference("idea_item", preview))
  console.log(ideaItemTitle)
  const data = {ideaBg, ideaItemTitle, ideaItem}
  return{
    props: data,
  }
}
