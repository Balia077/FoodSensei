import React, { useState } from "react";
import axios from 'axios';

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
    <div className="h-[91vh] w-full bg-[#EFF5F3] flex px-30 py-5">
      <div className="h-[81vh] w-full flex justify-between rounded-2xl overflow-hidden bg-[#ffffff]">
        <div className="w-1/2 h-full p-2">
          <img className="w-full h-full object-cover overflow-hidden rounded-2xl" src="../images/second.png" alt="" />
        </div>
        <div className="w-1/2 h-full"></div>
      </div>
    </div>
  );
};

export default Login;
