export function Button({bn, onClick}){
  const main = (
    <>
      <button className="bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white font-semibold py-2 px-4 border border-blue-500 rounded" onClick={onClick}>
        {bn}
      </button>  
    </>
  )
  return (
    <>
      {main}
    </>
  )
}
