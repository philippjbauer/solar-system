class Generic {
  constructor () {
    this.name = this.constructor.name + '-' + btoa((Math.random() * Math.PI).toString()).substr(0, 6)
    this.handlers = []
  }

  emit (event, ...params) {
    const handlers = this.handlers[event]

    if (handlers && handlers.length > 0) {
      handlers.map(function (handler) {
        if (this.isFunction(handler)) {
          handler(...params)
        }
      }.bind(this))
    }

    return this
  }

  subscribe (event, callback) {
    if (this.isFunction(callback)) {
      // Create handler array if no subscriptions exist
      // so we can populate it with push()
      if (!this.handlers[event]) {
        this.handlers[event] = []
      }

      this.handlers[event].push(callback)
    }

    return this
  }

  unsubscribe (event) {
    delete this.handlers[event]
    return this
  }

  isFunction (handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler is not a function.')
    }

    return true
  }
}