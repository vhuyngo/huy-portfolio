import React from 'react'

export default function Profile(){
  return (
    <div className="profile-section">
      <div className="card profile" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
        <img src="/images/Github-Logo.png" alt="Vinh-Huy Ngo" style={{width:'200px',height:'200px'}} />
        <div style={{maxWidth:'800px'}}>
          <h2 style={{marginBottom:'8px',marginTop:'24px',color:'#fff'}}>Vinh-Huy Ngo</h2>
          <p style={{fontSize:'1.1rem',color:'#fff',fontWeight:'600',marginBottom:'12px'}}>
            Aspiring Software Engineer | Cybersecurity Enthusiast
          </p>
          <p style={{marginBottom:'12px',color:'#f3f4f6'}}>
            Santa Clara University • B.S. Computer Science & Engineering • GPA 3.84 • Expected Jun. 2026
          </p>
          <div style={{display:'flex',gap:'24px',flexWrap:'wrap',marginTop:'24px',justifyContent:'center',alignItems:'center'}}>
            <a href="mailto:vinhhuyngo@outlook.com" style={{color:'#fff',display:'flex',alignItems:'center',gap:'8px',fontSize:'1rem'}}>
              📧 vinhhuyngo@outlook.com
            </a>
            <a href="https://github.com/vhuyngo" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
              <img src="/images/Github-Logo.png" alt="GitHub" style={{width:'24px',height:'24px',filter:'brightness(0) invert(1)'}} />
              <span style={{color:'#fff',fontSize:'1rem'}}>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/vinh-huy-ngo" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
              <img src="/images/LinkedIn-Logo.png" alt="LinkedIn" style={{width:'24px',height:'24px',filter:'brightness(0) invert(1)'}} />
              <span style={{color:'#fff',fontSize:'1rem'}}>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
