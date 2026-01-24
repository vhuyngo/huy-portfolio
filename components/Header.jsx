import Link from 'next/link'
import {useRouter} from 'next/router'

export default function Header({physicsEnabled, onTogglePhysics}){
  const scrollTo = (id) => {
    const element = document.getElementById(id)
    if(element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header>
      <div className="top-ribbon">
        <h1>Huy's Playground</h1>
        
        {/* Apple-style Physics Toggle */}
        <div className="physics-toggle-container">
          <div className="physics-label-wrapper">
            <div className="physics-label">PHYSICS</div>
            <div className="physics-toggle-row">
              <span className="toggle-label">OFF</span>
              <label className="physics-toggle-switch">
                <input 
                  type="checkbox" 
                  checked={physicsEnabled} 
                  onChange={onTogglePhysics}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">ON</span>
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <a onClick={() => scrollTo('about')}>About</a>
          <a onClick={() => scrollTo('projects')}>Projects</a>
          <a onClick={() => scrollTo('hobbies')}>Hobbies</a>
          <a href="https://drive.google.com/file/d/1FE-SaQtDVyGsdDgLt31uC2CMLEVef0xY/view?usp=sharing" target="_blank" rel="noreferrer">Resume</a>
        </nav>
      </div>
    </header>
  )
}
