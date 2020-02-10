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
      collide: true,
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

    this.init()
  }

  init () {
    this.subscribe('collision', (o1, o2) => {
      console.log('collision')

      const v1 = [ o1.vx, o1.vy ]
      const v2 = [ o2.vx, o2.vy ]
      const vSum = [ (v1[0] + v2[0]), (v1[1] + v2[1]) ]

      console.log('Vector 1', v1)
      console.log('Vector 2', v2)
      console.log('Vector Sum', vSum)
      
      const n1 = [ v1[0] - vSum[0], v1[1] - vSum[1] ]
      const n2 = [ v2[0] - vSum[0], v2[1] - vSum[1] ]
      
      console.log('Neg 1', n1)
      console.log('Neg 2', n2)
      
      const mD = o1.m > o2.m
        ? o1.m / o2.m / 100
        : o2.m / o1.m / 100

      console.log(mD, (o1.m > o2.m ? mD : 1 - mD), (o1.m > o2.m ? 1 - mD : mD))

      o1.x -= o1.ax
      o1.y -= o1.ay
      o1.vx = -n1[0]
      o1.vy = -n1[1]
      // o1.resetForce()
      // o1.applyForce(n1[0], n1[1])
      
      o2.x -= o2.ax
      o2.y -= o2.ay
      o2.vx = -n2[0]
      o2.vy = -n2[1]
      // o2.resetForce()
      // o2.applyForce(n2[0], n2[1])
    })
  }

  // Forces
  resetForce () {
    this.fx = 0
    this.fy = 0
  }

  applyForce (fx, fy) {
    this.fx += fx
    this.fy += fy
  }

  applyForceWith (o2) {
    const { fx, fy } = this.forcesWith(o2)

    this.applyForce(fx, fy)
    o2.applyForce(-fx, -fy)
  }

  // Velocity
  resetVelocity () {
    this.vx = 0
    this.vy = 0
  }

  distanceTo(o2) {
    const o1 = this

    const distanceX = o2.x - o1.x
    const distanceY = o2.y - o1.y

    let distanceTo = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))

    const o1Radius = o1.radiusX > o1.radiusY ? o1.radiusX : o1.radiusY
    const o2Radius = o2.radiusX > o2.radiusY ? o2.radiusX : o2.radiusY
    
    const outerDistanceTo = distanceTo - (o1Radius) - (o2Radius)
    
    console.log(`${o1.name} -> ${o2.name}`)
    console.log(`${[
      distanceX,
      distanceY,
      distanceTo,
      o1Radius,
      o2Radius,
      outerDistanceTo
    ].join(', ')}`)

    if (this.collide && outerDistanceTo <= 0) {
      this.emit('collision', o1, o2)
    }

    // Can't be smaller than 0 for later divisions
    if (distanceTo < 1) {
      distanceTo = 1
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
