/**
 * @class `Viewport`
 * A a scrollable container containing multiple observers
 * that are checked each time the viewport is manipulated (scrolled, resized, mutated)
 */
export default function Viewport(container, handleScrollResizeEvent) {
  this.container = container
  this.handleScrollResizeEvent = handleScrollResizeEvent
  this.observers = []
  this.lastX = 0
  this.lastY = 0
  this.element = container === document.body ? window : container

  let scheduled = false
  const throttle = window.requestAnimationFrame || (callback => setTimeout(callback, 1000 / 60))
  const handler = (this.handler = () => {
    if (!scheduled) {
      scheduled = true
      throttle(() => {
        const { observers } = this
        const state = this.getState()
        for (let i = observers.length; i--; ) observers[i].check(state)
        this.lastX = state.positionX
        this.lastY = state.positionY
        scheduled = false
      })
    }
  })

  const wrappedHandler = this.handleScrollResizeEvent(handler)

  window.addEventListener('scroll', wrappedHandler, true)
  window.addEventListener('resize', wrappedHandler, true)

  if (window.MutationObserver) {
    document.addEventListener('DOMContentLoaded', () => {
      const mutationObserver = (this.mutationObserver = new MutationObserver(handler))
      mutationObserver.observe(document, { attributes: true, childList: true, subtree: true })
    })
  }
}

Viewport.prototype = {
  getState() {
    const { element, lastX, lastY } = this
    let width, height, positionX, positionY, directionX, directionY

    if (element === window) {
      width = element.innerWidth
      height = element.innerHeight
      positionX = element.pageXOffset
      positionY = element.pageYOffset
    } else {
      width = element.offsetWidth
      height = element.offsetHeight
      positionX = element.scrollLeft
      positionY = element.scrollTop
    }

    if (lastX < positionX) directionX = 'right'
    else if (lastX > positionX) directionX = 'left'
    else directionX = 'none'

    if (lastY < positionY) directionY = 'down'
    else if (lastY > positionY) directionY = 'up'
    else directionY = 'none'

    return { width, height, positionX, positionY, directionX, directionY, viewportElement: element }
  },

  destroy() {
    const { wrappedHandler, mutationObserver } = this
    window.removeEventListener('scroll', wrappedHandler)
    window.removeEventListener('resize', wrappedHandler)
    if (mutationObserver) mutationObserver.disconnect()
  }
}
