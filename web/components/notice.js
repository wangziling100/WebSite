import Markdown from '../components/markdown'
export default function Notice({ title, content }){ 
  return(
    <div className="ml-10 mr-10 bg-gray-100 rounded border-gray-200 border-2">
      <div className="text-2xl mt-2 mx-4 font-semibold">
        {title}
      </div>
      <div className=" mx-4 my-4">
        <Markdown content={content}/>
      </div>
    </div>
  )
}
