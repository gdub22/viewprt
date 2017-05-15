/**
 * @class `Viewport`
 * A a scrollable container containing multiple observers
 * that are checked each time the viewport is manipulated (scrolled, resized, mutated)
 */
function Viewport (container) {
  this.container = container
  this.observers = []
  this.lastY = 0
  const element = this.element = container === document.body ? window : container

  let scheduled = false
  const throttle = window.requestAnimationFrame || ((callback) => setTimeout(callback, 1000 / 60))
  const handler = this.handler = () => {
    if (!scheduled) {
      scheduled = true
      throttle(() => {
        const state = this.getState()
        this.checkObservers(state)
        this.lastY = state.y
        scheduled = false
      })
    }
  }

  element.addEventListener('scroll', handler)
  element.addEventListener('resize', handler)

  if (window.MutationObserver) {
    addEventListener('DOMContentLoaded', () => {
      const mutationObserver = this.mutationObserver = new MutationObserver(handler)
      mutationObserver.observe(container, { attributes: true, childList: true, subtree: true })
    })
  }
}

Viewport.prototype = {
  addObserver (observer) {
    const { observers } = this
    observers.indexOf(observer) === -1 && observers.push(observer)
  },
  removeObserver (observer) {
    const { observers } = this
    const index = observers.indexOf(observer)
    index > -1 && observers.splice(index, 1)
  },
  checkObservers (state) {
    const { observers } = this
    for (let i = observers.length; i--;) {
      observers[i].check(state)
    }
  },
  getState () {
    const { element } = this
    let w, h, y
    if (element === window) {
      w = element.innerWidth
      h = element.innerHeight
      y = element.pageYOffset
    } else {
      w = element.offsetWidth
      h = element.offsetHeight
      y = element.scrollTop
    }
    const yDirection = this.lastY < y ? 'down' : 'up'
    return { w, h, y, yDirection }
  },
  destroy () {
    const { element, handler, mutationObserver } = this
    element.removeEventListener('scroll', handler)
    element.removeEventListener('resize', handler)
    mutationObserver && mutationObserver.disconnect()
  }
}

export default Viewport
