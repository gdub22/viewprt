const { JSDOM } = require('jsdom')
global.window = (new JSDOM()).window
global.document = window.document
global.Element = window.Element
