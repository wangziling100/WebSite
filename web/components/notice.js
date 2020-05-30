export default function Notice({ title, content }){
  return(
    <div className="ml-10 mr-10 bg-gray-100 rounded border-gray-200 border-2">
      <div className="text-6xl mt-6 mx-4 font-semibold">
        {title}
      </div>
      <div className="text-2xl mx-4">
        {content}
      </div>
    </div>
  )
}
