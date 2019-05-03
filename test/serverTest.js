const assert = require('chai').assert
const server = require('../server')

describe('Check Numeric', function(){
	it('change KING to 13', function(){
		assert.equal(server.getNumeric('KING'), 13)
	})

	it('change QUEEN to 12', function(){
		assert.equal(server.getNumeric('QUEEN'), 12)
	})

	it('change JACK to 11', function(){
		assert.equal(server.getNumeric('JACK'), 11)
	})

	it('change ACE to 1', function(){
		assert.equal(server.getNumeric('ACE'), 1)
	})
})