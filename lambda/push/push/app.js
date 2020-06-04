const { SiteClient } = require("datocms-client");
const token = '90837768f762fd5b292d797092d75d'
const client = new SiteClient(token)
let response

exports.lambdaHandler = async (event, context) =>{
    try{
	console.log("-------")
	console.log(JSON.parse(event.body).test)
        console.log("-------")
	console.log(context)
        await client.items.create({
            itemType: "238671",
            title: "abc",
            content: "abc",
            priority: 5,
            completeness: 0,
            startTime:  null,
            evaluation:  null,
            allowPriorityChange: false,
            ref: "test",
            refId: null,
            owner: "",
            contributor: "",
            tag: "",
            itemStatus: "active"
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
        console.log(err);
        return err;
    }

    return response
    
}
