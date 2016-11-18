'use strict'

const Blessed = require('blessed')
const zipkin = require('../models/zipkin')

function trace (bus, parent) {

  const main = new Blessed.box({
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    align: 'center',
    valign: 'middle'
  })
  parent.append(main)
  main.setText('Select a Message')

  parent.key('b', back)

  bus.on('trace.select', select)

  function back() {
    bus.emit('trace.select', null)
  }

  function select (selectedTrace) {
    if (!selectedTrace) {
      clear()
      main.setText('Select a Message')
      return
    }

    setData(selectedTrace)
  }

  function clear () {
    while(main.children.length) {
      main.children[0].destroy()
    }
    main.setText("")
  }

  function convertToTree (data) {
    const spans = {}
    const tree = {
      start: new Date().getTime() * 10000,
      end: 0,
      root: null,
      levels: 0
    }

    for (let i = 0; i < data.length; i++) {
      let span = data[i]
      let id = span.id
      let localEnd = 0

      if (!spans[id]) {
        spans[id] = {id: id, children: [], tree: tree}
      }

      spans[id].duration = span.duration
      spans[id].name = span.name

      for(let j = 0; j < span.annotations.length; j++) {
        localEnd = Math.max(localEnd, span.annotations[j].timestamp)
      }


      spans[id].start = span.timestamp
      spans[id].duration = span.duration || localEnd


      if (span.parentId) {
        spans[id].parent = spans[span.parentId] = spans[span.parentId] || {id:span.parentId, children:[], tree: tree}
        spans[span.parentId].children.push(spans[id])
      }

      if (id === span.traceId) {
        tree.root = spans[id]
      }

      tree.start = Math.min(tree.start, span.timestamp)
      tree.end = Math.max(tree.end, localEnd)

    }

    addLevels(tree.root)

    return tree
  }

  function setData (data) {
    clear()

    const tree = convertToTree(data)
    const spansBox = new Blessed.box({
      top: 0,
      left: tree.levels,
      right: 0,
      height: '100%'
    })
    main.append(spansBox)

    const levelsBox = new Blessed.box({
      top: 0,
      left: 0,
      width: tree.levels,
      height: '100%'
    })
    main.append(levelsBox)

    buildDrawNode(tree, spansBox, levelsBox)(tree.root)
  }

  function buildDrawNode (tree, spansBox, levelsBox) {
    const totalWidth = spansBox.width
    const ratio = totalWidth / (tree.end - tree.start)
    let row = 0

    function drawNode (span) {
      const left = Math.round((span.start - tree.start) * ratio)
      const width = Math.max(Math.round((span.duration) * ratio), 1)
      let label = " " + Math.round(span.duration / 1000) + "ms " + span.name

      const thisBox = Blessed.box({
        left: left,
        top: row,
        width: width,
        height: 1,
        bg: 'blue',
        fg: 'black'
      })

      spansBox.append(thisBox)

      if (label.length <= width) {
        thisBox.setText(label)
      }

      if (label.length > width) {

        if (width > 2) {
          thisBox.setText(label.substring(0, width))
          label = label.substring(width)
        }

        let labelBox = Blessed.text({
          left: left + width,
          top: row,
          height: 1
        })
        labelBox.setText(label)
        spansBox.append(labelBox)
      }

      const levelIndicator = Blessed.box({
        right: 0,
        top: row,
        width: tree.levels - span.level + 1,
        height: 1,
        bg: 'cyan'
      })
      levelsBox.append(levelIndicator)

      row++

      span.children.sort(sortByStart).forEach(drawNode)
    }

    return drawNode
  }
}

function sortByStart(a, b) {
  return a.start - b.start
}

function addLevels (span) {
  if (span.parent) {
    span.level = span.parent.level + 1
  }
  else {
    span.level = 1
  }

  span.tree.levels = Math.max(span.tree.levels, span.level)

  span.children.forEach(addLevels)
}

module.exports = trace