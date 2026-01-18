import React, {useEffect, useRef, useState} from 'react'

// Real-time DOM-physics sync: actual page elements move with physics simulation
export default function PhysicsScene({enabled}){
  const matterRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const elementsRef = useRef([])
  const originalPositionsRef = useRef([])
  const [gravityEnabled, setGravityEnabled] = useState(true)

  useEffect(()=>{
    if(!enabled) return

    let mounted = true
    let animationFrame

    const init = async ()=>{
      const Matter = await import('matter-js')
      matterRef.current = Matter
      if(!mounted) return
      
      const {Engine, World, Bodies, Body, Events, Mouse, MouseConstraint} = Matter
      const engine = Engine.create({
        gravity: { x: 0, y: gravityEnabled ? 1 : 0 }
      })
      engineRef.current = engine

      // Find all interactive elements (exclude header and footer)
      const selector = '.card, .profile'
      const allElements = Array.from(document.querySelectorAll(selector))
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      
      // Filter out elements inside header or footer
      const interactiveElements = allElements.filter(el => {
        return !header?.contains(el) && !footer?.contains(el)
      })

      // Store original positions and create physics bodies
      const bodiesData = interactiveElements.map((el, i) => {
        const rect = el.getBoundingClientRect()
        const scrollX = window.scrollX
        const scrollY = window.scrollY
        
        // Store original position
        const originalPos = {
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        }
        originalPositionsRef.current.push(originalPos)

        // Make element position: absolute so we can move it
        el.style.position = 'absolute'
        el.style.left = originalPos.x + 'px'
        el.style.top = originalPos.y + 'px'
        el.style.width = originalPos.width + 'px'
        el.style.margin = '0'
        el.style.cursor = 'grab'
        el.style.transition = 'none'
        el.style.zIndex = '100'

        // Create physics body at current position
        const body = Bodies.rectangle(
          rect.left + rect.width / 2 + scrollX,
          rect.top + rect.height / 2 + scrollY,
          rect.width,
          rect.height,
          { 
            restitution: 0.3,
            friction: 0.1,
            frictionAir: 0.01,
            density: 0.001
          }
        )

        return { element: el, body, index: i }
      })

      elementsRef.current = bodiesData
      const bodies = bodiesData.map(d => d.body)

      // Add boundaries (invisible walls)
      const thickness = 100
      const viewWidth = window.innerWidth
      const viewHeight = document.documentElement.scrollHeight
      
      const walls = [
        Bodies.rectangle(viewWidth/2, -thickness/2, viewWidth, thickness, { isStatic: true }), // top
        Bodies.rectangle(viewWidth/2, viewHeight + thickness/2, viewWidth, thickness, { isStatic: true }), // bottom
        Bodies.rectangle(-thickness/2, viewHeight/2, thickness, viewHeight*2, { isStatic: true }), // left
        Bodies.rectangle(viewWidth + thickness/2, viewHeight/2, thickness, viewHeight*2, { isStatic: true }) // right
      ]

      World.add(engine.world, [...bodies, ...walls])

      // Mouse constraint for dragging
      const mouse = Mouse.create(document.body)
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      })
      World.add(engine.world, mouseConstraint)

      // Update cursor on drag
      Events.on(mouseConstraint, 'startdrag', () => {
        document.body.style.cursor = 'grabbing'
      })
      Events.on(mouseConstraint, 'enddrag', () => {
        document.body.style.cursor = 'default'
      })

      // Run physics engine
      const runner = Matter.Runner.create()
      runnerRef.current = runner
      Matter.Runner.run(runner, engine)

      // Add physics-active class to body
      document.body.classList.add('physics-active')

      // Sync DOM elements with physics bodies every frame
      function syncDOMWithPhysics(){
        if(!mounted) return
        
        elementsRef.current.forEach(({element, body}) => {
          const {x, y} = body.position
          const angle = body.angle
          
          // Apply transform to move and rotate element
          element.style.transform = `translate(${x - body.bounds.max.x + body.bounds.min.x}px, ${y - body.bounds.max.y + body.bounds.min.y}px) rotate(${angle}rad)`
          element.style.transformOrigin = 'center center'
        })

        animationFrame = requestAnimationFrame(syncDOMWithPhysics)
      }
      syncDOMWithPhysics()
    }

    init()

    return ()=>{
      mounted = false
      if(animationFrame) cancelAnimationFrame(animationFrame)
      
      // Remove physics-active class
      document.body.classList.remove('physics-active')
      
      // Restore elements to original positions
      elementsRef.current.forEach(({element}, i) => {
        const original = originalPositionsRef.current[i]
        if(original && element){
          element.style.position = ''
          element.style.left = ''
          element.style.top = ''
          element.style.width = ''
          element.style.transform = ''
          element.style.cursor = ''
          element.style.zIndex = ''
        }
      })
      
      elementsRef.current = []
      originalPositionsRef.current = []

      // Stop physics engine
      if(runnerRef.current && engineRef.current && matterRef.current){
        matterRef.current.Runner.stop(runnerRef.current)
        matterRef.current.Engine.clear(engineRef.current)
      }
      
      matterRef.current = null
    }
  },[enabled, gravityEnabled])

  const resetPositions = () => {
    if(!engineRef.current || !matterRef.current) return
    elementsRef.current.forEach(({body}, i) => {
      const original = originalPositionsRef.current[i]
      if(original && body){
        matterRef.current.Body.setPosition(body, {
          x: original.x + original.width/2,
          y: original.y + original.height/2
        })
        matterRef.current.Body.setAngle(body, 0)
        matterRef.current.Body.setVelocity(body, {x: 0, y: 0})
        matterRef.current.Body.setAngularVelocity(body, 0)
      }
    })
  }

  const toggleGravity = () => {
    setGravityEnabled(prev => !prev)
    if(engineRef.current){
      engineRef.current.gravity.y = gravityEnabled ? 0 : 1
    }
  }

  const addImpulse = () => {
    if(!engineRef.current || !matterRef.current) return
    elementsRef.current.forEach(({body}) => {
      if(body){
        const randomX = (Math.random() - 0.5) * 0.02
        const randomY = (Math.random() - 0.5) * 0.02
        matterRef.current.Body.applyForce(body, body.position, {x: randomX, y: randomY})
      }
    })
  }

  if(!enabled) return null

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      background: 'rgba(11,18,32,0.95)',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '200px'
    }}>
      <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '4px'}}>Physics Controls</div>
      <button onClick={resetPositions} style={{fontSize: '14px', padding: '8px 12px'}}>
        Reset Positions
      </button>
      <button onClick={toggleGravity} style={{fontSize: '14px', padding: '8px 12px'}}>
        {gravityEnabled ? 'Disable' : 'Enable'} Gravity
      </button>
      <button onClick={addImpulse} style={{fontSize: '14px', padding: '8px 12px'}}>
        Add Random Force
      </button>
      <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '8px'}}>
        💡 Drag elements around!
      </div>
    </div>
  )
}
