const https = require('https')
const password = process.env.PASSWORD

exports.lambdaHandler = async (event, context) =>{
    let data
    let error
    let response
    let scheduled = false

    if (event.data===undefined && event['detail-type']==='Scheduled Event'){
        scheduled =true
    }

    if (typeof(event.body)==='object'){
        data = event.body
    }

    if (typeof(event.body)==='string'){
        data = JSON.parse(event.body)
    }

    if (scheduled || data.password === password){
        const netlifyOptions = {
            hostname: 'api.netlify.com',
            port: 443,
            path: '/build_hooks/5efb6a52c294fed4048fdf23',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        const vercelOptions = {
            hostname: 'api.vercel.com',
            port: 443,
            path: '/v1/integrations/deploy/QmQEvHkpsUAwELZzwZk8TfHChbydY1UzubmYavP7PNVw7V/er4SWD2Cvk',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        
        await httpsrequest(netlifyOptions).then((data) => {
            console.log('netlify response: ', data)
        }).catch((err) => {
            console.log('netlify error: ', err)
            error = err
        })
        await httpsrequest(vercelOptions).then((data) => {
            console.log('vercel response: ', data)
        }).catch((err) => {
            console.log('vercel response: ', err)
            error = err
        })
        if (error !== undefined){
            response = {
                'statusCode': 500,
                'body': JSON.stringify({
                    message: 'failed',
                    error: error.message,
                })
            }
            return response
        }
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'succeed',
            })
        }
        return response
    }
    if (data.password !== password){
        response = {
            'statusCode': 500,
            'body': JSON.stringify({
                message: 'failed',
                error: 'wrong password',
            })
        }
        return response
    }
}

function httpsrequest(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >=300){
                return reject(new Error('statusCode=' + res.statusCode))
            }
            let body = []
            res.on('data', (chunk) => {
                body.push(chunk)
            })
            res.on('end', () => {
                if (body.length===0){
                    resolve({})
                }
                try {
                    body = JSON.parse(Buffer.concat(body).toString())
                } catch(e) {
                    reject(e)
                }
                resolve(body)
            })
        })
        req.on('error', (e) => {
            reject(e.message)
        })
        req.end()
    })
}
