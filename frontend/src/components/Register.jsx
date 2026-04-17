import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Register = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const formHandler = async (e) => {
//     e.preventDefault();
//     const data = {
//       username,
//       email,
//       password,
//     };
//     // console.log(data);
//     setUsername("");
//     setEmail("");
//     setPassword("");

//     try {
//       const response = await axios.post(
//         "http://localhost:3000/api/auth/register",
//         data,
//       );
//       alert(response.data.message);
//     } catch (err) {
//       console.log(err);
//     }
//   };

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
          <h2 className="flex justify-center text-[4vh] font-bold mb-5">
            Create an account
          </h2>
          <form className="flex flex-col gap-3" action="">
            <h3>Username</h3>
            <input
              placeholder="Enter Username..."
              className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
              type="email"
            />
            <h3 className="font-semibold">Email</h3>
            <input
              placeholder="Enter email..."
              className="px-5 py-3 outline-none bg-transparent border border-zinc-300 rounded-xl"
              type="email"
            />
            <h3 className="font-semibold">Password</h3>
            <input
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
          <h4 className="text-md mt-5 flex justify-center">
            Already have an account?{" "}
            <Link className="text-blue-600 font-semibold" to="/login">
              Sign in
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Register;
