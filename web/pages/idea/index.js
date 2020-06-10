import Head from 'next/head'
import Link from 'next/link'
import Container from '../../components/container'
import Navigation from '../../components/navigation'
import Layout from '../../components/layout'
import { getItemByReference, getImageByReference } from '../../lib/api'
import { IdeaHeader, Ideas } from '../../components/ideas'
import Notice from '../../components/notice'
import { useRouter } from 'next/router'

export default function IdeaPage(props) {
  const img = props.data.ideaBg
  const noticeTitle = props.data.ideaItemTitle[0].title
  const noticeContent = props.data.ideaItemTitle[0].content
  const setting=[]
  const bgImgAndSetting={img, setting}
  const router = useRouter()
  const orderBy = router.query.orderBy || "priority"
  const selectedStatus = router.query.selectedStatus || "active"
  const main = (
  
    <>
      <Navigation page="idea"/>
      <Notice title={noticeTitle} content={noticeContent} />
      <div className="mt-6">
        <div className="flex mx-12 mb-2 justify-end">
          <Link href="/idea/new">
            <button className="h-8 w-32 bg-red-400 rounded-lg text-white font-semibold hover:shadow-lg hover:bg-blue-400"> + New Idea </button>
          </Link>
        </div>
        <IdeaHeader/>
        <Ideas data={props.data.ideaItem} orderBy={orderBy} selectedStatus={selectedStatus} />
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
  const orderBy = "priority-reverse"
  const data = {ideaBg, ideaItemTitle, ideaItem}
  return{
    props: {
        data: data,
    }
  }
}
