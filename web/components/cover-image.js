import cn from 'classnames'
import Link from 'next/link'
import {Image} from 'react-datocms'

export default function CoverImage({ title, responsiveImage, setting}) {
  const image=(
    <div className="-mx-5 sm:mx-0">
      <Image data={{...responsiveImage, 
        title: `${title}`,
      }} 
      className={cn('shadow-small', ...setting,{
        'hover:shadow-medium transition-shadow duration-200': title,
      })}
      />
    </div>
  )
  return (
    <>
      {image}
    </>
  )
}
