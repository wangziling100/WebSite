const { SiteClient } = require("datocms-client");
const token = process.env.CMS_TOKEN
const password = process.env.PASSWORD
const client = new SiteClient(token)
let response
let atob = require('atob')

const processData = async (data) => {
    let res 
    if (data.option===undefined || data.option==='edit'){
        let tmpRef = data.ref

        if (data.password===password){
            switch (data.ref){
                case 'idea_new': tmpRef='idea_item'; break;
                case 'plan_new': tmpRef='plan_item'; break;
            }
            if (data.option==='edit'){
                let historyRef
                switch (data.ref){
                    case 'idea_new': historyRef='idea_history'; break;
                    case 'plan_new': historyRef='plan_history'; break
                }
                await client.items.update(data.refId, {
                    ref: historyRef,
                }).catch((err)=>{
                    console.error(err)
                })
            }

        }
        res = await client.items.create({
            itemType: "238671",
            title: data.title,
            content: data.content,
            priority: data.priority,
            completeness: data.completeness,
            startTime: data.startTime, 
            evaluation:  data.evaluation,
            allowPriorityChange: data.allowPriorityChange,
            ref: tmpRef,
            refId: data.refId,
            owner: data.owner,
            contributor: data.contributor,
            tag: data.tag,
            itemStatus: data.itemStatus,
            version: data.version,
            layer: data.layer,
            parents: data.parents,
            target: data.target,
            difficulty: data.difficulty,
            urgency: data.urgency,
            endDate: data.endDate,
            duration: data.duration,
            period: data.period,
            planType: data.planType || 0,
            itemId: data.itemId,
        })
        res.option = 'create'
        return res
    }

    if(data.option==='delete' && data.password===password){
        res = await client.items.destroy(data.id)
            .catch((error) => {
                console.error(error);
            })
        return {id: res.id, layer: res.layer, option: 'delete'}
    }

    if(data.option==='completed' && data.password===password){
        res = await client.items.update(data.id, {
            itemStatus: "completed",
        }).catch((err) => {
            console.error(err)
        })
        res.option = 'completed'
        return res
    }

    if(data.option==='active' && data.password===password){
        res = await client.items.update(data.id, {
            itemStatus: "active",
        }).catch((err) => {
            console.error(err)
        })
        res.option = 'active'
        return res
    }
    
    if(data.option==='update' && data.password===password){
        let tmp = Object.assign({}, data)
        delete tmp.option
        delete tmp.id
        delete tmp.password
        res = await client.items.update(data.id, tmp)
        .catch((err) =>{
            console.error(err)
        })
        res.option = 'update'
        return res
    }
}
exports.lambdaHandler = async (event, context) =>{
    
    try{
        let isBase64 = false
        let res
        try{
            let tmp = atob(event.body)
            data = JSON.parse(tmp)
            if(tmp.title===undefined){
                // pass
            }else{
                isBase64 = true
            }

        }catch(err){
            console.log(err.message)

        }
        if(!isBase64){
            data = JSON.parse(event.body)
        }
        console.log(data)

        if (data.data === undefined){
            res = await processData(data)
        }else{
            // array
            res = []
            for (element of data.data){
                const tmp = await processData(element)
                res.push(tmp)
            }
        }
                
        response = {
            'statusCode': 200,
            'headers': {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers": "Content-Type",},
            'body': JSON.stringify({
                message: 'succeed',
                data: res,
                // location: ret.data.trim()
            })
        }
    }catch (err) {
        console.log(err)
        response = {
            'statusCode': 500,
            'headers': {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers": "Content-Type",},
            'body': JSON.stringify({
                message: 'failed',
                error: err.message,
            })
        }
    }

    return response
    
}
