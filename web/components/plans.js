import cn from 'classnames'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faHiking, faStar, faExclamationCircle, faHourglassEnd, faClock, faHistory, faAngleLeft, faAngleDown, faAngleDoubleRight, faAngleDoubleLeft, faPlus, faArrowAltCircleDown, faTags } from '@fortawesome/free-solid-svg-icons'
import Input from '../components/input'
import Select from '../components/select'
import Markdown from '../components/markdown'
import TextArea from '../components/textarea'
import { sendData } from '../lib/api'
import { useDrag, useDrop } from 'react-dnd'
import { Overlay } from '../components/overlay'

const ItemTypes = {
    PLAN: 'plan'
}

export function PlanItem({data, layer, editStatus, actions, parents, brother, password, fold, selected=false}){
  // Variables
  const isTest = false
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
  const [ title, setTitle ] = useState(data?.title || "")
  const [ target, setTarget ] = useState(data?.target || "")
  const [ edit, setEdit ] = useState(editStatus || false)
  const [ compose, setCompose ] = useState(false)
  const [ showBody, setShowBody ] = useState(edit?false:true)
  const [ showTarget, setShowTarget ] = useState(true)
  const [ itemStatus, setItemStatus ] = useState(data?.itemStatus || 'active')
  const [ difficulty, setDifficulty ] = useState((data?.difficulty===undefined || data?.difficulty===null)? (diffcultySelect.length-1):data.difficulty)
  const [ priority, setPriority ] = useState((data?.priority===undefined || data?.priority===null)? 0: data.priority)
  const [ urgency, setUrgency ] = useState((data?.urgency===undefined || data?.urgency===null)? 0: data.urgency)
  const [ endDate, setEndDate ] = useState(data?.endDate || dateString)
  const [ duration, setDuration ] = useState((data?.duration==undefined || data?.duration===null)? 0: data.duration)
  const [ period, setPeriod ] = useState((data?.period===undefined || data?.period===null)? 0: data.period)
  const [ tags, setTags ] = useState(data?.tags || '')
  const [ content, setContent ] = useState(data?.content || 'Enter something')
  const [ tmpData, setTmpData ] = useState()
  const [ originalContent, setOriginalContent ] = useState(data?.originalContent || '')
  const [ showDetails, setShowDetails ] = useState(fold?.details===undefined? true: fold.details)
  const [ showPeriod, setShowPeriod ] = useState(true)
  const [ showContent, setShowContent ] = useState(false)
  const [ showTags, setShowTags ] = useState(true)

  // CSS
  const inputCSS = ['ml-2', 'p-1', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const flexCSS = ['flex', 'items-center', 'content-center' ]
  const text1CSS = ['text-lg', 'font-medium', 'break-all', 'my-1']
  const text2CSS = ['text-sm', 'break-all', 'my-1']
  const text3CSS = ['ml-1', 'text-gray-400', 'text-sm', 'hover:text-blue-400', 'cursor-pointer']
  const iconCSS = ['mr-2', 'h-5', 'w-5']
  // Actions
  const startCompose = () => setCompose(true)
  const stopCompose = () => setCompose(false)
  function getTitle(e){
      !compose && setTitle(e.target.value)
  } 

  const submit = async () =>{
      if (data?.id===undefined){
          const form = {
              "title": title,
              "content": content,
              "tag": tags,
              "priority": parseInt(priority),
              "completeness":0,
              "startTime": null,
              "evaluation": null,
              "allowPriorityChange": false,
              "ref": "plan_new",
              "refId": null,
              "owner": null,
              "contributor": null,
              "itemStatus": "active",
              "version": 0,
              "password": password,
              "layer": layer,
              "parents": parents,
              "target": target,
              "difficulty": difficulty,
              "urgency": urgency,
              "endDate": endDate,
              "duration": duration,
              "period": period,
                  
          }
          await sendData(form, isTest, actions.afterAddAction, true)
          return
      }
      if (data.id!==undefined){
          const form = {
              "title": title,
              "content": content,
              "tag": tags,
              "priority": parseInt(priority),
              "itemStatus": "active",
              "password": password,
              "target": target,
              "difficulty": difficulty,
              "urgency": urgency,
              "endDate": endDate,
              "duration": duration,
              "period": period,
              "id": data.id,
              "option": "update",
                  
          }
          await sendData(form, isTest)
      }
  }
  if (tmpData!==undefined){
      tmpData.then(v=>setContent(v))
  }
  const editAction = () =>{
      setEdit(true)
      setShowBody(false)
  }
  const selectAction = () =>{
      actions?.setSelectedId && actions.setSelectedId(data.id)
      actions?.setSelectedLayer && actions.setSelectedLayer(data.layer)
  }
  const confirmAction = () =>{
      setEdit(false)
      actions?.setShowNew && actions.setShowNew(false)
      submit()
  }
  const cancelAction = () =>{
      setEdit(false)
      actions?.setShowNew && actions.setShowNew(false)
  }
  const completeAction = () =>{
      setItemStatus('completed')
  }
  const activeAction = () =>{
      setItemStatus('active')
  }
  const deleteAction = () =>{
      actions.setSelectedItem(data)
      actions.setShowOverlay(true)
      actions.setOption('delete')
  }
  function attachRef(el){
      drop(el)
      end(el)
  }
  const [{isDragging}, end] = useDrag({
      item: {type: ItemTypes.PLAN},
      end: (el) => { 
          actions.setDragSource({id:data.id, layer:data.layer})
          return
      },
      collect: monitor => ({
          isDragging: !!monitor.isDragging(),
      }),
  })
  const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.PLAN,
      drop: (el) => {
          actions.setDropTarget({id:data.id, layer:data.layer})
          return
      },
      collect: monitor => ({
          isOver: !!monitor.isOver(),
      }),
  })
  if (data===undefined) selected=true

  const main = (
    <>
      <div className={cn("m-2", "px-2", "border-2", "border-gray-800", "max-w-lg", {'bg-black': itemStatus==='completed'}, {'bg-opacity-50': itemStatus==='completed'})} ref={attachRef} style={{
          opacity: isDragging?0.5:1,
          cursor: 'move',
          background: isOver?'lightblue':'',
      }}>
        {/* head */}
        <div className="flex justify-end">
          <div className={cn(...text3CSS, {'hidden':edit}, )} onClick={itemStatus==="completed"?activeAction:completeAction}>
            {itemStatus==="completed"?"active":"complete"}
          </div>
          <div className={cn(...text3CSS, {'hidden':edit})} onClick={deleteAction}>
            delete
          </div>
          <div className={cn(...text3CSS, {'hidden':selected})} onClick={selectAction}>
            select
          </div>
          <div className={cn(...text3CSS, {'hidden':!edit})} onClick={cancelAction}>
            cancel
          </div>
          <div className={cn(...text3CSS, {'hidden':!edit})} onClick={confirmAction}>
            confirm
          </div>
          <div className={cn(...text3CSS, {'hidden':edit}, )} onClick={editAction}>
            edit
          </div>
        </div>
        <div className="flex flex-none justify-between" >
          <div className={cn({'hidden': edit}, ...text1CSS, 'cursor-pointer', 'w-full')} onClick={()=>setShowBody(!showBody)}>
            {title || 'you need a title'}
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
            <div className={cn({'hidden':!showTarget})} onClick={()=>setShowTarget(false)}> {target || "what's your target?"} </div>
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
            
          </div>
          {/*tags*/}
          <div className={cn(...text2CSS, ...flexCSS, 'justify-between',)}>
            <div className={cn('flex', 'w-9/10')}>
              <FontAwesomeIcon icon={faTags} className={cn(...iconCSS,)} title={'Tags'} />
              <div className={cn({'hidden':!showTags})} onClick={()=>setShowTags(false)}> {tags || 'your tags'} </div>
              <Input value={tags} setValue={setTags} css={[{'hidden':showTags}]} setState={()=>setShowTags(true)}/>
            </div>
            {/*details symbol*/}
            <div className="w-1/10">
              <FontAwesomeIcon icon={showContent?faAngleDown:faAngleLeft} className={cn(...iconCSS, 'cursor-pointer')} title={showContent?'Hide content':'Show content'} onClick={()=>setShowContent(!showContent)}/> 
            </div>
          </div>
          {/*details*/}
          <hr />
          {
            showContent &&
            <div>
              <div className={cn({'hidden':!showDetails}, )} onClick={()=>setShowDetails(false)}>
                <Markdown content={content} />
                {content.length<=1 && 'Enter something'}
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


export function PlanLayer({items, layer, actions, password}){
    // CSS
    const flexCSS = ['flex', 'items-center', 'content-center' ]
    const iconCSS = ['mr-2', 'h-10', 'w-10']
    // Variables
    let plans = []
    const [showBrother, setShowBrother] = useState(false)
    const [showNew, setShowNew] = useState(false)
    let firstPlan
    const newKey = Math.random()
    // Actions
    
    const actionsNext = {
        setSelectedId: actions.setSelectedId,
        setShowNew: setShowNew,
        setSelectedLayer: actions.setSelectedLayer,
        afterAddAction: actions.afterAddAction,
        setDragSource: actions.setDragSource,
        setDropTarget: actions.setDropTarget,
        setShowOverlay: actions.setShowOverlay,
        setSelectedItem: actions.setSelectedItem,
        setOption: actions.setOption,
    }
    // all children items
    for (let i of items){
        plans.push(<PlanItem data={i} key={i.id} actions={actionsNext} layer={layer} password={password}/>)
    }
    firstPlan = plans[0]
    plans.splice(0, 1)

    const main = (
        <div className={cn(...flexCSS)}>
          <div className={cn(...flexCSS, )}>
            {firstPlan}
            <div>
              <FontAwesomeIcon icon={faPlus} className={cn('cursor-pointer', 'w-5', 'h-5', 'ml-2')} title={'add new plan'} onClick={()=>setShowNew(true)}/>
              <FontAwesomeIcon icon={faAngleDoubleRight} className={cn(...iconCSS, 'cursor-pointer', {'hidden':showBrother})} title={'more'} onClick={()=>setShowBrother(true)}/>
              <FontAwesomeIcon icon={faAngleDoubleLeft} className={cn(...iconCSS, 'cursor-pointer', {'hidden':!showBrother})} title={'less'} onClick={()=>setShowBrother(false)}/>
            </div>
            {/*new brother*/}
            <div className={cn({'hidden':!showNew})}> 
              <PlanItem actions={actionsNext} layer={layer} editStatus={true} key={newKey} parents={items[0].parents} password={password}/>
            </div>
          </div>
          <div className={cn(...flexCSS, 'overflow-auto')}>
            {showBrother && plans}
          </div>
        </div>
    )
    return (
        <>
          {main}
        </>
    )
}
