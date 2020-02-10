// Canvas
const canvas = document.querySelector('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Controls
const run = document.querySelector('#run')
const add = document.querySelector('#add')
const pull = document.querySelector('#pull')

// Animation Framework
const animator = new Animator(canvas.getContext('2d'))

const frame = {
  width: canvas.width,
  height: canvas.height,
  boundaries: true
}

// Circles
const sun = new Circle({
  canvas: frame,
  color: '#ffe047',
  position: {
    x: canvas.width / 2,
    y: canvas.height / 2
  },
  radius: { x: 100 },
  mass: 100,
  movable: false,
  collide: false
})
animator.add(sun)

const earth = new Circle({
  canvas: frame,
  color: '#0055bb',
  position: {
    x: sun.x - 400,
    y: sun.y
  },
  radius: { x: 10 },
  mass: 1,
  velocity: { x: 0, y: -1.5},
  collide: false
})
animator.add(earth)

const moon = new Circle({
  canvas: frame,
  color: '#ccc',
  position: {
    x: earth.x - 22,
    y: earth.y
  },
  radius: { x: 3 },
  mass: 0.01,
  velocity: { x: 0.5, y: earth.vy + 0.5},
  collide: false
})
animator.add(moon)

add.addEventListener('click', () => {
  animator.add(new Circle({ canvas: { ...frame, boundaries: true} }))
})

run.addEventListener('click', () => {
  if (animator.running) {
    animator.stop()
    run.textContent = 'Start'
  } else {
    animator.start()
    run.textContent = 'Stop'
  }
})

pull.addEventListener('click', () => {
  animator.objects.forEach(o => o
    .unsubscribe('move-start')
    .subscribe('move-start', (o) => o.applyForces(0, 0.02))
  )
})

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  animator.objects.forEach(o => { o.canvas = frame })
})