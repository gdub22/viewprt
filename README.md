# viewprt [![Build Status](https://travis-ci.org/gpoitch/viewprt.svg)](https://travis-ci.org/gpoitch/viewprt)

A tiny, dependency-free, high performance viewport position & intersection observation tool. You can watch when elements enter & exit the viewport, or when a viewport itself reaches its bounds. Use this as a building block for things such as lazy loaders, infinite scrollers, etc.

#### [Demo](https://rawgit.com/gpoitch/viewprt/master/demos/index.html)

### Install

```
npm install viewprt --save
```

### API

Create new observers and any time its container is scrolled, resized, or mutated, the appropriate callbacks will be triggered when the condition is met.

```js
import {
  ElementObserver, // Use this to observe when an element enters and exits the viewport
  PositionObserver // Use this to observe when a viewport reaches its bounds
} from 'viewprt'

// All options are optional. The defaults are shown below.

// ElementObserver(element, options)
const elementObserver = ElementObserver(document.getElementById('element'), {
  onEnter(element, viewport) {}, // callback when the element enters the viewport
  onExit(element, viewport) {},  // callback when the element exits the viewport
  offset: 0,                     // offset from the edge of the viewport in pixels
  once: false                    // if true, observer is detroyed after first callback is triggered
})

// PositionObserver(options)
const positionObserver = PositionObserver({
  onBottom(container, viewport) {},   // callback when the viewport reaches the bottom
  onTop(container, viewport) {},      // callback when the viewport reaches the top
  onLeft(container, viewport) {},     // callback when the viewport reaches the left
  onRight(container, viewport) {},    // callback when the viewport reaches the right
  onMaximized(container, viewport) {} // callback when the viewport and container are the same size,
  container: document.body,           // the viewport element to observe the position of
  offset: 0,                          // offset from the edge of the viewport in pixels
  once: false                         // if true, observer is detroyed after first callback is triggered
})
```

The `viewport` argument in callbacks is an object containing the current state of the viewport e.g.:

```js
{
  width: 1024,
  height: 768,
  positionX: 0,
  positionY: 2000
  directionY: "down",
  directionX: "none"
}
```

```js
// Stop observing:
positionObserver.destroy()
elementObserver.destroy() // This happens automatically if the element is removed from the DOM

// Start observing again:
positionObserver.activate()
elementObserver.activate()
```
