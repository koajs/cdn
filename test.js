
var koa = require('koa')
var request = require('supertest')
var sendfile = require('koa-sendfile')

var cdn = require('./')

describe('cdn', function () {
  describe('when GET', function () {
    it('should send the file', function (done) {
      var app = koa()
      app.use(cdn())
      var stats
      app.use(function* (next) {
        yield* sendfile.call(this, process.cwd() + '/index.js')
      })

      request(app.listen())
      .get('/')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        res.headers['x-content-type-options'].should.equal('nosniff')
        res.headers['x-frame-options'].should.equal('deny')
        res.headers['x-xss-protection'].should.equal('1; mode=block')
        res.headers['access-control-allow-origin'].should.equal('*')
        res.headers['access-control-allow-methods'].should.equal('HEAD,GET,OPTIONS')

        res.headers['content-type'].should.equal('application/javascript')
        done()
      })
    })
  })

  describe('when HEAD', function () {
    it('should 200', function (done) {
      var app = koa()
      app.use(cdn())
      app.use(function* (next) {
        yield* sendfile.call(this, process.cwd() + '/index.js')
      })

      request(app.listen())
      .head('/')
      .expect(200)
      .expect('content-type', 'application/javascript')
      .end(function (err, res) {
        if (err) return done(err)

        res.headers['x-content-type-options'].should.equal('nosniff')
        res.headers['x-frame-options'].should.equal('deny')
        res.headers['x-xss-protection'].should.equal('1; mode=block')
        res.headers['access-control-allow-origin'].should.equal('*')
        res.headers['access-control-allow-methods'].should.equal('HEAD,GET,OPTIONS')

        res.headers['content-type'].should.equal('application/javascript')
        done()
      })
    })
  })

  describe('when POST', function () {
    it('should 501', function (done) {
      var app = koa()
      app.use(cdn())
      app.use(function* (next) {
        console.log('before')
        yield* sendfile.call(this, process.cwd() + '/index.js')
      })

      request(app.listen())
      .post('/')
      .send()
      .expect(501)
      .expect('allow', 'HEAD,GET,OPTIONS')
      .expect('Not Implemented', done)
    })
  })
})