export function IdeaHeader({header}){
  return(
    <>
    <div className="flex mx-10 p-4 bg-white">
      <div className="w-1/2 flex">
        <div className="mx-2">
          <input className="" type="radio" name="status" id="active" value="active" checked/> 
          <label for="active" className="hover:text-blue-600"> Active </label>
        </div>
        <div className="mx-2">
          <input className="" type="radio" name="status" id="completed" value="completed"/> 
          <label for="completed" className="hover:text-blue-600 active:text-blue-600"> Completed </label>
        </div>
      </div>
      <div className="w-1/2 flex justify-end">
        <div className="mx-2"> All Tags </div>
        <div className="mx-2"> Default Sort </div>
      </div>
    </div>
    <style jsx>{`
      input:checked + label{
        color: blue;
        text-decoration: underline;
      }
    `}
    </style>
    </>
  )
}
export default function Ideas({ data }){
  
}
