import React from 'react'

export default function Footer(){
  return (
    <footer>
      <h1>Contact Me @</h1>

      <div className="contact-info">
        <div className="column">
          <a className="hyperlink" href="tel:+4084446295">
            <img src="/pages/images/Phone-Icon.png" alt="Phone Icon" />
            <p>Tel: 408-444-6295</p>
          </a>

          <a className="hyperlink" href="mailto:vinhhuyngo@outlook.com">
            <img src="/pages/images/Email-Icon.png" alt="Email Icon" />
            <p>vinhhuyngo@outlook.com</p>
          </a>

          <a className="hyperlink" href="https://drive.google.com/file/d/1FE-SaQtDVyGsdDgLt31uC2CMLEVef0xY/view?usp=sharing" target="_blank" rel="noreferrer">
            <img src="/pages/images/Document-Icon.png" alt="Resume Icon" />
            <p>Resume</p>
          </a>
        </div>
        <div className="column">
          <a className="hyperlink" href="https://www.linkedin.com/in/vinh-huy-ngo/" target="_blank" rel="noreferrer">
            <img src="/pages/images/LinkedIn-Logo.png" alt="LinkedIn Icon" />
            <p>LinkedIn</p>
          </a>

          <a className="hyperlink" href="https://github.com/vhuyngo" target="_blank" rel="noreferrer">
            <img src="/pages/images/Github-Logo.png" alt="Github Icon" />
            <p>Github</p>
          </a>

          <a className="hyperlink" href="https://devpost.com/vinhhuyngo?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav" target="_blank" rel="noreferrer">
            <img src="/pages/images/Devpost-Logo.png" alt="Devpost Icon" />
            <p>Devpost (Hackathons)</p>
          </a>
        </div>
      </div>
      <div id="copyright">© 2023 Vinh-Huy Ngo. All rights reserved.</div>
    </footer>
  )
}
