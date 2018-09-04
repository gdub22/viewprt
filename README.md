# viewprt [![Build Status](https://travis-ci.org/gpoitch/viewprt.svg)](https://travis-ci.org/gpoitch/viewprt)

A tiny, high performance viewport position & intersection observation tool. You can watch when elements enter & exit the viewport, or when a viewport itself is at the bottom, top, left or right. Use this as a building block for things such as lazy loaders, infinite scrollers, etc.

#### [Demo](https://rawgit.com/gpoitch/viewprt/master/demos/index.html)

### Install

```bash
npm install viewprt --save
```

### API

Create new observers and any time its container is scrolled, resized, or mutated, the appropriate callbacks will be triggered when the condition is met.

```js
import { PositionObserver, ElementObserver } from 'viewprt'

// Observe when an element enters and exits the viewport:
const elementObserver = ElementObserver(document.getElementById('element'), {
  // options (defaults)
  offset: 0, // offset from the edge of the viewport in pixels
  once: false, // if true, observer is detroyed after first callback is triggered
  onEnter(element, viewportState) {}, // callback when the element enters the viewport
  onExit(element, viewportState) {} // callback when the element exits the viewport
})

// Observe when the viewport reaches its bounds:
const positionObserver = PositionObserver({
  // options (defaults)
  container: document.body, // the viewport container element
  offset: 0, // offset from the edge of the viewport in pixels
  once: false, // if true, observer is detroyed after first callback is triggered
  onBottom(container, viewportState) {}, // callback when the viewport reaches the bottom
  onTop(container, viewportState) {}, // callback when the viewport reaches the top
  onLeft(container, viewportState) {}, // callback when the viewport reaches the left
  onRight(container, viewportState) {}, // callback when the viewport reaches the right
  onMaximized(container, viewportState) {} // callback when the viewport and container are the same size
})

// The `viewportState` is an object containing information like:
/*
{
  width: 1024,
  height: 768,
  positionX: 0,
  positionY: 2000
  directionY: "down",
  directionX: "none"
}
*/

// Stop observing:
positionObserver.destroy()
elementObserver.destroy() // This happens automatically if the element is removed from the DOM

// Start observing again:
positionObserver.activate()
elementObserver.activate()
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```
