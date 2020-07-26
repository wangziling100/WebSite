import {parseVersion} from '../lib/github'
export function getDateDiff(targetDate){
    const now = new Date()
    const target = new Date(targetDate)
    return (target-now)/1000
}

export function s2Time(s){
    let hour = parseInt(s / 3600)
    hour = hour.toString().padStart(2,'0')
    const hourLeft = s % 3600
    let min = parseInt(hourLeft / 60)
    min = min.toString().padStart(2,'0')
    let sec = parseInt(hourLeft % 60)
    sec = sec.toString().padStart(2,'0')
    const ret = hour + ' : ' + min + ' : ' + sec
    return (ret)
}

export function compare(prop){
    return function(a, b){
        const value1 = a[prop]
        const value2 = b[prop]
        return value2-value1
    }
}
export function flat(array){
    let result = []
    for (let el of array){
        let tmp
        if (Array.isArray(el)){
            tmp = flat(el)
            result = result.concat(tmp)
        }else{
            result.push(el)
        }
    }
    return result
}
export function getQueryVariable(variable){
    const query = window.location.search.substring(1)
    const vars = query.split("&")
    for (let i=0; i<vars.length; i++){
        const pair = vars[i].split("=")
        if(pair[0] === variable) return pair[1]
    }
    return null
}
export function copy(obj){
    let result = {}
    for (let index in obj){
        result[index] = obj[index]
    }
    return result
}
/*
 * targets: Objects that should be deleted
 * array: where target deleted from
 * key: comparable attribute, which used to locate target in array
 *
 */

export function deleteElementsFromArray(targets, array, key){
    console.log(targets, array, 'delete elements from array')
    let counter = {}
    let ret = []
    let setContinue = false

    if (key === undefined){
        for (let el1 of array){
            for(let el2 of targets){
                if (el1===el2) { setContinue = true;break}
            }
            if (setContinue) continue
            ret.push(el1)
        }
    }

    else{
        for (let el of targets){
            counter[el[key]] = 1
        }
        for (let el of array){
            if (counter[el[key]]===undefined) ret.push(el)
        }
    }
    console.log(ret, 'delete elements from array 2')
    return ret
}

export function deleteValueFromArray(target, value, onlyFirst=false){
    let returnArray = []
    let allowCheck = true
    let findIt = false
    for (let el of target){
        if (el===value && allowCheck){
            if (onlyFirst) allowCheck=false
            findIt = true
            continue
        }
        returnArray.push(el)
    }
    return {findIt, returnArray}
}

export function isEqual(obj1, obj2){
    if(typeof(obj1)!==typeof(obj2)) return false

    if(obj1 instanceof Array){
        if (obj1.length!==obj2.length) return false
        for (let index in obj1){
            if(obj1[index]!==obj2[index]) return false
        }
        return true
    }
    return null
}

export function updateItems(newSet, target, compareFunc, updateFunc){
    let result = null
    const defaultUpdateFunc = (item1, item2) => {
        for (let index in item1){
            item2[index] = item1[index]
        }
        return item2
    }
    updateFunc = updateFunc || defaultUpdateFunc

    if (newSet instanceof Array && target instanceof Array){
        for (let el1 of newSet){
            for (let el2 of target){
                if (compareFunc(el1, el2)){
                    el2 = updateFunc(el1, el2)
                    break
                }
            }
        }
        result = target
    }
    return result
}

export function filterDuplicateItems(items){
    console.log(items, 'duplicates filter')
    let result = {}
    let invalid = []

    for (let item of items){
        if (item.itemId===undefined || item.itemId===null) {
            invalid.push(item)
            continue
        }
        const id = item.itemId
        if (result[id]===undefined){ 
            result[id]=item 
            continue
        }

        else {
            const currentVersion = new Date(parseVersion(result[id])).getTime()
            const newVersion = new Date(parseVersion(item)).getTime()

            console.log(currentVersion, newVersion, typeof(currentVersion), typeof(newVersion), 'version format')
            if (currentVersion>=newVersion){
                invalid.push(item)
                continue
            }
            else{
                invalid.push(result[id])
                result[id] = item
            }
        }
    }
    let ret = []
    for (let index in result) ret.push(result[index])
    return {ret, invalid}
}

