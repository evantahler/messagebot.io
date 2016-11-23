process.env.NODE_ENV = 'test'

var should = require('should')
var ActionheroPrototype = require('actionhero')
var actionhero = new ActionheroPrototype()
var api

describe('actionhero Tests', function () {
  before(function (done) {
    actionhero.start(function (error, a) {
      should.not.exist(error)
      api = a
      done()
    })
  })

  after(function (done) {
    actionhero.stop(function (error) {
      should.not.exist(error)
      done()
    })
  })

  it('should have booted into the test env', function () {
    process.env.NODE_ENV.should.equal('test')
    api.env.should.equal('test')
    should.exist(api.id)
  })

  it('can retrieve server uptime via the status action', function (done) {
    api.specHelper.runAction('status', function (response) {
      should.not.exist(response.error)
      response.uptime.should.be.above(0)
      done()
    })
  })
})
