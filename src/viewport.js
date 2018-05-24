/**
 * @class `Viewport`
 * A a scrollable container containing multiple observers
 * that are checked each time the viewport is manipulated (scrolled, resized, mutated)
 */
function Viewport(container) {
  this.container = container
  this.observers = []
  this.lastX = 0
  this.lastY = 0
  const element = (this.element = container === document.body ? window : container)

  let scheduled = false
  const throttle = window.requestAnimationFrame || (callback => setTimeout(callback, 1000 / 60))
  const handler = (this.handler = () => {
    if (!scheduled) {
      scheduled = true
      throttle(() => {
        const state = this.getState()
        this.checkObservers(state)
        this.lastX = state.positionX
        this.lastY = state.positionY
        scheduled = false
      })
    }
  })

  element.addEventListener('scroll', handler)
  element.addEventListener('resize', handler)

  if (window.MutationObserver) {
    addEventListener('DOMContentLoaded', () => {
      const mutationObserver = (this.mutationObserver = new MutationObserver(handler))
      mutationObserver.observe(container, { attributes: true, childList: true, subtree: true })
    })
  }
}

Viewport.prototype = {
  addObserver(observer) {
    const { observers } = this
    observers.indexOf(observer) === -1 && observers.push(observer)
  },
  removeObserver(observer) {
    const { observers } = this
    const index = observers.indexOf(observer)
    index > -1 && observers.splice(index, 1)
  },
  checkObservers(state) {
    const { observers } = this
    for (let i = observers.length; i--; ) {
      observers[i].check(state)
    }
  },
  getState() {
    const { element, lastX, lastY } = this
    let width, height, positionX, positionY
    if (element === window) {
      width = element.innerWidth
      height = element.innerHeight
      positionX = element.pageXOffset
      positionY = element.pageYOffset
    } else {
      width = element.offsetWidth
      height = element.offsetHeight
      positionY = element.scrollTop
      positionX = element.scrollLeft
    }
    const directionX = lastX < positionX ? 'right' : 'left'
    const directionY = lastY < positionY ? 'down' : 'up'

    return { width, height, positionX, positionY, directionX, directionY }
  },
  destroy() {
    const { element, handler, mutationObserver } = this
    element.removeEventListener('scroll', handler)
    element.removeEventListener('resize', handler)
    mutationObserver && mutationObserver.disconnect()
  }
}

export default Viewport
