import React from 'react'

export default function Skills(){
  const skills = {
    'Languages': ['C', 'Python', 'JavaScript', 'C++', 'Java', 'SQL'],
    'Frameworks': ['Flask', 'Node.js', 'React', 'Next.js'],
    'Tools': ['Git', 'VS Code', 'Wireshark', 'Chrome DevTools'],
    'Specialties': ['Algorithms', 'Operating Systems', 'Networks', 'Compilers', 'Cybersecurity']
  }

  return (
    <div className="card">
      <h2>Technical Skills</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'16px',marginTop:'16px'}}>
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
            <h3 style={{fontSize:'1rem',color:'var(--accent)',marginBottom:'8px'}}>{category}</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {items.map(skill => (
                <span key={skill} style={{
                  background:'var(--accent)',
                  color:'#fff',
                  padding:'4px 12px',
                  borderRadius:'20px',
                  fontSize:'0.875rem',
                  fontWeight:'500'
                }}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
