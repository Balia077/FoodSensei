import React, { useState } from 'react'
import axios from 'axios';

const Register = () => {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const formHandler = async (e) =>{
        e.preventDefault();
        const data = {
            username,
            email,
            password
        }
        // console.log(data);
        setUsername('');
        setEmail('');
        setPassword('');

        try{
            const response = await axios.post('http://localhost:3000/api/auth/register', data);
            alert(response.data.message);
        }
        catch(err){
            console.log(err);
        }

    }

    return (
        <div className='h-[85vh] w-full bg-[#F8F2F0] text-white flex items-center justify-center'>
            <div className='bg-zinc-800 w-130 rounded-lg'>
                <h1 className='text-4xl text-center font-semibold mt-5 mb-5'>Register</h1>
                <form onSubmit={formHandler} className='h-full w-full flex flex-wrap p-5' action="">
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='w-full h-15 outline-none border rounded-xl border-zinc-600 p-2 mt-2' type="text" placeholder='Username' 
                    />
                    <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full h-15 outline-none border rounded-xl border-zinc-600 p-2 mt-2' type="email" placeholder='Email' 
                    />
                    <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='w-full h-15 outline-none border rounded-xl border-zinc-600 p-2 mt-2' type="password" placeholder='Password' 
                    />
                    <input 
                    className='w-45 h-12 ml-35 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 mt-5 px-4 border border-blue-700 rounded-xl' type="submit" value="Submit" 
                    />
                </form>
            </div>
        </div>
    )
}

export default Register
