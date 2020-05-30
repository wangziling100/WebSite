import Head from 'next/head'
import Container from '../components/container'
import Navigation from '../components/navigation'
import Layout from '../components/layout'
import { getImageByReference } from '../lib/api'

export default function ServicePage(data) {
  const img = data.ideaBg
  const setting=[]
  const bgImgAndSetting={img, setting}
  const main = (
    <Navigation page="service"/>
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
  const data = {ideaBg}
  return{
    props: data,
  }
}
