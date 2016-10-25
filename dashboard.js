
var collector = require('./collector')
var blessed = require('blessed')
var contrib = require('blessed-contrib')
var screen = blessed.screen()
var filter = null


screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})
var line = grid.set(4, 2, 4, 5, contrib.line, {
  style: {
    text: "green",
    baseline: "black"
  },
  showLegend: true,
  xLabelPadding: 3,
  xPadding: 5,
  label: 'Message Flow'
})

var msgTop = grid.set(0, 2, 4, 5, contrib.table, {
  label: 'Messages',
  keys: true,
  fg: 'green',
  selectedFg: 'white',
  selectedBg: 'blue',
  interactive: true,
  columnWidth: [12, 6, 6]
})
msgTop.focus()
msgTop.rows.on('select', function (item, index) {
  filter = topData[index][0]
})
msgTop.rows.on('keypress', function (key) {
  if (key === 'a') {
    filter = null
  }
})

var memUsageBars = grid.set(0, 0, 4, 2, contrib.bar, {
  label: 'Memory Utilization (%)',
  maxHeight: 100,
  barWidth: 3,
  barSpacing: 1
})
memUsageBars.setData({
  titles: ['HU', 'HT', 'RSS'],
  data: [0, 0, 0]
})

collector.start()

function pickTime (record) {
  return new Date(record.time).toTimeString().substring(0,8)
}

function pickValue (record) {
  return record.value
}

function sortByIndex (index) {
  return function (a, b) {
    if (a[index] < b[index]) return 1
    if (a[index] > b [index]) return -1
    return 0
  }
}

function filterByMessage (msg) {
  return function (record) {
    if (!msg) return true
    return record[0] === msg
  }
}

var topData

setInterval(function () {

  var data = collector.getData()

  memUsageBars.setData({
    titles: ['HU', 'HT', 'RSS'],
    data: [
      Math.round(data.mem.value.heapUsed / (1024 * 1024)),
      Math.round(data.mem.value.heapTotal / (1024 * 1024)),
      Math.round(data.mem.value.rss / (1024 * 1024))
    ]
  })


  var lineData = []
  var colors = ['purple', 'brown', 'yellow', 'blue', 'white', 'red']
  topData = []

  Object.keys(data.msgs).forEach(function (key) {
    var msg = data.msgs[key]
    var validHistory = msg.history.slice(-20)
    var x = msg.history.map(pickTime)
    var y = msg.history.map(pickValue)
    var currentColor = colors.pop()

    if (!filter || filter === key) {
      lineData.push({
        title: key,
        style: {line: currentColor},
        x: x,
        y: y
      })
    }

    topData.push([key, msg.value, msg.rate])
  })

  if (lineData.length) {
    line.setData(lineData)
  }

  topData = topData.sort(sortByIndex(2))

  msgTop.setData({
    headers: ['msg', 'value', 'rate %'],
    data: topData
  })

  screen.render()
}, 200)