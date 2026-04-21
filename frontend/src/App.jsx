import React from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Hero from './pages/Hero'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'

const App = () => {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path='/' element={<Hero />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/profile' element={<Profile />} />
    </Routes>
    </>
  )
}

export default App
