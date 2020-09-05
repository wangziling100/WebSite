import Footer from '../components/footer'
import Meta from '../components/meta'
//import Header from '../components/header'
import Container from '../components/container'
import Background from '../components/background'
//import cn from 'classnames'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
//import { Image } from 'react-datocms'

export default function Layout({ bgImgAndSetting, children , hostname, page, curtain}) {
  let main
  switch (page){
      case 'index': main = <IndexLayout bg={bgImgAndSetting} children={children} />; break;
      case 'idea' : main = <NormalLayout bg={bgImgAndSetting} children={children} hostname={hostname}/>; break;
      case 'plan': {
        main = <SidebarLayout 
        top={children.top} 
        left={children.left} 
        right={children.right} 
        hostname={hostname} />; 
        break;
      }
      case 'service': {
        main = <SidebarLayout2 
        top={children.top} 
        left={children.left} 
        right={children.right} 
        hostname={hostname}/>;
        break;
      }
      case 'about': main = <CurtainLayout curtain={curtain} hostname={hostname} children={children}/>;break; 
  }
  return (
    <>
      {main}
    </>
  )
}

function IndexLayout({bg, children}){
  const main = (
    <>
      <Meta />
        <Background imgAndSetting={bg}>
          <div className=''>
            <Container>
              <main>{children}</main>
            </Container>
          </div>
          
        </Background>
 
    </>
  )
  return (
    <>
      { main }
    </>
  )
}

function NormalLayout({bg, children, hostname}){
  const main = (
    <>
      <Meta />
          <div>
            <Container>
              <main>{children}</main>
            </Container>
            <Footer hostname={hostname} />
          </div>
 
    </>
  )
  return (
    <>
      { main }
    </>
  )
}

function SidebarLayout({top, left, right, hostname}){
  const main = (
    <>
      <Meta />
        <div>
          <Container>
            <main>{top}</main>
          </Container>
          <div className="relative flex w-full h-screen overflow-auto antialiased bg-gray-200 border-t">
            <div className="relative flex flex-col h-full bg-white border-r border-gray-300 shadow-xl md:block w-1/5" >
              {left}
            </div>
            <div className="relative right-0 flex flex-col pb-2 bg-white border-l border-gray-300 xl:block w-5/6 overflow-auto">
              <DndProvider backend={HTML5Backend}>
                {right}
              </DndProvider>
            </div>
          </div>
          <Footer hostname={hostname} />
        </div>
    </>
  )
  return (
    <>
      {main}
    </>
  )
}

function SidebarLayout2({top, left, right, hostname}){
  const main = (
    <>
      <Meta />
      <div className=''>
        <Container>
          <main>{top}</main>
        </Container>
        <div className='bg-gray-100 px-24 w-full min-h-screen'>
          <div className="relative  
          flex w-full  
          antialiased">
            <div className="relative 
            flex flex-col h-full 
            shadow-xl md:block w-1/5" >
              {left}
            </div>
            <div className="relative 
            right-0 flex flex-col pb-2 
            xl:block w-5/6 ">
              {right}
            </div>
          </div>
        </div>
        <Footer hostname={hostname} />
      </div>
    </>
  )

  return (
    <>
      {main}
    </>
  )
}
function CurtainLayout({curtain, hostname, background, children}){
    let image
    let setting
    if (background!==undefined){
        image = background.img.image
        setting = background.setting

    }
    const main = (
        <>
          <Meta />
          <div>
            <div className=''>
              <Container>
                {curtain}
              </Container>
              <main>{children}</main>
            </div>
            <Footer hostname={hostname} />
          </div>
        </>
    )
    return (
        <>
            {main}
        </>
    )
}
