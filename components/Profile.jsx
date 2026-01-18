import React from 'react'

export default function Profile(){
  return (
    <div className="card profile">
      <img src="/pages/images/Github-Logo.png" alt="Vinh-Huy Ngo" />
      <div style={{flex:1}}>
        <h2 style={{marginBottom:'8px'}}>Vinh-Huy Ngo</h2>
        <p style={{fontSize:'1.1rem',color:'var(--accent)',fontWeight:'600',marginBottom:'12px'}}>
          Aspiring Software Engineer | Cybersecurity Enthusiast
        </p>
        <p className="muted" style={{marginBottom:'12px'}}>
          Santa Clara University • B.S. Computer Science & Engineering • GPA 3.84 • Expected Jun. 2026
        </p>
        <div style={{display:'flex',gap:'16px',flexWrap:'wrap',marginTop:'16px'}}>
          <a href="mailto:vinhhuyngo@outlook.com" style={{color:'var(--accent)',display:'flex',alignItems:'center',gap:'6px'}}>
            📧 vinhhuyngo@outlook.com
          </a>
          <a href="https://github.com/vhuyngo" target="_blank" rel="noreferrer" style={{color:'var(--accent)',display:'flex',alignItems:'center',gap:'6px'}}>
            💻 GitHub
          </a>
          <a href="https://linkedin.com/in/vinh-huy-ngo" target="_blank" rel="noreferrer" style={{color:'var(--accent)',display:'flex',alignItems:'center',gap:'6px'}}>
            💼 LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}
