import Footer from '../components/footer'
import Meta from '../components/meta'
import Header from '../components/header'
import Container from '../components/container'
import Background from '../components/background'
import cn from 'classnames'

export default function Layout({ bgImgAndSetting, children , hostname, page }) {
  console.log(page)
  let main
  switch (page){
      case 'index': main = <IndexLayout bg={bgImgAndSetting} children={children} />; break;
      case 'idea' : main = <NormalLayout bg={bgImgAndSetting} children={children} hostname={hostname}/>; break;
      case 'plan': main = <SidebarLayout top={children.top} left={children.left} right={children.right} hostname={hostname} />; break;
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
          <div className={cn('h-screen')}>
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
        <Background imgAndSetting={bg}>
          <div>
            <Container>
              <main>{children}</main>
            </Container>
            <Footer hostname={hostname} />
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

function SidebarLayout({top, left, right, hostname}){
  const main = (
    <>
      <Meta />
        <div>
          <Container>
            <main>{top}</main>
          </Container>
          <div className="relative flex w-full h-screen overflow-hidden antialiased bg-gray-200 border-t">
            <div className="relative flex flex-col h-full bg-white border-r border-gray-300 shadow-xl md:block w-1/5" >
              {left}
            </div>
            <div className="right-0 flex flex-col pb-2 bg-white border-l border-gray-300 xl:block w-5/6 overflow-hidden">
              {right}
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
