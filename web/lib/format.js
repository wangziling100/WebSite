export const dateFormat = (year, month, day) => {
    return{
        year: year,
        month: month,
        day: day,
    }
}

export const timeFormat = (hour, min, sec) => {
    return{
        hour: hour,
        min: min,
        sec: sec,
    }
}

export class DateFormat{
    constructor(year, month, day){
        this.year = year
        this.month = month
        this.day = day
    }
    toString(){
        let  month, day
        month = this.month.toString().padStart(2,'0')
        day = this.day.toString().padStart(2, '0')

        return this.year+'-'+month+'-'+day
    }
}

export class TimeFormat{
    constructor(hour, min, sec, gmt=true){
        this.hour = hour
        this.min = min
        this.sec = sec
        this.gmt = gmt
    }
    toString(){
        let hour, min, sec
        if (this.hour>=0) hour = this.hour.toString().padStart(2,'0')
        else hour = '-'+this.hour.toString().slice(1).padStart(2,'0')

        if (this.min>=0) min = this.min.toString().padStart(2,'0')
        else min = '-'+this.min.toString().slice(1).padStart(2,'0')

        if (this.sec>=0) sec = this.sec.toString().padStart(2,'0')
        else sec = '-'+this.sec.toString().slice(1).padStart(2,'0')
        let string = hour+':'+min+':'+sec
        if(this.gmt) string = string + ' GMT'
            
        return string
    }
}
