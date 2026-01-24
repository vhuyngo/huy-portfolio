import React, { useState } from 'react'

export default function Projects(){
  const [flipped, setFlipped] = useState({})

  const projects = [
    {
      id: 'custom-cpu',
      title: 'Custom CPU',
      subtitle: 'Pipelined processor architecture',
      image: '/images/cpu.jpg',
      alt: 'Custom CPU project',
      description: 'Built & verified a pipelined CPU for custom ISA in Verilog/Vivado with a comprehensive testbench. Implemented full instruction pipeline with hazard detection and forwarding.',
      link: 'https://github.com/vhuyngo/CSEN122'
    },
    {
      id: 'zeronic',
      title: 'ZeroNic',
      subtitle: 'Nicotine cessation device',
      image: '/images/zeronic.jpg',
      alt: 'ZeroNic WeanPen logo',
      description: 'Designed vape pen for quitting nicotine. Led UX research with 5 vapers and 10+ usability tests to create an autoregulating device that helps users gradually reduce nicotine intake.',
      link: 'https://medium.com/human-computer-interaction-at-santa-clara/zeronic-weanpen-the-autoregulating-nicotine-quitting-device-58a8f6261021'
    },
    {
      id: 'flashalert',
      title: 'FlashAlert',
      subtitle: 'Epileptic content warning system',
      image: '/images/FlashAlert.png',
      alt: 'FlashAlert project',
      description: 'Developed robust back-end with Python, Flask, and OpenCV. Statistically analyzes video frames to detect flashing patterns and generate timestamps and warnings for potential seizure-inducing content.',
      link: 'https://devpost.com/software/flickersafe'
    },
    {
      id: 'safeparksf',
      title: 'Safe Park SF',
      subtitle: 'Optimized parking recommendation app',
      image: '/images/Safe Park SF.png',
      alt: 'A symbol of a lock on a car, with the words Safe Park SF written below it.',
      description: 'Programmed comprehensive parking web app with customized recommendation index for optimal parking spots. Utilized 3 external APIs including INRIX traffic and SF city parking data to calculate safety scores based on crime rates, cost, and availability.',
      link: 'https://devpost.com/software/safe-parking-sf'
    },
    {
      id: 'dermai',
      title: 'DermAI',
      subtitle: 'AI skin disease detector',
      image: '/images/DermAI.png',
      alt: 'A stunning logo of Derm AI in vivid colors.',
      specialClass: 'DermAI',
      description: 'Trained and fine-tuned TensorFlow deep learning models (InceptionV3 with transfer learning) on 10,000+ medical images to generate differential diagnoses for skin lesions. Integrated with Flask backend and Google Maps API to recommend nearby dermatologists.',
      link: 'https://devpost.com/software/dermai'
    },
    {
      id: 'fairway',
      title: 'Fairway',
      subtitle: 'Trucker salary negotiation tool',
      image: '/images/Fairway.png',
      alt: 'Fairway logo',
      description: 'Created distance-based compensation algorithm for truckers, scaling salary based on route danger level. Weighted algorithm uses weather, hazards, and annual crash rates to calculate comprehensive danger scores for fair compensation.',
      link: 'https://devpost.com/software/fairway-t09crm'
    }
  ]

  const handleFlip = (id) => {
    // Disable flipping when physics is active
    if(document.body.classList.contains('physics-active')) return
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="projects" className="card section">
      <h2>Projects</h2>
      <div className="portfolio-grid">
        {projects.map(project => (
          <div 
            key={project.id} 
            className={`portfolio-item flip-card ${flipped[project.id] ? 'flipped' : ''}`}
            onClick={() => handleFlip(project.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flip-card-inner">
              {/* Front */}
              <div className="flip-card-front">
                <h3>{project.title}</h3>
                <p className="muted">{project.subtitle}</p>
                <img 
                  src={project.image} 
                  alt={project.alt}
                  className={project.specialClass || ''}
                />
                <div className="flip-hint">Click to learn more</div>
              </div>
              
              {/* Back */}
              <div className="flip-card-back">
                <h3>{project.title}</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginTop: '12px' }}>
                  {project.description}
                </p>
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-block',
                      marginTop: '16px',
                      padding: '10px 20px',
                      background: 'var(--accent)',
                      color: '#fff',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    View Project →
                  </a>
                )}
                <div className="flip-hint" style={{ marginTop: '16px' }}>Click to flip back</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
