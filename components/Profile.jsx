import React from 'react'

const basePath = process.env.BASE_PATH || ''

export default function Profile(){
  return (
    <div className="profile-section">
      <div className="profile-content">
        <div className="profile-photo-wrapper">
          <img
            src={`${basePath}/images/Huy Professional Photo Square.jpeg`}
            alt="Vinh-Huy Ngo"
            className="profile-photo"
          />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">Vinh-Huy Ngo</h2>
          <p className="profile-title">
            Aspiring Software Engineer | Cybersecurity Enthusiast
          </p>
          <p className="profile-description">
            Santa Clara University • B.S. Computer Science & Engineering
          </p>
          <div className="social-links">
            <a
              href="mailto:vinhhuyngo@outlook.com"
              className="social-link"
              aria-label="Email"
              title="Email"
            >
              <img
                src={`${basePath}/images/Email-Icon.png`}
                alt="Email"
                className="social-icon"
              />
            </a>
            <a
              href="https://github.com/vhuyngo"
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="GitHub"
              title="GitHub"
            >
              <img
                src={`${basePath}/images/Github-Logo.png`}
                alt="GitHub"
                className="social-icon"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/vinh-huy-ngo/"
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <img
                src={`${basePath}/images/LinkedIn-Logo.png`}
                alt="LinkedIn"
                className="social-icon"
              />
            </a>
            <a
              href="https://devpost.com/vinhhuyngo"
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="Devpost"
              title="Devpost"
            >
              <img
                src={`${basePath}/images/Devpost-Logo.png`}
                alt="Devpost"
                className="social-icon"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
