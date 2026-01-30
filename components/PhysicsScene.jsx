import React, {useEffect, useRef, useState, useCallback} from 'react'

// Real-time DOM-physics sync: actual page elements move with physics simulation  
export default function PhysicsScene({enabled, onToggle}){
  const matterRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const mouseConstraintRef = useRef(null)
  const elementsRef = useRef([])
  const originalPositionsRef = useRef([])
  const wallsRef = useRef([])
  const hiddenSectionsRef = useRef([])
  const activeBodyRef = useRef(null)
  const [gravityEnabled, setGravityEnabled] = useState(false)
  const [explodeMode, setExplodeMode] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [collisionEnabled, setCollisionEnabled] = useState(false)

  useEffect(()=>{
    if(!enabled) return

    let mounted = true
    let animationFrame
    let clickHandler = null
    let scrollHandler = null

    const init = async ()=>{
      const Matter = await import('matter-js')
      matterRef.current = Matter
      if(!mounted) return
      
      const {Engine, World, Bodies, Body, Events, Mouse, MouseConstraint, Sleeping} = Matter
      
      // Create engine with no gravity initially
      const engine = Engine.create({
        gravity: { x: 0, y: 0 },
        timing: {
          timeScale: 1
        },
        positionIterations: 10,
        velocityIterations: 8,
        constraintIterations: 4
      })
      engineRef.current = engine
      
      // Enable sleeping for performance
      engine.enableSleeping = true

      // Find all interactive elements
      const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'))
      const hobbyItems = Array.from(document.querySelectorAll('.hobby-item'))
      
      // Hide section titles and grids
      const projectsSection = document.querySelector('#projects')
      const hobbiesSection = document.querySelector('#hobbies')
      const elementsToHide = []
      
      if(projectsSection) {
        const projectTitle = projectsSection.querySelector('h2')
        const projectGrid = projectsSection.querySelector('.portfolio-grid')
        if(projectTitle) elementsToHide.push(projectTitle)
        if(projectGrid) elementsToHide.push(projectGrid)
      }
      
      if(hobbiesSection) {
        const hobbiesTitle = hobbiesSection.querySelector('h2')
        const hobbiesGrid = hobbiesSection.querySelector('.hobbies-grid')
        if(hobbiesTitle) elementsToHide.push(hobbiesTitle)
        if(hobbiesGrid) elementsToHide.push(hobbiesGrid)
      }
      
      hiddenSectionsRef.current = elementsToHide.map(element => ({
        element,
        originalVisibility: element.style.visibility || '',
        originalPointerEvents: element.style.pointerEvents || ''
      }))
      
      elementsToHide.forEach(element => {
        element.style.visibility = 'hidden'
        element.style.pointerEvents = 'none'
      })
      
      const interactiveElements = [...portfolioItems, ...hobbyItems]
      const navbarElement = document.querySelector('header')
      const footerElement = document.querySelector('footer')

      // Store original positions and create physics bodies
      const bodiesData = interactiveElements.map((el, i) => {
        const rect = el.getBoundingClientRect()
        const scrollX = window.scrollX
        const scrollY = window.scrollY
        const computedStyle = window.getComputedStyle(el)
        
        const visualWidth = rect.width
        const visualHeight = rect.height
        const absoluteLeft = rect.left + scrollX
        const absoluteTop = rect.top + scrollY
        
        // Create placeholder to preserve document flow
        const placeholder = document.createElement('div')
        placeholder.style.width = visualWidth + 'px'
        placeholder.style.height = visualHeight + 'px'
        placeholder.style.visibility = 'hidden'
        placeholder.className = 'physics-placeholder'
        el.parentNode.insertBefore(placeholder, el)
        
        const originalPos = {
          x: absoluteLeft,
          y: absoluteTop,
          width: visualWidth,
          height: visualHeight,
          position: el.style.position || computedStyle.position,
          left: el.style.left,
          top: el.style.top,
          transform: el.style.transform,
          margin: el.style.margin,
          zIndex: el.style.zIndex,
          placeholder
        }
        originalPositionsRef.current.push(originalPos)

        // Make element absolutely positioned
        el.style.position = 'absolute'
        el.style.left = absoluteLeft + 'px'
        el.style.top = absoluteTop + 'px'
        el.style.width = visualWidth + 'px'
        el.style.height = visualHeight + 'px'
        el.style.margin = '0'
        el.style.cursor = 'grab'
        el.style.transition = 'none'
        el.style.zIndex = '100'
        el.style.boxSizing = 'border-box'
        el.style.transformOrigin = 'center center'
        el.style.transform = 'rotate(0rad)'

        // Create physics body - START AS SLEEPING so objects don't move
        const body = Bodies.rectangle(
          absoluteLeft + visualWidth / 2,
          absoluteTop + visualHeight / 2,
          visualWidth,
          visualHeight,
          { 
            restitution: 0.3,
            friction: 0.6,
            frictionAir: 0.05,
            frictionStatic: 0.8,
            density: 0.002,
            slop: 0.01,
            isSensor: !collisionEnabled,
            // Start sleeping - objects won't move until interacted with
            isSleeping: true,
            sleepThreshold: 60,
            collisionFilter: {
              group: 0,
              category: 0x0001,
              mask: collisionEnabled ? 0xFFFF : 0x0002
            },
            label: `element-${i}`
          }
        )
        
        // Ensure zero velocity
        Body.setVelocity(body, { x: 0, y: 0 })
        Body.setAngularVelocity(body, 0)

        return { 
          element: el, 
          body, 
          index: i, 
          isInWorld: true,
          wasInteracted: false
        }
      })

      elementsRef.current = bodiesData
      const bodies = bodiesData.map(d => d.body)

      // Create boundary walls
      const thickness = 100
      const viewWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      
      let navbarBottom = 80
      let footerHeight = 50
      
      if(navbarElement){
        navbarBottom = navbarElement.offsetHeight
      }
      
      if(footerElement){
        footerHeight = footerElement.offsetHeight
      }
      
      // Bottom wall position: viewport bottom minus footer height
      const bottomWallY = window.scrollY + viewportHeight - footerHeight
      
      const wallOptions = { 
        isStatic: true,
        friction: 0.8,
        restitution: 0.2,
        collisionFilter: {
          group: 0,
          category: 0x0002,
          mask: 0xFFFF
        }
      }
      
      const topWall = Bodies.rectangle(viewWidth/2, window.scrollY + navbarBottom - thickness/2, viewWidth * 3, thickness, {
        ...wallOptions,
        label: 'topWall'
      })
      
      const bottomWall = Bodies.rectangle(viewWidth/2, bottomWallY + thickness/2, viewWidth * 3, thickness, {
        ...wallOptions,
        label: 'bottomWall'
      })
      
      const leftWall = Bodies.rectangle(-thickness/2, docHeight/2, thickness, docHeight * 3, {
        ...wallOptions,
        label: 'leftWall'
      })
      
      const rightWall = Bodies.rectangle(viewWidth + thickness/2, docHeight/2, thickness, docHeight * 3, {
        ...wallOptions,
        label: 'rightWall'
      })
      
      const walls = [topWall, bottomWall, leftWall, rightWall]
      wallsRef.current = walls

      World.add(engine.world, [...bodies, ...walls])
      
      // Update walls on scroll
      const updateWallsOnScroll = () => {
        if(!engineRef.current || !matterRef.current || !mounted) return
        
        const currentScrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const navbarHeight = navbarElement ? navbarElement.offsetHeight : 80
        const footerHeight = footerElement ? footerElement.offsetHeight : 50
        
        // Update top wall - follows viewport top + navbar
        Body.setPosition(wallsRef.current[0], { 
          x: viewWidth/2, 
          y: currentScrollY + navbarHeight - thickness/2
        })
        
        // Update bottom wall - follows viewport bottom - footer (since footer is fixed)
        Body.setPosition(wallsRef.current[1], { 
          x: viewWidth/2, 
          y: currentScrollY + viewportHeight - footerHeight + thickness/2
        })
      }
      
      // Simple scroll handler - just update walls
      let scrollFrame = null
      scrollHandler = () => {
        if(!scrollFrame) {
          scrollFrame = requestAnimationFrame(() => {
            updateWallsOnScroll()
            scrollFrame = null
          })
        }
      }
      
      window.addEventListener('scroll', scrollHandler, { passive: true })
      updateWallsOnScroll()

      // Mouse constraint for dragging - with better configuration
      const mouse = Mouse.create(document.body)
      
      // Fix mouse wheel scrolling issue
      mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
      mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)
      
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.6,
          damping: 0.3,
          angularStiffness: 0.3,
          render: { visible: false }
        }
      })
      mouseConstraintRef.current = mouseConstraint
      World.add(engine.world, mouseConstraint)

      // When dragging starts, wake the body and mark as interacted
      Events.on(mouseConstraint, 'startdrag', (event) => {
        const body = event.body
        if(body) {
          activeBodyRef.current = body
          Sleeping.set(body, false)
          document.body.style.cursor = 'grabbing'
          
          // Mark this element as interacted
          const elementData = elementsRef.current.find(d => d.body === body)
          if(elementData) {
            elementData.wasInteracted = true
          }
        }
      })
      
      Events.on(mouseConstraint, 'enddrag', (event) => {
        activeBodyRef.current = null
        document.body.style.cursor = 'default'
        
        // Apply some damping after release for smoother feel
        const body = event.body
        if(body && matterRef.current) {
          const currentVel = body.velocity
          // Cap maximum throw velocity for better UX
          const maxVel = 30
          const velMag = Math.sqrt(currentVel.x * currentVel.x + currentVel.y * currentVel.y)
          if(velMag > maxVel) {
            const scale = maxVel / velMag
            Body.setVelocity(body, {
              x: currentVel.x * scale,
              y: currentVel.y * scale
            })
          }
        }
      })

      // Explosion click handler
      const handleClick = (e) => {
        if(!engineRef.current || !matterRef.current || !explodeMode) return
        
        const clickX = e.clientX + window.scrollX
        const clickY = e.clientY + window.scrollY
        
        // Visual effect
        const indicator = document.createElement('div')
        indicator.style.cssText = `
          position: absolute;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 60px;
          height: 60px;
          margin-left: -30px;
          margin-top: -30px;
          border-radius: 50%;
          border: 3px solid rgba(249,115,22,0.9);
          background: radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%);
          box-shadow: 0 0 30px rgba(249,115,22,0.8), 0 0 60px rgba(234,88,12,0.4);
          z-index: 9998;
          pointer-events: none;
          animation: explode-pulse 0.6s ease-out forwards;
        `
        document.body.appendChild(indicator)
        
        if(!document.getElementById('explode-animation')){
          const style = document.createElement('style')
          style.id = 'explode-animation'
          style.textContent = `
            @keyframes explode-pulse {
              0% { transform: scale(0.5); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.8; }
              100% { transform: scale(2); opacity: 0; }
            }
          `
          document.head.appendChild(style)
        }
        
        setTimeout(() => indicator.remove(), 600)
        
        // Apply explosion force and wake all bodies
        elementsRef.current.forEach(({body}) => {
          if(body){
            Sleeping.set(body, false)
            const dx = body.position.x - clickX
            const dy = body.position.y - clickY
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if(distance > 0 && distance < 800){
              const explosionStrength = 0.8 * (1 - distance / 800)
              const forceX = (dx / distance) * explosionStrength
              const forceY = (dy / distance) * explosionStrength
              Body.applyForce(body, body.position, {x: forceX, y: forceY})
            }
          }
        })
      }
      
      clickHandler = handleClick
      document.addEventListener('click', handleClick)

      // Run physics engine
      const runner = Matter.Runner.create({
        delta: 1000 / 60,
        isFixed: true
      })
      runnerRef.current = runner
      Matter.Runner.run(runner, engine)

      document.body.classList.add('physics-active')

      // Sync DOM with physics
      const syncDOMWithPhysics = () => {
        if(!mounted) return
        
        const currentScrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const navbarHeight = navbarElement ? navbarElement.offsetHeight : 80
        const footerHeight = footerElement ? footerElement.offsetHeight : 50
        
        // Calculate boundaries in absolute coordinates
        // Top boundary: current scroll + navbar height
        // Bottom boundary: current scroll + viewport - footer (since footer is fixed at bottom)
        const minTopAbs = currentScrollY + navbarHeight + 5
        const maxBottomAbs = currentScrollY + viewportHeight - footerHeight - 5
        
        elementsRef.current.forEach(({element, body}, i) => {
          const {x, y} = body.position
          const angle = body.angle
          const original = originalPositionsRef.current[i]
          
          // Calculate element position from body center
          let left = x - original.width / 2
          let top = y - original.height / 2
          
          // Boundary constraints
          const minTop = minTopAbs
          const maxTop = maxBottomAbs - original.height
          const minLeft = 5
          const maxLeft = window.innerWidth - original.width - 5
          
          let needsCorrection = false
          let newX = x
          let newY = y
          
          if(top < minTop) {
            top = minTop
            newY = minTop + original.height / 2
            needsCorrection = true
          }
          if(top > maxTop) {
            top = maxTop
            newY = maxTop + original.height / 2
            needsCorrection = true
          }
          if(left < minLeft) {
            left = minLeft
            newX = minLeft + original.width / 2
            needsCorrection = true
          }
          if(left > maxLeft) {
            left = maxLeft
            newX = maxLeft + original.width / 2
            needsCorrection = true
          }
          
          // Correct physics body if out of bounds
          if(needsCorrection && matterRef.current) {
            Body.setPosition(body, { x: newX, y: newY })
            // Dampen velocity when hitting bounds
            const vel = body.velocity
            if((top <= minTop && vel.y < 0) || (top >= maxTop && vel.y > 0)) {
              Body.setVelocity(body, { x: vel.x * 0.5, y: -vel.y * 0.3 })
            }
            if((left <= minLeft && vel.x < 0) || (left >= maxLeft && vel.x > 0)) {
              Body.setVelocity(body, { x: -vel.x * 0.3, y: vel.y * 0.5 })
            }
          }
          
          // Update DOM element
          element.style.left = `${Math.round(left)}px`
          element.style.top = `${Math.round(top)}px`
          element.style.transform = `rotate(${angle}rad)`
        })

        animationFrame = requestAnimationFrame(syncDOMWithPhysics)
      }
      syncDOMWithPhysics()
    }

    init()

    return ()=>{
      mounted = false
      if(animationFrame) cancelAnimationFrame(animationFrame)
      
      if(clickHandler) document.removeEventListener('click', clickHandler)
      if(scrollHandler) window.removeEventListener('scroll', scrollHandler)
      
      document.body.classList.remove('physics-active')
      
      // Restore hidden elements
      hiddenSectionsRef.current.forEach(({element, originalVisibility, originalPointerEvents}) => {
        if(element) {
          element.style.visibility = originalVisibility || ''
          element.style.pointerEvents = originalPointerEvents || ''
        }
      })
      hiddenSectionsRef.current = []
      
      // Restore DOM elements
      elementsRef.current.forEach(({element}, i) => {
        const original = originalPositionsRef.current[i]
        if(original && element){
          element.style.position = original.position || ''
          element.style.left = original.left || ''
          element.style.top = original.top || ''
          element.style.width = ''
          element.style.height = ''
          element.style.transform = original.transform || ''
          element.style.cursor = ''
          element.style.zIndex = original.zIndex || ''
          element.style.margin = original.margin || ''
          element.style.transition = ''
          element.style.transformOrigin = ''
          element.style.boxSizing = ''
          element.style.display = ''
          
          if(original.placeholder?.parentNode) {
            original.placeholder.parentNode.removeChild(original.placeholder)
          }
        }
      })
      
      elementsRef.current = []
      originalPositionsRef.current = []
      wallsRef.current = []
      activeBodyRef.current = null

      if(runnerRef.current && engineRef.current && matterRef.current){
        matterRef.current.Runner.stop(runnerRef.current)
        matterRef.current.Engine.clear(engineRef.current)
      }
      
      mouseConstraintRef.current = null
      matterRef.current = null
    }
  },[enabled, collisionEnabled])
  
  // Update gravity when toggled
  useEffect(() => {
    if(engineRef.current) {
      engineRef.current.gravity.y = gravityEnabled ? 2.5 : 0
      
      // Wake all bodies when gravity changes so they respond
      if(gravityEnabled && matterRef.current) {
        elementsRef.current.forEach(({body}) => {
          if(body) {
            matterRef.current.Sleeping.set(body, false)
          }
        })
      }
    }
  }, [gravityEnabled])

  const resetPositions = useCallback(() => {
    if(!engineRef.current || !matterRef.current) return
    const { Body, Sleeping } = matterRef.current
    
    elementsRef.current.forEach((data, i) => {
      const { body } = data
      const original = originalPositionsRef.current[i]
      if(original && body){
        // Reset position and state
        Body.setPosition(body, {
          x: original.x + original.width / 2,
          y: original.y + original.height / 2
        })
        Body.setAngle(body, 0)
        Body.setVelocity(body, {x: 0, y: 0})
        Body.setAngularVelocity(body, 0)
        Sleeping.set(body, true) // Put back to sleep
      }
    })
  }, [])

  if(!enabled) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? 10 : 20,
      right: isMobile ? 10 : 20,
      zIndex: 9999,
      background: 'linear-gradient(135deg, rgba(30,58,138,0.95) 0%, rgba(37,99,235,0.95) 100%)',
      backdropFilter: 'blur(12px)',
      padding: isMinimized ? '12px' : '18px',
      borderRadius: '16px',
      border: '1px solid rgba(59,130,246,0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minWidth: isMinimized ? 'auto' : (isMobile ? '180px' : '220px'),
      maxWidth: isMobile ? 'calc(100vw - 20px)' : 'auto',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#fff'}}>
          {isMinimized ? '⚛️' : 'Physics Controls'}
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            style={{
              fontSize: '16px', 
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
          <button 
            onClick={onToggle} 
            style={{
              fontSize: '16px', 
              padding: '4px 8px',
              background: 'rgba(239,68,68,0.9)',
              border: '1px solid rgba(248,113,113,0.5)',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.9)'}
            title="Turn off physics"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <button 
            onClick={resetPositions} 
            style={{
              fontSize: '14px', 
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.9) 100%)',
              border: '1px solid rgba(96,165,250,0.4)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
            }}
          >
            🔄 Reset Positions
          </button>
          <button 
            onClick={() => setGravityEnabled(!gravityEnabled)} 
            style={{
              fontSize: '14px', 
              padding: '10px 14px',
              background: gravityEnabled 
                ? 'linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)' 
                : 'linear-gradient(135deg, rgba(100,116,139,0.9) 0%, rgba(71,85,105,0.9) 100%)',
              border: gravityEnabled 
                ? '1px solid rgba(52,211,153,0.4)' 
                : '1px solid rgba(148,163,184,0.4)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: gravityEnabled 
                ? '0 2px 8px rgba(16,185,129,0.3)' 
                : '0 2px 8px rgba(100,116,139,0.3)'
            }}
          >
            {gravityEnabled ? '🌍 Gravity ON' : '🚀 Gravity OFF'}
          </button>
          <button 
            onClick={() => setExplodeMode(!explodeMode)} 
            style={{
              fontSize: '14px', 
              padding: '10px 14px',
              background: explodeMode 
                ? 'linear-gradient(135deg, rgba(249,115,22,0.9) 0%, rgba(234,88,12,0.9) 100%)' 
                : 'linear-gradient(135deg, rgba(100,116,139,0.9) 0%, rgba(71,85,105,0.9) 100%)',
              border: explodeMode 
                ? '1px solid rgba(251,146,60,0.4)' 
                : '1px solid rgba(148,163,184,0.4)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: explodeMode 
                ? '0 2px 8px rgba(249,115,22,0.4)' 
                : '0 2px 8px rgba(100,116,139,0.3)'
            }}
          >
            {explodeMode ? '💥 Explode ON' : '💥 Explode OFF'}
          </button>
          <button 
            onClick={() => {
              const newCollisionState = !collisionEnabled
              setCollisionEnabled(newCollisionState)
              if(engineRef.current && elementsRef.current.length > 0 && matterRef.current){
                elementsRef.current.forEach(({body}) => {
                  if(body){
                    matterRef.current.Body.set(body, 'isSensor', !newCollisionState)
                    body.collisionFilter.mask = newCollisionState ? 0xFFFF : 0x0002
                  }
                })
              }
            }} 
            style={{
              fontSize: '14px', 
              padding: '10px 14px',
              background: collisionEnabled 
                ? 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(124,58,237,0.9) 100%)' 
                : 'linear-gradient(135deg, rgba(100,116,139,0.9) 0%, rgba(71,85,105,0.9) 100%)',
              border: collisionEnabled 
                ? '1px solid rgba(167,139,250,0.4)' 
                : '1px solid rgba(148,163,184,0.4)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: collisionEnabled 
                ? '0 2px 8px rgba(139,92,246,0.4)' 
                : '0 2px 8px rgba(100,116,139,0.3)'
            }}
          >
            {collisionEnabled ? '🎯 Collision ON' : '👻 Collision OFF'}
          </button>
        </>
      )}
    </div>
  )
}
