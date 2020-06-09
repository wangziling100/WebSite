const { SiteClient } = require("datocms-client");
const token = process.env.CMS_TOKEN
const client = new SiteClient(token)
let response
let atob = require('atob')

exports.lambdaHandler = async (event, context) =>{
    try{
	    //console.log("-------")
	    //console.log(JSON.parse(event.body).test)
        //console.log("-------")
	    //console.log(context)
        console.log(token)
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
        console.log('--------')
        console.log(data)
        console.log('---------')
        await client.items.create({
            itemType: "238671",
            title: data.title,
            content: data.content,
            priority: data.priority,
            completeness: data.completeness,
            startTime: data.startTime, 
            evaluation:  data.evaluation,
            allowPriorityChange: data.allowPriorityChange,
            ref: data.ref,
            refId: data.refId,
            owner: data.owner,
            contributor: data.contributor,
            tag: data.tag,
            itemStatus: data.itemStatus
        })
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
