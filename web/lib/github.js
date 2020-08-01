import { getLabels, deleteLabel, setServerRequestOptions, sendRequest, readData } from '../lib/api'
import { copy } from '../lib/tools'
import { getFlatPlans, getLocalItemByAttr, getLocalItemsByAttr } from '../lib/localData'
function item2Milestone(item){
    let milestone = null
    const option = item.option
    if (option==='create' || option==='update'){
        //console.log(item, 'item2Milestone')
        milestone= {
            title: item.title,
            state: item.itemStatus,
            //description: JSON.stringify(tmp),
            option: item.option || 'create',
            itemType: 'milestone',
            userId: item.userId,
            userName: item.userName,
            repo: item.repo,
            hostname: item.hostname,
            issueNumber: item.issueNumber || null,
        }
        if (item.description!==undefined){
            milestone['description'] = item.description
        }
        else{
            const tmp = {
                tag: item.tag,
                priority: parseInt(item.priority),
                itemId: item.itemId,
                createdAt: item._createdAt,
                version: item.version,
                content: item.originContent || item.content,
                url: item.url || null,
                issueNumber: item.issueNumber || null,
                completeness: item.completeness, 
                endDate: item.endDate,
                itemStatus: item.itemStatus,
            }
            milestone['description'] = JSON.stringify(tmp)
        }
        
    
        if (option==='update') milestone['number'] = item.number
    }
    else if (option==='delete'){
        const tmp = {
            version: item.version,
            content: item.originContent || item.content,
        }
        milestone = {
            title: item.title,
            number: item.number,
            itemType: 'milestone',
            userId: item.userId,
            userName: item.userName,
            repo: item.repo,
            hostname: item.hostname,
            description: JSON.stringify(tmp),
            option: item.option,
            issueNumber: item.issueNumber,
        }
    }
    //console.log(milestone, 'item2Milestone')
    return milestone
}

export function milestone2Item(milestone, oldData){
    oldData['number'] = milestone.data.number
    oldData['id'] = milestone.data.id
    oldData['url'] = milestone.data.url
    return oldData
}
export function remoteData2LocalFormat(remote){
    const itemType = remote.itemType
    let ret
    if (itemType==='issue'){
        const [attrs, content] = parseBody(remote.body)
        ret = {
            id: remote.id,
            itemId: remote.itemId,
            number: remote.number,
            itemStatus: attrs.itemStatus,
            title: remote.title,
            url: remote.url,
            content: content,
            tag: decodeTag(attrs.tag) || '',
            priority: parseInt(attrs.priority),
            target: attrs.target,
            difficulty: attrs.difficulty,
            urgency: attrs.urgency,
            endDate: attrs.endDate,
            duration: attrs.duration,
            period: attrs.period,
            option: attrs.option || null,
            planType: attrs.planType,
            completeness: attrs.completeness,
            startTime: attrs.startTime|| null,
            evaluation: attrs.evaluation || null,
            allowPriorityChange: attrs.evaluation ||null,
            ref: attrs.ref || 'plan_new',
            owner: attrs.owner || null,
            contributor: attrs.contributor,
            version: attrs.version,
            layer: attrs.layer,
            parents: attrs.parents,
            itemType: itemType,
            url: attrs.url||remote.url,
            completeness: parseFloat(attrs.completeness) || 0,
        }
        return ret
    }
    else if (itemType==='milestone'){
        const [attrs, content] = parseBody(remote.description)
        ret = {
            title: remote.title,
            itemId: remote.itemId,
            id: remote.id,
            content: content,
            tag: attrs.tag || '',
            priority: parseInt(attrs.priority),
            completeness: parseFloat(attrs.completeness || 0),
            startTime: attrs.startTime || null,
            evaluation: attrs.evaluation || null,
            allowPriorityChange: attrs.allowPriorityChange || null,
            ref: attrs.ref || 'idea_new',
            refId: attrs.refId || null,
            owner: attrs.owner || null,
            contributor: attrs.contributor || '',
            itemStatus: attrs.itemStatus,
            version: attrs.version,
            layer: attrs.layer,
            parents: attrs.parents,
            target: attrs.target,
            difficulty: attrs.difficulty || null,
            urgency: attrs.urgency || null,
            endDate: attrs.endDate || null,
            duration: attrs.duration || null,
            period: attrs.period || null,
            _createdAt: attrs.createdAt || null,
            originContent: attrs.originContent|| null,
            comments: attrs.comments || null,
            url: attrs.url,
            itemType: itemType,
            number: remote.number,
            issueNumber: attrs.issueNumber,
        }

    }
    return ret
}

function encodeTag(tag){
    return tag.replace('#', '#!')

}

function decodeTag(tag){
    return tag.replace('#!', '#')
}

export function remoteData2Local(remote){
    //console.log('remote 2 local', remote)
    let ret = {}
    for (let el of remote){
        const formatedItem = remoteData2LocalFormat(el)
        //console.log(formatedItem, 'formatedItem')
        ret = reconstructRemote2LocalForEach(ret, formatedItem)
    }
    //console.log('remote 2 local', ret)
    return ret
}



function parseBody(body){
    //console.log(body, 'parse body')
    const lines = body.split('\n')
    let content = null
    let attrs = JSON.parse(lines[0]) 
    if (attrs.content!==undefined) content = attrs.content
    else content = lines.slice(1).join("")
    //console.log(content, 'parse body end')
    return [attrs, content]
}

export function parseVersion(item){
    if (item.description!==undefined){
        const [attrs, content] = parseBody(item.description)
        return attrs.version
    }
    else if (item.body!==undefined){
        const [attrs, content] = parseBody(item.body)
        return attrs.version
    }
    return null
}

function reconstructRemote2LocalForEach(output, item){
    //console.log(item.itemType, 'item type')
    if (item.itemType==='milestone'){
        if (output.ideaItem===undefined) output['ideaItem'] = []
        output.ideaItem.push(item)
    }
    else if (item.itemType==='issue'){
        if (output.layers===undefined) output['layers'] = {}
        const layer = item.layer
        if (output.layers[layer]===undefined) output.layers[layer] = []
        output.layers[layer].push(item)
    }
    return output
}

export function item2Issue(item){
    let issue = null
    //console.log(item, 'item2Issue')
    if (item instanceof Array){
        let tmp = []
        for (let el of item){
            el = tmpFunc(el)
            tmp.push(el)
        }
        issue = tmp
    }
    else {
        issue = tmpFunc(item)
    }
    //console.log(issue, 'issue')
    return issue

    function tmpFunc(item){
        const option = item.option
        if (option==='create' || option==='update' || option==='delete'){
            issue = {
                title: item.title,
                state: item.itemStatus,
                //body: JSON.stringify(tmp) + '\n' + item.content,
                //labels: labels,
                itemType: 'issue',
                assignees: item.assignees || [],
                //milestone: numMilestone,
                number: item.number,
                option: item.option,
            }
            if (item.body!==undefined){
                issue['body'] = item.body
                issue['state'] = item.state
            }
            else{
                const tmp = {
                    priority: parseInt(item.priority),
                    duration: parseInt(item.duration),
                    target: item.target,
                    difficulty: item.difficulty,
                    urgency: item.urgency,
                    endDate: item.endDate,
                    period: item.period,
                    planType: item.planType,
                    itemId: item.itemId,
                    createdAt: item._createdAt,
                    version: item.version,
                    parents: item.parents,
                    layer: item.layer,
                    completeness: item.completeness,
                    allowPriorityChange: item.allowPriorityChange,
                    contributor: item.contributor,
                    evaluation: item.evaluation,
                    owner: item.owner,
                    startTime: item.startTime,
                    url: item.url,
                    tag: encodeTag(item.tag),
                    itemStatus: item.itemStatus,
                }
                const [numMilestone, labels] = findMilestoneFromTags(item.tag)
                tmp['labels'] = labels
                tmp['milestone'] = numMilestone
                issue['body'] = JSON.stringify(tmp) + '\n' + item.content
                issue['labels'] = labels
                issue['milestone'] = numMilestone
            }
            
        }
        return issue
    }
    
    
}

function findMilestoneFromTags(tags){
    if (tags==='') return [null, null]
    let labels = []
    let numMilestone = null
    const tmpLables = tags.split(',')
    for (let label of tmpLables){
        const tmp = label.split(" ").join("")
        if (tmp[0]==='#'){
            try{
                numMilestone = parseInt(tmp.slice(1))
                continue
            }
            catch(error){
            }
        }
        label =label.replace(/(^\s*)|(\s*$)/g, "")
        if (label==='') continue
        labels.push(label)
        //labels.push(label.replace(/(^\s*)|(\s*$)/g, ""))
    }
    return [numMilestone, labels]
}

function deleteMilestoneLabel(plan, number){
    const label = '#'+number
    const labels = getLabels(plan.tag)
    const {findIt, returnArray} = deleteLabel(label, labels)
    if (findIt) {
        plan.tag = returnArray.join(', ')
    }
    return { findIt, returnPlan:plan }

}

export function findAndUpdatePlanByMilestoneNumber(plans, number){
    let ret = []
    for (let plan of plans){
        let {findIt, returnPlan} = deleteMilestoneLabel(plan, number)
        if (findIt) {
            returnPlan['option'] = 'update'
            returnPlan['itemType'] = 'issue'
            ret.push(returnPlan)
        }
    }
    return ret
}

export function getMilestoneByNum(password, number){
    const {succeed, item } = getLocalItemByAttr('idea', password, 'number', number)
    if(!succeed) console.warn('wrong number, getMilestoneByNum')
    return item
}

function getLatestIssueEndDateByMilestone(password, number, exclude){
    const issues = getFlatPlans(password) 
    let latestEndDate = null
    let latestEndTime = 0
    for (let issue of issues){
        const [ num, labels ] = findMilestoneFromTags(issue.tag)
        if (num===number ){
            if (exclude!==undefined && issue.itemId===exclude.itemId) continue
            const endDate = new Date(issue.endDate)
            const endTime = endDate.getTime()
            if (endTime>latestEndTime){
                latestEndTime = endTime
                latestEndDate = endDate
            }

        }

    }
    return latestEndDate
}

function getIssuesByMilestone(password, number){
    const {succeed, items} = getLocalItemsByAttr('plan', password, 'milestone', number)
    if(!succeed) console.warn('wrong number, getIssuesByMilestone')
    return items
}

function findLargestEndDateFromIssues(issues){
    let largest =0
    let largestDate = null
    for (let issue of issues){
        const endDate = new Date(issue.endDate)
        const endTime = endDate.getTime()
        if(endTime>largest){
            largest = endTime
            largestDate = endDate
        }
    }
    return largestDate
}

export function checkUpdateMilestoneEndDate(newData, sourceData, password){
    //console.log('---------------')
    //console.log(newData, sourceData, 'checkUpdateMilestoneEndDate')
    const option = newData.option
    const newEndDate = new Date(newData.endDate)
    const oldEndDate = new Date(sourceData.endDate)
    /*
    if (newEndDate===undefined || newEndDate===null) {
        return {
            shouldUpdateMilestoneEndDate: false,
            newMilestone: null
        }
    }
    */
    // get newMilestone and oldMilestone
    let newMilestone, oldMilestone
    if (newData===null) newMilestone = null
    else {
        const [ number, labels ] = findMilestoneFromTags(newData.tag)
        newMilestone = getMilestoneByNum(password, number)
    }
    
    if (sourceData===null) oldMilestone = null
    else {
        const [number, labels] = findMilestoneFromTags(sourceData.tag)
        oldMilestone = getMilestoneByNum(password, number)
    }
    //--------------------------------------
    
    if (option==='create'){
        /*
        const [ number, labels ] = findMilestoneFromTags(newData.tag)
        let milestone  = getMilestoneByNum(password, number)
        */
        if(newMilestone===undefined|| newMilestone===null){
            return {
                shouldUpdateMilestoneEndDate: false,
                newMilestone: null,
                oldMilestone: null
            }
        }
        return addMilestone(newMilestone, newEndDate)
        /*
        if (newMilestone.endDate===undefined || newMilestone.endDate===null){
            newMilestone['endDate'] = newEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: milestone
            }
        }
        const newEndTime = newEndDate.getTime()
        const latestEndDate = new Date(milestone.endDate)
        const latestEndTime = latestEndDate.getTime()
        if (newEndTime>latestEndTime){
            milestone['endDate'] = newEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: milestone
            }
        }
        return {
            shouldUpdateMilestoneEndDate: false,
            newMilestone: null
        }
        */
    }
    else{
        if(newMilestone===null && oldMilestone===null){
            return {
                shouldUpdateMilestoneEndDate: false,
                newMilestone: null,
                oldMilestone: null,
            }
        }
        else if(newMilestone!==null && oldMilestone===null){
            return addMilestone(newMilestone, newEndDate)
        }
        else if(newMilestone===null && oldMilestone!==null ){
            return deleteMilestone(oldMilestone, oldEndDate)
        }
        else if(newMilestone.number === oldMilestone.number){
            return updateMilestone(newMilestone, oldMilestone, newEndDate, oldEndDate)
        }
        else {
            if (newMilestone.endDate===undefined || newMilestone.endDate===null){
                newMilestone['endDate'] = newEndDate
            }
            else{
                const newEndTime = newEndDate.getTime()
                const latestEndDate = new Date(newMilestone.endDate)
                const latestEndTime = latestEndDate.getTime()
                if (newEndTime>latestEndTime){
                    newMilestone['endDate'] = newEndDate
                }
                else newMilestone = null
                
            }
            const oldEndTime = oldEndDate.getTime()
            const latestEndDate = new Date(oldMilestone.endDate)
            const latestEndTime = latestEndDate.getTime()
            let oldEndTimeIsLatest
            if (oldEndTime===latestEndTime) oldEndTimeIsLatest=true
            else oldEndTimeIsLatest = false
            if (oldEndTimeIsLatest){
                const newLatestEndDate = getLatestIssueEndDateByMilestone(password, oldMilestone.number, sourceData)
                oldMilestone['endDate'] = newLatestEndDate
            }
            else oldMilestone = null

            if (newMilestone === null && oldMilestone===null){
                return {
                    shouldUpdateMilestoneEndDate: false,
                    newMilestone: null,
                    oldMilestone: null,
                }
            }
            else{
                return {
                    shouldUpdateMilestoneEndDate: true,
                    newMilestone: newMilestone,
                    oldMilestone: oldMilestone,
                }
            }

        }
        /*
        //const oldEndDate = new Date(sourceData.endDate)
        const oldEndTime = oldEndDate.getTime()
        let number = null
        if (newData.milestone===undefined) {
            console.log('checkUpdateMilestoneEndDate bug')
            //alert('bug')
            let holder
            [ number, holder]  = findMilestoneFromTags(newData.tag)
        }
        else number = newData.milestone
        const milestone = getMilestoneByNum(password, number)
        const latestEndDate = new Date(milestone.endDate)
        const latestEndTime = latestEndDate.getTime()
        const newEndTime = newEndDate.getTime()
        console.log(newEndDate, latestEndDate, 'new latest end date')

        let oldEndDateIsLatest
        if (oldEndTime===latestEndTime) oldEndDateIsLatest=true
        else oldEndDateIsLatest = false

        if (newEndTime>latestEndTime){
            milestone['endDate'] = newEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: milestone,
                oldMilestone: null,
            }
        }
        else if (oldEndDateIsLatest){
            //const issues = getIssuesByMilestone(password, number)
            //console.log(issues, 'related issues')
            const newLatestEndDate = getLatestIssueEndDateByMilestone(password, number, sourceData)
            console.log(newLatestEndDate, 'new latest end date')
            milestone['endDate'] = newLatestEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: milestone,
                oldMilestone: null,
            }
        }
        return {
            shouldUpdateMilestoneEndDate: false,
            newMilestone: null,
            oldMilestone: null,
        }
        */
        
    } 

    function addMilestone(newMilestone, newEndDate){
        if (newMilestone.endDate===undefined || newMilestone.endDate===null){
            newMilestone['endDate'] = newEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: newMilestone,
                oldMilestone: null,
            }
        }
        const newEndTime = newEndDate.getTime()
        const latestEndDate = new Date(newMilestone.endDate)
        const latestEndTime = latestEndDate.getTime()
        if (newEndTime>latestEndTime){
            newMilestone['endDate'] = newEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: newMilestone,
                oldMilestone: null,
            }
        }
        return {
            shouldUpdateMilestoneEndDate: false,
            newMilestone: null,
            oldMilestone: null,
        }
    }

    function deleteMilestone(oldMilestone, oldEndDate){
        const oldEndTime = oldEndDate.getTime()
        const latestEndDateOldMilestone = new Date(oldMilestone.endDate)
        const latestEndTimeOldMilestone = latestEndDateOldMilestone.getTime()
        let oldEndTimeIsLatest
        if (oldEndTime===latestEndTimeOldMilestone) oldEndTimeIsLatest = true
        else oldEndTimeIsLatest = false
        // if delete a latest date of milestone, then pick out a new latest one
        if (oldEndTimeIsLatest){
            const newLatestEndDate = getLatestIssueEndDateByMilestone(password, oldMilestone.number, sourceData)
            oldMilestone['endDate'] = newLatestEndDate
            return {
                shouldUpdateMilestoneEndDate: true,
                newMilestone: null,
                oldMilestone: oldMilestone,
            }

        }
        else{
            return {
                shouldUpdateMilestoneEndDate: false,
                newMilestone: null,
                oldMilestone: null,
            }
        }

    }

    function updateMilestone(newMilestone, oldMilestone, newEndDate, oldEndDate){
        const newEndTime = newEndDate.getTime()
        const oldEndTime = oldEndDate.getTime()
        if (newEndTime>oldEndTime) return addMilestone(newMilestone, newEndDate)
        else if (newEndTime<oldEndTime) {
            const tmp = deleteMilestone(oldMilestone, oldEndDate)
            const newLatestEndDate = new Date(tmp.oldMilestone.endDate)
            const newLatestEndTime = newLatestEndDate.getTime()
            if (newEndTime>newLatestEndTime){
                tmp.oldMilestone['endDate'] = newEndDate
            }
            return tmp
        }
        else if(option==='delete'){
            return deleteMilestone(oldMilestone, oldEndDate)
        }
        else{
            return {
                shouldUpdateMilestoneEndDate: false,
                newMilestone: null,
                oldMilestone: null,
            }
        }
    }
}

export function checkUpdateMilestoneCompleteness(newData, sourceData, password){
    console.log(newData, sourceData, 'check update milestone completeness')
    const option = newData.option
    let newMilestone, oldMilestone
    if (newData===null) newMilestone = null
    else{
        const [number, label] = findMilestoneFromTags(newData.tag)
        newMilestone = getMilestoneByNum(password, number)
    }
    if (sourceData===null) oldMilestone = null
    else{
        const [number, label] = findMilestoneFromTags(sourceData.tag)
        oldMilestone = getMilestoneByNum(password, number)
    }
    if (option==='create'){
        if (newMilestone===null) return setReturn(false, null, null)
        else return setReturn(true, newMilestone, null) 
    }
    else if (option==='delete'){
        if (oldMilestone===null) return setReturn(false, null, null)
        else return setReturn(true, null, oldMilestone)
    }
    else if (option==='update'){
        if (newMilestone===null && oldMilestone!==null) return setReturn(true, null, oldMilestone)
        else if (newMilestone!==null && oldMilestone===null) return setReturn(true, newMilestone, null)
        else if (newMilestone===null && oldMilestone===null) return setReturn(false, null, null)
        else if (newMilestone.number!==oldMilestone.number){
            return setReturn(true, newMilestone, oldMilestone)
        }
        else if(newData.itemStatus!==sourceData.itemStatus){
            return setReturn(true, newMilestone, null)
        }
        else return setReturn(false, null, null)
    }
    

    function setReturn(should, newMilestone, oldMilestone){
        return {
            shouldUpdateMilestoneCompleteness: should,
            newMilestone: newMilestone,
            oldMilestone: oldMilestone,
        }
    }

}

export function combineCheckMilestone(endDate, completeness){
    let newMilestone, oldMilestone
    let shouldUpdate = endDate.shouldUpdateMilestoneEndDate || completeness.shouldUpdateMilestoneCompleteness
    if (endDate.newMilestone!==null) newMilestone=endDate.newMilestone
    else if(completeness.newMilestone!==null) newMilestone=completeness.newMilestone
    else newMilestone=null

    if (endDate.oldMilestone!==null) oldMilestone=endDate.oldMilestone
    else if(completeness.oldMilestone!==null) oldMilestone=completeness.oldMilestone
    else oldMilestone=null

    return {
        shouldUpdateMilestone: shouldUpdate,
        newMilestone: newMilestone,
        oldMilestone: oldMilestone,
    }
}

export function checkIssueMilestoneNum(password, issues){
    // check if issue's milestone num effective
    console.log(issues, "check issue's milestone")
    
    let update = []
    for (let issue of issues){
        if (issue.itemType==='issue'){
            console.log(issue, 'issue')
            const tag = issue.tag
            const [ milestoneNum, labels ] = findMilestoneFromTags(tag)
            if (milestoneNum===null) continue
            console.log(tag, milestoneNum, labels, "check issue's milestone")

            const milestone = getMilestoneByNum(password, milestoneNum)
            if (milestone===undefined || milestone===null){
                issue.tag = labels.join(', ')
                update.push(issue)
            }
        }
    }
    return update
}

export function addIssuesToLayers(issues, layers){
    if (layers instanceof Array){
        // Array
    }
    else{
        // Object
        for (let issue of issues){
            if (layers[issue.layer]===undefined) layers[issue.layer] = []
            layers[issue.layer].push(issue)
        }
    }
    return layers
}

export function isGithubLogin(){
    const data = readData()
    if (data.userData===null) return false
    if (data.loginStatus==='github_login') return true
    else return false
}
export function getUserId(){
    const data = readData()
    return data.userData.id
}
export function getGithubInfo(){
    const data = readData()
    return {
        userId: data.userData.id,
        userName: data.userData.name,
        repo: data.repos[data.selectedRepo].repoName,
    }
}

function allData2MilestoneIssue(allData){
    //console.log(allData, 'all data 2 milestone and issue')
    let ret = []
    for (let el of allData){
        el['option'] = 'update'
        const version = el.version
        let tmp = null
        if (el.itemType === 'milestone'){
            tmp = item2Milestone(el)
        }
        else if (el.itemType === 'issue'){
            tmp = item2Issue(el)
        }
        tmp['version'] = version
        ret.push(tmp)
    }
    return ret
}
function addGithubInfo(data, hostname, type){
    if (data instanceof Array){
        data = {
            list: data
        }
    }
    if (type!==undefined && type!==null) data['itemType'] = type
    const githubInfo = getGithubInfo()
    data['userId'] = githubInfo.userId
    data['userName'] = githubInfo.userName
    data['repo'] = githubInfo.repo
    data['hostname'] = hostname
    return data
}

async function processGithubItem(data, hostname, afterAction, type, option){
    let postData = null
    if (type==='milestone'){
        postData = item2Milestone(data)
        postData = addGithubInfo(postData, hostname, type)
    } 
    else if (type==='issue') {
        postData = item2Issue(data)
        postData = addGithubInfo(postData, hostname, type)
    }
    console.log(postData, 'postData')
    let tmpAction = null
    //console.log(data, afterAction, 'processGithubItem')
    if (afterAction!==null) tmpAction = newData => afterAction(newData, data)
    return await sendGithubRequest(postData, tmpAction)

}

export async function processGithubItemBatch(batch, hostname, afterAction,option){
    let list = []
    for (let item of batch){
        const type = item.itemType
        if (option!==undefined && option!==null){
            item['option'] = option
        }
        if (type==='milestone'){
            const tmpData = item2Milestone(item)
            list.push(tmpData)
            continue
        }
        else if (type==='issue'){
            const tmpData = item2Issue(item)
            list.push(tmpData)
            continue
        }
    }
    let postData = {
        list: list,
    }
    postData = addGithubInfo(postData, hostname)
    let tmpAction = null
    if (afterAction!==null) tmpAction = newData => afterAction(newData, batch)
    console.log(postData, 'processGithubItemBatch')
    return await sendGithubRequest(postData, tmpAction)
    //console.log(page, 'get local item by attr')

}

export async function createGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'create'
    await processGithubItem(data, hostname, afterAction, type, 'create')
}

export async function updateGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'update'
    return await processGithubItem(data, hostname, afterAction, type, 'update')
}

export async function deleteGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'delete'
    await processGithubItem(data, hostname, afterAction, type, 'delete')
}

export async function createGithubItemBatch(data, hostname, afterAction){
    await processGithubItemBatch(data, hostname, afterAction, 'create')
}

export async function deleteGithubItemBatch(data, hostname, afterAction){
    await processGithubItemBatch(data, hostname, afterAction, 'delete')
}

export async function updateGithubItemBatch(data, hostname, afterAction){
    await processGithubItemBatch(data, hostname, afterAction, 'update')
}

export async function sendAllGithubData(data, hostname, afterAction, isTest=false){
    //console.log(data, 'send all github data')
    data = allData2MilestoneIssue(data)
    data = addGithubInfo(data, hostname, 'all')
    //console.log(data, 'post data')
    const postData = JSON.stringify(data)
    const host = 'z7yyx1kgf4.execute-api.eu-central-1.amazonaws.com'
    const path = 'github-sync'
    const [options, https] = setServerRequestOptions(host, path, 'POST', isTest)
    sendRequest(options, https, postData, afterAction)
}

export async function sendGithubRequest(data, afterAction, isTest=false) {
    //if (data.itemType==='milestone') data = item2Milestone(data)
    //else if (data.itemType==='issue') data = item2Issue(data)
    //console.log(data, 'send github')
    const postData = JSON.stringify(data)
    const host = 'wm1269hl6e.execute-api.eu-central-1.amazonaws.com'
    const path = 'github'
    const [options, https] = setServerRequestOptions(host, path, 'POST', isTest)
    //console.log('send github request')
    return sendRequest(options, https, postData, afterAction)
    
}

export async function sendPublishRequest(data, afterAction, isTest=false){
    //console.log(data, 'send publish request')
    const postData = JSON.stringify(data)
    const host = '6vhagypyjd.execute-api.eu-central-1.amazonaws.com'
    const path = 'github-publish'
    const [options, https] = setServerRequestOptions(host, path, 'POST', isTest)
    sendRequest(options, https, postData, afterAction)
}
