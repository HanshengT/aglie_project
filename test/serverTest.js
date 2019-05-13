const assert = require('chai').assert
const server = require('../server')
const backend = require('../backend')
const chai = require('chai'), chaiHttp = require('chai-http')
const request = require('supertest')
const app = require('../app')


const should = chai.should()
chai.use(chaiHttp)

describe('Check Numeric', function() {
    it('change KING to 13', function() {
        assert.equal(server.getNumeric('KING'), 13)
    })

    it('change QUEEN to 12', function() {
        assert.equal(server.getNumeric('QUEEN'), 12)
    })

    it('change JACK to 11', function() {
        assert.equal(server.getNumeric('JACK'), 11)
    })

    it('change ACE to 1', function() {
        assert.equal(server.getNumeric('ACE'), 1)
    })
})

describe('Account managing', function() {
    it('create account', function() {
        assert.equal(backend.accountCreate('TestUsername'), 'Account TestUsername Created')
    })

    it('show current score', function() {
        assert.equal(backend.currentScore('TestUsername'), 0)
    })

    it('show high score', function() {
        assert.equal(backend.highScore('TestUsername'), 0)
    })

    it('delete account', function() {
        assert.equal(backend.accountDelete('TestUsername'), 'Account TestUsername Deleted')
    })

})


describe('GET /', function() {
    it('return home page', function(done) {
    	request("http://localhost:8080")
        .get('/')
        .end(function(err,res) {
        	res.should.have.status(200)
        	done()
        })
    })
})

describe('GET /register', function() {
    it('return register page', function(done) {
    	request("http://localhost:8080")
        .get('/register')
        .end(function(err,res) {
        	res.should.have.status(200)
        	done()
        })
    })

})

/*describe('POST /login-user', function() {
    it('return register page', function(done) {
    	request("http://localhost:8080")
        .post('/login-user')
        .send({'username': '123', 'password': '123'})
        .end(function(err,res) {
        	res.should.have.status(200)
        	done()
        })
    })

})

describe('isPrime function', function() {
    it('should return Number is Prime', function() {
        app.isPrime(35).should.be.equal('Number is Prime')
    })
})*/