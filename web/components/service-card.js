import Image from '../components/image'
//import { Image } from 'antd'
import cn from 'classnames'
export default function ServiceCard({name, bg, logo}){
    // Variables
    let logoText, logoComponent
    
    const cardCSS = ['relative', 'h-40', 'max-w-xs',
    'shadow', 'cursor-pointer']
    const bgCSS = ['h-full', 'w-full', 
    'rounded-md']
    const logoCSS = ['h-24', 'w-24', 'rounded-full', ]
    const nameCSS = ['font-semibold', 'text-4xl',
    'w-full', 'flex', 'justify-center']

    // Init
    if (logo.text!==undefined){
        const text = logo.text
        let color, size
        if (logo.color===undefined) color = 'bg-white'
        else if (logo.color==='black') color = 'bg-black'
        else color = 'bg-'+logo.color+'-400'

        if (logo.size===undefined) size='text-6xl'
        else size = 'text-'+logo.size+'xl'
        logoComponent = (
          <div className={cn(...logoCSS, color, 'flex',
          'justify-center', 'items-center')}>
            <div className={size}>
              {text}
            </div>
          </div>
        )
    }
    else if(logo.src!==undefined){
        logoComponent = <Image src={logo.src} 
                                css={logoCSS} />
    }

    const main = (
      <>
        <div className={cn(...cardCSS)}>
          { bg && <Image src={bg.src} css={bgCSS}/> }
          <div className='absolute inset-0 
          flex-col pt-3
          w-full h-full'>
            <div className='w-full flex justify-center'>
                {logo && logoComponent}
            </div>
            <div className={cn(...nameCSS)}>
            {name} 
            </div>
          </div>
          
        </div>
      </>
    )
    return (
      <>
        {main}
      </>
    )
}