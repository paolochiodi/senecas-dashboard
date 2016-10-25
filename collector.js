var dgram = require('dgram')
var server = dgram.createSocket('udp4')

var LIMIT = 30

var messages = {

}

var mem = {
  value: {rss: 0, heapTotal: 0, heapUsed: 0},
  history: []
}

function collectMessageStats (stats) {
  var total = 0;

  Object.keys(stats).forEach(function (key) {

    var msg = stats[key]
    var msgData = messages[key]

    if (!msgData) {
      msgData = messages[key] = {
        value: 0,
        history: []
      }
    }

    msgData.value = msg.sum
    msgData.history.push({
      value: msg.sum,
      time: msg.now
    })

    if (msgData.history.length >= LIMIT) {
      msgData.history.shift()
    }

    total += msg.sum
  })

  Object.keys(stats).forEach(function (key) {
    messages[key].rate = Math.round(messages[key].value/total*100)
  })
}

function collectMemStats (stats, when) {
  mem.value = stats
  mem.history.push({
    value: stats,
    time: when
  })
}

server.on('message', function (msg, remote) {
  var msg

  try {
    msg = JSON.parse(msg)
  }
  catch(e) {
    console.log(e.stack)
    return
  }

  if (msg.msg_stats) {
    collectMessageStats(msg.msg_stats)
  }

  if (msg.mem_stats) {
    collectMemStats(msg.mem_stats, msg.when)
  }
})

function start () {
  server.bind(40404, 'localhost')
}

function getData () {
  return {
    msgs: messages,
    mem: mem
  }
}

module.exports = {
  start,
  getData
}