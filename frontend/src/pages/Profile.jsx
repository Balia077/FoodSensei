import React from 'react'
import api from '../api/axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {

  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/profile');
        // console.log(response.data)
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUser();
  }, []);

  if(!user) return <div>Loading...</div>

  return (
    <div className='flex justify-between p-10'>
      <h1 className='font-semibold text-3xl'>Welcome Back <br /> <span className='text-5xl '>{user.user.username}</span></h1>
      <button 
        onClick={logout}
        className='h-10 w-20 flex items-center rounded-md justify-center bg-red-500 text-white font-semibold shadow-md cursor-pointer hover:bg-red-600'>Logout</button>
    </div>
  )
}

export default Profile
