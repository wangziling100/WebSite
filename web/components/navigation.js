import Link from 'next/link'
import cn from 'classnames'
import Router, { useRouter } from 'next/router'
import { useState } from 'react'
import { Overlay } from '../components/overlay'
import { Image } from 'react-datocms'

export default function Navigation({ page, password, actions, states, logo}){
    // Variable
    const [ showOverlay, setShowOverlay ] = useState(false)
    const [ option, setOption ] = useState("")
    const path = '/' + page
    // downflow data
    const downflowActions = {
        setPassword: actions.setPassword,
        setShowOverlay: setShowOverlay,
        setOption: actions.setOption,
        setShowRootOverlay: actions.setShowOverlay,
    }
    // Actions
    const loginAction= () => {
        setShowOverlay(true)
        actions.setShowOverlay(true)
        setOption("login")
    }
    const logoutAction = () => {
        setShowOverlay(false)
        actions.setShowOverlay(false)
        setOption("")
        actions.setPassword("")
    }
    const logInOutAction = () => {
        (password===undefined || password==="")?loginAction():logoutAction()
    }
    console.log(logo)

    const nav = (
        <>
        <div className={cn("p-4 ", {"text-white": page=="index",}, 'flex', 'justify-between')}>
          <div className="flex flex-raw items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg list-none ">
            
            { logo && <Image data={logo.image.responsiveImage}  className="w-24 h-10"/> }
            <div className={cn({"underline": page=="index"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/index')}>Home</a>
            </div >
            <div className={cn({"underline": page=="idea"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/idea')}>Idea</a>
            </div>
            <div className={cn({"underline": page=="plan"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/plan')}>
                  Plan
                </a>
            </div>
            <div className={cn({"underline": page=="service"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/service')}>
                  Service
                </a>
            </div>
            <div className={cn({"underline": page=="about"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/about')}>
                  About me
                </a>
            </div>
          </div>
          <div className="px-4 cursor-pointer items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg" onClick={logInOutAction}>
            { password?"Log out":"Sign in" }
          </div>
        </div>
        {
          showOverlay && (option==='login') &&
          <Overlay page={page} option='login' className='' password={password} actions={downflowActions}/>
        }  
        </>
    )
    return (
        <>
          {nav}
        </>
    )
}
