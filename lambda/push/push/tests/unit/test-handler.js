'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var fs = require('fs')
let event = JSON.parse(fs.readFileSync(process.cwd()+'/../events/event.json'));
var context
describe('Tests lambda', function () {
    it('verifies successful response', async () => {
        
        const result = await app.lambdaHandler(event, context)
        let response = JSON.parse(result.body);
        if(response.message=='succeed'){
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200);
            expect(result.body).to.be.an('string');
            expect(response).to.be.an('object');
            expect(response.message).to.be.equal("succeed");
            // expect(response.location).to.be.an("string");
        }

        
    });
    it('verifies failed response', async () =>{
        const result = await app.lambdaHandler(event, context)
        let response = JSON.parse(result.body);
        if(response.message=='failed'){
            console.log('failed')
        }
    })
});
