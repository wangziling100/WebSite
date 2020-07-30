import { writeData, readData } from '../lib/api'
import { useEffect } from 'react'
export function setPageStatus(state){
    writeData({
        pageStatus: state,
    })
}

export function useLoadSession(setSessionData){
    useEffect(() => {
        console.log('set sessionData')
        const sessionData = readData()
        setSessionData(sessionData)
    }, [])
}

export function getLoginStatus(){
    sessionData = readData()
    return sessionData.loginStatus
}
