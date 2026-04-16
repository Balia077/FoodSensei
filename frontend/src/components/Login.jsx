import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  // const formHandler = async (e) => {
  //   e.preventDefault();

  //   const loginData = {email, password};

  //   try{
  //     const response = await axios.post("http://localhost:3000/api/auth/login", loginData);
  //     alert(response.data.message);
  //   }
  //   catch(err){
  //     console.log(err);
  //   }

  //   setEmail("");
  //   setPassword("");
  // };

  return (
    <div className="h-[91vh] w-full bg-[#EFF5F3] flex px-50 py-5">
      <div className="h-[81vh] w-full flex justify-between rounded-2xl drop-shadow-xl drop-shadow-black/15 overflow-hidden bg-[#ffffff]">
          <div className="w-1/2 h-full p-3">
            <img
              className="w-full h-full object-cover overflow-hidden rounded-2xl"
              src="../images/third.jpg"
              alt=""
            />
          </div>
          <div className="w-1/2 h-full p-20">
              <h2 className="flex justify-center text-[4vh] font-bold mb-10">Sign in</h2>
              <form className="flex flex-col gap-3" action="">
                <h3 className="font-semibold">Your email</h3>
                <input placeholder="Enter email..." className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl" type="email" />
                <h3 className="font-semibold">Password</h3>
                <input placeholder="Password..." className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl" type="password" />
                <button className="px-5 py-3 mt-5 bg-black text-white font-bold text-lg rounded-xl" type="submit">Sign in</button>
              </form>
              <h4 className="text-md mt-5 flex justify-center">Don't have an account? <Link className="text-blue-600 font-semibold" to="/register">Sign up</Link></h4>
          </div>
      </div>
    </div>
  );
};

export default Login;
