export default function Avatar({ name, picture }) {
  return (
    <div className="flex items-center">
      <img src={picture} className="w-10 h-10 rounded-full mr-4" alt={name} title={name}/>
    </div>
  )
}
