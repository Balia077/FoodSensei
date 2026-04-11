import React, { useState } from "react";
import axios from 'axios';

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formHandler = async (e) => {
    e.preventDefault();

    const loginData = {email, password};

    try{
      const response = await axios.post("http://localhost:3000/api/auth/login", loginData);
      alert(response.data.message);
    }
    catch(err){
      console.log(err);
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="h-screen w-full bg-zinc-900 text-white flex items-center justify-center">
      <div className="bg-zinc-800 w-130 rounded-lg">
        <h1 className="text-4xl text-center font-semibold mt-5 mb-2">Login</h1>
        <form
          onSubmit={formHandler}
          className="h-full w-full flex flex-wrap p-5"
          action=""
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-15 outline-none border rounded-xl border-zinc-600 p-2 mt-2"
            type="email"
            placeholder="Email"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-15 outline-none border rounded-xl border-zinc-600 p-2 mt-2"
            type="password"
            placeholder="Password"
            required
          />
          <input
            className="w-45 h-12 ml-35 bg-green-500 hover:bg-green-600 text-white font-bold py-2 mt-5 px-4 rounded-xl"
            type="submit"
            value="Login"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
