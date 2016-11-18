'use strict'

const Blessed = require('blessed')
const zipkin = require('../models/zipkin')

function traceList (bus, parent) {

  let fetchedData = []
  const main = new Blessed.List({
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    interactive: true,
    keys: true,
    style: {
      item: {
        fg: 'green'
      },
      selected: {
        fg: 'white',
        bg: 'blue'
      }
    }
  })
  parent.append(main)

  parent.on('focus', focus)
  main.key('b', back)
  bus.on('msg.select', select)

  function focus () {
    main.pick(picked)
  }

  function back () {
    bus.emit('msg.select', null)
  }

  function picked (err, child) {
    const index = main.getItemIndex(child)
    const selectedTrace = fetchedData[index]
    bus.emit('trace.select', selectedTrace)
  }

  function select (selectedMsg) {
    if (!selectedMsg) {
      clear()
      return
    }

    zipkin.findAllByMessage(selectedMsg, function gotData (err, data) {
      setData(data)
    })
  }

  function clear () {
    main.clearItems()
  }

  function isParent (span) {
    return !span.parentId
  }

  function buildItem(trace) {
    const parent = trace.find(isParent)
    const description = `${parent.duration/1000 || 0}ms - ${trace.length} spans`

    return description
  }

  function byDuration (a, b) {
    const parentA = a.find(isParent)
    const parentB = b.find(isParent)

    return (parentB.duration || 0) - (parentA.duration || 0)
  }

  function setData (data) {
    clear()
    fetchedData = data.sort(byDuration)
    const items = fetchedData.map(buildItem)
    main.setItems(items)
  }

}

module.exports = traceList
