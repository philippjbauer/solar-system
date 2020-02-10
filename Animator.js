class Animator extends Generic {
  constructor (ctx) {
    super()

    this.ctx = ctx
    this.ctxHeight = this.ctx.canvas.clientHeight
    this.ctxWidth = this.ctx.canvas.clientWidth

    this.objects = []

    this.running = false
    this.animationFrameHandle = 0

    this.init()
  }

  init () {
    this
      .subscribe('added', o => o.draw(this.ctx))
      .subscribe('added', o => console.log(`New ${o.name} added.`, o))
      .subscribe('started', () => console.log('Animator started.'))
      .subscribe('stopped', () => console.log('Animator stopped.'))
  }

  add (object) {
    this.emit('add', object)
    
    // object.subscribe('collision', function () {
      //   this.stop()
      // }.bind(this))
      
    this.objects.push(object)
    this.emit('added', object)
  }

  clear () {
    this.emit('clear')
    this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight)
    this.emit('cleared')
  }

  run () {
    if (this.running) {
      this.clear()

      this.objects.forEach(o => o.resetForce())
      
      this.objects.forEach((o1, i) => {
        this.objects.forEach((o2, j) => {
          if (i < j) {
            o1.applyForceWith(o2)
          }
        })
      })

      this.objects.forEach(o => {
        o.move()
        o.draw(this.ctx)
      }, this)

      this.animationFrameHandle = requestAnimationFrame(this.run.bind(this))
    }
  }
  
  start () {
    this.emit('start')
    this.running = true
    this.animationFrameHandle = requestAnimationFrame(this.run.bind(this))
    this.emit('started', this.running)
  }

  stop () {
    this.emit('stop')
    this.running = false
    cancelAnimationFrame(this.animFrameHandle)
    this.emit('stopped', this.running)
  }
}
