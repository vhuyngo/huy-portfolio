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
          <a onClick={() => scrollTo('about')}>About</a>
          <a onClick={() => scrollTo('projects')}>Projects</a>
          <a onClick={() => scrollTo('hobbies')}>Hobbies</a>
          <a href="https://drive.google.com/file/d/1mX6npHlWCj3WwvvuHnz4yLLQJDqIsJ9j/view?usp=sharing" target="_blank" rel="noreferrer">Resume</a>
        </nav>
      </div>
    </header>
  )
}
