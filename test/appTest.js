const assert = require('chai').assert;
const backend = require('../backend.js')

describe('Back End Testing', function(){
	it('account create', function(){
		assert.equal(backend.accountCreate('TestAccount'), 'Account TestAccount Created')
	})

	it('show high score', function(){
		assert.equal(backend.highScore('TestAccount'), 0)
	})

	it('high score type', function(){
		assert.typeOf(backend.highScore('TestAccount'), 'number')
	})

	it('show score', function(){
		assert.equal(backend.currentScore('TestAccount'), 0)
	})

	it('score type', function(){
		assert.typeOf(backend.currentScore('TestAccount'), 'number')
	})

	it('account delete', function(){
		assert.equal(backend.accountDelete('TestAccount'), 'Account TestAccount Deleted')
	})
})