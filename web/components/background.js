import CoverImage from '../components/cover-image'
import Container from '../components/container'
import cn from 'classnames'

export default function Background({ imgAndSetting=[], children }) {
  const setting = imgAndSetting.setting
  const url = imgAndSetting.img.image.responsiveImage.src
  return (
    <div className={cn("bg-img",...setting)}>
      <style jsx>{`
        .bg-img{
          background: url(${url}) no-repeat;
          background-size: cover;
          width: 100%;
        }
      `}
      </style>
      {children}
    </div>
  )
}
