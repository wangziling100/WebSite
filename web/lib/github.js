import { setServerRequestOptions, sendRequest, readData } from '../lib/api'
import { copy } from '../lib/tools'
function item2Milestone(item){
    let milestone = null
    const option = item.option
    if (option==='create' || option==='update'){
        console.log(item, 'item2Milestone')
        let tmp = {
            tag: item.tag,
            priority: parseInt(item.priority),
            itemId: item.itemId,
            createdAt: item._createdAt,
            version: item.version,
            content: item.originContent || item.content,
            url: item.url || null,
            issueNumber: item.issueNumber || null,
        }
        milestone= {
            title: item.title,
            state: item.itemStatus,
            description: JSON.stringify(tmp),
            option: item.option || 'create',
            itemType: 'milestone',
            userId: item.userId,
            userName: item.userName,
            repo: item.repo,
            hostname: item.hostname,
            issueNumber: item.issueNumber || null,
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
            let tmp = {
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
                version: new Date(),
                parents: item.parents,
                layer: item.layer,
                completeness: item.completeness,
                allowPriorityChange: item.allowPriorityChange,
                contributor: item.contributor,
                evaluation: item.evaluation,
                owner: item.owner,
                startTime: item.startTime,
                url: item.url,

            }
            const [numMilestone, labels] = findMilestoneFromTags(item.tag)
            issue = {
                title: item.title,
                state: item.itemStatus,
                body: JSON.stringify(tmp) + '\n' + item.content,
                labels: labels,
                itemType: 'issue',
                assignees: item.assignees || [],
                milestone: numMilestone,
                number: item.number,
                option: item.option,
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
        labels.push(label.replace(/(^\s*)|(\s*$)/g, ""))
    }
    return [numMilestone, labels]
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
        repo: data.selectedRepo,
    }
}
function addGithubInfo(data, hostname, type){
    if (data instanceof Array){
        data = {
            list: data
        }
    }
    data['itemType'] = type
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
    const tmpAction = newData => afterAction(newData, data)
    return await sendGithubRequest(postData, tmpAction)

}
export async function createGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'create'
    await processGithubItem(data, hostname, afterAction, type, 'create')
}

export async function updateGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'update'
    await processGithubItem(data, hostname, afterAction, type, 'update')
}

export async function deleteGithubItem(data, hostname, afterAction, type='milestone'){
    data['option'] = 'delete'
    await processGithubItem(data, hostname, afterAction, type, 'delete')
}

export async function sendGithubRequest(data, afterAction, isTest=false) {
    //if (data.itemType==='milestone') data = item2Milestone(data)
    //else if (data.itemType==='issue') data = item2Issue(data)
    console.log(data, 'send github')
    const postData = JSON.stringify(data)
    const host = 'wm1269hl6e.execute-api.eu-central-1.amazonaws.com'
    const path = 'github'
    const [options, https] = setServerRequestOptions(host, path, 'POST', true)
    //console.log('send github request')
    sendRequest(options, https, postData, afterAction)
    
}
