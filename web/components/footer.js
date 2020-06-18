import Container from './container'
import { Overlay } from '../components/overlay'
import { useState } from 'react'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin, faXing } from '@fortawesome/free-brands-svg-icons'

export default function Footer({hostname}) {
  // CSS
  const text1CSS = ["text-xl", "font-semibold"]
  const text2CSS = ["text-base", "font-normal"]
  const copyrightCSS = ['text-gray-600', 'text-center', 'w-full', 'text-sm']
  const iconCSS = ['mr-2', 'h-5', 'w-5', 'cursor-pointer', 'hover:bg-gray-400']
  // Attributes
  const email = "wangziling1000@gmail.com"
  const [showOverlay, setShowOverlay] = useState(false)
  const downflowActions = {
      setShowOverlay: setShowOverlay,
  }
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="flex justify-around m-4">
          <div className={cn(...text1CSS)} > 
            Services
          </div>
          <div className={cn('cursor-pointer', ...text1CSS)} onClick={()=>setShowOverlay(true)}>
            Disclaimer
          </div>
          <div className={cn(...text1CSS)}>
            Contact & Links
            <div className="flex">
              <FontAwesomeIcon icon={faEnvelope} className="mt-1 mr-2 h-5 w-5"/>

              <div className={cn(...text2CSS)}>
                <a href="mailto:wangziling1000@gmail.com">
                  {email}
                </a>
              </div>
            </div>
            <div className="mt-2 flex">
              <a href="https://github.com/wangziling100" target="_blank">
                <FontAwesomeIcon icon={faGithub} className={cn(...iconCSS)} />
              </a>
              <a href="https://www.linkedin.com/in/xingbo-wang-8a4970b1" target="_blank">
                <FontAwesomeIcon icon={faLinkedin} className={cn(...iconCSS)}/>
              </a>
              <a href="https://www.xing.com/profile/Bob_Wang8/cv" target="_blank">
                <FontAwesomeIcon icon={faXing} className={cn(...iconCSS)}/>
              </a>
            </div>

          </div>
        </div>
        <div className={cn(...copyrightCSS)}>  
          Copyright &copy; 2020 Xingbo Wang. All Rights Reserved 
        </div>

      </Container>
      { showOverlay && <Overlay option='disclaimer' actions={downflowActions} overlayData={{hostname: hostname}}/>}
    </footer>
  )
}
