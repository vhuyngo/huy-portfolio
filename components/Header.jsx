import Link from 'next/link'
import {useRouter} from 'next/router'

export default function Header(){
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
        <nav className="nav-links">
          <button onClick={() => scrollTo('about')}>About</button>
          <button onClick={() => scrollTo('portfolio')}>Portfolio</button>
          <button onClick={() => scrollTo('hobbies')}>Hobbies</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
        </nav>
      </div>
    </header>
  )
}
