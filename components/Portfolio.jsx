import React from 'react'

export default function Portfolio(){
  const projects = [
    {
      id: 'inrix2023',
      title: 'Safe Park SF',
      subtitle: 'For peace of mind on your SF day trip.',
      image: '/pages/images/Safe Park SF.png',
      alt: 'A symbol of a lock on a car, with the words Safe Park SF written below it.'
    },
    {
      id: 'h4h2022',
      title: 'DermAI',
      subtitle: 'Your pocket dermatologist.',
      image: '/pages/images/DermAI.png',
      alt: 'A stunning logo of Derm AI in vivid colors.',
      specialClass: 'DermAI'
    },
    {
      id: 'inrix2022',
      title: 'Fairway',
      subtitle: 'An alternative to trucker salary inequity.',
      image: '/pages/images/Fairway.png',
      alt: 'A big, bold D in a hexagon.'
    }
  ]

  return (
    <section id="portfolio" className="card section">
      <h2>Portfolio</h2>
      <div className="portfolio-grid">
        {projects.map(project => (
          <div key={project.id} className="portfolio-item">
            <h3>{project.title}</h3>
            <p className="muted" dangerouslySetInnerHTML={{__html: project.subtitle}} />
            <img 
              src={project.image} 
              alt={project.alt}
              className={project.specialClass || ''}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
