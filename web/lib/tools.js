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
