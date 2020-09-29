import Image from '../components/image'
//import { Image } from 'antd'
import cn from 'classnames'
import { useState } from 'react'
import { Modal, Button } from 'antd';
import { addPluginConfig } from '../lib/tools';
export default function ServiceCard({config, bg, logo}){
    // Variables
    const name = config.name || 'No Name'
    const description = config.description || 'No description'
    let logoText, logoComponent
    const cardCSS = ['relative', 'h-40', 'w-full', 'max-w-xs', 'my-10',
    'shadow', 'cursor-pointer']
    const bgCSS = ['h-full', 'w-full', 
    'rounded-md']
    const logoCSS = ['h-24', 'w-24', 'rounded-full', ]
    const nameCSS = ['font-semibold', 'text-2xl',
    'w-full', 'flex', 'justify-center']
    // States
    const [ visible, setVisible] = useState(false)
    const [ loading, setLoading ] = useState(false)

    // Functions
    const clickCard = ()=>{
      setVisible(true)
    }
    const handleOk = ()=>{
      addPluginConfig(config)
      setVisible(false)
      setLoading(false)
    }
    const handleCancel = ()=>{
      setVisible(false)
      setLoading(false)
    }

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
        <div className={cn(...cardCSS)} onClick={clickCard}>
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
        <Modal
          visible={visible}
          title="Description"
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="back" type="primary" onClick={handleCancel}>
              Return
            </Button>,
            <Button key="install" type="primary" loading={loading} onClick={handleOk}>
              Install 
            </Button>,
          ]}
        >
          {
            description &&
            <div>
              {description}
            </div>
          }
        </Modal>
      </>
    )
    return (
      <>
        {main}
      </>
    )
}
