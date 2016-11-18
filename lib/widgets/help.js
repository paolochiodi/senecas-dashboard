'use strict'

const Blessed = require('blessed')
const HELP_TEXT = `
Arrows:\tmove
Enter:\t select
b:\t\t back
q:\t\t quit
`

function help (bus, parent) {

  const content = Blessed.box({
    top: 0,
    left: 0,
    hight: '100%-2',
    width: '100%-2',
    fg: 'green'
  })
  parent.append(content)

  content.setText(HELP_TEXT)
}

module.exports = help

