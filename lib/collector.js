const dgram = require('dgram')

const LIMIT = 30

var server = dgram.createSocket('udp4')


function Collector (bus) {

  const messages = {}
  const mem = {
    value: {rss: 0, heapTotal: 0, heapUsed: 0},
    history: []
  }
  const server = dgram.createSocket('udp4')

  server.on('message', onMessage)

  this.start = start
  this.getData = getData

  function start () {
    server.bind(40404, 'localhost')
  }

  function getData () {
    return {
      msgs: messages,
      mem: mem
    }
  }

  function onMessage (msg) {
    var data
    try {
      data = JSON.parse(msg)
    }
    catch (ex) {
      return
    }

    if (data.msg_stats) {
      collectMessageStats(data.msg_stats)
    }

    if (data.mem_stats) {
      collectMemStats(data.mem_stats, data.when)
    }
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

}
module.exports = Collector
