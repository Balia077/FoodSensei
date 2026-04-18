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
    <div className="min-h-[91vh] w-full bg-[#EFF5F3] flex px-4 py-5 lg:px-50">
  <div className="w-full flex flex-col lg:flex-row justify-between rounded-2xl shadow-xl overflow-hidden bg-white lg:h-[81vh]">
    
    {/* Image - only visible on large screens */}
    <div className="hidden lg:block w-1/2 h-full p-3">
      <img
        className="w-full h-full object-cover rounded-2xl"
        src="../images/third.jpg"
        alt=""
      />
    </div>

    {/* Form */}
    <div className="w-full lg:w-1/2 h-full p-6 sm:p-10 lg:p-20">
      <h2 className="flex justify-center text-2xl sm:text-3xl lg:text-[4vh] font-bold mb-6 lg:mb-10">
        Sign in
      </h2>

      <form className="flex flex-col gap-3">
        <h3 className="font-semibold">Your email</h3>
        <input
          placeholder="Enter email..."
          className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
          type="email"
        />

        <h3 className="font-semibold">Password</h3>
        <input
          placeholder="Password..."
          className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
          type="password"
        />

        <button
          className="px-5 py-3 mt-5 bg-black text-white font-bold text-lg rounded-xl"
          type="submit"
        >
          Sign in
        </button>
      </form>

      <h4 className="text-sm sm:text-md mt-5 flex justify-center text-center">
        Don't have an account?{" "}
        <Link className="text-blue-600 font-semibold ml-1" to="/register">
          Sign up
        </Link>
      </h4>
    </div>
  </div>
</div>
  );
};

export default Login;
