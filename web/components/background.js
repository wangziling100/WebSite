import cn from 'classnames'
import Image from '../components/image'

export default function Background({ imgAndSetting=[], children }) {
  const setting = imgAndSetting.setting
  const url = imgAndSetting.img.image.responsiveImage.src
  const onLoadAction = () => {
      console.log('Background', url)
  }
  const onLoad = () => {
      console.log('bg loaded')
  }
  const actions = {
      onLoadAction: onLoadAction,
  }
  return (

    <>
    {/*
    <div className={cn("bg-img",...setting)} onLoad={onLoad}>
      <style jsx>{`
        .bg-img{
          background: url(${url});
          background-size: cover;
          width: 100%;
        }
      `}
      </style>
      {children}
    </div>
    */}
      <Image src={url} actions={actions} css={setting}/>
      {children}
    </>
  )
}
