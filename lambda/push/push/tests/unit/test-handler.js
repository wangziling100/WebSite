'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests lambda', function () {
    it('verifies successful response', async () => {
        
        const result = await app.lambdaHandler(event, context)
        console.log(result)
        if(result.body!==undefined){
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200);
            expect(result.body).to.be.an('string');

            let response = JSON.parse(result.body);

            expect(response).to.be.an('object');
            expect(response.message).to.be.equal("hello world");
            // expect(response.location).to.be.an("string");
        }

        
    });
    it('verifies failed response', async () =>{
        const result = await app.lambdaHandler(event, context)
        if(result.body===undefined){
            console.log('error')
        }
    })
});
