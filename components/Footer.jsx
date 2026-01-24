import React from 'react'

export default function Footer(){
  return (
    <footer>
      <h1>Contact Me</h1>

      <div className="contact-info">
        <a className="hyperlink" href="mailto:vinhhuyngo@outlook.com">
          <img src="/images/Email-Icon.png" alt="Email Icon" />
          <p>vinhhuyngo@outlook.com</p>
        </a>

        <a className="hyperlink" href="https://www.linkedin.com/in/vinh-huy-ngo/" target="_blank" rel="noreferrer">
          <img src="/images/LinkedIn-Logo.png" alt="LinkedIn Icon" />
          <p>LinkedIn</p>
        </a>

        <a className="hyperlink" href="https://github.com/vhuyngo" target="_blank" rel="noreferrer">
          <img src="/images/Github-Logo.png" alt="Github Icon" />
          <p>Github</p>
        </a>

        <a className="hyperlink" href="https://devpost.com/vinhhuyngo?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav" target="_blank" rel="noreferrer">
          <img src="/images/Devpost-Logo.png" alt="Devpost Icon" />
          <p>Devpost (Hackathons)</p>
        </a>
      </div>
      <div id="copyright">© 2026 Vinh-Huy Ngo. All rights reserved.</div>
    </footer>
  )
}
