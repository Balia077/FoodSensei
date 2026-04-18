import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formHandler = async (e) => {
    e.preventDefault();
    const data = {
      username,
      email,
      password,
    };
    // console.log(data);
    setUsername("");
    setEmail("");
    setPassword("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        data,
      );
      navigate('/');
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="min-h-[91vh] w-full bg-[#EFF5F3] flex px-4 py-5 lg:px-50">
      <div className="w-full flex flex-col lg:flex-row justify-between rounded-2xl shadow-xl overflow-hidden bg-white lg:h-[81vh]">
        {/* Image - only on large screens */}
        <div className="hidden lg:block w-1/2 h-full p-3">
          <img
            className="w-full h-full object-cover rounded-2xl"
            src="../images/third.jpg"
            alt=""
          />
        </div>

        {/* Form */}
        <div className="w-full lg:w-1/2 h-full p-6 sm:p-10 lg:p-20">
          <h2 className="flex justify-center text-2xl sm:text-3xl lg:text-[4vh] font-bold mb-5">
            Create an account
          </h2>

          <form onSubmit={formHandler} className="flex flex-col gap-3">
            <h3>Username</h3>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username..."
              className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
              type="text"
            />

            <h3 className="font-semibold">Email</h3>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email..."
              className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
              type="email"
            />

            <h3 className="font-semibold">Password</h3>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password..."
              className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
              type="password"
            />

            <button
              className="px-5 py-3 mt-5 bg-black text-white font-bold text-lg rounded-xl"
              type="submit"
            >
              Get Started
            </button>
          </form>

          <h4 className="text-sm sm:text-md mt-5 flex justify-center text-center">
            Already have an account?{" "}
            <Link className="text-blue-600 font-semibold ml-1" to="/login">
              Sign in
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Register;
