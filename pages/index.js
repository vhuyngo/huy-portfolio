import React from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Profile from '../components/Profile'
import Projects from '../components/Portfolio'
import Hobbies from '../components/Hobbies'

export default function Home(){
  return (
    <>
      <Head>
        <title>Huy's Playground</title>
        <meta name="description" content="All about Huy! Aspiring software engineer with an emphasis in cybersecurity and information privacy." />
        <meta property="og:title" content="Huy's Playground" />
        <meta property="og:description" content="It's about time." />
      </Head>
      <div className="container">
        <Header />
        <main>
        <Profile />

        <Projects />

        <Hobbies />
      </main>
    </div>
    </>
  )
}
