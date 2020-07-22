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
