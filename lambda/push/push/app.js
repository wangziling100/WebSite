const { SiteClient } = require("datocms-client");
const token = process.env.CMS_TOKEN
const client = new SiteClient(token)
let response

exports.lambdaHandler = async (event, context) =>{
    try{
	    //console.log("-------")
	    //console.log(JSON.parse(event.body).test)
        //console.log("-------")
	    //console.log(context)
        console.log(event)
        data = JSON.parse(event.body)
        await client.items.create({
            itemType: data.itemType,
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
            'body': JSON.stringify({
                message: 'succeed',
                // location: ret.data.trim()
            })
        }
    }catch (err) {
        console.log(err)
        response = {
            'statusCode': 500,
            'body': JSON.stringify({
                message: 'failed',
                error: err.message,
            })
        }
    }

    return response
    
}
