
var Seneca = require('seneca')

var server = Seneca({
  log:'silent',
  tag: 'dashboard-example'
})
server.add('test:1', function (msg, done) {
  done(null, {hello:'world'})
})
server.add('test:2', function (msg, done) {
  done(null, {bye:'bye'})
})
server.add('zipkin:child', function (msg, done) {
  setTimeout(function () {
    done(null, {bye:'heya'})
  }, Math.round(Math.random()*100))
})
server.add('test:zipkin', function (msg, done) {
  const self = this
  setTimeout(function () {
    self.act('zipkin:child', done)
  }, 80)
})

server.use('zipkin-tracer', {
  sampling: 1,
  transport: "http"
})
server.use('msgstats', {
  pins: ['test:1', 'test:2', 'test:zipkin']
})

function noop () {}

server.ready(function () {
  console.log('up and running')

  setInterval(function generateRandomMessages() {
    console.log('sending')

    var one = Math.round(Math.random() * 3)
    var two = Math.round(Math.random() * 15)
    var three = Math.round(Math.random() * 12)

    for(i = 0; i < one; i++) {
      server.act('test:1', noop)
    }

    for(i = 0; i < two; i++) {
      server.act('test:2', noop)
    }

    for(i = 0; i < three; i++) {
      server.act('test:zipkin', noop)
    }


  }, 700)
})