import React from 'react'
import Navbar from '../components/Navbar'
import HeroText from '../components/HeroText'
import Features from '../components/Features'
import Marquee from '../components/Marquee'

const Home = () => {
  return (
    <div className='w-full bg-[#EFF5F3]'>

      <HeroText />
      <Marquee />
      <Features />

    </div>
  )
}

export default Home
