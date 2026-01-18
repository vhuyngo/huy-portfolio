import React from 'react'

export default function QuickContact(){
  return (
    <div className="card" style={{
      background:'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
      border:'none',
      textAlign:'center'
    }}>
      <h2 style={{color:'#fff',marginBottom:'12px'}}>Ready to Connect?</h2>
      <p style={{color:'rgba(255,255,255,0.9)',marginBottom:'20px'}}>
        I'm actively seeking software engineering opportunities. Let's talk!
      </p>
      <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
        <a href="mailto:vinhhuyngo@outlook.com" style={{textDecoration:'none'}}>
          <button style={{background:'#fff',color:'var(--accent)',fontWeight:'700'}}>
            📧 Email Me
          </button>
        </a>
        <a href="https://www.linkedin.com/in/vinh-huy-ngo/" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
          <button style={{background:'rgba(255,255,255,0.2)',color:'#fff',fontWeight:'700',border:'2px solid #fff'}}>
            💼 LinkedIn
          </button>
        </a>
        <a href="https://github.com/vhuyngo" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
          <button style={{background:'rgba(255,255,255,0.2)',color:'#fff',fontWeight:'700',border:'2px solid #fff'}}>
            💻 GitHub
          </button>
        </a>
      </div>
    </div>
  )
}
