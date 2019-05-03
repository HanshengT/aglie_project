const assert = require('chai').assert
const server = require('../server')
const backend = require('../backend')

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

describe('Account managing', function(){
	it('create account', function(){
		assert.equal(backend.accountCreate('TestUsername'), 'Account TestUsername Created')
	})

	it('show current score', function(){
		assert.equal(backend.currentScore('TestUsername'), 0)
	})

	it('show high score', function(){
		assert.equal(backend.highScore('TestUsername'), 0)
	})

	it('delete account', function(){
		assert.equal(backend.accountDelete('TestUsername'), 'Account TestUsername Deleted')
	})

})


