import Link from 'next/link'
import cn from 'classnames'
import Router, { useRouter } from 'next/router'
import { useState } from 'react'
import { Overlay } from '../components/overlay'

export default function Navigation({ page, password, actions, states}){
    // Variable
    //const router = useRouter()
    //const showOverlay = router.query.showOverlay || false
    //const option = router.query.option || ""
    //const showOverlay = false
    const [ showOverlay, setShowOverlay ] = useState(false)
    const [ option, setOption ] = useState("")
    const path = '/' + page
    // downflow data
    const downflowActions = {
        setPassword: actions.setPassword,
        setShowOverlay: setShowOverlay,
        setOption: actions.setOption,
    }
    // Actions
    const loginAction= () => {
        setShowOverlay(true)
        setOption("login")
    }
    const logoutAction = () => {
        setShowOverlay(false)
        setOption("")
        actions.setPassword("")
    }
    const logInOutAction = () => {
        (password===undefined || password==="")?loginAction():logoutAction()
    }


    const toIndexOpt = {
        pathname: '/index',
        query: {password: password}
    }
    const toIdeaOpt = {
        pathname: '/idea',
        query: {password: password}
    }
    const toPlanOpt = {
        pathname: '/plan',
        query: {password: password}
    }
    const toServiceOpt = {
        pathname: '/service',
        query: {password: password}
    }
    const toAboutOpt = {
        pathname: '/about',
        query: {password: password}
    }

    const nav = (
        <>
        <div className={cn("p-4 ", {"text-white": page=="index",}, 'flex', 'justify-between')}>
          <div className="flex flex-raw items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg list-none ">
            <div className={cn({"underline": page=="index"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push(toIndexOpt)}>Home</a>
            </div >
            <div className={cn({"underline": page=="idea"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push(toIdeaOpt)}>Idea</a>
            </div>
            <div className={cn({"underline": page=="plan"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push(toPlanOpt)}>
                  Plan
                </a>
            </div>
            <div className={cn({"underline": page=="service"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push(toServiceOpt)}>
                  Service
                </a>
            </div>
            <div className={cn({"underline": page=="about"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push(toAboutOpt)}>
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
