'use strict'

const Contrib = require('blessed-contrib')

function sortByIndex (index) {
  return function (a, b) {
    if (a[index] < b[index]) return 1
    if (a[index] > b [index]) return -1
    return 0
  }
}

function msgTop (bus, parent) {
  const table = Contrib.table({
    keys: true,
    fg: 'green',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: true,
    columnWidth: [12, 6, 6]
  })
  let topData

  parent.on('focus', focus)
  table.rows.on('select', select)
  table.rows.on('keypress', keypress)

  bus.on('data', update)

  parent.append(table)

  function focus () {
    table.focus()
  }

  function update (data) {
    const msgs = data.msgs
    const colors = ['purple', 'brown', 'yellow', 'blue', 'white', 'red']
    topData = []

    Object.keys(msgs).forEach(function (key) {
      const msgs = data.msgs
      const msg = msgs[key]
      const currentColor = colors.pop()

      topData.push([key, msg.value, msg.rate])
    })

    topData = topData.sort(sortByIndex(2))

    table.setData({
      headers: ['msg', 'value', 'rate %'],
      data: topData
    })
  }

  function select (item, index) {
    const selectedKey = topData[index][0]
    bus.emit('msg.select', selectedKey)
  }

  function keypress (key) {
    if (key === 'a') {
      bus.emit('msg.select', null)
    }
  }

}

module.exports = msgTop
