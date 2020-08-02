import { readData } from '../lib/api'
export function isLocalLogin(){
    const data = readData()
    if (data.loginStatus==='local_login') return true
    else return false
}
