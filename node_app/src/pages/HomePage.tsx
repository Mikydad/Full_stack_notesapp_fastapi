import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
function HomePage() {
  return (
    <div className='min-h-screen flex flex-col'>
        <Navbar />
        <div className='flex flex-1 h-screen items-center'>
        <HeroSection/>
        </div>
    </div>
  )
}

export default HomePage