import React from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Hero from './pages/Hero'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'
import Analyze from './pages/Analyze'
import MealPlanner from './pages/MealPlanner'
import FoodPage from './pages/FoodPage'
import About from './components/About'
import Footer from './components/Footer'
import LocomotiveScroll from 'locomotive-scroll'

const App = () => {

  const locomotiveScroll = new LocomotiveScroll();

  return (
    <>
    <Navbar />
    <Routes>
      <Route path='/' element={<Hero />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/analyze' element={<Analyze />} />
      <Route path='/mealplanner' element={<MealPlanner />} />
      <Route path='/foodproduct' element={<FoodPage />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Footer />} />
    </Routes>
    </>
  )
}

export default App
