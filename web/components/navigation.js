import Link from 'next/link'
import cn from 'classnames'
import Router, { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { Overlay } from '../components/overlay'
import { Image } from 'react-datocms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithubSquare } from '@fortawesome/free-brands-svg-icons'
import { faCaretDown, faRedoAlt } from '@fortawesome/free-solid-svg-icons'
import { createNewUser, reloadPage, writeData } from '../lib/api'
import Avatar from '../components/avatar'
import GithubList from '../components/github-drop-down-list'
import { Button } from '../components/button'
import  Select from '../components/select'
import { switchAccount, updateAllInLocal, deleteLocalPlans, getSelectedRepo, checkIsolatedPlan, addAllToLocal, collectAllGithubData } from '../lib/localData'
import { addIssuesToLayers, checkIssueMilestoneNum, updateGithubItemBatch, createGithubItemBatch, deleteGithubItemBatch, deleteGithubItem, remoteData2Local, sendAllGithubData } from '../lib/github'
import { flat, filterDuplicateItems } from '../lib/tools'
import { setPageStatus } from '../lib/sessionData'

export default function Navigation({ page, password, actions, states, logo, hostname, loginStatus, githubUserData, repos}){
    // Variable
    const isTest = false
    const [ showOverlay, setShowOverlay ] = useState(false)
    const [ option, setOption ] = useState("")
    const [ showLoginType, setShowLoginType ] = useState(false)
    const [ showGithubList, setShowGithubList ] = useState(false)
    const [ listFocus, setListFocus ] = useState(false)
    const [ repoIndex, setRepoIndex ] = useState(0)
    const listRef = useRef(null)
    const path = '/' + page
    let clientId = null
    let redirectURL = null
    let githubURL = null
    let redirectPage = null
    useEffect(()=>{
        console.log('effect')
        const selectedRepo = getSelectedRepo()
        if (selectedRepo!==undefined){
            setRepoIndex(getSelectedRepo())
        }
    }, [setRepoIndex])
    if (hostname==='localhost'){
        clientId = 'Iv1.f70dacffd5b15781'
        const tmpHostname = 'http://'+hostname+':3000'
        redirectURL = tmpHostname+'/idea'
    }
    else if (hostname==='wangxingbo.now.sh'){
        clientId = 'Iv1.eb5280f99b695cba'
        const tmpHostname = 'https://'+hostname
        redirectURL = tmpHostname+'/idea'
    }
    else if (hostname==='wangxingbo.netlify.app'){
        clientId = 'Iv1.cfc1ba9b160285d9'
        const tmpHostname = 'https://'+hostname
        redirectURL= tmpHostname+'/idea'
    }
    githubURL = 'https://github.com/login/oauth/authorize?client_id='+clientId+'&redirect_uri='+redirectURL
    // downflow data
    const downflowActions = {
        setPassword: actions.setPassword,
        setShowOverlay: setShowOverlay,
        setOption: actions.setOption,
        setShowRootOverlay: actions.setShowOverlay,
        updateFunction: actions.updateFunction,
    }
    // Functions
    function getUserIdentity(){

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
        writeData({
            userPassword: '',
            loginStatus: 'logout',
        })
        actions.cleanLocalData()
        actions.updateFunction()
    }
    const logInOutAction = () => {
        (password===undefined || password==="")?loginAction():logoutAction()
    }
    const githubLoginAction = () => {
        writeData({
            loginStatus: 'github_pending',
            redirectPage: page,
        })
    }
    const signUpAction = () => {
        setShowOverlay(true)
        actions.setShowOverlay(true)
        setOption('signUp')
    }
    const showLoginTypeAction = () => {
        setShowLoginType(!showLoginType)
    }
    const afterSyncAction = async (newData) => {
        console.log(newData, 'after github sync')
        if (newData===null){
            setPageStatus('logout')
            alert('No connection with server')
            reloadPage()
            return
        } 
        const statusText = newData.statusText
        if ( statusText==='OK' ){
            //const downloadCreate = remoteData2Local(newData.data.downloadCreate)
            //const downloadUpdate = remoteData2Local(newData.data.downloadUpdate)
            let downloadCreate = newData.data.downloadCreate
            let downloadUpdate = newData.data.downloadUpdate 
            let uploadCreate = newData.data.uploadCreate
            let uploadUpdate = newData.data.uploadUpdate
            let invalid = []
            let tmp = null
            tmp = filterDuplicateItems(downloadCreate)
            downloadCreate = remoteData2Local(tmp.ret)
            invalid = invalid.concat(tmp.invalid)
            tmp = filterDuplicateItems(downloadUpdate)
            downloadUpdate = remoteData2Local(tmp.ret)
            invalid = invalid.concat(tmp.invalid)
            console.log(tmp.ret, tmp.invalid, 'filter duplicate')
            console.log(uploadCreate, uploadUpdate, 'upload')
            console.log(downloadCreate, downloadUpdate, 'download')
            console.log(password, 'password')
            tmp = addAllToLocal(password, downloadCreate)
            invalid = invalid.concat(tmp)
            console.log(tmp, 'invalid format')
            console.log(downloadUpdate, 'down update')
            if (downloadCreate.layers!==undefined){
                const withNewMilestoneIssues = checkIssueMilestoneNum(password, flat(downloadCreate.layers))
                console.log(withNewMilestoneIssues, 'withNewMilestoneIssues')
                if (withNewMilestoneIssues.length>0){
                    if (downloadUpdate.layers===undefined){
                        downloadUpdate['layers'] = {}
                    }
                    downloadUpdate = addIssuesToLayers(withNewMilestoneIssues, downloadUpdate.layers)
                    uploadUpdate = uploadUpdate.concat(withNewMilestoneIssues)
                }
                
            }
            
            updateAllInLocal(password, downloadUpdate)
            const isolatedPlans = checkIsolatedPlan(password)
            console.log(isolatedPlans, 'isolated plans')
            invalid = invalid.concat(isolatedPlans)
            
            console.log(invalid, 'invalid data')
            deleteLocalPlans(invalid, password)
            
            if (invalid.length>0 && invalid!==undefined && invalid!==null){
                await deleteGithubItemBatch(invalid, hostname, null)
            }
            /*
            if (uploadCreate.length>0 && uploadCreate!==undefined && uploadCreate!==null){
                await createGithubItemBatch(uploadCreate, hostname, null)
            }
            */
            if (uploadUpdate.length>0 && uploadUpdate!==undefined && uploadUpdate!==null){
                await updateGithubItemBatch(uploadUpdate, hostname, null)
            }
        }
        else{
            alert('Synchronise failed')
        }
        console.log('----------------------')
        actions.reloadFunction()
        //actions.updateFunction()
        actions.setPageStatus('normal')
    }
    const syncAction = () => {
        console.log('Synchronise')
        actions.setPageStatus('pending')
        const allGithubData = collectAllGithubData()
        sendAllGithubData(allGithubData, hostname, afterSyncAction, isTest)
    }
    
    const showGithubListAction = () => {
        if (showGithubList){
            setListFocus(false)
            setShowGithubList(false)
        }
        else {
            setTimeout(()=>listRef.current.focus(), 200)
            setListFocus(true)
            setShowGithubList(true)
        }
        
    }
    
    const githubListBlurAction = () => {
        const tmpFunc = () => {
            setListFocus(false)
            setShowGithubList(false)
        }
        setTimeout(tmpFunc, 200)
        
    }
    const newRepoAction = () => {
        writeData({
            loginStatus: 'github_pending'
        })
    }
    // components
    const userData = githubUserData
    let loginComponent
    let repoSelect 

    if (loginStatus==='github_login'){
        let githubURL = null
        if (hostname==='localhost'){
            githubURL = 'https://github.com/apps/test-app-wangziling100'
        }
        else if (hostname==='wangxingbo.now.sh'){
            githubURL = 'https://github.com/apps/plan-schedule-system-vercel'
        }
        else if (hostname==='wangxingbo.netlify.app'){
            githubURL = 'https://github.com/apps/plan-schedule-system-netlify'
        }
        const onClickAction = () => {
            writeData({loginStatus: 'github_pending'})
        }
        
        if (repos===null){
            repoSelect = (
                <div className='' >
                  <a href={githubURL} >
                    <Button bn={'Select repository'} onClick={onClickAction}/>
                  </a>
                </div>
            )
        }
        else {
            const repoListSelect = repos.map(el=>el.repoName)
            const selectAction = (value) => {
                writeData({
                    selectedRepo: value,
                })
            }
            const onClick = (index) => () => {
                const repoId = repos[index].repoId
                const userData = githubUserData
                const password = 'github_'+userData.id+'_'+repoId
                console.log(password, 'password')
                switchAccount(password)
                createNewUser(password)
                reloadPage()
            }
            let optionActions = {}
            for (let index in repoListSelect){
                optionActions[index] = onClick(index)
            }
            repoSelect = (
                <div className='flex'>
                    <div className='mr-3 cursor-pointer font-semibold' title='New repository' onClick={newRepoAction}>

                      <a href={githubURL}>
                      +
                      </a>
                    </div>
                    <Select items={repoListSelect} setValue={setRepoIndex} defaultValue={repoIndex} action={selectAction} optionActions={optionActions}/>

                </div>
            )
        }
        
    }

    switch (loginStatus){
        case 'github_login':  
            loginComponent = (
              <div className='w-1/3 flex justify-between items-center'>
                
                <div>
                  { repoSelect }
                </div>
                <div className='hover:shadow p-1 cursor-pointer ' title='Synchronise' onClick={syncAction}>
                  <FontAwesomeIcon icon={faRedoAlt} className="w-4 h-4 text-blue-400" />
                </div>
                <div className='w-48'>
                  <div className='flex justify-end items-center cursor-pointer relative' onClick={showGithubListAction}>
                    <Avatar name={userData.name} picture={userData.avatar_url} />
                    <FontAwesomeIcon icon={faCaretDown} className="w-4 h-4" />
                  </div>
                  <div className={cn({'hidden':!showGithubList}, 'absolute', 'z-20', 'w-48', 'outline-none')} ref={listRef} onBlur={githubListBlurAction} tabIndex="0">
                    <GithubList name={userData.name} actions={actions}/> 
                  </div>
                </div>
              </div>
        )

            break;
        case 'logout':
            loginComponent = (
              <div className='flex'>
                <div className='relative px-4 cursor-pointer items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg' onMouseLeave={()=>setShowLoginType(false)}>
                  <div className='' onMouseOver={()=>setShowLoginType(true)} >
                    { "Login" }
                  </div>
                  <div className={cn({'hidden':!showLoginType}, 'absolute', 'z-20', 'w-40', 'bg-gray-100')}>
                    <div className='mt-1 text-center text-white flex justify-center hover:bg-orange-600 bg-orange-400 rounded ' onClick={loginAction}>
                      <div className=''>
                        Local
                      </div>
                    </div>

                    <a href={githubURL} onClick={githubLoginAction}>
                      <div className='mt-1 text-center text-white bg-gray-700 hover:bg-black rounded'>
                        <div className='flex justify-center '>
                          <FontAwesomeIcon icon={faGithubSquare} className='w-4 h-4 self-center' />
                          <div>
                            GitHub
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="px-4 cursor-pointer items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg" onClick={signUpAction}>
                  Sign up
                </div>
              </div>
            )
            break;
        case 'local_login':
            loginComponent = (
              <>
                <div className='flex justify-end items-center'>
                  <div className='cursor-pointer' onClick={logoutAction}>
                    Logout
                  </div>
                </div>
              </>
            )
            break;
        case 'github_pending':
            loginComponent = (
              <div className='flex justify-end items-center'>
                <div className='text-gray-400'>
                  Connecting
                </div>
              </div>
            )
            break;
    }

    const nav = (
        <>
        <div className={cn("p-4 ", {"text-white": page=="index",}, 'flex', 'justify-between')}>
          <div className="flex flex-raw items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg list-none z-20">
            
            { logo && <Image data={logo.image.responsiveImage}  className="w-24 h-10"/> }
            <div className={cn({"underline": page=="index"})}>
                <a className="px-4 hover:underline cursor-pointer" onClick={()=>Router.push('/')}>Home</a>
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
          {loginComponent} 
        </div>
        {
          showOverlay &&
          <Overlay page={page} option={option} className='' password={password} actions={downflowActions} />
        }  
        </>
    )
    return (
        <>
          {nav}
        </>
    )
}
