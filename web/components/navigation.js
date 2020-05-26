import Link from 'next/link'
import cn from 'classnames'

export default function Navigation({ page }){
    const nav = (
        <div className={cn("p-4 ", {"text-white": page=="index",})}>
          <div className="w-full flex flex-raw items-center justify-start p-2 text-base font-serif-Georgia tracking-widest rounded-lg list-none">
            <div className={cn({"underline": page=="index"})}>
              <Link href="/index">
                <a className="px-4 hover:underline cursor-pointer">Home</a>
              </Link>
            </div >
            <div className={cn({"underline": page=="idea"})}>
              <Link href="/idea">
                <a className="px-4 hover:underline cursor-pointer">Idea</a>
              </Link>
            </div>
            <div className={cn({"underline": page=="plan"})}>
              <Link href="/plan">
                <a className="px-4 hover:underline cursor-pointer">
                  Plan
                </a>
              </Link>
            </div>
            <div className={cn({"underline": page=="service"})}>
              <Link href="/service">
                <a className="px-4 hover:underline cursor-pointer">
                  Service
                </a>
              </Link>
            </div>
            <div className={cn({"underline": page=="about"})}>
              <Link href="/about">
                <a className="px-4 hover:underline cursor-pointer">
                  About me
                </a>
              </Link>
            </div>
          </div>
        </div>
    )
    return (
        <>
          {nav}
        </>
    )
}
