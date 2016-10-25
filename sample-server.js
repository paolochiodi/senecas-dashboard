
var Seneca = require('seneca')

var server = Seneca({log:'silent'})
server.add('test:1', function (msg, done) {
  done(null, {hello:'world'})
})
server.add('test:2', function (msg, done) {
  done(null, {bye:'bye'})
})
server.add('test:3', function (msg, done) {
  done(null, {bye:'heya'})
})

server.use('msgstats', {
  pins: ['test:1', 'test:2', 'test:3']
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
      server.act('test:3', noop)
    }


  }, 700)
})