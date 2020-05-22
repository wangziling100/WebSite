import CoverImage from './cover-image.js'
import Image from 'react-datocms'
import Container from '../components/container'
export default function Header({ img }) {
  const setting = ["w-full", "h-full", "bg-cover"]
  console.log(img)
  const image= (
    img &&
    <div className="container w-full">
      <CoverImage title={img.title} responsiveImage={img.image.responsiveImage} setting={setting} />
    </div>
  )
  return (
    <>
      { 
        image
      }
    </>
  )
}
