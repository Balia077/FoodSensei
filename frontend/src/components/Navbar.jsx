import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="text-[#222222] bg-[#F8F2F0] lg:w-full w-full lg:h-[15vh] h-[10vh] border-b border-zinc-300 flex items-center lg:px-10 p-5 lg:gap-12 gap-3">
      
      <div className="logo font-[font-1]">
        <h2 className="lg:text-3xl text-[4vh]">
          Food<span className="text-[#F30819]">Sensei</span>
        </h2>
      </div>

      <div className="navcontents font-[helvetica] capitalize lg:flex hidden gap-10 items-center h-12 w-105 text-[#222222] rounded-4xl">
        
        <Link className="font-semibold" to="/">
          Home
        </Link>

        <Link className="flex font-semibold" to="#">
          Feature
          <ChevronDown className="mt-1" size={17} />
        </Link>

        <Link className="font-semibold" to="#">
          FP
        </Link>

        <Link className="font-semibold" to="#">
          About
        </Link>

        <Link className="font-semibold" to="#">
          Contact
        </Link>
      </div>

      <div className="flex items-center lg:gap-3 gap-2 lg:px-4 px-3 lg:py-2.5 py-1.5 lg:w-125 w-[35vw] rounded-4xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl inset-shadow-sm">
        <Search className="text-black/70 " size={20} />

        <input
          type="text"
          placeholder="Search Food..."
          className="bg-transparent outline-none text-sm text-black placeholder:text-black/60 w-full"
        />
      </div>

      <div className="lg:flex hidden font-[helvetica] gap-5">
        
        <Link to="/register">
          <button className="lg:text-md font-bold text-[#222222] whitespace-nowrap rounded-4xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl inset-shadow-sm lg:px-5 lg:py-2 px-7 py-3">
            Sign Up
          </button>
        </Link>

        <Link to="/login">
          <button className="lg:text-md font-bold rounded-4xl backdrop-blur-xl bg-black border border-white/20 shadow-xl/20 text-white lg:px-5 lg:py-2 px-7 py-3">
            Login
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Navbar;