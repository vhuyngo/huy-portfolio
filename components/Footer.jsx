import React from 'react'

const basePath = process.env.BASE_PATH || ''

export default function Footer(){
  return (
    <footer>
      <h1>Contact Me</h1>
      <div className="contact-info">
        <a className="hyperlink" href="mailto:vinhhuyngo@outlook.com">
          <img src={`${basePath}/images/Email-Icon.png`} alt="Email" />
          <p>vinhhuyngo@outlook.com</p>
        </a>

        <a className="hyperlink" href="https://www.linkedin.com/in/vinh-huy-ngo/" target="_blank" rel="noreferrer">
          <img src={`${basePath}/images/LinkedIn-Logo.png`} alt="LinkedIn" />
          <p>LinkedIn</p>
        </a>

        <a className="hyperlink" href="https://github.com/vhuyngo" target="_blank" rel="noreferrer">
          <img src={`${basePath}/images/Github-Logo.png`} alt="Github" />
          <p>Github</p>
        </a>

        <a className="hyperlink" href="https://devpost.com/vinhhuyngo" target="_blank" rel="noreferrer">
          <img src={`${basePath}/images/Devpost-Logo.png`} alt="Devpost" />
          <p>Devpost</p>
        </a>
      </div>
    </footer>
  )
}
