import Footer from '../components/footer'
import Meta from '../components/meta'
import Header from '../components/header'
import Container from '../components/container'
import Background from '../components/background'
import cn from 'classnames'

export default function Layout({ bgImgAndSetting, children , hostname, index=false }) {
  return (
    <>
      <Meta />
        <Background imgAndSetting={bgImgAndSetting}>
          <div className={cn({'h-screen': index})}>
            <Container>
              <main>{children}</main>
            </Container>
            { !index && 
              <Footer hostname={hostname}/>
            }
          </div>
          
        </Background>

    </>
  )
}
