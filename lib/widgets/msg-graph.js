'use strict'

const Contrib = require('blessed-contrib')

function pickTime (record) {
  return new Date(record.time).toTimeString().substring(0,8)
}

function pickValue (record) {
  return record.value
}

function msgGraph (bus, parent) {
  const graph = Contrib.line({
    style: {
      text: "green",
      baseline: "black"
    },
    showLegend: true,
    xLabelPadding: 3,
    xPadding: 5
  })

  let filter = null

  bus.on('data', update)
  bus.on('msg.select', select)

  parent.append(graph)

  function select (selectedMsg) {
    filter = selectedMsg
  }

  function update (data) {
    const msgs = data.msgs
    const lineData = []
    const colors = ['purple', 'brown', 'yellow', 'blue', 'white', 'red']

    Object.keys(msgs).forEach(function (key) {
      const msg = msgs[key]
      const validHistory = msg.history.slice(-20)
      const x = msg.history.map(pickTime)
      const y = msg.history.map(pickValue)
      const currentColor = colors.pop()

      if (!filter || filter === key) {
        lineData.push({
          title: key,
          style: {line: currentColor},
          x: x,
          y: y
        })
      }
    })


    if (lineData.length) {
      graph.setData(lineData)
    }
  }
}

module.exports = msgGraph
