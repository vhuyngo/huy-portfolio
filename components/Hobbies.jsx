import React from 'react'

export default function Hobbies(){
  const hobbies = [
    {
      id: 'martial-arts',
      title: 'Martial Arts',
      description: 'Boxing, Muay Thai, BJJ'
    },
    {
      id: 'sports',
      title: 'Sports',
      description: 'Swimming, Surfing, Frisbee, Tennis'
    },
    {
      id: 'music',
      title: 'Instruments',
      description: 'Alto Sax, Guitar, Piano'
    }
  ]

  return (
    <section id="hobbies" className="card section">
      <h2>Hobbies</h2>
      <div className="hobbies-grid">
        {hobbies.map(hobby => (
          <div key={hobby.id} className="hobby-item">
            <h3>{hobby.title}</h3>
            <p className="muted">{hobby.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
