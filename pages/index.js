import React, {useState} from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Profile from '../components/Profile'
import Projects from '../components/Portfolio'
import Hobbies from '../components/Hobbies'
import QuickContact from '../components/QuickContact'
import PhysicsScene from '../components/PhysicsScene'

export default function Home(){
  const [physicsEnabled,setPhysicsEnabled] = useState(false)

  const startPhysics = () => {
    setPhysicsEnabled(true)
  }

  const togglePhysics = () => {
    setPhysicsEnabled(prev => !prev)
  }

  return (
    <>
      <Head>
        <title>Huy's Playground</title>
        <meta name="description" content="All about Huy! Aspiring software engineer with an emphasis in cybersecurity and information privacy." />
        <meta property="og:title" content="Huy's Playground" />
        <meta property="og:description" content="It's about time." />
      </Head>
      <div className="container">
        <Header physicsEnabled={physicsEnabled} onTogglePhysics={togglePhysics} />
        <main>
        <Profile />
        
        <section id="about" className="card section">
          <h2>About</h2>
          <p>Hi! My name is Huy (pronounced H-wee). I am an aspiring software engineer with strong fundamentals in algorithms, operating systems, networks, and compilers.</p>
          <p style={{marginTop:12}}>Experienced in building full-stack applications, backend systems with Flask and Node.js, and working with computer vision and machine learning. Skilled in C, Python, JavaScript, and C++.</p>
        </section>

        <Projects />

        <Hobbies />

        <PhysicsScene enabled={physicsEnabled} onToggle={togglePhysics} />
      </main>
      <Footer />
    </div>
    </>
  )
}
