import cn from 'classnames'
import { PlanItem } from '../components/plans'
import { useState } from 'react'
import { Overlay } from '../components/overlay'
export function TopPlan({businessPlan=[], privatePlan=[], password, actions}){
    // CSS
    const textCSS = ['text-gray-400', 'hover:text-blue-400', 'cursor-pointer']
    // Status
    const [ showBusiness, setShowBusiness ] = useState(true)
    const [ showPrivate, setShowPrivate ] = useState(false)
    const [ showOverlay, setShowOverlay ] = useState(false)
    const [ option, setOption ] = useState()
    const [ selectedItem, setSelectedItem ] = useState(false)
    const [ itemData, setItemData ] = useState()

    // Actions
    const topPlanCompleteAction = () => {
        itemData.completeAction()
    }
    // Variables
    const init = {
        showContent: true,
        showEditbar: false,
        showBody: false,
        countDown: true,
        type: 'top-plan',
    }
    const itemActions = {
        setShowOverlay: setShowOverlay,
        setSelectedItem: setSelectedItem,
        setItemData: setItemData,
    }
    
    const overlayActions = {
        setShowOverlay: setShowOverlay,
        setItemStatus: itemData?.setItemStatus || null,
        setOption: setOption,
        topPlanCompleteAction: topPlanCompleteAction,
    }
    let businessPlans = []
    let privatePlans = []
    
    // all children items
    for (let i of businessPlan){
        businessPlans.push(<PlanItem data={i} key={i.id+"_top"} password={password} editStatus={false} init={init} css={['mr-auto', 'ml-auto']} actions={itemActions}/>)
    }

    for (let i of privatePlan){
        privatePlans.push(<PlanItem data={i} key={i.id+"_top"} password={password} editStatus={false} init={init} css={['mr-auto', 'ml-auto']} actions={itemActions}/>)
    }
    const main = (
        <>
          <div>
            <div className={cn(...textCSS, )} onClick={()=>setShowBusiness(!showBusiness)}>
              Business
            </div>
            <div className={cn({'hidden':!showBusiness}, 'w-full', )}>
              {businessPlans}
            </div>
            <div className={cn(...textCSS)} onClick={()=>setShowPrivate(!showPrivate)}>
              Private
            </div>
            <div className={cn({'hidden':!showPrivate}, 'w-full')}>
              {privatePlans}
            </div>
          </div>
        </>
    )
    return (
        <>
          {main}
          { showOverlay &&
              <Overlay page='top_plan' option='delete' password={password} actions={overlayActions} />
          }
         
        </>
    )
}
