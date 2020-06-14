const { SiteClient } = require("datocms-client");
const token = process.env.CMS_TOKEN
const password = process.env.PASSWORD
const client = new SiteClient(token)
let response
let atob = require('atob')

exports.lambdaHandler = async (event, context) =>{
    try{
        let isBase64 = false
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
        //console.log('--------')
        //console.log(data)
        //console.log('---------')
        if (data.option===undefined){
            let tmpRef = data.ref
            if (data.password===password){
                switch (data.ref){
                    case 'idea_new': tmpRef='idea_item'; break;
                }

            }
            await client.items.create({
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
                itemStatus: data.itemStatus
            })
        }else if(data.option==='delete' && data.password===password){
            await client.items.destroy(data.id)
                .catch((error) => {
                    console.error(error);
                })

        }else if(data.option==='completed' && data.password===password){
            await client.items.update(data.id, {
                itemStatus: "completed",
            }).catch((err) => {
                console.error(err)
            })
        }else if(data.option==='active' && data.password===password){
            await client.items.update(data.id, {
                itemStatus: "active",
            }).catch((err) => {
                console.error(err)
            })
        }
        
	// const ret = await axios(url);
        response = {
            'statusCode': 200,
            'headers': {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers": "Content-Type",},
            'body': JSON.stringify({
                message: 'succeed',
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
