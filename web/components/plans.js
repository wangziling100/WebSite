import cn from 'classnames'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faHiking, faStar, faExclamationCircle, faHourglassEnd, faClock, faHistory, faAngleLeft, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import Input from '../components/input'
import Select from '../components/select'
import Markdown from '../components/markdown'
import TextArea from '../components/textarea'

export function PlanItem({data}){
  // Variables
  const diffcultySelect = [
    'Have all details',
    'Have idea and schedule but no details',
    'Have only idea', 
    'No idea, no schedule, no details',
  ]
  const prioritySelect =  [
    'Not important',
    'Normal',
    'Important',
    'Very important'
  ]
  const urgencySelect = [
    'Not urgent',
    'Normal',
    'Urgent',
    'Very urgent'
  ]
  const durationSelect= [1,2,3,4,5,6,7,8]
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth()+1).toString().padStart(2,'0')
  const day = date.getDate().toString().padStart(2,'0')
  const dateString = year+'-'+month+'-'+day
  const [ title, setTitle ] = useState(data.title)
  const [ target, setTarget ] = useState(data.target)
  const [ edit, setEdit ] = useState(false)
  const [ compose, setCompose ] = useState(false)
  const [ showBody, setShowBody ] = useState(false)
  const [ showTarget, setShowTarget ] = useState(true)
  const [ difficulty, setDifficulty ] = useState(data.difficulty || diffcultySelect.length-1)
  const [ priority, setPriority ] = useState(0)
  const [ urgency, setUrgency ] = useState(0)
  const [ endDate, setEndDate ] = useState(data.endDate || dateString)
  const [ duration, setDuration ] = useState(data.duration || 0)
  const [ period, setPeriod ] = useState(data.period || 0)
  const [ content, setContent ] = useState(data.content || 'Enter something')
  const [ tmpData, setTmpData ] = useState()
  const [ originalContent, setOriginalContent ] = useState(data.originalContent || '')
  const [ showDetails, setShowDetails ] = useState(true)
  const [ showPeriod, setShowPeriod ] = useState(true)
  const [ showContent, setShowContent ] = useState(false)

  // CSS
  const inputCSS = ['ml-2', 'p-1', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const flexCSS = ['flex', 'items-center', 'content-center' ]
  const text1CSS = ['text-lg', 'font-medium', 'break-all', 'my-1']
  const text2CSS = ['text-sm', 'break-all', 'my-1']
  const iconCSS = ['mr-2', 'h-5', 'w-5']
  // Actions
  const startCompose = () => setCompose(true)
  const stopCompose = () => setCompose(false)
  function getTitle(e){
      !compose && setTitle(e.target.value)
  } 
  if (tmpData!==undefined){
      tmpData.then(v=>setContent(v))
  }

  const main = (
    <>
      <div className="m-2 px-2 border-2 border-gray-800 max-w-lg">
        {/* head */}
        <div className="flex justify-end">
          <div className="text-gray-400 text-sm hover:text-blue-400 cursor-pointer" onClick={()=>setEdit(!edit)}>
            edit
          </div>
        </div>
        <div className="flex flex-none justify-between" >
          <div className={cn({'hidden': edit}, ...text1CSS, 'cursor-pointer', 'w-full')} onClick={()=>setShowBody(!showBody)}>
            {title}
          </div>
          <div className={cn({'hidden':!edit}, ...flexCSS)}>
            <div> Title:</div>
            <input  className={cn(...inputCSS,)} id='title' type='text' placeholder={title} onCompositionStart={startCompose} onCompositionEnd={e=>{stopCompose(); setTitle(e.target.value)}} onChange={getTitle}/>
          </div>
          <button className={cn({'hidden': edit}, 'uppercase', 'mx-1')}>
            start
          </button>
        </div>
        {/* body */}
        <hr />
        <div className={cn({'hidden':showBody})}>
          {/*target*/}
          <div className={cn(...text2CSS, ...flexCSS)} >
            <FontAwesomeIcon icon={faCrosshairs} className={cn(...iconCSS)} title={'Target'} />
            <div className={cn({'hidden':!showTarget})} onClick={()=>setShowTarget(false)}> {target} </div>
            <Input value={target} setValue={setTarget} css={[{'hidden':showTarget}]} setState={()=>setShowTarget(true)}/>
          </div>
          {/*difficutly*/}
          <div className={cn(...text2CSS, ...flexCSS)}>
              <FontAwesomeIcon icon={faHiking} className={cn(...iconCSS)} title={'Difficulty'}/>
              <Select items={diffcultySelect} setValue={setDifficulty} defaultValue={difficulty} />
          </div>
          {/*priority and urgency*/}
          <div className={cn(...text2CSS, ...flexCSS)}>
            <div className="w-1/2 flex">
              <FontAwesomeIcon icon={faStar} className={cn(...iconCSS)} title={'Priority'} />
              <Select items={prioritySelect} setValue={setPriority} defaultValue={priority} />
            </div>
            <div className="w-1/2 flex">
              <FontAwesomeIcon icon={faExclamationCircle} className={cn(...iconCSS)} title={'Urgency'} />
              <Select items={urgencySelect} setValue={setUrgency}defaultValue={urgency} />
            </div>
          </div>
          {/*end date, duration and period*/}
          <div className={cn(...text2CSS, ...flexCSS, 'justify-between')}>
            <div className="w-1/3 flex">
              <FontAwesomeIcon icon={faHourglassEnd} className={cn(...iconCSS)} title={'End date'} />
              <input type="date" value={endDate}  onChange={e=>setEndDate(e.target.value)}/>
            </div>
            <div className="w-1/3 flex">
              <FontAwesomeIcon icon={faClock} className={cn(...iconCSS)} title={'Duration'} />
              <Select items={durationSelect} setValue={setDuration} defaultValue={duration} showIcon={false}/>
              <div>
                hours
              </div>
            </div>
            <div className="w-1/3 flex">
              <FontAwesomeIcon icon={faHistory} className={cn(...iconCSS)} title={'Period'} />
              <div className={cn({'hidden':!showPeriod})} onClick={()=>setShowPeriod(false)}> {period} days </div>

              <Input value={period} setValue={setPeriod} css={[{'hidden':showPeriod}]} setState={()=>setShowPeriod(true)}/>


            </div>
            <div>
              <FontAwesomeIcon icon={showContent?faAngleDown:faAngleLeft} className={cn(...iconCSS, 'cursor-pointer')} title={showContent?'Hide content':'Show content'} onClick={()=>setShowContent(!showContent)}/> 
            </div>
          </div>
          {/*details*/}
          <hr />
          {
            showContent &&
            <div>
              <div className={cn({'hidden':!showDetails})} onClick={()=>setShowDetails(false)}>
                <Markdown content={content} />
              </div>
              <TextArea value={originalContent} setValue={setOriginalContent} setHtml={setTmpData} css={[{'hidden':showDetails}]} setState={()=>setShowDetails(true)} />
              <div className={cn({'hidden':showDetails}, 'flex')}>
                <button onClick={()=>setShowDetails(true)}> Confirm </button>
              </div>
            </div>
          }
        </div>
      </div>
    </>
  )
  return(
    <>
      {main}
    </>
  )
}
