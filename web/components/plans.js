import cn from 'classnames'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCrosshairs, faHiking, faStar, faExclamationCircle, faHourglassEnd, faClock, faHistory, faAngleLeft, faAngleDown, faAngleDoubleRight, faAngleDoubleLeft, faPlus, faArrowAltCircleDown, faTags } from '@fortawesome/free-solid-svg-icons'
import Input from '../components/input'
import Select from '../components/select'
import Markdown from '../components/markdown'
import TextArea from '../components/textarea'
import { useInterval, sendData } from '../lib/api'
import { useDrag, useDrop } from 'react-dnd'
import { Overlay } from '../components/overlay'
import { getDateDiff, s2Time } from '../lib/tools'
import { isGithubLogin } from '../lib/github'

const ItemTypes = {
    PLAN: 'plan'
}

export function PlanItem({data, layer, editStatus, actions, parents, brother, password, init, css=[], selected=false}){
  // Variables
  const isTest = false
  const difficultySelect = [
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
  const typeSelect = [
    'Business',
    'Private',
  ]
  // Variables
  const durationSelect= [1,2,3,4,5,6,7,8]
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth()+1).toString().padStart(2,'0')
  const day = (date.getDate()+1).toString().padStart(2,'0')
  const dateString = year+'-'+month+'-'+day
  const commentUrl = data?.url
  // Status
  const [ contentPerformance, setContentPerformance] = useState(data?.contentPerformance || "Enter something")
  const [ title, setTitle ] = useState(data?.title || "")
  const [ showMenu, setShowMenu ] = useState(false)
  const [ showTitle, setShowTitle ] = useState(true)
  const [ target, setTarget ] = useState(data?.target || "")
  const [ edit, setEdit ] = useState(editStatus===undefined?false:editStatus)
  const [ compose, setCompose ] = useState(false)
  const [ showBody, setShowBody ] = useState(init?.showBody===undefined?(edit?false:true):init.showBody)
  const [ showTarget, setShowTarget ] = useState(true)
  const [ itemStatus, setItemStatus ] = useState(data?.itemStatus || 'active')
  const [ difficulty, setDifficulty ] = useState((data?.difficulty===undefined || data?.difficulty===null)? (difficultySelect.length-1):data.difficulty)
  const [ priority, setPriority ] = useState((data?.priority===undefined || data?.priority===null)? 0: data.priority)
  const [ urgency, setUrgency ] = useState((data?.urgency===undefined || data?.urgency===null)? 0: data.urgency)
  const [ endDate, setEndDate ] = useState(data?.endDate || dateString)
  const [ duration, setDuration ] = useState((data?.duration==undefined || data?.duration===null)? 0: data.duration)
  const [ type, setType ] = useState((data?.planType===undefined || data?.planType===null)? 0: data.planType)
  const [ period, setPeriod ] = useState((data?.period===undefined || data?.period===null)? 0: data.period)
  const [ tags, setTags ] = useState(data?.tag || '')
  const tagPerformance = data?.tag||''
  const [ content, setContent ] = useState(data?.content || '')
  const [ showDetails, setShowDetails ] = useState(true)
  const [ showPeriod, setShowPeriod ] = useState(true)
  const [ showContent, setShowContent ] = useState(init?.showContent===undefined?false:init.showContent)
  const [ showTags, setShowTags ] = useState(true)
  const [ showEditbar, setShowEditbar ] = useState(init?.showEditbar===undefined?true:init.showEditbar)
  const [ dateDiff, setDateDiff ] = useState(getDateDiff(data?.endDate))
  const [ diffDate, setDiffDate ] = useState(s2Time(dateDiff))
  const [ stopCount, setStopCount] = useState(data?.stopCount || true)
  const [ lastTime, setLastTime ] = useState(new Date())
  const [ startTime, setStartTime ] = useState(data?.startTime || null)
  const condition = (data!==undefined && data.startTime!==null) ? (new Date()-new Date(data.startTime))/1000 : 0
  const [ usedTime, setUsedTime ] = useState(condition)
  const [ totalUsedTime, setTotalUsedTime ] = useState(data?.totalUsedTime || 0)
  const [ left, setLeft ] = useState((data?.duration*3600+3600)-(totalUsedTime+usedTime) || null)
  const [ leftTime, setLeftTime ] = useState(s2Time(left) || null)
  // CSS
  const inputCSS = ['ml-2', 'p-1', 'w-full', 'shadow', 'appearance-none', 'border', 'rounded', 'text-gray-700', 'leading-tight', 'focus:outline-none', 'focus:shadow-outline', 'focus:border-red-500']
  const flexCSS = ['flex', 'items-center', 'content-center' ]
  const text1CSS = ['text-lg', 'font-medium', 'break-all', 'my-1']
  const text2CSS = ['text-sm', 'break-all', 'my-1']
  const text3CSS = ['ml-1', 'text-gray-400', 'text-sm', 'hover:text-blue-400', 'cursor-pointer']
  const iconCSS = ['mr-2', 'h-5', 'w-5']
  const menuShow = {'hidden':!showMenu}
  const menuHidden = {'hidden':showMenu}
  // Actions
  //console.log(data?.itemStatus, data?.title, 'status')
  const startCompose = () => setCompose(true)
  const stopCompose = () => setCompose(false)
  function getTitle(e){
      !compose && setTitle(e.target.value)
  } 

  const submit = async () =>{
      let form
      form = {
              "title": title,
              "content": content,
              "tag": tags,
              "priority": parseInt(priority),
              "itemStatus": itemStatus || 'active',
              "password": password,
              "target": target,
              "difficulty": difficulty,
              "urgency": urgency,
              "endDate": endDate,
              "duration": parseInt(duration),
              "period": period,
              "option": "update",
              "planType": parseInt(type),
              'completeness': 0,
              'startTime': null,
              'evaluation': null,
              'allowPriorityChange': false,
              'ref': 'plan_new',
              'owner': null,
              'contributor': null,
              'version': 0,
              'layer': parseInt(layer),
              'parents': parents || data.parents,
              'itemId': data?.itemId || Math.random().toString(),
                  
      }
      // create
      if (data?.id===undefined && data?.itemId===undefined){
          actions.createAction(form)
          return
      }
      // edit
      if (data?.id!==undefined || data?.itemId!==undefined){
          console.log('edit plan')
          form['id'] = data.id
          form['contentPerformance'] = contentPerformance
          actions.editAction(form, data)
          return
      }
  }
  
  const editAction = () =>{
      setEdit(true)
      setShowBody(false)
  }
  const selectAction = () =>{
      actions.setSelectedItem(data)
  }
  const confirmAction = () =>{
      setEdit(false)
      actions?.setShowNew && actions.setShowNew(false)
      submit()
  }
  const cancelAction = () =>{
      setEdit(false)
      actions?.setShowNew && actions.setShowNew(false)
      setTitle(data?.title || '')
      setTarget(data?.target || '')
      setDifficulty((data?.difficulty===undefined || data?.difficulty===null)? (difficultySelect.length-1):data.difficulty)
      setPriority((data?.priority===undefined || data?.priority===null)? 0: data.priority)
      setUrgency((data?.urgency===undefined || data?.urgency===null)? 0: data.urgency)
      setEndDate(data?.endDate || dateString)
      setDuration((data?.duration==undefined || data?.duration===null)? 0: data.duration)
      setType((data?.planType===undefined || data?.planType===null)? 0: data.planType)
      setPeriod((data?.period===undefined || data?.period===null)? 0: data.period)
      setTags(data?.tag || '')
      setContent(data?.content || "")
      setContentPerformance(data?.contentPerformance || 'Enter something')

      actions.cancelAction
  }
  const completeAction = async () =>{
      setItemStatus('completed')
      const form = {
          "id": data.id,
          "itemStatus": 'completed',
          "option": "update",
          //"password": password,
      }
      actions.completeAction(form, data)

  }
  const activeAction =  async () =>{
      setItemStatus('active')
      const form = {
          "id": data.id,
          "itemStatus": 'active',
          "option": "update",
          //"password": password,
      }
      actions.activeAction(form, data)
  }
  const deleteAction = () =>{
      actions.setSelectedItem(data)
      actions.setShowOverlay(true)
      actions.setOption('delete')
  }
  const topPlanCompleteAction= () => {
      actions.setSelectedItem(data)
      actions.setShowOverlay(true)
      actions.setItemData({completeAction: completeAction,  setItemStatus: setItemStatus})
  }
  const topPlanStopAction = () => {
      const form = {
          totalUsedTime: totalUsedTime+usedTime,
          stopCount: !stopCount, //the state can't change immediately
          startTime: null,
      }
      setStopCount(true)
      setStartTime(null)
      setTotalUsedTime(totalUsedTime+usedTime)
      setUsedTime(0)
      actions.updateOneAction(form, data)

  }
  const topPlanStartAction = () => {
      const form = {
          stopCount: !stopCount,
          startTime: new Date(), //stamptime
      }
      setStopCount(false)
      actions.updateOneAction(form, data)
  }
  const clickTitleAction = () => {
      if (edit){
          setShowTitle(false)
      }
      if (!edit) {
          setShowBody(!showBody)
      }
  }
  function attachRef(el){
      if (edit) return
      drop(el)
      end(el)
  }
  const [{isDragging}, end] = useDrag({
      item: {type: ItemTypes.PLAN},
      end: (el) => { 
          actions?.setDragSource && actions.setDragSource(data)
          return
      },
      collect: monitor => ({
          isDragging: !!monitor.isDragging(),
      }),
  })
  const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.PLAN,
      drop: (el) => {
          actions?.setDropTarget && actions.setDropTarget(data)
          return
      },
      collect: monitor => ({
          isOver: !!monitor.isOver(),
      }),
  })
  if (data===undefined) selected=true
  const updateTopState = () => {
      const form = {
          left: left
      }
      actions?.updateOneAction && actions.updateOneAction(form, data)
  }

  // Effect
  useInterval(() => {
      setDateDiff(dateDiff-1)
      setDiffDate(s2Time(dateDiff))
  }, 1000)
  
  useInterval(()=>{
      if (!stopCount){
        const now = new Date()
        if (now-lastTime>2000){
            const tmpUsedTime = (now-new Date(data.startTime))/1000
            setUsedTime(tmpUsedTime+1)
            setLeft(data.duration*3600+3600-(totalUsedTime+usedTime))
            setLeftTime(s2Time(left))
        }
        else{
            setLeft(left-1)
            setLeftTime(s2Time(left))
            setUsedTime(usedTime+1)
        }
        
        setLastTime(now)
      }
     
  }, 1000)
  useEffect(() => {
      if (data?.stopCount!==undefined){
        setStopCount(data.stopCount)
      }
  }, [(data?.stopCount===stopCount)])

  const main = (
    <>
      <div className={cn("m-2", "px-2", "border-2", "border-gray-800", "max-w-lg", {'bg-black': itemStatus==='completed'}, {'bg-opacity-50': itemStatus==='completed'}, ...css)} ref={attachRef} style={{
          opacity: isDragging?0.5:1,
          cursor: 'move',
          background: isOver?'lightblue':'',
      }}>
        {/* head */}
        <div className={cn("flex", "justify-end", "items-center",  {'hidden':!showEditbar})}>
          <FontAwesomeIcon icon={faAngleDoubleRight} className={cn('w-3', 'h-3', 'cursor-pointer', menuShow, {'hidden':edit}) } onClick={()=>setShowMenu(false)} />
          <FontAwesomeIcon icon={faAngleDoubleLeft} className={cn('w-3', 'h-3', 'cursor-pointer', menuHidden, {'hidden':edit}) } onClick={()=>setShowMenu(true)} />
          <a href={commentUrl} className={cn(...text3CSS, {'hidden':edit}, menuShow)} target='_blank'>
            comment
          </a>
          <div className={cn(...text3CSS, {'hidden':edit}, menuShow)} onClick={itemStatus==="completed"?activeAction:completeAction}>
            {itemStatus==="completed"?"active":"complete"}
          </div>
          <div className={cn(...text3CSS, {'hidden':edit}, menuShow )} onClick={deleteAction}>
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
          <div className={cn(...text3CSS, {'hidden':edit}, menuShow )} onClick={editAction}>
            edit
          </div>
        </div>
        { init?.countDown &&
            <div className={cn(...flexCSS, 'justify-between')}>
              <div className={cn(...flexCSS,)}>
                <div className="text-red-600">
                 {diffDate}
                </div>
                <div className="text-red-600 ml-4">
                 {leftTime}
                </div>
              </div>
              <div className={cn(...flexCSS,)}>
                <button className={cn({'hidden': edit}, 'uppercase', 'mx-1', {'hidden':!stopCount})} onClick={topPlanStartAction}>
                  start
                </button>
                <div className={cn({'hidden': edit}, 'uppercase', 'mx-1', {'hidden':stopCount}, 'cursor-pointer')} onClick={topPlanStopAction}>
                  stop
                </div>
                <div className={cn({'hidden': edit}, 'uppercase', 'mx-1', 'cursor-pointer')} onClick={itemStatus==='completed'?activeAction:topPlanCompleteAction}>
                  {itemStatus==='completed'?'active':'complete'}
                </div>
              </div>
            </div>
        }
        <div className="flex flex-none justify-between" >
          <div className={cn({'hidden': !showTitle}, ...text1CSS, 'cursor-pointer', 'w-full')} onClick={clickTitleAction}>
            {title || 'you need a title'}
          </div>
          <div className={cn({'hidden':showTitle}, ...flexCSS)}>
            <div> Title:</div>
            <Input value={title} setValue={setTitle} css={[{'hidden':!edit}]} setState={()=>{setShowTitle(true)}}/> 
          </div>

        </div>
        {/* body */}
        <hr />
        <div className={cn({'hidden':showBody})}>
          {/*target*/}
          <div className={cn(...text2CSS, ...flexCSS)} >
            <FontAwesomeIcon icon={faCrosshairs} className={cn(...iconCSS)} title={'Target'} />
            <div className={cn({'hidden':!showTarget&&edit}, {'cursor-pointer':edit} )} onClick={()=>setShowTarget(false)}> {target || "what's your target?"} </div>
            <Input value={target} setValue={setTarget} css={[{'hidden':showTarget||!edit}]} setState={()=>setShowTarget(true)}/>
          </div>
          {/*difficutly*/}
          <div className={cn(...text2CSS, ...flexCSS)}>
              <FontAwesomeIcon icon={faHiking} className={cn(...iconCSS)} title={'Difficulty'}/>
              <div className={cn({'hidden':edit})} > 
                {difficultySelect[difficulty]}
              </div>
              <Select items={difficultySelect} setValue={setDifficulty} defaultValue={difficulty} css={[{'hidden':!edit}]}/>
          </div>
          {/*priority and urgency*/}
          <div className={cn(...text2CSS, ...flexCSS, 'w-full')}>
            <div className="w-2/3 flex">
              <FontAwesomeIcon icon={faStar} className={cn(...iconCSS)} title={'Priority'} />
              <div className={cn({'hidden':edit})} > 
                {prioritySelect[priority]}
              </div>
              <Select items={prioritySelect} setValue={setPriority} defaultValue={priority} css={[{'hidden':!edit}]}/>
            </div>
            <div className="w-32 flex">
              <FontAwesomeIcon icon={faExclamationCircle} className={cn(...iconCSS)} title={'Urgency'} />
              <div className={cn({'hidden':edit})} > 
                {urgencySelect[urgency]}
              </div>
              <Select items={urgencySelect} setValue={setUrgency}defaultValue={urgency} css={[{'hidden':!edit}]}/>
            </div>
          </div>
          {/*end date and duration */}
          <div className={cn(...text2CSS, ...flexCSS, 'justify-between')}>
            <div className="w-2/3 flex">
              <FontAwesomeIcon icon={faHourglassEnd} className={cn(...iconCSS)} title={'End date'} />
              <div className={cn({'hidden':edit},)} > 
                {endDate}
              </div>
              <input type="date" value={endDate}  onChange={e=>setEndDate(e.target.value)} className={cn({'hidden':!edit}, 'cursor-pointer')}/>
            </div>
            <div className="w-32 flex">
              <FontAwesomeIcon icon={faClock} className={cn(...iconCSS)} title={'Duration'} />
              <div className={cn({'hidden':edit})} > 
                {(parseInt(duration)+1)} &nbsp;
              </div>
              <Select items={durationSelect} setValue={setDuration} defaultValue={duration} showIcon={false} css={[{'hidden':!edit}]}/>
              <div>
                {duration>0?'hours':'hour'}
              </div>
            </div>
            
            
          </div>
          {/* period and types*/}
          <div className={cn(...text2CSS, ...flexCSS, 'justify-between')}>
            <div className="w-1/2 flex">
              <FontAwesomeIcon icon={faHistory} className={cn(...iconCSS)} title={'Period'} />
              <div className={cn({'hidden':!showPeriod&&edit}, {'cursor-pointer':edit})} onClick={()=>setShowPeriod(false)}> {period} days </div>
              <Input value={period} setValue={setPeriod} css={[{'hidden':showPeriod||!edit}]} setState={()=>setShowPeriod(true)} />

            </div>
            <div className="w-1/2 flex">
              
              <FontAwesomeIcon icon={faList} className={cn(...iconCSS)} title={'type'} />
              <div className={cn({'hidden':edit})} > 
                {typeSelect[type]} 
              </div>
              <Select items={typeSelect} setValue={setType} defaultValue={type} css={[{'hidden':!edit}]}/>
            </div>

          </div>
          {/*tags*/}
          <div className={cn(...text2CSS, ...flexCSS, 'justify-between',)}>
            <div className={cn('flex', 'w-9/10')}>
              <FontAwesomeIcon icon={faTags} className={cn(...iconCSS,)} title={'Tags'} />
              <div className={cn({'hidden':!showTags&&edit}, {'cursor-pointer':edit})} onClick={()=>setShowTags(false)}> {tagPerformance || 'your tags'} </div>
              <Input value={tags} setValue={setTags} css={[{'hidden':showTags||!edit}]} setState={()=>setShowTags(true)}/>
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
              <div className={cn({'hidden':!showDetails&&edit}, {'cursor-pointer':edit})} onClick={()=>setShowDetails(false)}>
                <Markdown content={contentPerformance} />
                {contentPerformance.length<=1 && 'Enter something'}
              </div>
              <TextArea value={content} setValue={setContent} setHtml={setContentPerformance} css={[{'hidden':showDetails||!edit}]} setState={()=>setShowDetails(true)} />
              <div className={cn({'hidden':showDetails}, 'flex')}>
                <button onClick={()=>setShowDetails(true)} className={cn({'hidden':showDetails||!edit})}> Confirm </button>
              </div>
            </div>
          }
        </div>
      </div>
    </>
  )
  return(
    <>
      {
          (init?.type===undefined || (init.type==='top-plan' && itemStatus==='active')) &&
          main
      }
    </>
  )
}


export function PlanLayer({items, layer, actions, password, update}){
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
        createAction: actions.createAction,
        editAction: actions.editAction,
        completeAction: actions.completeAction,
        activeAction: actions.activeAction,
        cancelAction: actions.cancelAction,
    }
    // all children items
    for (let i of items){
        plans.push(<PlanItem data={i} key={i.id||i.itemId} actions={actionsNext} layer={layer} password={password}/>)
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
