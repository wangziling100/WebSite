import cn from 'classnames'
import Router from 'next/router'
import { useState } from 'react'
import { sendData } from '../lib/api'

export function Overlay({ page, option, overlayData, password }){
    let child
    switch (option){
        case "delete": child = (<> <DeleteWnd page={page} data={overlayData} savedPassword={password}/></>);break;
        case "login": child = (<> <LoginWnd page={page}/></>);break;
        default: child=""; break;
    }
    return(
        <>
            { (page==='idea')  && (option==='delete') &&
                <Style1 child={child} page={page} password={password}/> 
            }
            { (option=='login') &&
                <Style1 child={child} page={page} password={password}/>

            }
        </>
    ) 
}

function resetAction(path, password){
    const resetOpt = {
        pathname: path,
        query:{
            password: password
        }
    }
    Router.push(resetOpt)
}

function LoginWnd({ page }){
    // Variable
    const path = '/' + page
    const [ password, setPassword ] = useState("")
    // CSS
    const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
    const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
    // Actions
    const getPassword = e => { setPassword(e.target.value) }
    const setPasswordOpt = {
        pathname: path,
        query: { 
            password: password,
        }
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
          <button className={cn(...buttonCSS)} onClick={()=>resetAction(path, null)}>
            no
          </button>
          <button className={cn(...buttonCSS)} onClick={()=>resetAction(path, password)}>
            yes
          </button>
        </div>
      </div>
    )
}

function DeleteWnd({ page, data, savedPassword }){
    // Variable
    const [ password, setPassword ] = useState("")
    let id = data.id
    let isTest = true
    const path = '/' + page
    // CSS
    const inputCSS = ['mt-2', 'p-2', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
    const buttonCSS = ['uppercase', 'bg-blue-400', 'w-32', 'h-8', 'rounded-md', 'hover:bg-blue-600', 'hover:shadow-outline']
    // Actions
    
    const confirmOpt = async () => {
        const tmpPassword = password?password:savedPassword
        let tmpData = {
          "id": id,
          "option": "delete",
          "password": tmpPassword,
        }

        await sendData(tmpData, isTest)
        
    }

    const getPassword = e => { setPassword(e.target.value) }

    return(
      <div className="text-center flex flex-wrap">
        <div className="w-full mt-2 font-semibold text-red-600 text-xl">Do you want to delete the idea?</div>
        <div className="flex mt-5 w-full">
          <div className={cn('mt-2', 'p-2', 'ml-4')}> Password: </div>
          <input className={cn(...inputCSS, 'mr-10')} id='password' type='password' placeholder='your password' onChange={(e)=>getPassword(e)}/>
        </div>
        <div className="flex justify-around my-5 w-full">
          <button className={cn(...buttonCSS)} onClick={()=>resetAction(path, savedPassword)}>
            no
          </button>
          <button className={cn(...buttonCSS)} onClick={()=>{confirmOpt();resetAction(path, savedPassword)}}>
            yes
          </button>
        </div>
      </div>
    )
    
}

function Style1({ child, page, password }){

    // CSS
    
    const overlayCSS = ['bg-gray-800', 'opacity-25']
    const path = '/' + page
    // Actions
    
    return(
      <>
        {/* overlay */}
        <div className={cn('fixed', 'top-0', 'left-0', 'flex', 'flex-wrap', 'w-screen', 'h-screen')}>
          <div className={cn(...overlayCSS, 'w-full', 'h-2/7')} onClick={()=>resetAction(path, password)}>
          </div>

          <div className="w-full h-auto flex">
            <div className={cn(...overlayCSS, 'w-1/3')} onClick={()=>resetAction(path, password)}> </div>
            <div className="w-1/3 bg-orange-200 border-2 border-red-400 ">
                { child }          
            </div>
            <div className={cn(...overlayCSS, 'w-1/3')} onClick={()=>resetAction(path, password)}> </div>
            
          </div>
          <div className={cn(...overlayCSS, 'w-full', 'h-3/5')} onClick={()=>resetAction(path, password)} ></div>
        </div>
      </>
    )

}
