//import Alert from '../components/alert'
import Footer from '../components/footer'
import Meta from '../components/meta'
import Header from '../components/header'
import Container from '../components/container'
import Background from '../components/background'

export default function Layout({ bgImgAndSetting, children , index=false}) {
  return (
    <>
      <Meta />
        <Background imgAndSetting={bgImgAndSetting}>
          <div className="h-screen">
            <Container>
              <main>{children}</main>
            </Container>
          </div>
        </Background>
      { !index && 
      <Footer />
      }
    </>
  )
}
