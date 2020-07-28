import { HelloAppear, Appear } from '../components/animation'

export default function Hello(){
  return(
    <>
    <div className="static text-white font-thin ml-40 text-purple-200 text-4xl font-sans-Roboto">
      <HelloAppear className="mt-48 inline-block text-4xl font-normal " duration="6s">
        Hey!
      </HelloAppear>
      <HelloAppear className="inline text-4xl font-normal" duration="8s"> I'm </HelloAppear>
      <HelloAppear className="font-momo text-red-500 text-6xl" duration="10s">
        Wang Xingbo 
      </HelloAppear>
      <HelloAppear duration="12s"> Welcome to my website </HelloAppear>
      <div className="absolute top-0 left-0 mt-48 w-full h-40 z-20 flex justify-center text-center">
        <div className="w-1/3">  </div>
        <Appear duration="14s" className="w-1/3"> 
          <div className="bg-black bg-opacity-50 font-medium p-6">
            <div className="text-sm font-light italic"> 
               I am a slow walker, but i never walk backwards.  
            </div>
            <div className="text-sm font-light text-right pr-16 italic">
              -- Abraham Lincoln
            </div>
            <div className="text-6xl">Wang Xingbo</div>
            <div className="text-sm font-light"> 
              <div> A developer </div>
              <div>focus on data analysis & automation </div>
            </div>

            <a href="mailto:wangziling1000@gmail.com">
            <button className="mt-2 text-base bg-red-600 p-2 rounded-full w-40 text-yellow-200 hover:bg-yellow-400 hover:text-red-600"> Let's have a talk</button>
            </a>
          </div>
        </Appear>
        <div className="w-1/3">  </div>
      </div>

    </div>
    </>
  )
}
