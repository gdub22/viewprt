# viewprt [![Build Status](https://travis-ci.org/gpoitch/viewprt.svg)](https://travis-ci.org/gpoitch/viewprt)

A tiny, dependency-free, high performance viewport position & intersection observation tool. You can watch when elements enter & exit a viewport, or when a viewport itself reaches its bounds. Use this as a building block for lazy loaders, infinite scrolling, etc.

### [Demo / Examples 🕹](https://rawgit.com/gpoitch/viewprt/master/demos/index.html)

### Install

```
npm i viewprt -S
```

### Usage & API

<!-- prettier-ignore-start -->
```js
import {
  ElementObserver,   // Use this to observe when an element enters and exits the viewport
  PositionObserver   // Use this to observe when a viewport reaches its bounds
  ObserverCollection // Advanced: Used for grouping custom viewport handling
} from 'viewprt'

// All options are optional. The defaults are shown below.

// ElementObserver(element, options)
const elementObserver = ElementObserver(document.getElementById('element'), {
  onEnter(element, viewport) {},               // callback when the element enters the viewport
  onExit(element, viewport) {},                // callback when the element exits the viewport
  offset: 0,                                   // offset from all edges of the viewport in pixels
  offsetX: 0,                                  // offset from the left and right edges of the viewport in pixels
  offsetY: 0,                                  // offset from the top and bottom edges of the viewport in pixels
  once: false,                                 // if true, observer is detroyed after first callback is triggered
  observerCollection: new ObserverCollection() // Advanced: Used for grouping custom viewport handling
})

// PositionObserver(options)
const positionObserver = PositionObserver({
  onBottom(container, viewport) {},            // callback when the viewport reaches the bottom
  onTop(container, viewport) {},               // callback when the viewport reaches the top
  onLeft(container, viewport) {},              // callback when the viewport reaches the left
  onRight(container, viewport) {},             // callback when the viewport reaches the right
  onFit(container, viewport) {},               // callback when the viewport contents fit within the container without having to scroll
  container: document.body,                    // the viewport element to observe the position of
  offset: 0,                                   // offset from all edges of the viewport in pixels
  offsetX: 0,                                  // offset from the left and right edges of the viewport in pixels
  offsetY: 0,                                  // offset from the top and bottom edges of the viewport in pixels
  once: false,                                 // if true, observer is detroyed after first callback is triggered
  observerCollection: new ObserverCollection() // Advanced: Used for grouping custom viewport handling
})
```
<!-- prettier-ignore-end -->

The `viewport` argument in callbacks is an object containing the current state of the viewport e.g.:

```js
{
  width: 1024,
  height: 768,
  positionX: 0,
  positionY: 2000,
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

#### Advanced: Using a custom observer collection

If you need to control scroll and resize events (e.g. for custom throttling/debouncing), you can create a new instance of `ObserverCollection`.

```js
const debouncedObserverCollection = new ObserverCollection({ handleScrollResize: (h) => debounce(h, 300) })

const elementObserver = ElementObserver(document.getElementById('element1'), {
  observerCollection: debouncedObserverCollection
})

// The same instance of ObserverCollection should be reused to have only one scroll and resize event
const elementObserver = ElementObserver(document.getElementById('element2'), {
  observerCollection: debouncedObserverCollection
})
```

### Browser support

Chrome, Firefox, Edge, IE 11+, Safari 8+  
(requestAnimationFrame, MutationObserver, Map)
