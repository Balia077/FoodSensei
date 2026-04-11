import React from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Hero from './pages/Hero'
import { Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Hero />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  )
}

export default App
