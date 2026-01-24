import React, {useEffect, useRef, useState} from 'react'

// Real-time DOM-physics sync: actual page elements move with physics simulation  
export default function PhysicsScene({enabled, onToggle}){
  const matterRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const elementsRef = useRef([])
  const originalPositionsRef = useRef([])
  const wallsRef = useRef([])
  const hiddenSectionsRef = useRef([])
  const [gravityEnabled, setGravityEnabled] = useState(false)
  const [explodeMode, setExplodeMode] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [collisionEnabled, setCollisionEnabled] = useState(false)

  useEffect(()=>{
    if(!enabled) return

    let mounted = true
    let animationFrame
    let clickHandler = null

    // Add blur overlay effect for sandbox mode
    const createBlurOverlay = () => {
      // Remove existing overlay if present
      const existingOverlay = document.getElementById('physics-blur-overlay')
      if(existingOverlay) existingOverlay.remove()
      
      const overlay = document.createElement('div')
      overlay.id = 'physics-blur-overlay'
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.02);
        backdrop-filter: blur(1.5px);
        -webkit-backdrop-filter: blur(1.5px);
        pointer-events: none;
        z-index: 50;
        transition: opacity 0.3s ease;
      `
      document.body.appendChild(overlay)
    }
    
    createBlurOverlay()

    const init = async ()=>{
      const Matter = await import('matter-js')
      matterRef.current = Matter
      if(!mounted) return
      
      const {Engine, World, Bodies, Body, Events, Mouse, MouseConstraint} = Matter
      const engine = Engine.create({
        gravity: { x: 0, y: gravityEnabled ? 3.5 : 0 },
        timing: {
          timeScale: 1,
          isFixed: false
        },
        positionIterations: 6,
        velocityIterations: 4,
        constraintIterations: 2
      })
      engineRef.current = engine
      
      // Configure collision detection based on state
      if(!collisionEnabled) {
        engine.world.gravity.scale = 0
      }

      // Find all interactive elements - ONLY individual cards, not sections
      const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'))
      const hobbyItems = Array.from(document.querySelectorAll('.hobby-item'))
      
      // Hide section TITLES (h2) during physics mode, keep sections visible to maintain page size
      const projectsSection = document.querySelector('#projects')
      const hobbiesSection = document.querySelector('#hobbies')
      
      // Find and hide only the h2 titles and grid containers within sections
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
      
      // Store original visibility states
      hiddenSectionsRef.current = elementsToHide.map(element => ({
        element: element,
        originalVisibility: element.style.visibility || '',
        originalPointerEvents: element.style.pointerEvents || ''
      }))
      
      // Hide elements with visibility:hidden to maintain document space
      elementsToHide.forEach(element => {
        element.style.visibility = 'hidden'
        element.style.pointerEvents = 'none'
      })
      
      // Only work with individual cards
      const interactiveElements = [...portfolioItems, ...hobbyItems]

      // Store original positions and create physics bodies
      const bodiesData = interactiveElements.map((el, i) => {
        const rect = el.getBoundingClientRect()
        const scrollX = window.scrollX
        const scrollY = window.scrollY
        const computedStyle = window.getComputedStyle(el)
        
        // Store original computed dimensions (accounts for padding, border)
        const visualWidth = rect.width
        const visualHeight = rect.height
        
        // Calculate exact absolute position in document
        const absoluteLeft = rect.left + scrollX
        const absoluteTop = rect.top + scrollY
        
        // Create placeholder to preserve document flow
        const placeholder = document.createElement('div')
        placeholder.style.width = visualWidth + 'px'
        placeholder.style.height = visualHeight + 'px'
        placeholder.style.visibility = 'hidden'
        placeholder.className = 'physics-placeholder'
        el.parentNode.insertBefore(placeholder, el)
        
        // Store original state for restoration
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
          placeholder: placeholder
        }
        originalPositionsRef.current.push(originalPos)

        // Make element position: absolute at EXACT current position
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

        // Create physics body at exact center with precise dimensions
        const body = Bodies.rectangle(
          absoluteLeft + visualWidth / 2,
          absoluteTop + visualHeight / 2,
          visualWidth,
          visualHeight,
          { 
            restitution: 0.2,
            friction: 0.8,
            frictionAir: 0.06,
            frictionStatic: 0.5,
            density: 0.001,
            slop: 0.05,
            isSensor: !collisionEnabled,
            collisionFilter: {
              group: 0,
              category: 0x0001,
              mask: collisionEnabled ? 0xFFFF : 0x0002
            }
          }
        )

        return { element: el, body, index: i, originalScrollY: absoluteTop }
      })

      elementsRef.current = bodiesData
      const bodies = bodiesData.map(d => d.body)

      // Add boundaries (invisible walls) - these will be updated on scroll
      const thickness = 100
      const viewWidth = window.innerWidth
      const viewHeight = document.documentElement.scrollHeight
      
      // Get navbar and footer positions for hitboxes
      const navbarElement = document.querySelector('header')
      const footerElement = document.querySelector('footer')
      
      let navbarBottom = 80 // default
      let footerTop = viewHeight - 100 // default
      
      if(navbarElement){
        const navbarHeight = navbarElement.offsetHeight
        navbarBottom = navbarHeight
      }
      
      if(footerElement){
        const footerRect = footerElement.getBoundingClientRect()
        footerTop = window.scrollY + footerRect.top
      }
      
      // Create walls that will track scroll position
      // Top wall (tracks with scroll + navbar height)
      const topWall = Bodies.rectangle(viewWidth/2, window.scrollY + navbarBottom, viewWidth * 2, thickness, { 
        isStatic: true,
        label: 'topWall',
        friction: 0.8,
        restitution: 0.1,
        collisionFilter: {
          group: 0,
          category: 0x0002,
          mask: 0xFFFF
        }
      })
      
      // Bottom wall (footer position in absolute coordinates)
      const bottomWall = Bodies.rectangle(viewWidth/2, footerTop, viewWidth * 2, thickness, { 
        isStatic: true,
        label: 'bottomWall',
        friction: 0.8,
        restitution: 0.1,
        collisionFilter: {
          group: 0,
          category: 0x0002,
          mask: 0xFFFF
        }
      })
      
      // Side walls (very tall to cover entire scrollable area)
      const leftWall = Bodies.rectangle(-thickness/2, viewHeight/2, thickness, viewHeight*4, { 
        isStatic: true,
        label: 'leftWall',
        friction: 0.8,
        restitution: 0.1,
        collisionFilter: {
          group: 0,
          category: 0x0002,
          mask: 0xFFFF
        }
      })
      
      const rightWall = Bodies.rectangle(viewWidth + thickness/2, viewHeight/2, thickness, viewHeight*4, { 
        isStatic: true,
        label: 'rightWall',
        friction: 0.8,
        restitution: 0.1,
        collisionFilter: {
          group: 0,
          category: 0x0002,
          mask: 0xFFFF
        }
      })
      
      const walls = [topWall, bottomWall, leftWall, rightWall]
      wallsRef.current = walls

      World.add(engine.world, [...bodies, ...walls])
      
      // Update wall positions on scroll to keep physics contained
      let scrollUpdateFrame = null
      const updateWallsOnScroll = () => {
        if(!engineRef.current || !matterRef.current || !mounted) return
        
        const currentScrollY = window.scrollY
        const viewportHeight = window.innerHeight
        
        // Update top wall to follow viewport top + navbar height
        const navbarHeight = navbarElement ? navbarElement.offsetHeight : 80
        const newTopY = currentScrollY + navbarHeight
        matterRef.current.Body.setPosition(wallsRef.current[0], { 
          x: viewWidth/2, 
          y: newTopY 
        })
        
        // Bottom wall stays at footer position (absolute)
        const footerRect = footerElement ? footerElement.getBoundingClientRect() : null
        if(footerRect) {
          const newBottomY = currentScrollY + footerRect.top
          matterRef.current.Body.setPosition(wallsRef.current[1], { 
            x: viewWidth/2, 
            y: newBottomY 
          })
        }
        
        scrollUpdateFrame = null
      }
      
      const handleScroll = () => {
        if(!scrollUpdateFrame) {
          scrollUpdateFrame = requestAnimationFrame(updateWallsOnScroll)
        }
      }
      
      window.addEventListener('scroll', handleScroll, { passive: true })
      
      // Initial wall position update
      updateWallsOnScroll()
      
      // Store cleanup function
      const scrollCleanup = () => {
        window.removeEventListener('scroll', handleScroll)
        if(scrollUpdateFrame) cancelAnimationFrame(scrollUpdateFrame)
      }

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

      // Add click handler for explosion effect
      const handleClick = (e) => {
        if(!engineRef.current || !matterRef.current || !explodeMode) return
        
        // Get click position
        const clickX = e.clientX + window.scrollX
        const clickY = e.clientY + window.scrollY
        
        // Create visual indicator
        const indicator = document.createElement('div')
        indicator.style.position = 'absolute'
        indicator.style.left = e.clientX + 'px'
        indicator.style.top = e.clientY + 'px'
        indicator.style.width = '60px'
        indicator.style.height = '60px'
        indicator.style.marginLeft = '-30px'
        indicator.style.marginTop = '-30px'
        indicator.style.borderRadius = '50%'
        indicator.style.border = '3px solid rgba(249,115,22,0.9)'
        indicator.style.background = 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)'
        indicator.style.boxShadow = '0 0 30px rgba(249,115,22,0.8), 0 0 60px rgba(234,88,12,0.4), inset 0 0 20px rgba(251,146,60,0.4)'
        indicator.style.zIndex = '9998'
        indicator.style.pointerEvents = 'none'
        indicator.style.animation = 'explode-pulse 0.6s ease-out'
        document.body.appendChild(indicator)
        
        // Add CSS animation if not already added
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
        
        // Remove indicator after animation
        setTimeout(() => indicator.remove(), 600)
        
        // Apply explosion force
        elementsRef.current.forEach(({body}) => {
          if(body){
            const dx = body.position.x - clickX
            const dy = body.position.y - clickY
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if(distance > 0){
              const explosionStrength = 25
              const forceX = (dx / distance) * explosionStrength
              const forceY = (dy / distance) * explosionStrength
              matterRef.current.Body.applyForce(body, body.position, {x: forceX, y: forceY})
            }
          }
        })
      }
      
      clickHandler = handleClick
      document.addEventListener('click', handleClick)

      // Run physics engine
      const runner = Matter.Runner.create()
      runnerRef.current = runner
      Matter.Runner.run(runner, engine)

      // Add physics-active class to body for blur effect
      document.body.classList.add('physics-active')

      // Sync DOM elements with physics bodies every frame with smoothing
      function syncDOMWithPhysics(){
        if(!mounted) return
        
        // Get current scroll position and boundaries
        const currentScrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const headerBottom = navbarElement ? navbarElement.offsetHeight : 80
        const footerRect = footerElement ? footerElement.getBoundingClientRect() : null
        const footerTop = footerRect ? (currentScrollY + footerRect.top) : (document.documentElement.scrollHeight - 200)
        
        elementsRef.current.forEach(({element, body, originalScrollY}, i) => {
          const {x, y} = body.position
          const angle = body.angle
          
          const original = originalPositionsRef.current[i]
          
          // Calculate top-left position from body center (body center - half width/height)
          let left = x - original.width / 2
          let top = y - original.height / 2
          
          // Constrain elements to stay within header (bottom) and footer (top) boundaries
          const minTop = headerBottom
          const maxTop = footerTop - original.height
          
          // Prevent elements from going above header or below footer
          if(top < minTop) {
            top = minTop
            // Also update physics body position to match
            if(matterRef.current) {
              matterRef.current.Body.setPosition(body, {
                x: body.position.x,
                y: minTop + original.height / 2
              })
              // Remove upward velocity
              if(body.velocity.y < 0) {
                matterRef.current.Body.setVelocity(body, {x: body.velocity.x, y: 0})
              }
            }
          }
          
          if(top > maxTop) {
            top = maxTop
            // Also update physics body position to match
            if(matterRef.current) {
              matterRef.current.Body.setPosition(body, {
                x: body.position.x,
                y: maxTop + original.height / 2
              })
              // Remove downward velocity
              if(body.velocity.y > 0) {
                matterRef.current.Body.setVelocity(body, {x: body.velocity.x, y: 0})
              }
            }
          }
          
          const rotation = angle
          
          // Check if element is near current viewport with generous buffer
          const viewportBuffer = viewportHeight * 1.5
          const isNearViewport = originalScrollY >= (currentScrollY - viewportBuffer) && 
                                  originalScrollY <= (currentScrollY + viewportHeight + viewportBuffer)
          
          // Show/hide element based on proximity to viewport
          if(isNearViewport) {
            element.style.display = ''
            element.style.left = Math.round(left) + 'px'
            element.style.top = Math.round(top) + 'px'
            element.style.transform = `rotate(${rotation}rad)`
            element.style.transformOrigin = 'center center'
            element.style.willChange = 'transform, top, left'
          } else {
            element.style.display = 'none'
          }
        })

        animationFrame = requestAnimationFrame(syncDOMWithPhysics)
      }
      syncDOMWithPhysics()
    }

    init()

    return ()=>{
      mounted = false
      if(animationFrame) cancelAnimationFrame(animationFrame)
      
      // Remove click handler
      if(clickHandler) {
        document.removeEventListener('click', clickHandler)
      }
      
      // Remove physics-active class and blur overlay
      document.body.classList.remove('physics-active')
      const blurOverlay = document.getElementById('physics-blur-overlay')
      if(blurOverlay) blurOverlay.remove()
      
      // Restore hidden elements (titles and grids)
      hiddenSectionsRef.current.forEach(({element, originalVisibility, originalPointerEvents}) => {
        if(element) {
          element.style.visibility = originalVisibility || ''
          element.style.pointerEvents = originalPointerEvents || ''
        }
      })
      hiddenSectionsRef.current = []
      
      // Restore elements to original state
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
          element.style.willChange = ''
          element.style.display = ''
          
          // Remove placeholder
          if(original.placeholder && original.placeholder.parentNode) {
            original.placeholder.parentNode.removeChild(original.placeholder)
          }
        }
      })
      
      elementsRef.current = []
      originalPositionsRef.current = []
      wallsRef.current = []

      // Stop physics engine
      if(runnerRef.current && engineRef.current && matterRef.current){
        matterRef.current.Runner.stop(runnerRef.current)
        matterRef.current.Engine.clear(engineRef.current)
      }
      
      matterRef.current = null
    }
  },[enabled, gravityEnabled, collisionEnabled])

  const resetPositions = () => {
    if(!engineRef.current || !matterRef.current) return
    elementsRef.current.forEach(({body, element}, i) => {
      const original = originalPositionsRef.current[i]
      if(original && body){
        // Reset body position to center of original position
        matterRef.current.Body.setPosition(body, {
          x: original.x + original.width / 2,
          y: original.y + original.height / 2
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
      engineRef.current.gravity.y = !gravityEnabled ? 3.5 : 0
    }
  }

  if(!enabled) return null

  // Responsive positioning
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
              transition: 'all 0.2s ease'
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
              transition: 'all 0.2s ease'
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
            onClick={() => {
              setGravityEnabled(!gravityEnabled)
              if(engineRef.current){
                engineRef.current.gravity.y = !gravityEnabled ? 3.5 : 0
              }
            }} 
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
                // Update all bodies collision properties
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
