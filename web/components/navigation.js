export default function Navigation(){
    const nav = (
        <div className="p-4 ">
          <div className="w-full flex flex-raw items-center justify-start p-2 text-base font-serif-Georgia tracking-widest text-white rounded-lg list-none">
            <div className="px-4 underline hover:underline cursor-pointer ">
              Home
            </div >
            <div className="px-4 hover:underline cursor-pointer">
              Idea
            </div>
            <div className="px-4 hover:underline cursor-pointer">
              Plan
            </div>
            <div className="px-4 hover:underline cursor-pointer">
              Service
            </div>
            <div className="px-4 hover:underline cursor-pointer">
              About me
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
