
var Seneca = require('seneca')

var server = Seneca({
  log:'silent',
  tag: 'mesh1'
})

server.add('mesh:1', function (msg, done) {
  done(null, {hello: 'mesh 1'})
})

server.add('mesh:remote', function (msg, done) {
  const self = this
  setTimeout(function () {
    self.act('mesh:2', done)
  }, 80)
})

server.use('zipkin-tracer', {
  sampling: 1,
  transport: "http"
})
server.use('msgstats', {
  pins: ['mesh:1', 'mesh:2', 'mesh:remote']
})
server.use('mesh', {
  isbase: true,
  pin: 'mesh:1',
  type: 'tcp'
})

function noop () {}

server.ready(function () {
  console.log('up and running')

  setInterval(function generateRandomMessages() {
    console.log('sending')

    var one = Math.round(Math.random() * 3)
    var two = Math.round(Math.random() * 15)

    for(i = 0; i < one; i++) {
      server.act('mesh:1', noop)
    }

    for(i = 0; i < two; i++) {
      server.act('mesh:remote', noop)
    }

  }, 700)
})