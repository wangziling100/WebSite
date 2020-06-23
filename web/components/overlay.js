import cn from 'classnames'
import Router from 'next/router'
import { useState } from 'react'
import { sendData } from '../lib/api'
import { withRouter } from 'next/router'

export function Overlay({ page, option, overlayData, password, actions }){
    let child
    switch (option){
        case "delete": child = (<> <DeleteWnd page={page} data={overlayData} savedPassword={password} actions={actions}/></>);break;
        case "login": child = (<> <LoginWnd actions={actions}/></>);break;
        case "disclaimer": child = (<> <DisclaimerWnd hostname={overlayData.hostname}/></>); break;
        default: child=""; break;
    }
    return(
        <>
            { (option==='delete') &&
                <Style1 child={child} page={page} password={password} actions={actions}/> 
            }
            { (option=='login') &&
                <Style1 child={child} page={page} password={password} actions={actions} />
            }
            { (option=='disclaimer') &&
                <Style2 child={child} actions={actions}/> 
            }
        </>
    ) 
}


function LoginWnd({ actions }){
    // Variable
    const [ password, setPassword ] = useState("")
    // CSS
    const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
    const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
    // Actions
    const getPassword = e => { setPassword(e.target.value) }
    const setPasswordAction = ()=>{
        actions.setPassword(password)
        actions.setShowOverlay(false)
        actions.setShowRootOverlay(false)
    }
    const returnAction = () => {
        actions.setShowOverlay(false)
        actions.setOption && actions.setOption("")
        actions.setShowRootOverlay(false)
    }
    
    
    // Return
    return(
      <div className="text-center flex flex-wrap">
        <div className="w-full mt-2 font-semibold text-red-600 text-xl">Login</div>
        <div className="flex mt-5 w-full">
          <div className={cn('mt-2', 'p-2', 'ml-4')}> Password: </div>
          <input className={cn(...inputCSS, 'mr-10')} id='password' type='password' placeholder='your password' onChange={(e)=>getPassword(e)}/>
        </div>
        <div className="flex justify-around my-5 w-full">
          <button className={cn(...buttonCSS)} onClick={returnAction}>
            no
          </button>
          <button className={cn(...buttonCSS)} onClick={setPasswordAction}>
            yes
          </button>
        </div>
      </div>
    )
}

function DeleteWnd({ page, data, savedPassword, actions }){
    // Variable
    let text
    switch (page){
        case 'idea': text='idea'; break;
        case 'plan': text='plan'; break;
    }
    const [ password, setPassword ] = useState("")
    //let id = data.id
    let isTest = false
    const path = '/' + page
    // CSS
    const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
    const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
    // Actions
    
    const confirmOpt = async () => {
        actions.deleteAction(savedPassword)
        actions.setShowOverlay && actions.setShowOverlay(false)
        actions.setOption && actions.setOption("")
    }

    const getPassword = e => { setPassword(e.target.value) }
    const returnAction = () => {
        actions.setShowOverlay(false)
        actions.setOption && actions.setOption("")
    }

    return(
      <div className="text-center flex flex-wrap">
        <div className="w-full mt-2 font-semibold text-red-600 text-xl">Do you want to delete the {text}?</div>
        <div className="flex mt-5 w-full">
          <div className={cn('mt-2', 'p-2', 'ml-4')}> Password: </div>
          <input className={cn(...inputCSS, 'mr-10')} id='password' type='password' placeholder='your password' onChange={(e)=>getPassword(e)}/>
        </div>
        <div className="flex justify-around my-5 w-full">
          <button className={cn(...buttonCSS)} onClick={returnAction}>
            no
          </button>
          <button className={cn(...buttonCSS)} onClick={confirmOpt}>
            yes
          </button>
        </div>
      </div>
    )
    
}

function DisclaimerWnd({hostname}){
    const text1CSS = ['text-center', 'text-xl', 'font-semibold']
    const text2CSS = ['py-1']
    const text3CSS = ['py-2', 'text-center', 'font-medium']
    return(
      <>
      <div className="absolute top-0 mx-32 my-10 p-20 bg-white shadow text-gray-800">
        <h1 className={cn(...text1CSS, ...text2CSS)}>Disclaimer for Xingbo Wang</h1>

        <p className={cn(...text2CSS)}>If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at wangziling1000@gmail.com</p>

        <h2 className={cn(...text2CSS, ...text3CSS)}>Disclaimers for Xingbo Wang's personal website</h2>

        <p className={cn(...text2CSS)}>All the information on this website - {hostname} - is published in good faith and for general information purpose only. Xingbo Wang's personal website does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website (Xingbo Wang's personal website), is strictly at your own risk. Xingbo Wang's personal website will not be liable for any losses and/or damages in connection with the use of our website. Our Disclaimer was generated with the help of the <a href="https://www.disclaimergenerator.net/">Disclaimer Generator</a> and the <a href="https://www.disclaimer-generator.com">Disclaimer Generator</a>.</p>

        <p className={cn(...text2CSS)}>From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone 'bad'.</p>

        <p className={cn(...text2CSS)}>Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their "Terms of Service" before engaging in any business or uploading any information.</p>

        <h2 className={cn(...text2CSS, ...text3CSS)}>Consent</h2>

        <p className={cn(...text2CSS)}>By using our website, you hereby consent to our disclaimer and agree to its terms.</p>

        <h2 className={cn(...text2CSS, ...text3CSS)}>Update</h2>

        <p className={cn(...text2CSS)}>Should we update, amend or make any changes to this document, those changes will be prominently posted here.</p>
      </div>
      </>
    )
}

function Style1({ child, page, actions}){

    // CSS
    
    const overlayCSS = ['bg-gray-800', 'opacity-25']
    // Actions
    const hideOverlay = ()=>{
        actions.setShowOverlay(false)
        actions.setShowRootOverlay(false)
        actions.setOption && actions.setOption("") 
    }
    
    return(
      <>
        {/* overlay */}
        <div className={cn('fixed', 'top-0', 'left-0', 'flex', 'flex-wrap', 'w-screen', 'h-screen', 'z-40')}>
          <div className={cn(...overlayCSS, 'w-full', 'h-2/7')} onClick={hideOverlay}>
          </div>

          <div className="w-full h-auto flex">
            <div className={cn(...overlayCSS, 'w-1/3')} onClick={hideOverlay}> </div>
            <div className="w-1/3 bg-orange-200 border-2 border-red-400 ">
                { child }          
            </div>
            <div className={cn(...overlayCSS, 'w-1/3')} onClick={hideOverlay}> </div>
            
          </div>
          <div className={cn(...overlayCSS, 'w-full', 'h-3/5')} onClick={hideOverlay} ></div>
        </div>
        
      </>
    )

}

function Style2({child, actions}){
    return(
      <>
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 opacity-25" onClick={()=>actions.setShowOverlay(false)}>
        </div>
        {child}
      </>
    )

}
