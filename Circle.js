class Circle extends Generic {
  constructor (options) {
    super()

    const defaults = {
      canvas: {
        width: 400,
        height: 400,
        boundaries: false
      },
      color: `#${[ '', '', '' ].map(() => Math.round(Math.random() * 255).toString(16)).join('')}`,
      radius: {
        x: Math.ceil(10 + (Math.random() * 100)),
        y: null
      },
      velocity: { x: null, y: null },
      position: { x: null, y: null },
      movable: true,
      mass: null,
      gravity: 9.8
    }

    const config = { ...defaults, ...options }

    this.canvas = config.canvas

    this.color = config.color
    this.movable = config.movable

    this.radiusX = config.radius.x
    this.radiusY = config.radius.y || this.radiusX

    this.x = config.position.x || Math.ceil(this.radiusX + (Math.random() * (this.canvas.width - this.radiusX * 2))) // Horizontal position
    this.y = config.position.y || Math.ceil(this.radiusY + (Math.random() * (this.canvas.height - this.radiusY * 2))) // Vertical position

    this.m = config.mass || this.radiusX * this.radiusY / 500 // Mass
    this.g = config.gravity
    
    this.vx = config.velocity.x || Math.random() * (Math.random() > 0.5 ? 1 : -1) // Velocity in x axis
    this.vy = config.velocity.y || Math.random() * (Math.random() > 0.5 ? 1 : -1) // Velocity in y axis

    this.ax = 0 // Acceleration in x axis
    this.ay = 0 // Acceleration in y axis

    this.fx = 0 // Force in x axis
    this.fy = 0 // Force in y axis
  }

  resetForces () {
    this.fx = 0
    this.fy = 0
  }

  applyForce(fx, fy) {
    this.fx += fx
    this.fy += fy
  }

  applyForcesWith (o2) {
    const { fx, fy } = this.forcesWith(o2)

    this.applyForce(fx, fy)
    o2.applyForce(-fx, -fy)
  }

  distanceTo(o2) {
    const o1 = this

    const distanceX = o2.x - o1.x
    const distanceY = o2.y - o1.y

    let distanceTo = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))

    const minDistance = o1.radiusX > o1.radiusY ? o1.radiusX : o1.radiusY

    if (distanceTo < minDistance) {
      distanceTo = minDistance
    }

    return { distanceTo, distanceX, distanceY }
  }

  forcesWith(o2) {
    const o1 = this

    const { distanceTo, distanceX, distanceY } = o1.distanceTo(o2)

    const force = (o1.g * o1.m * o2.m) / Math.pow(distanceTo, 2)
    const fx = force * distanceX / distanceTo
    const fy = force * distanceY / distanceTo

    return { force, fx, fy }
  }

  currentPosition () {
    return {
      top: this.y - this.radiusY,
      right: this.x + this.radiusX,
      bottom: this.y + this.radiusY,
      left: this.x - this.radiusX
    }
  }

  move () {
    this.emit('isMovableObject', this.movable)

    if (!this.movable) {
      return
    }

    this.emit('move-start', this)

    const {top, right, bottom, left} = this.currentPosition()
    
    // Acceleration
    this.ax = this.fx / this.m
    this.ay = this.fy / this.m

    // Horizontal position
    if (this.canvas.boundaries && (right >= this.canvas.width || left <= 0)) {
      this.vx = this.vx * -1
    }
    
    this.vx += this.ax
    this.x += this.vx
    
    // Vertical position
    if (this.canvas.boundaries && (top <= 0 || bottom >= this.canvas.height)) {
      this.vy = this.vy * -1
    }
    
    this.vy += this.ay
    this.y += this.vy

    this.emit('move-end', this)
  }

  draw (ctx) {
    this.emit('draw')
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, Math.PI, 0, Math.PI * 2)
    ctx.fill()
    this.emit('drawn')
  }
}
