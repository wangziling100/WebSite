import { writeData } from '../lib/api'
import cn from 'classnames'

export default function GithubList({name, actions}){
    const textCSS = ['flex justify-center cursor-pointer']
    // Actions
    const signOutAction = () => {
        writeData({
            userData: null,
            loginStatus: 'logout',
            repos: null,
            userPassword:'',
        })
        actions.updateFunction()
        actions.cleanLocalData()
    }
    const main = (
      <>
        <div className='p-2 bg-white rounded-md border-2'>
          <div className={cn(...textCSS, 'font-semibold', 'divide-y')}>
            {name}
          </div>
          <hr/>
          <div className={cn(...textCSS, 'hover:text-white', 'hover:bg-blue-400', )} onClick={signOutAction}>
            Sign out
          </div>
        </div>
      </>
    )
    return (
      <>
        { main }
      </>
    )
}
